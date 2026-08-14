import { apiClient } from "@/lib/api";
import type { GeoGovernorate, GeoPoi, Site, AreaNotice, ZonesResult, LegalGuide, ZoneClass } from "./geo-types";

export const HERITAGE_CATEGORIES = [
  "archaeological",
  "islamic",
  "christian",
] as const;

export const ALL_CATEGORIES = [...HERITAGE_CATEGORIES, "infrastructure"];

export const CATEGORY_LABELS: Record<string, string> = {
  archaeological: "Archaeological",
  islamic: "Islamic",
  christian: "Christian",
  infrastructure: "Infrastructure",
};

function toSite(poi: GeoPoi): Site {
  const details = poi.details || {};
  return {
    id: String(poi.id),
    name: poi.name_en || poi.name,
    nameAr: poi.name_ar || "",
    latitude: poi.lat,
    longitude: poi.lon,
    category: poi.categories?.[0] || "archaeological",
    governorate: poi.governorate || "",
    description: details.description || "",
    images: details.images || [],
    rating: details.rating ?? 4.5,
    visitDuration: details.visit_duration ?? 120,
    bestTime: details.best_time || "year-round",
    tips: details.tips || [],
  };
}

const ROUTE_TIMEOUT_MS = 10000;
const FALLBACK_DRIVE_KMH = 45;

const ROUTE_PROVIDERS = [
  'https://routing.openstreetmap.de/routed-car',
  'https://router.project-osrm.org',
];

