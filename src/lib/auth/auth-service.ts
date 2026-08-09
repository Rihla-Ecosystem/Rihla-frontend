import { apiClient, tokenManager } from '../api';
import { AuthResponse, LoginPayload, RegisterPayload, User } from './types';
import { withRateLimitRetry } from '@/lib/rateLimitHandler';

/**
 * Authentication API Service
 * Handles user registration, login, logout, and current user retrieval.
 */
const retryOptions = { maxRetries: 3, baseDelay: 1000 };

const withRetry = async <T,>(fn: () => Promise<{ data: T }>): Promise<T> => {
  const wrappedFn = withRateLimitRetry(fn, retryOptions);
  const result = await wrappedFn();
  return result.data;
};

export const authService = {
  /**
   * Registers a new user account.
   */
  async register(payload: RegisterPayload): Promise<User> {
    return withRetry(() => apiClient.post<User>('/auth/register', payload));
  },

  /**
   * Authenticates user with credentials and stores the JWT access token.
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const authData = await withRetry(() => apiClient.post<AuthResponse>('/auth/login', payload));

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
    return withRetry(() => apiClient.get<User>('/users/me'));
  },

  /**
   * Updates the current user's profile (used by onboarding and settings).
   */
  async updateProfile(payload: Partial<RegisterPayload> & Record<string, unknown>): Promise<User> {
    return withRetry(() => apiClient.patch<User>('/users/me', payload));
  },

  /**
   * Requests a password reset email for the given address.
   */
  async forgotPassword(email: string): Promise<void> {
    await withRetry(() => apiClient.post('/auth/forgot-password', { email }));
  },

  /**
   * Resets the user's password using a reset token.
   */
  async resetPassword(token: string, password: string): Promise<void> {
    await withRetry(() => apiClient.post('/auth/reset-password', { token, password }));
  },

  /**
   * Verifies the user's email address with a token from the sent email link.
   */
  async verifyEmail(token: string): Promise<void> {
    await withRetry(() => apiClient.get('/auth/verify-email', { params: { token } }));
  },

  /**
   * Resends the email-verification link for the given address.
   */
  async resendVerification(email: string): Promise<void> {
    await withRetry(() => apiClient.post('/auth/resend-verification', { email }));
  },
};
