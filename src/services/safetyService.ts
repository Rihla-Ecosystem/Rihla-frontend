import { apiClient, API_BASE_URL } from '../api';
import { tokenManager } from '../lib/api';
import {
  RISK_SCORE,
  RISK_STATUS,
  RISK_LEVEL_LABEL,
  toRiskSeverity,
  type RiskSeverity,
} from '@/lib/constants/riskMeta';

export type EventCategory =
  | 'seismic'
  | 'weather'
  | 'fire'
  | 'flood'
  | 'unrest'
  | 'health'
  | 'crime'
  | 'advisory'
  | 'tsunami';

export type EventSeverity = RiskSeverity;

export interface SafetyEvent {
  source: string;
  category: EventCategory;
  severity: EventSeverity;
  city: string | null;
  lat: number | null;
  lon: number | null;
  headline: string;
  detail?: string;
  effectiveTime: string | null;
  expiresTime?: string | null;
}

export interface CityState {
  key: string;
  name: string;
  gov: string;
  lat: number;
  lon: number;
  overallRisk: EventSeverity;
  events: SafetyEvent[];
  updatedAt: string | null;
  score: number;
  status: 'safe' | 'caution' | 'warning' | 'critical';
  level: string;
  distanceKm: number | null;
  scamRiskLevel?: 'high' | 'moderate' | 'low';
  activeAlertsCount?: number;
  totalSignals?: number;
  govNote?: string | null;
}

export interface SafetyData {
  governorate: string;
  safetyScore: number | null;
  safetyLevel: string | null;
  status: 'safe' | 'caution' | 'warning' | 'critical' | null;
  activeAlertsCount: number | null;
  scamRiskLevel: 'high' | 'moderate' | 'low' | null;
  scamAlertsCount: number | null;
  emergencyContacts: {
    touristPolice?: string;
    ambulance?: string;
    generalEmergency?: string;
  } | null;
  liveContacts?: Record<string, unknown>[] | null;
  safetyTips: string[];
  updatedAt: string | null;
  source: 'live' | 'offline';
  events: SafetyEvent[];
  cities: CityState[];
  categories: Partial<Record<EventCategory, number>>;
  govNote?: string | null;
}

export interface SafetySnapshot {
  data: SafetyData | null;
  source: 'live' | 'offline';
}

export interface SourceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  lastUpdate: string;
  category: string;
}

export interface SafetySourceHealth {
  sources: SourceStatus[];
}

const CITY_META: Record<string, { gov: string; lat: number; lon: number }> = {
  cairo: { gov: 'Cairo', lat: 30.0444, lon: 31.2357 },
  giza: { gov: 'Giza', lat: 29.9773, lon: 31.1325 },
  alexandria: { gov: 'Alexandria', lat: 31.2001, lon: 29.9187 },
  luxor: { gov: 'Luxor', lat: 25.6872, lon: 32.6396 },
  aswan: { gov: 'Aswan', lat: 24.0889, lon: 32.8998 },
  hurghada: { gov: 'Red Sea', lat: 27.2579, lon: 33.8116 },
  sharm_el_sheikh: { gov: 'South Sinai', lat: 27.9158, lon: 34.3300 },
  dahab: { gov: 'South Sinai', lat: 28.5091, lon: 34.5136 },
  marsa_alam: { gov: 'Red Sea', lat: 25.0676, lon: 34.8790 },
  el_gouna: { gov: 'Red Sea', lat: 27.3942, lon: 33.6783 },
  siwa_oasis: { gov: 'Matrouh', lat: 29.2032, lon: 25.5197 },
};

