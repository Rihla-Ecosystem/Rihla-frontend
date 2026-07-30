/**
 * API Foundation Configuration
 * Environment-based configuration for API endpoints and client settings.
 */

export const getApiBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    console.warn(
      '[API Config Warning]: NEXT_PUBLIC_API_BASE_URL environment variable is not defined.'
    );
    return '';
  }
  return baseUrl;
};

export const API_CONFIG = {
  timeout: 15000,
  refreshEndpoint: '/auth/refresh',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
} as const;
