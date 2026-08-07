"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiClient } from "../api";

let inMemoryToken: string | null = null;

export const getAuthHeader = () => {
  return inMemoryToken ? { Authorization: `Bearer ${inMemoryToken}` } : {};
};

interface AuthContextType {
  accessToken: string | null;
  setToken: (token: string | null) => void;
  refresh: () => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setToken = (token: string | null) => {
    inMemoryToken = token;
    setAccessToken(token);
  };

  const refresh = async () => {
    try {
      const { data, error } = await apiClient.POST("/auth/refresh", {});
      if (data && data.accessToken) {
        setToken(data.accessToken);
        return true;
      }
      if (error) {
        setToken(null);
      }
      return false;
    } catch (err) {
      setToken(null);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiClient.POST("/auth/logout", {});
    } finally {
      setToken(null);
    }
  };

  useEffect(() => {
    // Attempt silent refresh on mount
    refresh().finally(() => {
      setIsLoading(false);
    });

    // We can also add an interval to refresh before token expires (e.g. 14 mins)
    const interval = setInterval(() => {
      if (inMemoryToken) {
        refresh();
      }
    }, 14 * 60 * 1000); // 14 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ accessToken, setToken, refresh, logout, isAuthenticated: !!accessToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
