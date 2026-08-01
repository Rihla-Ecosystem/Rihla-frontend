import { apiClient } from "../api";

export const geoService = {
  getPois: async (lat: number, lon: number, radius?: number, categories?: string) => {
    const { data, error } = await apiClient.GET("/geo/pois", {
      params: {
        query: { lat, lon, radius, categories },
      },
    });
    if (error) throw error;
    return data;
  },
};
