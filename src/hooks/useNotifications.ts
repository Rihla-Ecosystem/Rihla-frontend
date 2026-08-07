'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchInbox,
  fetchUnreadCount,
  markRead,
  markAllRead,
  deleteInboxItem,
  openNotificationStream,
  syncAfterReconnect,
  reportLocation,
  type NotificationInbox,
} from '@/lib/api';
import {
  offlineQueue,
  reportPosition,
  startTracking,
  type GeofenceDefinition,
  type ReporterOptions,
  type TrackerHandle,
  locationStorage,
  requestPermission,
} from '@/lib/location';

const MOVEMENT_THRESHOLD_M = 1000;
const TRACK_INTERVAL_MS = 60_000;
const ACTIVE_FENCES_KEY = 'rihla_active_geofences';

function readFences(): GeofenceDefinition[] {
  try {
    const raw = window.localStorage.getItem(ACTIVE_FENCES_KEY);
    return raw ? (JSON.parse(raw) as GeofenceDefinition[]) : [];
  } catch {
    return [];
  }
}

function writeFences(fences: GeofenceDefinition[]) {
  try {
    window.localStorage.setItem(ACTIVE_FENCES_KEY, JSON.stringify(fences));
  } catch {
    /* ignore */
  }
}

export function useNotifications() {
  const [inbox, setInbox] = useState<NotificationInbox[]>([]);
  const [unread, setUnread] = useState(0);
  const [tracking, setTracking] = useState(false);
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [lastError, setLastError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const lastPosRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastSentRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastCloseRef = useRef<(() => void) | null>(null);
  const trackerRef = useRef<TrackerHandle | null>(null);
  const fencesRef = useRef<GeofenceDefinition[]>([]);

  const pushNotification = useCallback((n: NotificationInbox) => {
    setInbox((prev) => [n, ...prev.filter((x) => x.id !== n.id)]);
    if (!n.isRead) setUnread((u) => u + 1);
  }, []);

  // Initial load: inbox + unread count
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [page, u] = await Promise.all([fetchInbox({ limit: 50 }), fetchUnreadCount()]);
        if (!alive) return;
        if (page) setInbox(page.notifications);
        setUnread(u);
      } catch {
        /* offline continue */
      } finally {
        if (alive) setInitialized(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Hydrate persisted state from local storage
  useEffect(() => {
    lastPosRef.current = locationStorage.readLastPosition();
    lastSentRef.current = locationStorage.readLastSentPosition();
    fencesRef.current = readFences();
  }, []);

  // Online/offline tracking + queue flush on reconnect
  useEffect(() => {
    const onOnline = () => {
      setOnline(true);
      void offlineQueue.flush(async (entry) => {
        const result = await reportLocation({ lat: entry.point.lat, lng: entry.point.lng, reason: entry.reason });
        if (result?.length) result.forEach((n) => pushNotification(n));
      });
    };
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [pushNotification]);

  // Live Server-Sent Events stream
  useEffect(() => {
    let active = true;
    openNotificationStream({
      onNotification: (n) => {
        if (active) pushNotification(n);
      },
      onError: () => undefined,
    }).then((close) => {
      if (active) lastCloseRef.current = close;
      else close();
    });
    return () => {
      active = false;
      lastCloseRef.current?.();
      lastCloseRef.current = null;
    };
  }, [pushNotification]);

  // Background location tracker wired to the location reporter engine
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLastError('Geolocation is not supported on this device.');
      return;
    }

    void requestPermission().then((granted) => {
      if (!granted) {
        setLastError('Location permission was denied.');
        return;
      }

      const reportOptions = (): ReporterOptions => ({
        movementThresholdMeters: MOVEMENT_THRESHOLD_M,
        lastPosition: lastPosRef.current,
        lastSentPosition: lastSentRef.current,
        fences: fencesRef.current,
        onReported: (notifications) => {
          if (notifications.length) notifications.forEach((n) => pushNotification(n));
        },
        onSent: (point) => {
          lastSentRef.current = point;
          locationStorage.writeLastSentPosition(point);
        },
      });

      trackerRef.current = startTracking(
        {
          onPosition: (point) => {
            lastPosRef.current = point;
            locationStorage.writeLastPosition(point);
            setTracking(true);
            void reportPosition(point, reportOptions());
          },
          onError: (message) => {
            setTracking(false);
            setLastError(message);
          },
        },
        { enableHighAccuracy: true, intervalMs: TRACK_INTERVAL_MS }
      );
    });

    return () => trackerRef.current?.stop();
  }, [pushNotification]);

  const markOneRead = useCallback(async (id: string) => {
    setInbox((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
    try {
      await markRead(id);
    } catch {
      /* ignore */
    }
  }, []);

  const markEveryRead = useCallback(async () => {
    setInbox((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
    try {
      await markAllRead();
    } catch {
      /* ignore */
    }
  }, []);

  const removeInbox = useCallback(async (id: string) => {
    setInbox((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteInboxItem(id);
    } catch {
      /* ignore */
    }
  }, []);

  const resync = useCallback(async () => {
    setLastError(null);
    try {
      await syncAfterReconnect();
      const page = await fetchInbox({ limit: 50 });
      if (page) setInbox(page.notifications);
      setUnread(await fetchUnreadCount());
    } catch {
      setLastError('Sync failed — check your connection.');
    }
  }, []);

  const registerFences = useCallback((fences: GeofenceDefinition[]) => {
    fencesRef.current = fences;
    writeFences(fences);
  }, []);

  return {
    inbox,
    unread,
    tracking,
    online,
    initialized,
    lastError,
    markOneRead,
    markEveryRead,
    removeInbox,
    resync,
    registerFences,
    pendingOfflineReports: offlineQueue.size(),
  } as const;
}
