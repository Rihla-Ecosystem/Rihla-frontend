import type { GeoPoint } from './types';

const LAST_POSITION_KEY = 'rihla_last_position';
const LAST_SENT_KEY = 'rihla_last_sent';

function readPoint(key: string): GeoPoint | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as GeoPoint) : null;
  } catch {
    return null;
  }
}

function writePoint(key: string, point: GeoPoint | null) {
  try {
    if (point) window.localStorage.setItem(key, JSON.stringify(point));
    else window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function readLastPosition(): GeoPoint | null {
  return readPoint(LAST_POSITION_KEY);
}

export function writeLastPosition(point: GeoPoint | null): void {
  writePoint(LAST_POSITION_KEY, point);
}

export function readLastSentPosition(): GeoPoint | null {
  return readPoint(LAST_SENT_KEY);
}

export function writeLastSentPosition(point: GeoPoint | null): void {
  writePoint(LAST_SENT_KEY, point);
}
