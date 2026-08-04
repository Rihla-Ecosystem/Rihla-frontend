import { apiClient, API_BASE_URL } from '../api';
import { tokenManager } from '../lib/api';

export interface SafetyData {
  governorate: string;
  safetyScore: number | null;
  safetyLevel: string | null;
  status: 'safe' | 'caution' | 'warning' | null;
  activeAlertsCount: number | null;
  scamRiskLevel: string | null;
  scamAlertsCount: number | null;
  emergencyContacts: {
    touristPolice?: string;
    ambulance?: string;
    generalEmergency?: string;
  } | null;
  safetyTips: string[];
  updatedAt: string | null;
  source: 'live' | 'offline';
}

export interface SafetySnapshot {
  data: SafetyData | null;
  source: 'live' | 'offline';
}

function hasMeaningfulSafetyData(data: SafetyData): boolean {
  return (
    data.safetyScore !== null ||
    Boolean(data.safetyLevel) ||
    Boolean(data.status) ||
    data.activeAlertsCount !== null ||
    data.scamAlertsCount !== null ||
    Boolean(data.scamRiskLevel) ||
    data.safetyTips.length > 0
  );
}

function pickNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function pickString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

export const FALLBACK_GOV_PROFILES: Record<
  string,
  { score: number; status: 'safe' | 'caution'; alerts: number; level: string }
> = {
  Cairo: { score: 88, status: 'safe', alerts: 1, level: 'Low Risk' },
  Giza: { score: 86, status: 'safe', alerts: 1, level: 'Low Risk' },
  Luxor: { score: 92, status: 'safe', alerts: 0, level: 'Very Low Risk' },
  Aswan: { score: 93, status: 'safe', alerts: 0, level: 'Very Low Risk' },
  Alexandria: { score: 87, status: 'safe', alerts: 1, level: 'Low Risk' },
  'Red Sea': { score: 90, status: 'safe', alerts: 0, level: 'Low Risk' },
  Sinai: { score: 62, status: 'caution', alerts: 2, level: 'Caution Advised' },
  Hurghada: { score: 90, status: 'safe', alerts: 0, level: 'Low Risk' },
};

const FALLBACK_TIPS = [
  'Keep a photocopy of your passport and visa separate from the originals.',
  'Use licensed taxis or ride-hailing apps and agree on the fare before starting the trip.',
  'Stay hydrated and carry bottled water — heat exhaustion is the most common traveler issue.',
  'Dress modestly at religious sites and always carry a scarf or cover-up.',
  'Exchange currency only at banks or official exchange offices, never on the street.',
  'Keep valuables out of reach in crowds and avoid displaying large amounts of cash.',
];

function buildFallbackSafetyData(gov?: string, lat?: number, lon?: number): SafetyData {
  const profile = FALLBACK_GOV_PROFILES[gov ?? ''] ?? {
    score: 88,
    status: 'safe' as const,
    alerts: 1,
    level: 'Low Risk',
  };
  return {
    governorate: gov || 'Egypt',
    safetyScore: profile.score,
    safetyLevel: profile.level,
    status: profile.status,
    activeAlertsCount: profile.alerts,
    scamRiskLevel: 'Low',
    scamAlertsCount: 0,
    emergencyContacts: {
      touristPolice: '126',
      ambulance: '123',
      generalEmergency: '112',
    },
    safetyTips: FALLBACK_TIPS,
    updatedAt: new Date().toISOString(),
    source: 'offline',
  };
}

function normalizeSafetyData(payload: any): SafetyData {
  return {
    governorate: pickString(payload?.governorate) || pickString(payload?.gov) || 'Unknown area',
    safetyScore: pickNumber(payload?.safetyScore),
    safetyLevel: pickString(payload?.safetyLevel),
    status:
      payload?.status === 'safe' || payload?.status === 'caution' || payload?.status === 'warning'
        ? payload.status
        : null,
    activeAlertsCount: pickNumber(payload?.activeAlertsCount),
    scamRiskLevel: pickString(payload?.scamRiskLevel),
    scamAlertsCount: pickNumber(payload?.scamAlertsCount),
    emergencyContacts:
      payload?.emergencyContacts && typeof payload.emergencyContacts === 'object'
        ? payload.emergencyContacts
        : null,
    safetyTips: Array.isArray(payload?.safetyTips)
      ? payload.safetyTips.filter((tip: unknown) => typeof tip === 'string')
      : [],
    updatedAt: pickString(payload?.updatedAt),
    source: 'live',
  };
}

export const safetyService = {
  getSafetySnapshot: async (lat?: number, lon?: number, gov?: string): Promise<SafetySnapshot> => {
    try {
      const { data, error } = await (apiClient as any).GET('/safety', {
        params: {
          query: { lat, lon, gov, governorate: gov },
        },
      });
      if (!error && data) {
        const normalized = normalizeSafetyData(data);
        if (hasMeaningfulSafetyData(normalized)) {
          return { data: normalized, source: 'live' };
        }
      }
    } catch (e) {
      console.warn('apiClient /safety failed, trying direct fetch:', e);
    }

    try {
      const token = tokenManager.getAccessToken();
      const query = new URLSearchParams();
      if (lat !== undefined && lat !== null) query.append('lat', String(lat));
      if (lon !== undefined && lon !== null) query.append('lon', String(lon));
      if (gov) query.append('gov', gov);

      const res = await fetch(`${API_BASE_URL}/safety?${query.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const payload = await res.json();
        const normalized = normalizeSafetyData(payload);
        if (hasMeaningfulSafetyData(normalized)) {
          return { data: normalized, source: 'live' };
        }
      }
    } catch (fetchErr) {
      console.warn('Direct fetch for safety info failed:', fetchErr);
    }

    return { data: buildFallbackSafetyData(gov), source: 'offline' };
  },
  getSafetyInfo: async (lat?: number, lon?: number, gov?: string): Promise<SafetyData | null> => {
    const snapshot = await safetyService.getSafetySnapshot(lat, lon, gov);
    return snapshot.data;
  },
};