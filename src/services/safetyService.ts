import { apiClient, API_BASE_URL } from "../api";
import { tokenManager } from "../lib/api";

export interface SafetyData {
  governorate: string;
  safetyScore: number;
  safetyLevel: 'Safe' | 'Moderate Risk' | 'Caution Required' | 'High Risk';
  status: 'safe' | 'caution' | 'warning';
  activeAlertsCount: number;
  scamRiskLevel: 'Low' | 'Moderate' | 'High';
  scamAlertsCount: number;
  emergencyContacts: {
    touristPolice: string;
    ambulance: string;
    generalEmergency: string;
  };
  safetyTips: string[];
  updatedAt: string;
}

export const safetyService = {
  getSafetyInfo: async (lat?: number, lon?: number, gov?: string): Promise<SafetyData> => {
    try {
      const { data, error } = await (apiClient as any).GET("/safety", {
        params: {
          query: { lat, lon, gov, governorate: gov },
        },
      });
      if (!error && data) {
        return data as SafetyData;
      }
    } catch (e) {
      console.warn("apiClient /safety failed, using direct fetch:", e);
    }

    const token = tokenManager.getAccessToken();
    const query = new URLSearchParams();
    if (lat !== undefined && lat !== null) query.append("lat", String(lat));
    if (lon !== undefined && lon !== null) query.append("lon", String(lon));
    if (gov) query.append("gov", gov);

    const res = await fetch(`${API_BASE_URL}/safety?${query.toString()}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch safety info: ${res.statusText}`);
    }

    return await res.json();
  },
};
