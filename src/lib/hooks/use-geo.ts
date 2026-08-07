"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { geoApi, ALL_CATEGORIES } from "@/lib/api/geo";
import type { Site, GeoGovernorate } from "@/lib/api/geo-types";

export function useGovernorates() {
  return useQuery({
    queryKey: ["geo", "governorates"],
    queryFn: geoApi.getGovernorates,
  });
}

export function useSitesByGovernorate(governorate: string, category?: string) {
  return useQuery({
    queryKey: ["geo", "sites", governorate, category],
    queryFn: () => geoApi.getSitesByGovernorate(governorate, category),
    enabled: !!governorate,
  });
}

export function useNearbySites(
  lat: number | null,
  lng: number | null,
  radius?: number
) {
  return useQuery({
    queryKey: ["geo", "nearby", lat, lng, radius],
    queryFn: () =>
      geoApi.getNearbySites(lat as number, lng as number, radius),
    enabled: lat !== null && lng !== null,
  });
}

export function useTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      start,
      sites,
    }: {
      start: { latitude: number; longitude: number };
      sites: Parameters<typeof geoApi.getTrip>[1];
    }) => geoApi.getTrip(start, sites),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["geo", "nearby"] }),
  });
}

export { ALL_CATEGORIES };
export type { GeoGovernorate };