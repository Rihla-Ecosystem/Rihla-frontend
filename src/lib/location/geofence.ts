import type { GeoPoint } from './types';

export interface GeofenceDefinition {
  id?: string;
  name?: string;
  polygon: GeoPoint[];
}

export interface GeofenceDetection {
  enter: GeofenceDefinition[];
  exit: GeofenceDefinition[];
}

/**
 * Point-in-polygon test (ray casting) for a convex/concave polygon.
 */
export function pointInPolygon(point: GeoPoint, polygon: GeoPoint[]): boolean {
  if (!polygon || polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat;
    const yi = polygon[i].lng;
    const xj = polygon[j].lat;
    const yj = polygon[j].lng;
    const intersects =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

/**
 * Given the user's new position and their previously-known position,
 * returns which fences were entered or exited.
 */
export function detectGeofenceTransitions(
  position: GeoPoint,
  previous: GeoPoint | null,
  fences: GeofenceDefinition[],
): GeofenceDetection {
  const enter: GeofenceDefinition[] = [];
  const exit: GeofenceDefinition[] = [];

  for (const fence of fences) {
    const nowInside = pointInPolygon(position, fence.polygon);
    const wasInside = previous ? pointInPolygon(previous, fence.polygon) : false;
    if (nowInside && !wasInside) enter.push(fence);
    if (!nowInside && wasInside) exit.push(fence);
  }

  return { enter, exit };
}
