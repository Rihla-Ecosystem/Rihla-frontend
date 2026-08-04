'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { tokenManager } from '../api';
import { authService } from './auth-service';
import { AuthState, LoginPayload, RegisterPayload, User } from './types';

interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<User | null>;
  updateProfile: (payload: Partial<RegisterPayload> & Record<string, unknown>) => Promise<User>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}

const extractAuthError = (err: unknown, fallback: string): string => {
  let data: any = (err as any)?.response?.data;

  // Support openapi-fetch errors where err is the response body
  if (!data && err && typeof err === 'object') {
    data = err;
  }

  if (data?.details && Array.isArray(data.details) && data.details.length > 0) {
    const detailMsg = data.details
      .map((d: any) => d.message)
      .filter(Boolean)
      .join('. ');
    if (detailMsg) return detailMsg;
  }

  const rawMsg = data?.error || data?.message;
  if (rawMsg) {
    if (rawMsg === 'Resource already exists') {
      return 'An account with this email address already exists. Please sign in instead.';
    }
    if (rawMsg === 'Invalid credentials') {
      return 'Invalid email address or password. Please try again.';
    }
    return rawMsg;
  }

  return fallback;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleLogoutState = useCallback(() => {
    setUser(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const fetchCurrentUser = useCallback(async (): Promise<User | null> => {
    const token = tokenManager.getAccessToken();
    if (!token) {
      handleLogoutState();
      return null;
    }

    try {
      setIsLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setError(null);
      return currentUser;
    } catch (err: unknown) {
      tokenManager.clearTokens();
      handleLogoutState();
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleLogoutState]);

  // Initial Auth Verification on Mount
  useEffect(() => {
    const initializeAuth = async () => {
      await fetchCurrentUser();
      setIsInitialized(true);
    };

    initializeAuth();

    // Subscribe to automatic logout events from token refresh failure
    tokenManager.onLogout(handleLogoutState);
  }, [fetchCurrentUser, handleLogoutState]);

  const login = async (payload: LoginPayload): Promise<User> => {
    try {
      setIsLoading(true);
      setError(null);

      const authData = await authService.login(payload);

      // Store the token so middleware can use it
      if (authData.accessToken) {
        tokenManager.setAccessToken(authData.accessToken);
      }

      const signedInUser = authData.user ?? (await authService.getCurrentUser());
      setUser(signedInUser as User);
      return signedInUser as User;
    } catch (err: unknown) {
      const errorMessage = extractAuthError(err, 'Failed to login. Please check your credentials.');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    try {
      setIsLoading(true);
      setError(null);

      const createdUser = await authService.register(payload);
      return createdUser;
    } catch (err: unknown) {
      const errorMessage = extractAuthError(err, 'Registration failed. Please check your details.');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
    } finally {
      handleLogoutState();
    }
  };

  const updateProfile = useCallback(
    async (payload: Partial<RegisterPayload> & Record<string, unknown>): Promise<User> => {
      setIsLoading(true);
      setError(null);
      try {
        const updated = await authService.updateProfile(payload);
        setUser(updated);
        return updated;
      } catch (err: unknown) {
        const errorMessage = extractAuthError(err, 'Failed to update profile.');
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [handleLogoutState]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isInitialized,
        error,
        login,
        register,
        logout,
        fetchCurrentUser,
        updateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
