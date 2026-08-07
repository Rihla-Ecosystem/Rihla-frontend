import { type RihlaSite } from '@/app/data/rihla-data';
import { mapApiPoiToRihlaSite } from '@/lib/poiMapping';
import { envService, type EnvSnapshot, type NormalizedEnvData } from '@/services/envService';
import {
  safetyService,
  type SafetyData,
  type SafetySnapshot,
} from '@/services/safetyService';
import { geoService } from '@/services/geoService';

export interface HomeDashboardFetchParams {
  lat: number;
  lon: number;
  governorate?: string | null;
  locationName?: string | null;
  onPoisProgress?: (message: string) => void;
}

export interface HomeDashboardData {
  envData: NormalizedEnvData | null;
  safetyData: SafetyData | null;
  nearbySites: RihlaSite[];
  searchScopeText: string;
  searchProgressMsg: string;
  isGovernorateFallback: boolean;
  restrictedZones: {
    available: boolean;
  } | null;
  sources: {
    env: EnvSnapshot['source'];
    safety: SafetySnapshot['source'];
    pois: 'live' | 'governorate_fallback' | 'unavailable';
  };
}

export const homeService = {
  fetchDashboard: async ({
    lat,
    lon,
    governorate,
    locationName,
    onPoisProgress,
  }: HomeDashboardFetchParams): Promise<HomeDashboardData> => {
    const areaName = governorate || locationName || 'Current area';

    // ── DEBUG ────────────────────────────────────────────────────────────────
    console.group('%c🏠 [HomeService] fetchDashboard called', 'color:#7c5cbf;font-weight:bold');
    console.log('lat:', lat, '| lon:', lon);
    console.log('governorate:', governorate, '| locationName:', locationName);
    console.groupEnd();

    const [envSnapshot, safetySnapshot, progressiveRes] = await Promise.all([
      envService.getEnvSnapshot(lat, lon).catch((err) => {
        console.error('Failed to fetch /env:', err);
        return { data: null, source: 'offline' as const };
      }),
      safetyService.getSafetySnapshot(lat, lon, areaName).catch((err) => {
        console.error('Failed to fetch /safety:', err);
        return { data: null, source: 'offline' as const };
      }),
      geoService
        .fetchPoisProgressive(lat, lon, areaName, undefined, (progress) => {
          onPoisProgress?.(progress.message);
        })
        .catch((err) => {
          console.error('Failed progressive POI search:', err);
          return null;
        }),
    ]);

    if (!progressiveRes) {
      return {
        envData: envSnapshot.data,
        safetyData: safetySnapshot.data,
        nearbySites: [],
        searchScopeText: 'POI feed unavailable',
        searchProgressMsg: '',
        isGovernorateFallback: false,
        restrictedZones: null,
        sources: {
          env: envSnapshot.source,
          safety: safetySnapshot.source,
          pois: 'unavailable',
        },
      };
    }

    let parsedSites = Array.isArray(progressiveRes.pois)
      ? progressiveRes.pois.map((poi: any, index: number) =>
          mapApiPoiToRihlaSite(poi, lat, lon, index)
        )
      : [];

    let poisSource: HomeDashboardData['sources']['pois'] =
      progressiveRes.source === 'geo_radius'
        ? 'live'
        : progressiveRes.source === 'governorate_fallback'
          ? 'governorate_fallback'
          : 'unavailable';

    let searchScopeText =
      parsedSites.length > 0
        ? progressiveRes.message || 'Core location-aware POI feed'
        : 'No POIs returned for this location';

    if (
      parsedSites.length === 0 &&
      locationName &&
      locationName.trim() &&
      locationName.trim() !== governorate?.trim()
    ) {
      const localSearch = await geoService.searchPlaces(locationName, lat, lon).catch((err) => {
        console.warn(`Local place search failed for ${locationName}:`, err);
        return null;
      });

      const localSearchPois = (localSearch as any)?.pois || (Array.isArray(localSearch) ? localSearch : []);

      if (Array.isArray(localSearchPois) && localSearchPois.length > 0) {
        parsedSites = localSearchPois.map((poi: any, index: number) =>
          mapApiPoiToRihlaSite(poi, lat, lon, index)
        );
        poisSource = 'governorate_fallback';
        searchScopeText = `Nearby places around ${locationName}`;
      }
    }

    return {
      envData: envSnapshot.data,
      safetyData: safetySnapshot.data,
      nearbySites: parsedSites,
      searchScopeText,
      searchProgressMsg: '',
      isGovernorateFallback: poisSource === 'governorate_fallback',
      restrictedZones: null,
      sources: {
        env: envSnapshot.source,
        safety: safetySnapshot.source,
        pois: poisSource,
      },
    };
  },
};
