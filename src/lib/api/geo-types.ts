export type GeoJsonGeometry =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };

export interface GeoPoi {
  id: string;
  name: string;
  name_en?: string | null;
  name_ar?: string | null;
  categories?: string[];
  details?: {
    description?: string;
    images?: string[];
    rating?: number;
    visit_duration?: number;
    best_time?: string;
    tips?: string[];
  } | null;
  governorate?: string | null;
  distance_meters?: number;
  lat: number;
  lon: number;
}

export interface GeoGovernorate {
  name: string;
  name_en?: string | null;
  geometry?: GeoJsonGeometry | null;
}

export interface Site {
  id: string;
  name: string;
  nameAr: string;
  latitude: number;
  longitude: number;
  category: string;
  governorate: string;
  description: string;
  images: string[];
  rating: number;
  visitDuration: number;
  bestTime: string;
  tips: string[];
}

export interface TripPlan {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
  orderedStops: Site[];
}

export interface GeoRoute {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
}

export type ZoneClass = 'restricted' | 'caution' | 'protected';
export type ZoneSeverity = 'critical' | 'warning' | 'info';

/** Anonymous area notice — identity of the zone is deliberately never exposed. */
export interface AreaNotice {
  active: boolean;
  class?: ZoneClass;
  severity?: ZoneSeverity;
  distance_meters?: number;
  guide_key: string;
  legal_keys?: Array<'drone' | 'photography' | 'entry' | 'safety'>;
}

/** Anonymous polygon for the map overlay — class + severity + geometry only. */
export interface ZonePolygon {
  zone_type: ZoneClass;
  severity: ZoneSeverity;
  geometry: GeoJsonGeometry;
}

export interface ZonesResult {
  lat: number;
  lon: number;
  radius_meters: number;
  zones: ZonePolygon[];
}

export interface LegalRule {
  heading: string;
  points: string[];
}

/** Egyptian laws/guides for a zone class (RAG context + optional AI advice). */
export interface LegalGuide {
  source: 'rag' | 'ai';
  class_name: ZoneClass;
  title: string;
  summary: string;
  rules: LegalRule[];
  citations: string[];
  advice?: string | null;
}