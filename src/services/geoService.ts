import { apiClient, formatApiError } from '../api';

export const geoService = {
  getPois: async (lat: number, lon: number, radius?: number, categories?: string) => {
    const { data, error } = await apiClient.GET('/geo/pois', {
      params: {
        query: { lat, lon, radius, categories },
      },
    });
    if (error) throw formatApiError(error, 'Failed to fetch points of interest from server');
    return data;
  },
  searchPlaces: async (q: string, lat?: number, lon?: number) => {
    const { data, error } = await apiClient.GET('/geo/search', {
      params: {
        query: { q, lat, lon },
      },
    });
    if (error) throw formatApiError(error, 'Failed to search places from server');
    return data;
  },
getSitesByGovernorate: async (governorateName: string, category?: string) => {
    try {
      const { data, error } = await (apiClient as any).GET('/geo/sites-by-governorate', {
        params: {
          query: { governorate_name: governorateName, category },
        },
      });
      if (!error && data) return data;
    } catch {
      // Fallback if specific endpoint is not available
    }
    return geoService.searchPlaces(governorateName);
  },

  getGovernorates: async () => {
    const { data, error } = await (apiClient as any).GET('/geo/governorates', {
      params: { query: {} },
    });
    if (error) throw formatApiError(error, 'Failed to fetch governorates');
    return data;
  },

  getSite: async (id: string) => {
    const { data, error } = await (apiClient as any).GET(`/geo/sites/${id}`);
    if (error) throw formatApiError(error, 'Failed to fetch site details');
    return data;
  },

  fetchPoisProgressive: async (
    lat: number,
    lon: number,
    governorateName: string = 'Egypt',
    categories?: string,
    onProgress?: (progress: {
      radius: number;
      attempt: number;
      message: string;
      isGovernorateFallback: boolean;
    }) => void
  ) => {
    const radii = [5, 10, 25, 50]; // Radii in km

    for (let i = 0; i < radii.length; i++) {
      const radiusKm = radii[i];
      const radiusMeters = radiusKm * 1000;

      const progressMsg =
        i === 0
          ? `Searching places within ${radiusKm} km...`
          : `Expanding search: checking places within ${radiusKm} km...`;

      onProgress?.({
        radius: radiusKm,
        attempt: i + 1,
        message: progressMsg,
        isGovernorateFallback: false,
      });

      try {
        const res = await geoService.getPois(lat, lon, radiusMeters, categories);
        const pois = (res as any)?.pois || (Array.isArray(res) ? res : []);

        if (Array.isArray(pois) && pois.length > 0) {
          const resultMsg =
            i === 0
              ? `Places within ${radiusKm} km`
              : `Expanded search: places within ${radiusKm} km`;

          return {
            pois,
            radius: radiusKm,
            source: 'geo_radius' as const,
            message: resultMsg,
          };
        }
      } catch (err) {
        console.warn(`Progressive POI search failed at ${radiusKm}km radius:`, err);
      }
    }

    // After 50km empty result: Governorate fallback
    onProgress?.({
      radius: 50,
      attempt: 5,
      message: `No POIs within 50 km. Fetching popular attractions in ${governorateName}...`,
      isGovernorateFallback: true,
    });

    try {
      const fallbackRes = await geoService.getSitesByGovernorate(governorateName, categories);
      const pois = (fallbackRes as any)?.pois || (Array.isArray(fallbackRes) ? fallbackRes : []);

      if (Array.isArray(pois) && pois.length > 0) {
        return {
          pois,
          radius: null,
          source: 'governorate_fallback' as const,
          message: `Popular attractions in ${governorateName}`,
        };
      }

      const fallbackQueries = [governorateName, `${governorateName} Egypt`, 'Egypt'];

      for (const query of fallbackQueries) {
        const searchRes = await geoService.searchPlaces(query, lat, lon).catch((err) => {
          console.warn(`Search fallback failed for ${query}:`, err);
          return null;
        });
        const searchPois = (searchRes as any)?.pois || (Array.isArray(searchRes) ? searchRes : []);

        if (Array.isArray(searchPois) && searchPois.length > 0) {
          return {
            pois: searchPois,
            radius: null,
            source: 'governorate_fallback' as const,
            message: `Popular attractions near ${query}`,
          };
        }
      }
    } catch (err) {
      console.warn('Governorate fallback search failed:', err);
    }

    return {
      pois: [],
      radius: 50,
      source: 'none' as const,
      message: `No points of interest found in ${governorateName}`,
    };
  },
};
