import { apiClient, formatApiError } from "../api";
import { tokenManager } from "../lib/api";

export const userService = {
  getProfile: async () => {
    const token = tokenManager.getAccessToken();
    const { data, error } = await apiClient.GET("/users/me", {
      headers: token ? ({ Authorization: `Bearer ${token}` } as any) : {},
    });
    if (error) throw formatApiError(error, "Failed to get user profile");
    return data;
  },
  updateProfile: async (updates: Record<string, any>) => {
    const token = tokenManager.getAccessToken();
    const { data, error } = await apiClient.PATCH("/users/me", {
      body: updates as any,
      headers: token ? ({ Authorization: `Bearer ${token}` } as any) : {},
    });
    if (error) throw formatApiError(error, "Failed to update user profile");
    return data;
  },
};


