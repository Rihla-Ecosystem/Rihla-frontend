import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG, getApiBaseUrl } from './config';
import { tokenManager } from './token-manager';
import { CustomAxiosRequestConfig, RefreshSubscriber } from './types';

let isRefreshing = false;
let refreshSubscribers: RefreshSubscriber[] = [];

/**
 * Notifies all queued request callbacks after token refresh completion.
 */
const notifySubscribers = (newToken: string | null): void => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

/**
 * Queues a request subscriber to execute once token refresh finishes.
 */
const queueRefreshSubscriber = (subscriber: RefreshSubscriber): void => {
  refreshSubscribers.push(subscriber);
};

/**
 * Primary reusable Axios Client instance.
 * Configured with base URL, withCredentials enabled, and default JSON headers.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

/**
 * Request Interceptor
 * Automatically injects the JWT access token into the Authorization header.
 */
apiClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Intercepts 401 Unauthorized responses to perform automatic token refresh via /auth/refresh.
 * Retries failed requests upon successful refresh or logs the user out if refresh fails.
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // Prevent infinite loops if /auth/refresh itself returns 401
      if (originalRequest.url?.includes(API_CONFIG.refreshEndpoint)) {
        tokenManager.triggerLogout();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If another token refresh is currently in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queueRefreshSubscriber((token: string | null) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      isRefreshing = true;

      try {
        // Call refresh token endpoint with HTTP credentials
        const refreshResponse = await axios.post(
          `${getApiBaseUrl()}${API_CONFIG.refreshEndpoint}`,
          {},
          {
            withCredentials: true,
            headers: API_CONFIG.headers,
          }
        );

        const newAccessToken: string | undefined =
          refreshResponse.data?.accessToken ||
          refreshResponse.data?.data?.accessToken;

        if (!newAccessToken) {
          throw new Error('Invalid token refresh response format.');
        }

        // Store new access token
        tokenManager.setAccessToken(newAccessToken);

        // Update Authorization header for original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Notify and process queued requests
        notifySubscribers(newAccessToken);

        // Retry original failed request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed -> clear subscribers, reset state, and log user out
        notifySubscribers(null);
        tokenManager.triggerLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
