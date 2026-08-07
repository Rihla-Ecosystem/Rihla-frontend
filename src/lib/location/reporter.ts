import type { GeofenceEvent, GeoPoint } from './types';
import { movedBeyond } from './distance';
import { detectGeofenceTransitions, type GeofenceDefinition } from './geofence';
import { offlineQueue } from './offline-queue';
import { reportLocation, type NotificationInbox } from '@/lib/api';

export interface ReporterOptions {
  movementThresholdMeters: number;
  lastPosition: GeoPoint | null;
  lastSentPosition: GeoPoint | null;
  fences: GeofenceDefinition[];
  onReported: (notifications: NotificationInbox[]) => void;
  onFailed?: (point: GeoPoint) => void;
  /** Invoked after a successful send regardless of whether notifications were created. */
  onSent?: (point: GeoPoint) => void;
}

export interface ReporterDecision {
  reason: 'movement' | 'geofence_enter' | 'geofence_exit' | 'initial' | 'manual' | 'none';
  geofenceEvents: GeofenceEvent[];
}

/**
 * Applies the frontend location-send rules:
 *   1. User moved more than the movement threshold.
 *   2. User entered a geofence.
 *   3. User exited a geofence.
 * If none apply, no request is made. Failed sends are queued for retry.
 */
export function shouldReportPosition(
  point: GeoPoint,
  options: Pick<ReporterOptions, 'movementThresholdMeters' | 'lastPosition' | 'lastSentPosition' | 'fences'>
): ReporterDecision {
  const { movementThresholdMeters, lastPosition, lastSentPosition, fences } = options;

  const transitions = detectGeofenceTransitions(point, lastPosition, fences);
  const geofenceEvents: GeofenceEvent[] = [
    ...transitions.enter.map((f) => ({ fenceId: f.id, name: f.name, type: 'enter' as const, polygon: f.polygon })),
    ...transitions.exit.map((f) => ({ fenceId: f.id, name: f.name, type: 'exit' as const, polygon: f.polygon })),
  ];

  if (geofenceEvents.length > 0) {
    return {
      reason: transitions.enter.length > 0 ? 'geofence_enter' : 'geofence_exit',
      geofenceEvents,
    };
  }

  if (movedBeyond(point, lastSentPosition, movementThresholdMeters)) {
    return { reason: 'movement', geofenceEvents: [] };
  }

  return { reason: 'none', geofenceEvents: [] };
}

/**
 * Sends a location update only if a rule triggers it. Reports return any
 * generated notifications from the Context Engine.
 */
export async function reportPosition(point: GeoPoint, options: ReporterOptions): Promise<void> {
  const decision = shouldReportPosition(point, options);

  if (decision.reason === 'none') return;

  try {
    const created = await reportLocation({
      lat: point.lat,
      lng: point.lng,
      reason: decision.reason,
      geofenceEvents: decision.geofenceEvents.length > 0 ? decision.geofenceEvents : undefined,
      timestamp: Date.now(),
    });
    if (created?.length) options.onReported(created);
    options.onSent?.(point);
    void offlineQueue.flush(async (entry) => {
      const result = await reportLocation({
        lat: entry.point.lat,
        lng: entry.point.lng,
        reason: entry.reason,
        timestamp: Date.now(),
      });
      if (result?.length) options.onReported(result);
      options.onSent?.(entry.point);
    });
  } catch {
    offlineQueue.enqueue(point, decision.reason);
    options.onFailed?.(point);
  }
}
