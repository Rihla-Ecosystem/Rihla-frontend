import axios from 'axios';
import { API_CONFIG, getApiBaseUrl } from './config';
import { tokenManager } from './token-manager';

let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  try {
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
      return null;
    }

    tokenManager.setAccessToken(newAccessToken);
    return newAccessToken;
  } catch {
    tokenManager.clearTokens();
    return null;
  }
}

/**
 * Single-flight access-token refresh.
 * All callers share the same in-flight refresh so Core never sees concurrent
 * refresh requests (it rotates and revokes refresh tokens on each use).
 */
export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
