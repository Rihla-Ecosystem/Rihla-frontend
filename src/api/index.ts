import createClient, { Middleware } from "openapi-fetch";
import type { paths } from "./generated/types";
import { tokenManager, API_CONFIG, getApiBaseUrl } from "../lib/api";
import { refreshAccessToken } from "../lib/api/refresh";

// The base URL must be set in the frontend config or .env.
// getApiBaseUrl() falls back to the local Core server for development.
export const API_BASE_URL = getApiBaseUrl();

export const apiClient = createClient<paths>({ baseUrl: API_BASE_URL });

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = tokenManager.getAccessToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
  async onResponse({ request, response }) {
    if (response.status !== 401) return response;

    const url = new URL(request.url, API_BASE_URL);

    // Never refresh-retry the refresh or login endpoints themselves
    if (
      url.pathname.includes(API_CONFIG.refreshEndpoint) ||
      url.pathname.includes("/auth/login")
    ) {
      return response;
    }

    // Prevent retry loops — only attempt the refresh once per request
    if (request.headers.get("x-rihla-refreshed")) {
      return response;
    }

    const newToken = await refreshAccessToken();
    if (!newToken) {
      tokenManager.triggerLogout();
      return response;
    }

    const retried = request.clone();
    retried.headers.set("Authorization", `Bearer ${newToken}`);
    retried.headers.set("x-rihla-refreshed", "1");
    return fetch(retried);
  }
};

export function formatApiError(error: unknown, defaultMessage = "API request failed"): Error {
  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);
  if (error && typeof error === "object") {
    const errObj = error as Record<string, any>;
    const message =
      errObj.message ||
      errObj.detail ||
      errObj.error ||
      (errObj.status ? `Request failed with status ${errObj.status}` : null);
    if (message && typeof message === "string") {
      return new Error(message);
    }
  }
  return new Error(defaultMessage);
}

apiClient.use(authMiddleware);
