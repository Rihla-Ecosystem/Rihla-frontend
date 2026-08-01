import { apiClient } from "../api";

export const envService = {
  getEnv: async (lat: number, lon: number) => {
    const { data, error } = await apiClient.GET("/env", {
      params: {
        query: { lat, lon },
      },
    });
    if (error) throw error;
    return data;
  },
};
