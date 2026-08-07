import type { GeoPoint } from './types';

export interface QueueEntry {
  id: string;
  point: GeoPoint;
  reason: 'movement' | 'geofence_enter' | 'geofence_exit' | 'initial' | 'manual';
  attempts: number;
  queuedAt: number;
  nextRetryAt: number;
}

const QUEUE_KEY = 'rihla_location_queue';

const BASE_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 60_000;
const MAX_ATTEMPTS = 6;

function id(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readQueue(): QueueEntry[] {
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueueEntry[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueueEntry[]) {
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-100)));
  } catch {
    /* ignore quota */
  }
}

/**
 * Exponential backoff delay for a given attempt index (1-based).
 */
export function backoffDelay(attempt: number): number {
  const capped = Math.min(Math.pow(2, Math.min(attempt - 1, 5)), MAX_BACKOFF_MS);
  return Math.min(BASE_BACKOFF_MS * capped, MAX_BACKOFF_MS);
}

/**
 * OfflineQueue buffers location updates that failed to send while offline,
 * and replays them with exponential backoff once connectivity returns.
 */
export const offlineQueue = {
  enqueue(point: GeoPoint, reason: QueueEntry['reason']): void {
    const now = Date.now();
    const queue = readQueue();
    queue.push({
      id: id(),
      point,
      reason,
      attempts: 0,
      queuedAt: now,
      nextRetryAt: now + backoffDelay(1),
    });
    writeQueue(queue);
  },

  pending(): QueueEntry[] {
    const now = Date.now();
    return readQueue().filter((e) => e.nextRetryAt <= now);
  },

  all(): QueueEntry[] {
    return readQueue();
  },

  size(): number {
    return readQueue().length;
  },

  /**
   * Runs the given send function against every due entry. Entries that
   * succeed are removed; failed entries get attempts incremented and are
   * scheduled for a later backoff retry (or dropped after MAX_ATTEMPTS).
   */
  async flush(send: (entry: QueueEntry) => Promise<void>): Promise<{ sent: number; remaining: number }> {
    const queue = readQueue();
    const now = Date.now();
    const due = queue.filter((e) => e.nextRetryAt <= now);
    if (due.length === 0) return { sent: 0, remaining: queue.length };

    const done = new Set<string>();
    const retry: QueueEntry[] = [];

    for (const entry of due) {
      if (entry.attempts >= MAX_ATTEMPTS) {
        done.add(entry.id);
        continue;
      }
      try {
        await send(entry);
        done.add(entry.id);
      } catch {
        retry.push({
          ...entry,
          attempts: entry.attempts + 1,
          nextRetryAt: now + backoffDelay(entry.attempts + 1),
        });
      }
    }

    const kept = queue
      .filter((e) => !done.has(e.id))
      .map((e) => (retry.some((r) => r.id === e.id) ? retry.find((r) => r.id === e.id)! : e));
    writeQueue(kept);

    return { sent: done.size, remaining: kept.length };
  },

  clear(): void {
    try {
      window.localStorage.removeItem(QUEUE_KEY);
    } catch {
      /* ignore */
    }
  },
};
