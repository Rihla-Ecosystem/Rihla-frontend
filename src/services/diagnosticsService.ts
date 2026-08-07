import { apiClient, API_BASE_URL } from '../api';
import { tokenManager } from '../lib/api';

/**
 * Backend Diagnostics
 * Proves the frontend is correctly wired to the Core Server: health, auth,
 * and the location-based APIs. Each check returns status, latency, and
 * whether real backend data (vs demo/offline fallback) was received.
 */

export type DiagResult = {
  endpoint: string;
  ok: boolean;
  status: number | null;
  ms: number;
  detail: string;
  hasData: boolean;
  source: 'backend' | 'demo' | 'offline';
};

const BASE = API_BASE_URL.replace(/\/+$/, '');
const ROOT = BASE.replace(/\/api$/, '');

async function timed(url: string, init?: RequestInit): Promise<{ res: Response; ms: number }> {
  const start = performance.now();
  const res = await fetch(url, init);
  return { res, ms: Math.round(performance.now() - start) };
}

function result(
  endpoint: string,
  res: Response | null,
  ms: number,
  detail: string,
  hasData: boolean
): DiagResult {
  const ok = res ? res.status >= 200 && res.status < 400 : false;
  return {
    endpoint,
    ok,
    status: res?.status ?? null,
    ms,
    detail,
    hasData,
    source: ok ? 'backend' : 'offline',
  };
}

async function jsonCount(body: unknown): Promise<number> {
  if (Array.isArray(body)) return body.length;
  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>;
    for (const key of ['items', 'data', 'pois', 'results']) {
      if (Array.isArray(b[key])) return (b[key] as unknown[]).length;
    }
  }
  return 0;
}

export const diagnosticsService = {
  /** Core API health (mounted at server root, not /api). */
  async health(): Promise<DiagResult> {
    try {
      const { res, ms } = await timed(`${ROOT}/health`);
      const text = await res.text().catch(() => '');
      const detail =
        res.ok ? `Server reachable${text ? ` · ${text.slice(0, 60)}` : ''}` : `HTTP ${res.status}`;
      return result('/health', res, ms, detail, res.ok);
    } catch (e) {
      return { endpoint: '/health', ok: false, status: null, ms: 0, detail: `Network error: ${(e as Error).message}`, hasData: false, source: 'offline' };
    }
  },

  /** Authenticated session check via /users/me. */
  async auth(): Promise<DiagResult> {
    const hasToken = !!tokenManager.getAccessToken();
    try {
      const start = performance.now();
      const { data, error, response } = await apiClient.GET('/users/me');
      const ms = Math.round(performance.now() - start);
      const status = response?.status ?? (error ? 400 : 200);
      if (data) {
        return result('/users/me', response ?? null, ms, `Authenticated as ${(data as any).displayName || (data as any).email || 'user'}`, true);
      }
      const detail = error
        ? (status === 401 ? 'Not authenticated — sign in first' : `HTTP ${status}`)
        : 'No profile data';
      return result('/users/me', response ?? null, ms, detail, false);
    } catch (e) {
      return {
        endpoint: '/users/me',
        ok: false,
        status: null,
        ms: 0,
        detail: hasToken ? `Request failed: ${(e as Error).message}` : 'No token stored — sign in first',
        hasData: false,
        source: 'offline',
      };
    }
  },

  /** Location-based API probe (needs a token). */
  async location(endpoint: '/geo/pois' | '/env' | '/safety', lat: number, lon: number): Promise<DiagResult> {
    const token = tokenManager.getAccessToken();
    const query = new URLSearchParams({ lat: String(lat), lon: String(lon) });
    if (endpoint === '/geo/pois') query.set('radius', '10000');
    try {
      const { res, ms } = await timed(`${BASE}${endpoint}?${query.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const body = await res.json().catch(() => null);
        const count = await jsonCount(body);
        const detail =
          count > 0 ? `Received data (${count} items)` : 'Backend responded (no items)';
        return result(endpoint, res, ms, detail, count > 0);
      }
      const detail =
        res.status === 401
          ? token
            ? 'HTTP 401 — token invalid or expired'
            : 'HTTP 401 — sign in first'
          : `HTTP ${res.status}`;
      return result(endpoint, res, ms, detail, false);
    } catch (e) {
      return {
        endpoint,
        ok: false,
        status: null,
        ms: 0,
        detail: `Network error: ${(e as Error).message}`,
        hasData: false,
        source: 'offline',
      };
    }
  },

  /** Journey history check via /memory/history. */
  async history(): Promise<DiagResult> {
    const token = tokenManager.getAccessToken();
    try {
      const { res, ms } = await timed(`${BASE}/memory/history`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const body = await res.json().catch(() => []);
        const count = Array.isArray(body) ? body.length : 0;
        return result('/memory/history', res, ms, count > 0 ? `Received ${count} trip record(s)` : 'Backend responded (no trips)', count > 0);
      }
      const detail =
        res.status === 401
          ? token
            ? 'HTTP 401 — token invalid or expired'
            : 'HTTP 401 — sign in first'
          : `HTTP ${res.status}`;
      return result('/memory/history', res, ms, detail, false);
    } catch (e) {
      return {
        endpoint: '/memory/history',
        ok: false,
        status: null,
        ms: 0,
        detail: `Network error: ${(e as Error).message}`,
        hasData: false,
        source: 'offline',
      };
    }
  },

  /** Run the full battery in parallel. */
  async runAll(lat: number, lon: number): Promise<DiagResult[]> {
    const [h, a, geo, env, saf, mem] = await Promise.all([
      diagnosticsService.health(),
      diagnosticsService.auth(),
      diagnosticsService.location('/geo/pois', lat, lon),
      diagnosticsService.location('/env', lat, lon),
      diagnosticsService.location('/safety', lat, lon),
      diagnosticsService.history(),
    ]);
    return [h, a, geo, env, saf, mem];
  },
};
