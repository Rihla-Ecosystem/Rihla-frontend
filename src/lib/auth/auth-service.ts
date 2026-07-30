import { apiClient, tokenManager } from '../api';
import { AuthResponse, LoginPayload, RegisterPayload, User } from './types';

/**
 * Authentication API Service
 * Handles user registration, login, logout, and current user retrieval.
 */
export const authService = {
  /**
   * Registers a new user account.
   */
  async register(payload: RegisterPayload): Promise<User> {
    const response = await apiClient.post<User>('/auth/register', payload);
    return response.data;
  },

  /**
   * Authenticates user with credentials and stores the JWT access token.
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', payload);
    const authData = response.data;

    if (authData.accessToken) {
      tokenManager.setAccessToken(authData.accessToken);
    }

    return authData;
  },

  /**
   * Logs out the user by revoking the refresh token and clearing client storage.
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore API errors on logout to guarantee client cleanup
    } finally {
      tokenManager.clearTokens();
    }
  },

  /**
   * Retrieves current authenticated user profile.
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },
};
