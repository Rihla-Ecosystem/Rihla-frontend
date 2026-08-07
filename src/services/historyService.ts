import { API_BASE_URL } from "../api";
import { tokenManager } from "../lib/api";

export interface TripHistoryItem {
  id: string;
  userId: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  itinerary?: any;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserBadgeItem {
  id: number;
  name: string;
  description?: string;
  iconUrl?: string;
  criteriaType: string;
  criteriaValue?: number;
  awardedAt?: string;
}

export interface InteractionSummaryItem {
  id: string;
  userId: string;
  summary: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

export const historyService = {
  getTrips: async (): Promise<TripHistoryItem[]> => {
    try {
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/memory/history`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        return await res.json();
      }
      console.warn(`Trip history API returned status ${res.status}, using empty fallback.`);
    } catch (err) {
      console.warn("Failed to fetch trip history, using fallback:", err);
    }
    return [];
  },

  getBadges: async (userId: string): Promise<UserBadgeItem[]> => {
    try {
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/users/${userId}/badges`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        return await res.json();
      }
      console.warn(`Badges API returned status ${res.status}, using empty fallback.`);
    } catch (err) {
      console.warn("Failed to fetch badges, using fallback:", err);
    }
    return [];
  },

  getSummary: async (): Promise<InteractionSummaryItem | null> => {
    try {
      const token = tokenManager.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/memory/summary`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        return await res.json();
      }
      console.warn(`Summary API returned status ${res.status}, returning null.`);
    } catch (err) {
      console.warn("Failed to fetch interaction summary:", err);
    }
    return null;
  },

  createTrip: async (tripData: {
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    itinerary?: any;
    notes?: string;
  }): Promise<TripHistoryItem> => {
    const token = tokenManager.getAccessToken();
    const res = await fetch(`${API_BASE_URL}/memory/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(tripData),
    });

    if (!res.ok) {
      throw new Error(`Failed to create trip record: ${res.statusText}`);
    }

    return await res.json();
  },
};
