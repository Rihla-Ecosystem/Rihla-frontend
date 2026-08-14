// ---------------------------------------------------------------------------
// Zone & Context Realtime (SSE) + anonymous area notification
// ---------------------------------------------------------------------------
// Browser EventSource cannot send an Authorization header, so we use a
// fetch-based SSE reader (same pattern as chatService.streamMessage). The
// server pushes anonymous `zone` enter/exit events and inbox notifications;
// zone identity is never sent to the client.
import { tokenManager, getApiBaseUrl } from "../lib/api";
import { refreshAccessToken } from "../lib/api/refresh";
import { apiClient } from "../lib/api";
import { geoApi } from "../lib/api/geo";
import type { ZoneClass, ZoneSeverity, AreaNotice } from "../lib/api/geo-types";

const CORE_API_URL = getApiBaseUrl();

export interface ZoneEvent {
  event: "enter" | "exit";
  class: ZoneClass;
  severity: ZoneSeverity;
  distance_meters?: number;
}

export interface StreamIncoming {
  type?: string;
  kind?: string;
  data?: unknown;
  notification?: Record<string, unknown>;
  event?: string;
}

export interface ZoneStreamHandlers {
  onZone?: (zone: ZoneEvent) => void;
  onNotification?: (notification: Record<string, unknown>) => void;
  onDisconnect?: () => void;
}

const authHeaders = (): Record<string, string> => {
  const token = tokenManager.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Opens a persistent fetch-based SSE stream and reconnects with backoff.
 * Returns an abort function.
 */
export function subscribeZoneStream(handlers: ZoneStreamHandlers): () => void {
  let aborted = false;
  let controller: AbortController | null = null;
  let retry = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const open = async () => {
    if (aborted) return;
    controller = new AbortController();
    try {
      const res = await fetch(`${CORE_API_URL}/context-notifications/stream`, {
        headers: authHeaders(),
        signal: controller.signal,
      });
      if (res.status === 401) {
        // Access token expired while the stream was running. Refresh once
        // (single-flight, same code path as the axios interceptor) then retry
        // with the fresh token instead of hammering the server / spamming 401s.
        const fresh = await refreshAccessToken();
        if (fresh && !aborted) {
          retry = 0;
          return open();
        }
        throw new Error(`stream auth failed: ${res.status}`);
      }
      if (!res.ok || !res.body) {
        throw new Error(`stream failed: ${res.status}`);
      }

      retry = 0;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (!aborted) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let sep;
        while ((sep = buffer.indexOf("\n\n")) !== -1) {
          const raw = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          for (const line of raw.split("\n")) {
            if (line.startsWith("data: ")) {
              try {
                const payload = JSON.parse(line.slice(6)) as StreamIncoming;
                handlePayload(payload, handlers);
              } catch {
                // ignore malformed frames
              }
            }
          }
        }
      }
    } catch {
      // network error / abort — fall through to reconnect
    }

    if (aborted) return;
    const delay = Math.min(15000, 1000 * 2 ** retry);
    retry += 1;
    handlers.onDisconnect?.();
    timer = setTimeout(open, delay);
  };

  void open();

  return () => {
    aborted = true;
    if (timer) clearTimeout(timer);
    controller?.abort();
  };
}

function handlePayload(payload: StreamIncoming, handlers: ZoneStreamHandlers): void {
  // `context` events carry { kind, data } from publishContextEvent.
  if (payload.type === "context" && payload.kind === "zone") {
    const data = payload.data as ZoneEvent | undefined;
    if (data && (data.event === "enter" || data.event === "exit") && data.class) {
      handlers.onZone?.(data);
    }
    return;
  }
  // `notification` events carry a full inbox notification.
  if (payload.type === "notification" || payload.notification) {
    handlers.onNotification?.((payload.notification as Record<string, unknown>) ?? {});
  }
}

// ---------------------------------------------------------------------------
// Location pings — let the server-side zone state machine track position.
// ---------------------------------------------------------------------------

let lastPingAt = 0;
const PING_MIN_INTERVAL_MS = 15000;

/**
 * Reports the user's position to the context engine, but never more often than
 * every `PING_MIN_INTERVAL_MS`. Fire-and-forget, silent on failure.
 */
export async function reportLocation(lat: number, lon: number): Promise<void> {
  const now = Date.now();
  if (now - lastPingAt < PING_MIN_INTERVAL_MS) return;
  lastPingAt = now;
  try {
    await apiClient.post(
      "/context-notifications/location",
      { lat, lng: lon, reason: "movement", timestamp: now },
      { timeout: 8000 }
    );
  } catch {
    // silent — server may be offline; the SSE stream will reflect missed events
  }
}

/** Fetches the current anonymous area notice (bootstrap for the banner). */
export function currentAreaNotice(lat: number, lon: number, radius?: number): Promise<AreaNotice> {
  return geoApi.getAreaNotice(lat, lon, radius);
}