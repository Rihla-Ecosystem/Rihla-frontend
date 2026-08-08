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

// Core-Server /safety proxies Risk_Intelligence, returning a multi-city map:
// { safety: { cairo: { updatedAt, events[], overallRisk }, ... } }.
// Map it onto the flat SafetyData model the page renders.
const CITY_STATUS: Record<string, SafetyData['status']> = {
  info: 'safe',
  advisory: 'caution',
  warning: 'warning',
  critical: 'warning',
};

const CITY_SCORE: Record<string, number> = {
  info: 92,
  advisory: 78,
  warning: 58,
  critical: 42,
};

const CITY_LEVEL: Record<string, string> = {
  info: 'Low Risk',
  advisory: 'Moderate Risk',
  warning: 'High Risk',
  critical: 'Critical Risk',
};

function titleCase(value: string): string {
  return value
    .replace(/[_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function mapCityMap(payload: any, gov?: string): SafetyData | null {
  const map = payload?.safety ?? payload;
  if (!map || typeof map !== 'object') return null;

  let entry: any = null;
  let key = '';
  const govKey = (gov || '').toLowerCase().trim();
  for (const [k, v] of Object.entries(map)) {
    const kc = k.replace(/_/g, ' ').toLowerCase();
    if (govKey && (kc === govKey || kc.includes(govKey) || govKey.includes(kc))) {
      entry = v;
      key = k;
      break;
    }
  }
  if (!entry) {
    const first = Object.entries(map)[0];
    entry = first?.[1];
    key = first?.[0] ?? '';
  }
  if (!entry || typeof entry !== 'object') return null;

  const overall = pickString(entry?.overallRisk) || 'info';
  const events: any[] = Array.isArray(entry?.events) ? entry.events : [];
  const tips = events
    .filter((e) => e && typeof e.headline === 'string')
    .map((e) => e.headline)
    .slice(0, 4);

  return {
    governorate: gov || titleCase(key) || 'Egypt',
    safetyScore: CITY_SCORE[overall] ?? 92,
    safetyLevel: CITY_LEVEL[overall] ?? 'Low Risk',
    status: CITY_STATUS[overall] ?? 'safe',
    activeAlertsCount: events.length,
    scamRiskLevel: 'Low',
    scamAlertsCount: 0,
    emergencyContacts: {
      touristPolice: '126',
      ambulance: '123',
      generalEmergency: '112',
    },
    safetyTips: tips.length ? tips : FALLBACK_TIPS.slice(0, 4),
    updatedAt: pickString(entry?.updatedAt) || new Date().toISOString(),
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
        const mapped = mapCityMap(data, gov);
        if (mapped && hasMeaningfulSafetyData(mapped)) {
          return { data: mapped, source: 'live' };
        }
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
        const mapped = mapCityMap(payload, gov);
        if (mapped && hasMeaningfulSafetyData(mapped)) {
          return { data: mapped, source: 'live' };
        }
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