import { InternalAxiosRequestConfig } from 'axios';

/**
 * Standard API Response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * API Error payload structure
 */
export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

/**
 * Interface extending internal request config to track retry attempts during token refresh
 */
export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Authentication tokens interface
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

/**
 * Subscriber callback type used during token refresh queuing
 */
export type RefreshSubscriber = (token: string | null) => void;