function hasMeaningfulSafetyData(data: SafetyData): boolean {
  return (
    data.safetyScore !== null ||
    Boolean(data.safetyLevel) ||
    Boolean(data.status) ||
    data.activeAlertsCount !== null ||
    data.scamAlertsCount !== null ||
    Boolean(data.scamRiskLevel) ||
    data.safetyTips.length > 0 ||
    data.events.length > 0 ||
    data.cities.length > 0
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

function buildFallbackSafetyData(gov?: string): SafetyData {
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
    scamRiskLevel: 'low',
    scamAlertsCount: 0,
    emergencyContacts: null,
    liveContacts: null,
    safetyTips: FALLBACK_TIPS,
    updatedAt: new Date().toISOString(),
    source: 'offline',
    events: [],
    cities: [],
    categories: {},
  };
}

function normalizeSafetyData(payload: any): SafetyData {
  return {
    governorate: pickString(payload?.governorate) || pickString(payload?.gov) || 'Unknown area',
    safetyScore: pickNumber(payload?.safetyScore),
    safetyLevel: pickString(payload?.safetyLevel),
    status:
      payload?.status === 'safe' || payload?.status === 'caution' || payload?.status === 'warning' || payload?.status === 'critical'
        ? payload.status
        : null,
    activeAlertsCount: pickNumber(payload?.activeAlertsCount),
    scamRiskLevel:
      payload?.scamRiskLevel === 'high' || payload?.scamRiskLevel === 'moderate' || payload?.scamRiskLevel === 'low'
        ? payload.scamRiskLevel
        : null,
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
    events: [],
    cities: [],
    categories: {},
  };
}

// Core-Server /safety proxies Risk_Intelligence, returning a multi-city map:
// { safety: { cairo: { updatedAt, events[], overallRisk }, ... } }.
// Score/status/level are derived from the shared riskMeta table (higher = safer).
function titleCase(value: string): string {
  return value
    .replace(/[_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseEvent(raw: any): SafetyEvent | null {
  if (!raw || typeof raw !== 'object') return null;
  const headline = pickString(raw?.headline) || pickString(raw?.title);
  if (!headline) return null;
  return {
    source: pickString(raw?.source) || 'unknown',
    category: (raw?.category as EventCategory) || 'advisory',
    severity: (raw?.severity as EventSeverity) || (raw?.type as EventSeverity) || 'info',
    city: pickString(raw?.city),
    lat: pickNumber(raw?.lat),
    lon: pickNumber(raw?.lon),
    headline,
    detail: pickString(raw?.detail) || pickString(raw?.description) || undefined,
    effectiveTime: pickString(raw?.effectiveTime) || pickString(raw?.timestamp),
    expiresTime: pickString(raw?.expiresTime),
  };
}

function countCategories(events: SafetyEvent[]): Partial<Record<EventCategory, number>> {
  const counts: Partial<Record<EventCategory, number>> = {};
  for (const e of events) {
    counts[e.category] = (counts[e.category] ?? 0) + 1;
  }
  return counts;
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function mapCityMap(payload: any, gov?: string, refLat?: number, refLon?: number): SafetyData | null {
  const map = payload?.safety ?? payload;
  if (!map || typeof map !== 'object') return null;

  // Build live city states first (all cities carried in the same payload).
  const cities: CityState[] = [];
  for (const [key, v] of Object.entries(map)) {
    if (!v || typeof v !== 'object') continue;
    const raw = v as Record<string, unknown>;
    const overall = pickString(raw?.overallRisk) || 'info';
    const events = (Array.isArray(raw.events) ? raw.events : [])
      .map((e) => parseEvent(e as Record<string, unknown>))
      .filter((e): e is SafetyEvent => e !== null);
    const meta = CITY_META[key] ?? { gov: titleCase(key), lat: NaN, lon: NaN };
    const scam = raw?.scamRiskLevel;
    const severity = toRiskSeverity(overall);
    cities.push({
      key,
      name: titleCase(key),
      gov: meta.gov,
      lat: meta.lat,
      lon: meta.lon,
      overallRisk: severity as EventSeverity,
      events,
      updatedAt: pickString(raw?.updatedAt),
      score: RISK_SCORE[severity],
      status: RISK_STATUS[severity],
      level: RISK_LEVEL_LABEL[severity],
      distanceKm:
        Number.isFinite(meta.lat) && Number.isFinite(meta.lon) && refLat != null && refLon != null
          ? distanceKm(refLat, refLon, meta.lat, meta.lon)
          : null,
      ...(scam === 'high' || scam === 'moderate' || scam === 'low' ? { scamRiskLevel: scam } : {}),
      ...(typeof raw?.activeAlertsCount === 'number' ? { activeAlertsCount: raw.activeAlertsCount } : {}),
      ...(typeof raw?.totalSignals === 'number' ? { totalSignals: raw.totalSignals } : {}),
      ...(typeof raw?.govNote === 'string' && raw.govNote.trim() ? { govNote: raw.govNote } : {}),
    });
  }

  // Pick the active city entry based on gov name or coords; default to nearest.
  let activeIndex = 0;
  const govKey = (gov || '').toLowerCase().trim();
  const match = cities.findIndex(
    (c) => govKey && (c.key === govKey || c.key.includes(govKey) || c.gov.toLowerCase().includes(govKey))
  );
  if (match >= 0) activeIndex = match;
  else if (cities.length > 0 && refLat != null && refLon != null && !Number.isNaN(refLat)) {
    activeIndex = cities.reduce((best, c, i) => {
      const d = c.distanceKm ?? Infinity;
      return d < (cities[best].distanceKm ?? Infinity) ? i : best;
    }, 0);
  }
  const entryCity = cities[activeIndex];

  if (!entryCity) return null;

  const tips = entryCity.events
    .filter((e) => e.severity !== 'info')
    .map((e) => e.headline)
    .slice(0, 4);

  const liveContacts = Array.isArray(payload?.contacts) ? payload.contacts : null;

  return {
    governorate: gov || entryCity.gov || 'Egypt',
    safetyScore: entryCity.score,
    safetyLevel: entryCity.level,
    status: entryCity.status,
    activeAlertsCount: entryCity.activeAlertsCount ?? entryCity.events.filter((e) => e.severity !== 'info').length,
    scamRiskLevel: entryCity.scamRiskLevel ?? null,
    scamAlertsCount: null,
    emergencyContacts: null,
    liveContacts,
    safetyTips: tips.length ? tips : FALLBACK_TIPS.slice(0, 4),
    updatedAt: entryCity.updatedAt || new Date().toISOString(),
    source: 'live',
    events: entryCity.events,
    cities,
    categories: countCategories(entryCity.events),
    govNote: entryCity.govNote ?? null,
  };
}

export const safetyService = {
  getSafetySnapshot: async (
    lat?: number,
    lon?: number,
    gov?: string
  ): Promise<SafetySnapshot> => {
    try {
      const { data, error } = await (apiClient as any).GET('/safety', {
        params: {
          query: { lat, lon, gov, governorate: gov },
        },
      });
      if (!error && data) {
        const mapped = mapCityMap(data, gov, lat, lon);
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
        const mapped = mapData(payload, gov, lat, lon);
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

  /** Real per-source health from Core `/safety/sources` (proxies Risk engine). */
  getSourcesHealth: async (): Promise<SourceStatus[] | null> => {
    try {
      const token = tokenManager.getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE_URL}/safety/sources`, { headers });
      if (!res.ok) return null;
      const payload = await res.json();
      const list = payload?.sources ?? payload;
      if (!Array.isArray(list)) return null;
      return list.map((s: Record<string, unknown>) => ({
        name: String(s?.name ?? 'source'),
        status: (['healthy', 'degraded', 'down'].includes(String(s?.status))
          ? String(s?.status)
          : 'degraded') as SourceStatus['status'],
        lastUpdate: String(s?.lastUpdate ?? 'Never'),
        category: String(s?.category ?? 'source'),
      }));
    } catch {
      return null;
    }
  },

  /** Extract city list from safety data for dynamic "Nearby" dropdown. */
  getCitiesFromSafety: async (lat?: number, lon?: number, gov?: string): Promise<Array<{ name: string; gov: string; lat: number; lon: number }>> => {
    try {
      const safetyData = await safetyService.getSafetyInfo(lat, lon, gov);
      if (safetyData?.cities && safetyData.cities.length > 0) {
        return safetyData.cities.map(c => ({
          name: c.name,
          gov: c.gov,
          lat: c.lat,
          lon: c.lon,
        }));
      }
    } catch {
      // fall through to static fallback
    }
    // Static fallback from CITY_META
    return Object.entries(CITY_META).map(([key, meta]) => ({
      name: titleCase(key),
      gov: meta.gov,
      lat: meta.lat,
      lon: meta.lon,
    }));
  },
};

function mapData(payload: any, gov?: string, lat?: number, lon?: number): SafetyData | null {
  return mapCityMap(payload, gov, lat, lon);
}