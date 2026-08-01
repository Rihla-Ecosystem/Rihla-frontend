import { apiClient } from "../api";
import { getAuthHeader } from "../providers/AuthProvider";

export const userService = {
  getProfile: async () => {
    const { data, error } = await apiClient.GET("/users/me", {
      headers: getAuthHeader() as any,
    });
    if (error) throw error;
    return data;
  },
  updateProfile: async (updates: Record<string, any>) => {
    // Note: The specific types will depend on the API schema for user update
    const { data, error } = await apiClient.PATCH("/users/me", {
      body: updates as any,
      headers: getAuthHeader() as any,
    });
    if (error) throw error;
    return data;
  }
};
