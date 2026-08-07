/**
 * Location Engine — shared geometry + state primitives.
 */

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeofenceEvent {
  fenceId?: string;
  name?: string;
  type: 'enter' | 'exit';
  polygon: GeoPoint[];
}

export interface LocationReportReason {
  reason: 'movement' | 'geofence_enter' | 'geofence_exit' | 'initial' | 'manual';
  geofenceEvents?: GeofenceEvent[];
}

export type LocationTrigger = LocationReportReason['reason'];
