'use client';

import { useSyncExternalStore } from 'react';

export type AppUnits = 'metric' | 'imperial';

export interface AppSettings {
  rafiqPersona: string;
  language: string;
  units: AppUnits;
  notifs: {
    scamAlerts: boolean;
    weather: boolean;
    rafiqTips: boolean;
    journeyXP: boolean;
    siteUpdates: boolean;
    marketing: boolean;
  };
  privacy: {
    locationLive: boolean;
    shareHistory: boolean;
    analytics: boolean;
    crashReports: boolean;
  };
}

const STORAGE_KEY = 'rihla_user_settings';

const DEFAULTS: AppSettings = {
  rafiqPersona: 'historian',
  language: 'English',
  units: 'metric',
  notifs: {
    scamAlerts: true,
    weather: true,
    rafiqTips: true,
    journeyXP: true,
    siteUpdates: false,
    marketing: false,
  },
  privacy: {
    locationLive: true,
    shareHistory: false,
    analytics: true,
    crashReports: true,
  },
};

let cache: AppSettings | null = null;
const listeners = new Set<() => void>();

function read(): AppSettings {
  if (cache) return cache;
  let base: AppSettings = { ...DEFAULTS };
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        base = {
          ...DEFAULTS,
          ...parsed,
          notifs: { ...DEFAULTS.notifs, ...parsed.notifs },
          privacy: { ...DEFAULTS.privacy, ...parsed.privacy },
        };
      }
    } catch {
      /* ignore */
    }
  }
  cache = base;
  return base;
}

function emit() {
  listeners.forEach((l) => l());
}

export function getAppSettings(): AppSettings {
  return read();
}

export function setAppSettings(patch: Partial<AppSettings>): AppSettings {
  const next = { ...read(), ...patch };
  if (patch.notifs) next.notifs = { ...DEFAULTS.notifs, ...patch.notifs };
  if (patch.privacy) next.privacy = { ...DEFAULTS.privacy, ...patch.privacy };
  cache = next;
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  } catch {
    /* ignore */
  }
  emit();
  return next;
}

export function subscribeAppSettings(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useAppSettings(): AppSettings {
  return useSyncExternalStore(subscribeAppSettings, read, read);
}
