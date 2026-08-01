import { apiClient, formatApiError } from "../api";

export const geoService = {
  getPois: async (lat: number, lon: number, radius?: number, categories?: string) => {
    const { data, error } = await apiClient.GET("/geo/pois", {
      params: {
        query: { lat, lon, radius, categories },
      },
    });
    if (error) throw formatApiError(error, "Failed to fetch points of interest from server");
    return data;
  },
  searchPlaces: async (q: string, lat?: number, lon?: number) => {
    const { data, error } = await apiClient.GET("/geo/search", {
      params: {
        query: { q, lat, lon },
      },
    });
    if (error) throw formatApiError(error, "Failed to search places from server");
    return data;
  },
};

