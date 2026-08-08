/**
 * API Foundation Configuration
 * Environment-based configuration for API endpoints and client settings.
 */

export const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";
};

export const API_CONFIG = {
  timeout: 15000,
  refreshEndpoint: '/auth/refresh',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
} as const;
