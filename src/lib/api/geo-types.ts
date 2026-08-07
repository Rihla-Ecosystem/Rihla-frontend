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