import { apiClient } from './client';

export interface FavoriteInput {
  placeId: string;
  placeName: string;
  category?: string;
  governorate?: string;
  lat?: number;
  lon?: number;
  img?: string;
}

export interface Favorite extends Required<Pick<FavoriteInput, 'placeId' | 'placeName'>> {
  id: string;
  category: string | null;
  governorate: string | null;
  lat: number | null;
  lon: number | null;
  img: string | null;
  createdAt: string;
}

export const placesApi = {
  listFavorites: async (): Promise<Favorite[]> => {
    const res = await apiClient.get<{ success: boolean; data: Favorite[] }>('/places/favorites');
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  isFavorited: async (placeId: string): Promise<boolean> => {
    const res = await apiClient.get<{ success: boolean; data: { favorited: boolean } }>(`/places/favorites/${encodeURIComponent(placeId)}`);
    return Boolean(res.data?.data?.favorited);
  },

  addFavorite: async (input: FavoriteInput): Promise<Favorite> => {
    const res = await apiClient.post<{ success: boolean; data: Favorite }>('/places/favorites', {
      placeId: input.placeId,
      placeName: input.placeName,
      category: input.category,
      governorate: input.governorate,
      lat: input.lat,
      lon: input.lon,
      img: input.img,
    });
    return res.data?.data as Favorite;
  },

  removeFavorite: async (placeId: string): Promise<void> => {
    await apiClient.delete(`/places/favorites/${encodeURIComponent(placeId)}`);
  },

  recordEvent: async (input: {
    event: string;
    siteId?: string;
    siteName?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> => {
    try {
      await apiClient.post('/places/events', {
        event: input.event,
        site_id: input.siteId,
        site_name: input.siteName,
        metadata: input.metadata,
      });
    } catch {
      // analytics must never block the UI
    }
  },
};