function haversineMeters(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function fallbackDuration(distanceMeters: number): number {
  return Math.round((distanceMeters / 1000 / FALLBACK_DRIVE_KMH) * 3600);
}

async function fetchJsonWithTimeout(url: string, timeoutMs: number): Promise<any | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Tries each routing provider until one responds.
async function fetchRouteJson(
  path: 'route' | 'trip',
  coords: string,
  extraQuery: string
): Promise<any | null> {
  for (const base of ROUTE_PROVIDERS) {
    const url = `${base}/${path}/v1/driving/${coords}?overview=full&geometries=geojson${extraQuery}`;
    const json = await fetchJsonWithTimeout(url, ROUTE_TIMEOUT_MS);
    if (json) return json;
  }
  return null;
}

// OSRM GeoJSON returns [longitude, latitude]; Leaflet polylines need [latitude, longitude].
function normalizeCoords(coords: [number, number][]): [number, number][] {
  return coords.map(([lng, lat]) => [lat, lng]);
}

function fallbackRoute(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
) {
  const distanceMeters = haversineMeters(from.latitude, from.longitude, to.latitude, to.longitude);
  return {
    coordinates: [
      [from.latitude, from.longitude],
      [to.latitude, to.longitude],
    ] as [number, number][],
    distanceMeters,
    durationSeconds: fallbackDuration(distanceMeters),
    approximate: true,
  };
}

export const geoApi = {
  getGovernorates: async (): Promise<GeoGovernorate[]> => {
    const { data } = await apiClient.get<GeoGovernorate[]>("/geo/governorates");
    return (data || [])
      .map((g) => ({ name: g.name_en || g.name || "", geometry: g.geometry || null }))
      .filter((g) => !!g.name)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  getSitesByGovernorate: async (
    governorate: string,
    category?: string,
    limit?: number
  ): Promise<Site[]> => {
    const { data } = await apiClient.get<{ pois?: GeoPoi[] }>(
      "/geo/sites-by-governorate",
      { params: { governorate_name: governorate, category, limit } }
    );
    return ((data || {}).pois || []).map(toSite);
  },

  getCountryBoundary: async (): Promise<GeoGovernorate["geometry"] | null> => {
    const { data } = await apiClient.get<
      { geometry?: GeoGovernorate["geometry"] | null }[]
    >("/geo/country");
    const boundary = (data || []).find((b) => b.geometry);
    return boundary?.geometry || null;
  },

  getNearbySites: async (
    lat: number,
    lng: number,
    radius?: number,
    categories?: string[]
  ): Promise<Site[]> => {
    const { data } = await apiClient.get<{ pois?: GeoPoi[] }>("/geo/pois", {
      params: {
        lat,
        lon: lng,
        radius,
categories: categories?.join(",") || HERITAGE_CATEGORIES.join(","),
      },
    });
    return ((data || {}).pois || []).map(toSite);
  },

  getRoute: async (
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number }
  ) => {
    const coords = `${from.longitude},${from.latitude};${to.longitude},${to.latitude}`;
    const json = await fetchRouteJson('route', coords, '');
    const route = json?.routes?.[0];
    if (route?.geometry?.coordinates) {
      return {
        coordinates: normalizeCoords(route.geometry.coordinates as [number, number][]),
        distanceMeters: route.distance || 0,
        durationSeconds: route.duration || 0,
        approximate: false,
      };
    }
    return fallbackRoute(from, to);
  },

  getTrip: async (
    start: { latitude: number; longitude: number },
    sites: Site[]
  ) => {
    if (sites.length === 0) return null;
    const coords = [
      `${start.longitude},${start.latitude}`,
      ...sites.map((s) => `${s.longitude},${s.latitude}`),
    ].join(";");
    const json = await fetchRouteJson('trip', coords, '&roundtrip=false&source=first');
    const trip = json?.trips?.[0];
    const waypoints: { waypoint_index: number }[] = json?.waypoints || [];
    if (trip?.geometry?.coordinates && waypoints.length > 0) {
      const order = [...waypoints]
        .sort((a, b) => a.waypoint_index - b.waypoint_index)
        .map((w) => w.waypoint_index);
      return {
        coordinates: normalizeCoords(trip.geometry.coordinates as [number, number][]),
        distanceMeters: trip.distance || 0,
        durationSeconds: trip.duration || 0,
        orderedStops: order.slice(1).map((idx) => sites[idx - 1]),
        approximate: false,
      };
    }
    let distanceMeters = 0;
    let prev = start;
    for (const site of sites) {
      distanceMeters += haversineMeters(
        prev.latitude,
        prev.longitude,
        site.latitude,
        site.longitude
      );
      prev = site;
    }
    return {
      coordinates: [
        [start.latitude, start.longitude],
        ...sites.map((s) => [s.latitude, s.longitude]),
      ] as [number, number][],
      distanceMeters,
      durationSeconds: fallbackDuration(distanceMeters),
      orderedStops: sites,
      approximate: true,
    };
  },

  search: async (
    q: string,
    opts?: { category?: string; governorate?: string; limit?: number }
  ): Promise<Site[]> => {
    const { data } = await apiClient.get<{ pois?: GeoPoi[] }>("/geo/search", {
      params: {
        q,
        category: opts?.category,
        governorate: opts?.governorate,
        limit: opts?.limit,
      },
    });
    return ((data || {}).pois || []).map(toSite);
  },

  /** Anonymous area notice for the current position (class + severity only). */
  getAreaNotice: async (
    lat: number,
    lon: number,
    radius?: number
  ): Promise<AreaNotice> => {
    const { data } = await apiClient.get<AreaNotice>("/geo/notice", {
      params: { lat, lon, radius },
    });
    return (
      data || { active: false, guide_key: "" }
    );
  },

  /** Anonymous zone polygons within radius for the map overlay. */
  getZonePolygons: async (
    lat: number,
    lon: number,
    radius?: number
  ): Promise<ZonesResult> => {
    const { data } = await apiClient.get<ZonesResult>("/geo/zones", {
      params: { lat, lon, radius },
    });
    return (
      data || { lat, lon, radius_meters: radius ?? 0, zones: [] }
    );
  },

  /** Egyptian laws/guides for a zone class (RAG + optional AI advice). */
  getZoneLaw: async (
    zoneClass: ZoneClass,
    synthesize = false
  ): Promise<LegalGuide | null> => {
    try {
      const { data } = await apiClient.get<LegalGuide>("/geo/law", {
        params: { class: zoneClass, synthesize: synthesize ? "1" : "0" },
      });
      return data;
    } catch {
      return null;
    }
  },
};

export function googleMapsDirectionsUrl(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): string {
  return (
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${from.latitude},${from.longitude}` +
    `&destination=${to.latitude},${to.longitude}` +
    `&travelmode=driving`
  );
}

export function googleMapsTripUrl(
  start: { latitude: number; longitude: number },
  stops: { latitude: number; longitude: number }[]
): string {
  const origin = `${start.latitude},${start.longitude}`;
  const destination =
    stops.length > 0
      ? `${stops[stops.length - 1].latitude},${stops[stops.length - 1].longitude}`
      : origin;
  const waypoints = stops
    .slice(0, -1)
    .map((s) => `${s.latitude},${s.longitude}`)
    .join("|");
  return (
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${origin}` +
    `&destination=${destination}` +
    `&travelmode=driving` +
    (waypoints ? `&waypoints=${waypoints}` : "")
  );
}