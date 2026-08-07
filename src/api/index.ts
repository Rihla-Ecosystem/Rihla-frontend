import createClient, { Middleware } from "openapi-fetch";
import type { paths } from "./generated/types";
import { tokenManager } from "../lib/api";

// The base URL must be set in the frontend config or .env
// We default to the local core server if not set
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

export const apiClient = createClient<paths>({ baseUrl: API_BASE_URL });

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = tokenManager.getAccessToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
  async onResponse({ response }) {
    // Optionally handle 401 refresh logic here or rely on client.ts
    return response;
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
