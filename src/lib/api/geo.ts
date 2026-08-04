import { apiClient } from "@/lib/api";
import type { GeoGovernorate, GeoPoi, Site } from "./geo-types";

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
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
      `?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const route = json?.routes?.[0];
    if (!route?.geometry?.coordinates) return null;
    return {
      coordinates: route.geometry.coordinates as [number, number][],
      distanceMeters: route.distance || 0,
      durationSeconds: route.duration || 0,
    };
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
    const url =
      `https://router.project-osrm.org/trip/v1/driving/${coords}` +
      `?roundtrip=false&source=first&overview=full&geometries=geojson`;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const json = await res.json();
      const trip = json?.trips?.[0];
      const waypoints: { waypoint_index: number }[] = json?.waypoints || [];
      if (!trip?.geometry?.coordinates || waypoints.length === 0) return null;
      const order = [...waypoints]
        .sort((a, b) => a.waypoint_index - b.waypoint_index)
        .map((w) => w.waypoint_index);
      return {
        coordinates: trip.geometry.coordinates as [number, number][],
        distanceMeters: trip.distance || 0,
        durationSeconds: trip.duration || 0,
        orderedStops: order.slice(1).map((idx) => sites[idx - 1]),
      };
    } catch {
      return null;
    }
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
};