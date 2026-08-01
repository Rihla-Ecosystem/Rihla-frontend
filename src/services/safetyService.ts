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

const DEFAULT_SAFETY_DATA: Record<string, SafetyData> = {
  Giza: {
    governorate: 'Giza',
    safetyScore: 88,
    safetyLevel: 'Safe',
    status: 'safe',
    activeAlertsCount: 0,
    scamRiskLevel: 'Moderate',
    scamAlertsCount: 2,
    emergencyContacts: {
      touristPolice: '126',
      ambulance: '123',
      generalEmergency: '112',
    },
    safetyTips: [
      'Use official guide services near Giza Plateau',
      'Agree on taxi or camel ride fares in advance',
      'Keep hydrated during peak sunlight hours',
    ],
    updatedAt: new Date().toISOString(),
  },
  Cairo: {
    governorate: 'Cairo',
    safetyScore: 90,
    safetyLevel: 'Safe',
    status: 'safe',
    activeAlertsCount: 0,
    scamRiskLevel: 'Moderate',
    scamAlertsCount: 1,
    emergencyContacts: {
      touristPolice: '126',
      ambulance: '123',
      generalEmergency: '112',
    },
    safetyTips: [
      'Use ride-hailing apps like Uber/InDrive for transparent pricing',
      'Be mindful of personal belongings in crowded bazaars like Khan el-Khalili',
    ],
    updatedAt: new Date().toISOString(),
  },
  Luxor: {
    governorate: 'Luxor',
    safetyScore: 92,
    safetyLevel: 'Safe',
    status: 'safe',
    activeAlertsCount: 0,
    scamRiskLevel: 'Moderate',
    scamAlertsCount: 1,
    emergencyContacts: {
      touristPolice: '126',
      ambulance: '123',
      generalEmergency: '112',
    },
    safetyTips: [
      'Book felucca rides through licensed vendors',
      'Carry cash in small denominations for tips',
    ],
    updatedAt: new Date().toISOString(),
  },
  Aswan: {
    governorate: 'Aswan',
    safetyScore: 94,
    safetyLevel: 'Safe',
    status: 'safe',
    activeAlertsCount: 0,
    scamRiskLevel: 'Low',
    scamAlertsCount: 0,
    emergencyContacts: {
      touristPolice: '126',
      ambulance: '123',
      generalEmergency: '112',
    },
    safetyTips: [
      'Enjoy peaceful boat rides with registered Nubian captains',
      'Stay hydrated in warm weather',
    ],
    updatedAt: new Date().toISOString(),
  },
  Alexandria: {
    governorate: 'Alexandria',
    safetyScore: 89,
    safetyLevel: 'Safe',
    status: 'safe',
    activeAlertsCount: 0,
    scamRiskLevel: 'Low',
    scamAlertsCount: 0,
    emergencyContacts: {
      touristPolice: '126',
      ambulance: '123',
      generalEmergency: '112',
    },
    safetyTips: [
      'Be cautious along the Corniche during heavy weather',
      'Use marked yellow-and-black taxis or ride apps',
    ],
    updatedAt: new Date().toISOString(),
  },
  Sinai: {
    governorate: 'Sinai',
    safetyScore: 85,
    safetyLevel: 'Safe',
    status: 'safe',
    activeAlertsCount: 0,
    scamRiskLevel: 'Low',
    scamAlertsCount: 0,
    emergencyContacts: {
      touristPolice: '126',
      ambulance: '123',
      generalEmergency: '112',
    },
    safetyTips: [
      'Stick to established resort areas and tour routes in South Sinai',
      'Always travel with certified bedouin guides for desert treks',
    ],
    updatedAt: new Date().toISOString(),
  },
  'Red Sea': {
    governorate: 'Red Sea',
    safetyScore: 95,
    safetyLevel: 'Safe',
    status: 'safe',
    activeAlertsCount: 0,
    scamRiskLevel: 'Low',
    scamAlertsCount: 0,
    emergencyContacts: {
      touristPolice: '126',
      ambulance: '123',
      generalEmergency: '112',
    },
    safetyTips: [
      'Follow diving and snorkeling safety guidelines',
      'Protect marine life and coral reefs',
    ],
    updatedAt: new Date().toISOString(),
  },
};

export const safetyService = {
  getSafetyInfo: async (lat?: number, lon?: number, gov?: string): Promise<SafetyData> => {
    const governorateKey = gov || 'Giza';

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
      console.warn("apiClient /safety failed, using direct fetch fallback:", e);
    }

    try {
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

      if (res.ok) {
        return await res.json();
      } else {
        console.warn(`Safety API returned status ${res.status} (${res.statusText}), using fallback safety data for ${governorateKey}.`);
      }
    } catch (fetchErr) {
      console.warn("Direct fetch for safety info failed, using fallback safety data:", fetchErr);
    }

    const fallback = DEFAULT_SAFETY_DATA[governorateKey] || DEFAULT_SAFETY_DATA['Giza'];
    return {
      ...fallback,
      governorate: governorateKey,
    };
  },
};

