'use client';

import { useSyncExternalStore } from 'react';
import { preferencesApi } from './api/preferences';

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
  };
  privacy: {
    locationLive: boolean;
    analytics: boolean;
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
  },
  privacy: {
    locationLive: true,
    analytics: true,
  },
};

const KEY_PERSONA = 'rafiq.persona';
const KEY_UNITS = 'app.units';
const KEY_NOTIFS = 'notifs';
const KEY_PRIVACY = 'privacy';

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function persistToServer(next: AppSettings, patch: Partial<AppSettings>) {
  const pushes: Promise<void>[] = [];
  if (patch.rafiqPersona !== undefined) {
    pushes.push(preferencesApi.set(KEY_PERSONA, next.rafiqPersona));
  }
  if (patch.units !== undefined) {
    pushes.push(preferencesApi.set(KEY_UNITS, next.units));
  }
  if (patch.notifs !== undefined) {
    pushes.push(preferencesApi.set(KEY_NOTIFS, next.notifs));
  }
  if (patch.privacy !== undefined) {
    pushes.push(preferencesApi.set(KEY_PRIVACY, next.privacy));
  }
  if (pushes.length) {
    Promise.allSettled(pushes).then((results) => {
      for (const r of results) {
        if (r.status === 'rejected') {
          console.warn('Preferences sync failed', r.reason);
        }
      }
    });
  }
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
  persistToServer(next, patch);
  return next;
}

/**
 * Pulls user preferences from the backend and merges them over local
 * defaults/cache. Safe to call once when the user is signed in; returns the
 * merged settings, or null when offline/unauthenticated.
 */
export async function syncAppSettingsFromServer(): Promise<AppSettings | null> {
  let prefs: Record<string, unknown>;
  try {
    prefs = await preferencesApi.getAll();
  } catch {
    return null;
  }
  if (!prefs || Object.keys(prefs).length === 0) return null;

  const base = read();
  const next: AppSettings = { ...base };
  if (typeof prefs[KEY_PERSONA] === 'string') next.rafiqPersona = prefs[KEY_PERSONA];
  if (
    typeof prefs[KEY_UNITS] === 'string' &&
    (prefs[KEY_UNITS] === 'metric' || prefs[KEY_UNITS] === 'imperial')
  ) {
    next.units = prefs[KEY_UNITS];
  }
  if (isRecord(prefs[KEY_NOTIFS])) {
    next.notifs = { ...DEFAULTS.notifs, ...(prefs[KEY_NOTIFS] as AppSettings['notifs']) };
  }
  if (isRecord(prefs[KEY_PRIVACY])) {
    next.privacy = { ...DEFAULTS.privacy, ...(prefs[KEY_PRIVACY] as AppSettings['privacy']) };
  }

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
  return useSyncExternalStore(subscribeAppSettings, read, () => DEFAULTS);
}
