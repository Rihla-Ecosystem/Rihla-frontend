import type { GeoPoint } from './types';

export interface TrackerCallbacks {
  onPosition: (position: GeoPoint) => void;
  onError: (message: string) => void;
}

export interface TrackerHandle {
  stop: () => void;
  getLastPosition: () => GeoPoint | null;
}

export interface TrackerOptions {
  enableHighAccuracy?: boolean;
  /** ms between interval-based refreshes. Default 60_000. */
  intervalMs?: number;
  timeoutMs?: number;
  maximumAgeMs?: number;
}

/**
 * LocationTracker wraps `navigator.geolocation` to emit the user's current
 * position on an interval. It is the sole module that talks to the browser's
 * location APIs.
 */
export function startTracking(callbacks: TrackerCallbacks, options: TrackerOptions = {}): TrackerHandle {
  const {
    enableHighAccuracy = true,
    intervalMs = 60_000,
    timeoutMs = 15_000,
    maximumAgeMs = 60_000,
  } = options;

  let last: GeoPoint | null = null;
  let interval: ReturnType<typeof setInterval> | null = null;
  let stopped = false;

  const sample = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (stopped) return;
        last = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        callbacks.onPosition(last);
      },
      (err) => {
        if (!stopped) callbacks.onError(err.message);
      },
      { enableHighAccuracy, timeout: timeoutMs, maximumAge: maximumAgeMs }
    );
  };

  sample();
  interval = setInterval(sample, intervalMs);

  return {
    stop: () => {
      stopped = true;
      if (interval) clearInterval(interval);
      interval = null;
    },
    getLastPosition: () => last,
  };
}
