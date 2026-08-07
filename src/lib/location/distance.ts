import type { GeoPoint } from './types';

const EARTH_RADIUS_M = 6_371_000;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Haversine distance between two coordinates in meters.
 */
export function haversineMeters(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const sa = Math.sin(dLat / 2) * Math.sin(dLat / 2);
  const sb =
    Math.cos(toRadians(a.lat)) *
    Math.cos(toRadians(b.lat)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(sa + sb));
}

/**
 * True if `a` and `b` are more than `thresholdMeters` apart.
 */
export function movedBeyond(point: GeoPoint, previous: GeoPoint | null, thresholdMeters: number): boolean {
  if (!previous) return true;
  return haversineMeters(point, previous) >= thresholdMeters;
}

/**
 * Distance in kilometers (rounded to 1 decimal) for display purposes.
 */
export function km(point: GeoPoint, other: GeoPoint): number {
  return Math.round((haversineMeters(point, other) / 1000) * 10) / 10;
}
