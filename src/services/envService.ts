import { apiClient } from '../api';
import { getApiBaseUrl } from '../lib/api/config';
import { tokenManager } from '../lib/api/token-manager';

export interface NormalizedEnvData {
  weather: Record<string, any>;
  airQuality: Record<string, any>;
  overview: Record<string, any>;
  prayerTimes: Record<string, any>;
  temperature: number | null;
  feelsLike: number | null;
  airQualityIndex: number | null;
  uvIndex: number | null;
  summary: string | null;
  updatedAt: string | null;
  raw: any;
}

export interface EnvSnapshot {
  data: NormalizedEnvData | null;
  source: 'live' | 'offline';
}

function hasMeaningfulEnvData(data: NormalizedEnvData): boolean {
  return (
    data.temperature !== null ||
    data.feelsLike !== null ||
    data.airQualityIndex !== null ||
    data.uvIndex !== null ||
    Boolean(data.summary) ||
    Object.keys(data.weather || {}).length > 0 ||
    Object.keys(data.airQuality || {}).length > 0
  );
}

function pickNumber(...values: any[]): number | null {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

function pickString(...values: any[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value;
  }
  return null;
}

function unwrapEnvPayload(payload: any): any {
  let current = payload;
  for (let i = 0; i < 3; i++) {
    if (!current || typeof current !== 'object') break;
    if (
      current.weather || current.airQuality || current.overview || current.prayerTimes ||
      current.temperature !== undefined || current.temp !== undefined || current.temp_c !== undefined ||
      current.current_weather || current.main || current.current
    ) {
      break;
    }
    const next = current.data || current.result || current.payload || current.environment || current.env;
    if (!next || next === current) break;
    current = next;
  }
  return current;
}

function normalizeEnvData(data: any): NormalizedEnvData {
  const payload = unwrapEnvPayload(data);
  const weather = payload?.weather || payload?.current || payload?.currentWeather || payload?.forecast?.current || {};
  const airQuality = payload?.airQuality || payload?.air_quality || payload?.aqi || {};
  const overview = payload?.overview || payload?.summary || {};
  const prayerTimes = payload?.prayerTimes || payload?.prayer_times || {};

  const temperature = pickNumber(
    weather?.temperature, weather?.temp, weather?.feels_like, weather?.feelsLike,
    overview?.temperature, overview?.temp, payload?.temperature, payload?.temp,
    data?.temperature, data?.temp,
    payload?.current_weather?.temperature, payload?.current?.temp_c,
    payload?.current?.temp, payload?.main?.temp, payload?.temp_c,
    payload?.temp_f !== undefined ? ((payload.temp_f - 32) * 5) / 9 : undefined,
  );
  const feelsLike = pickNumber(
    weather?.feelsLike, weather?.feels_like, weather?.apparent_temperature,
    overview?.feelsLike, overview?.feels_like, payload?.feelsLike, payload?.feels_like,
    payload?.apparent_temperature, payload?.main?.feels_like, payload?.current?.feelslike_c,
  );
  const airQualityIndex = pickNumber(
    airQuality?.aqi, airQuality?.index, airQuality?.us_aqi, airQuality?.european_aqi,
    airQuality?.value, payload?.aqi, payload?.air_quality_index, overview?.aqi, data?.aqi,
  );
  const uvIndex = pickNumber(
    weather?.uvIndex, weather?.uv, weather?.uv_index, overview?.uvIndex,
    overview?.uv, overview?.uv_index, payload?.uvIndex, payload?.uv, payload?.uv_index,
    payload?.daily?.uv_index_max?.[0],
  );
  const summary = pickString(
    weather?.summary, weather?.condition, weather?.description,
    overview?.summary, overview?.description, payload?.summary, payload?.description
  );
  const updatedAt = pickString(
    payload?.updatedAt, payload?.lastUpdated, overview?.updatedAt, overview?.lastUpdated
  );

  return {
    weather, airQuality, overview, prayerTimes,
    temperature, feelsLike, airQualityIndex, uvIndex,
    summary, updatedAt, raw: payload,
  };
}

function buildFallbackEnvData(lat: number, lon: number): NormalizedEnvData {
  const weather = {
    temperature: 33,
    feelsLike: 37,
    uvIndex: 7,
    visibility: 'Clear',
    summary: 'Hot and sunny',
    condition: 'Sunny',
    description: 'Hot, dry and sunny — typical Egyptian conditions',
  };
  const airQuality = {
    aqi: 72,
    index: 72,
  };
  return {
    weather,
    airQuality,
    overview: {
      temperature: 33,
      summary: 'Hot and sunny',
      aqi: 72,
    },
    prayerTimes: {},
    temperature: 33,
    feelsLike: 37,
    airQualityIndex: 72,
    uvIndex: 7,
    summary: 'Hot and sunny',
    updatedAt: new Date().toISOString(),
    raw: { weather, airQuality },
  };
}

export const envService = {
  getEnvSnapshot: async (lat: number, lon: number): Promise<EnvSnapshot> => {
    try {
      const { data, error } = await apiClient.GET('/env', {
        params: { query: { lat, lon } },
      });
      if (!error && data) {
        const normalized = normalizeEnvData(data);
        if (hasMeaningfulEnvData(normalized)) {
          return { data: normalized, source: 'live' };
        }
      }
    } catch (err) {
      console.warn('apiClient /env failed, trying direct fetch fallback:', err);
    }

    try {
      const baseUrl = getApiBaseUrl();
      if (!baseUrl) throw new Error('Environment API base URL is not configured');

      const query = new URLSearchParams({ lat: String(lat), lon: String(lon) });
      const token = tokenManager.getAccessToken();

      const response = await fetch(`${baseUrl}/env?${query.toString()}`, {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        const payload = await response.json();
        const normalized = normalizeEnvData(payload);
        if (hasMeaningfulEnvData(normalized)) {
          return { data: normalized, source: 'live' };
        }
      }
    } catch (fetchErr) {
      console.warn('Direct fetch for env info failed:', fetchErr);
    }

    return { data: buildFallbackEnvData(lat, lon), source: 'offline' };
  },
  getEnv: async (lat: number, lon: number) => {
    const snapshot = await envService.getEnvSnapshot(lat, lon);
    return snapshot.data;
  },
};