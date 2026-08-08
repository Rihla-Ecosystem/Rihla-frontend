'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/auth';
import { C } from '@/lib/constants/theme';
import {
  AlertTriangle,
  Navigation,
  MapPin,
  Compass,
  Ticket,
  Route,
  X,
  Loader2,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { TopBar } from '@/app/components/layout/TopBar';
import { geoService } from '@/services/geoService';
import { geoApi, googleMapsDirectionsUrl, googleMapsTripUrl, HERITAGE_CATEGORIES } from '@/lib/api/geo';
import type { GeoJsonGeometry, Site as GeoSite } from '@/lib/api/geo-types';
import { useLocation, useLocationLabel, formatCoords } from '@/providers/LocationProvider';
import { ALL_SITES, type RihlaSite } from '@/app/data/rihla-data';
import { monumentToSite } from '@/app/data/monument-catalog';
import { mapApiPoiToRihlaSite, calculateDistanceKm } from '@/lib/poiMapping';
import {
  monumentsService,
  buildMonumentLookup,
  applyMonumentToSite,
  normalizeName,
  type Monument,
} from '@/services/monumentsService';
import { ALL_EGYPT_VALUE, ExploreSearchBar, type ExploreGovernorateOption } from '@/app/app/explore/components/ExploreSearchBar';
import { SitePopup } from '@/app/app/explore/components/SitePopup';
import type { MapTripStop, MapTicketMarker } from '@/app/components/ui/InteractiveMap';

const InteractiveMap = dynamic(
  () => import('@/app/components/ui/InteractiveMap').then((mod) => mod.InteractiveMap),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: '100%',
          minHeight: 340,
          background: C.limestoneDark,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Inter', sans-serif",
          fontSize: '12px',
          color: '#8B7E6A',
        }}
      >
        Loading map...
      </div>
    ),
  }
);

const RADIUS_OPTIONS = [1000, 2000, 5000, 10000, 25000] as const;
const DEFAULT_LOCATION = { lat: 30.0444, lon: 31.2357 };
const MAX_TRIP_STOPS = 12;

// Approximate centroid per governorate — used to make the static fallback
// location-aware (distances, radius filtering, map markers) when the backend
// returns no POIs or is unreachable.
const GOV_COORDS: Record<string, { lat: number; lon: number }> = {
  'Giza': { lat: 29.9870, lon: 31.2118 },
  'Cairo': { lat: 30.0444, lon: 31.2357 },
  'Luxor': { lat: 25.6872, lon: 32.6396 },
  'Aswan': { lat: 24.0889, lon: 32.8998 },
  'Alexandria': { lat: 31.2001, lon: 29.9187 },
  'South Sinai': { lat: 28.5395, lon: 33.9750 },
  'Red Sea': { lat: 27.2579, lon: 33.8116 },
};

// Full local catalog so the governorate dropdown always has options even when
// the backend `/geo/governorates` endpoint is missing or unreachable.
const EGYPT_GOVERNORATES: string[] = [
  'Alexandria', 'Aswan', 'Asyut', 'Beheira', 'Beni Suef', 'Cairo',
  'Damietta', 'Faiyum', 'Gharbia', 'Giza', 'Ismailia', 'Kafr El-Sheikh',
  'Luxor', 'Matruh', 'Minya', 'Monufia', 'New Valley', 'North Sinai',
  'Port Said', 'Qalyubia', 'Qena', 'Red Sea', 'Sharqia', 'Sohag',
  'South Sinai', 'Suez',
];

// Build a RihlaSite from a local monument record (which always carries real
// coordinates, so the map can render markers for offline data).
// Client-side filtering of the rich local monument catalog so Explore responds
// to governorate / category / radius / location even when the backend POIs are
// unreachable, returns 401, or is empty. Picks the ~6 curated ALL_SITES entries
// (by governorate) to enrich matching monuments with narrative/insight fields.
function localizeFallback(
  monuments: Monument[],
  origin: { lat: number; lon: number },
  governorate: string,
  category: string,
  radius: number,
  hasExplicitOrigin: boolean
): RihlaSite[] {
  const enriched = new Map(ALL_SITES.map((s) => [(s.gov || '').toLowerCase(), s]));
  const scoped = monuments
    .map((m, i) => {
      const base = monumentToSite(m, i, origin);
      const ext = enriched.get((m.governorate || '').toLowerCase());
      if (!ext) return base;
      return {
        ...base,
        name: base.name || ext.name,
        nameAr: ext.nameAr,
        rating: ext.rating,
        reviews: ext.reviews,
        img: base.img || ext.img,
        imgs: base.imgs.length ? base.imgs : ext.imgs,
        tag: ext.tag || base.tag,
        scam: ext.scam,
        built: ext.built,
        dynasty: ext.dynasty,
        duration: ext.duration,
        bestTime: ext.bestTime,
        accessibility: ext.accessibility,
        story: ext.story || base.story,
        rafiqInsight: ext.rafiqInsight,
        scamDetail: ext.scamDetail,
        tips: ext.tips,
        nearby: ext.nearby,
        hours: ext.hours,
        admission: ext.admission,
      };
    })
    .filter((s) => !governorate || s.gov.toLowerCase() === governorate.toLowerCase())
    .filter((s) => !category || s.cat.toLowerCase() === category.toLowerCase());

  // Radius only applies once the user is located / drops a pin; if nothing is
  // within range, relax the radius so the map never renders blank.
  if (governorate || !hasExplicitOrigin) return scoped;
  const near = scoped.filter((s) => calculateDistanceKm(origin.lat, origin.lon, s.lat!, s.lon!) <= radius / 1000);
  return near.length > 0 ? near : scoped;
}

const CITY_TO_GOVERNORATE: Record<string, string> = {
  cairo: 'Cairo',
  giza: 'Giza',
  luxor: 'Luxor',
  aswan: 'Aswan',
  alexandria: 'Alexandria',
  'red sea': 'Red Sea',
  sinai: 'South Sinai',
  hurghada: 'Red Sea',
  'sharm el-sheikh': 'South Sinai',
};

interface GovernorateOption extends ExploreGovernorateOption {
  geometry: GeoJsonGeometry | null;
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isDesktop;
}

function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

export default function ExplorePage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    lat: userLat,
    lon: userLon,
    status: locStatus,
    requestLocation,
  } = useLocation();
  const locationLabel = useLocationLabel();
  const isDesktop = useIsDesktop();

  // Filters
  const [search, setSearch] = useState('');
  const [radius, setRadius] = useState<number>(5000);
  const [governorate, setGovernorate] = useState('');
  const isAllEgypt = governorate === ALL_EGYPT_VALUE;
  const [category, setCategory] = useState('');
  const [pin, setPin] = useState<{ lat: number; lon: number } | null>(null);

  // Data
  const [sites, setSites] = useState<RihlaSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [governorates, setGovernorates] = useState<GovernorateOption[]>([]);
  const [countryOutline, setCountryOutline] = useState<GeoJsonGeometry | null>(null);
  const [monuments, setMonuments] = useState<Monument[]>([]);
  const [ticketsEnabled, setTicketsEnabled] = useState(false);
  const [selectedMonument, setSelectedMonument] = useState<Monument | null>(null);
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [clusterPins, setClusterPins] = useState(false);

  // Selection / routing
  const [selectedSite, setSelectedSite] = useState<RihlaSite | null>(null);
  const [route, setRoute] = useState<{
    coordinates: [number, number][];
    distanceMeters: number;
    durationSeconds: number;
    approximate?: boolean;
    origin?: { lat: number; lon: number };
    dest?: { lat: number; lon: number };
  } | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [tripSelection, setTripSelection] = useState<Set<string>>(new Set());
  const [tripPlan, setTripPlan] = useState<{ coordinates: [number, number][]; distanceMeters: number; durationSeconds: number; orderedStops: GeoSite[]; approximate?: boolean } | null>(null);
  const [tripLoading, setTripLoading] = useState(false);
  const [focus, setFocus] = useState<{ lat: number; lon: number; zoom?: number; key: number } | null>(null);
  const [govFitKey, setGovFitKey] = useState(0);

  const searchActive = search.trim().length > 0;

  // Origin: pin overrides live location; fall back to Cairo
  const searchOrigin = useMemo(() => {
    if (pin) return pin;
    if (userLat !== null && userLon !== null) return { lat: userLat, lon: userLon };
    return DEFAULT_LOCATION;
  }, [pin, userLat, userLon]);

  // True once the user is located or drops a pin — only then should the offline
  // fallback respect the radius pill. Otherwise show all monuments initially.
  const hasExplicitOrigin = useMemo(
    () => pin !== null || (userLat !== null && userLon !== null),
    [pin, userLat, userLon]
  );

  const monumentLookup = useMemo(() => buildMonumentLookup(monuments), [monuments]);

  // Load metadata once — always seed the governorate dropdown from the local
  // catalog so it works even when `/geo/governorates` is missing/unreachable.
  useEffect(() => {
    let active = true;
    const staticGovernorates = EGYPT_GOVERNORATES.map((name) => ({ name, geometry: null }));
    setGovernorates(staticGovernorates);
    geoApi.getGovernorates().then((gs) => {
      if (!active || gs.length === 0) return;
      const byName = new Map(staticGovernorates.map((sg) => [sg.name.toLowerCase(), sg]));
      const merged = gs.map((g) => ({
        ...g,
        geometry: g.geometry ?? byName.get(g.name.toLowerCase())?.geometry ?? null,
      }));
      setGovernorates(merged);
    }).catch(() => {});
    geoApi.getCountryBoundary().then((b) => {
      if (active) setCountryOutline(b ?? null);
    }).catch(() => {});
    monumentsService.getMonuments().then((ms) => {
      if (active) setMonuments(ms);
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Deep link: ?city=
  useEffect(() => {
    const city = new URLSearchParams(window.location.search).get('city');
    if (city) {
      const gov = CITY_TO_GOVERNORATE[city.toLowerCase()];
      if (gov) {
        setGovernorate(gov);
        setGovFitKey((k) => k + 1);
      }
    }
  }, []);

  const activeGovObj = useMemo(
    () => governorates.find((g) => g.name.toLowerCase() === governorate.toLowerCase()),
    [governorates, governorate]
  );
  const governorateGeometry = activeGovObj?.geometry ?? null;

  // Points that let the map locate the selected governorate even when the
  // backend boundary geometry is missing/unreachable: local monument markers
  // for that governorate → loaded sites → a known centroid as last resort.
  const governorateFocusPoints = useMemo<{ lat: number; lon: number }[] | null>(() => {
    if (!governorate || isAllEgypt) return null;
    const g = governorate.toLowerCase();
    const local = monuments.filter((m) => (m.governorate || '').toLowerCase() === g);
    if (local.length >= 2) return local.map((m) => ({ lat: m.latitude, lon: m.longitude }));
    const fromSites = sites
      .filter((s) => s.lat != null && s.lon != null && (s.gov || '').toLowerCase() === g)
      .map((s) => ({ lat: s.lat!, lon: s.lon! }));
    if (fromSites.length >= 2) return fromSites;
    const c = GOV_COORDS[governorate];
    return c ? [{ lat: c.lat, lon: c.lon }] : null;
  }, [governorate, isAllEgypt, monuments, sites]);

  // Whenever the effective search origin moves (location resolves, pin set, or
  // default fallback), ask the map to center on it so the map matches the data.
  const originKeyRef = useRef(0);
  useEffect(() => {
    originKeyRef.current += 1;
  }, [searchOrigin.lat, searchOrigin.lon]);
  const originCenter = {
    lat: searchOrigin.lat,
    lon: searchOrigin.lon,
    key: originKeyRef.current,
  };

  const enrichSites = useCallback(
    (list: RihlaSite[]): RihlaSite[] => {
      if (monumentLookup.size === 0 || list.length === 0) return list;
      return list.map((s) => {
        const monument =
          monumentLookup.get(normalizeName(s.name)) ?? monumentLookup.get(normalizeName(s.nameAr));
        return monument ? applyMonumentToSite(s, monument) : s;
      });
    },
    [monumentLookup]
  );

  const reload = useCallback(async () => {
    if (searchActive) {
      setSearching(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      let rawPois: any[] = [];
      const queryCategory = category || undefined;

      if (searchActive) {
        const res: any = await geoService.searchPlaces(search.trim(), searchOrigin.lat, searchOrigin.lon);
        rawPois = res?.pois || (Array.isArray(res) ? res : []);
      } else if (isAllEgypt) {
        const res: any = await geoService.getPois(
          searchOrigin.lat,
          searchOrigin.lon,
          1000000,
          category ? category : HERITAGE_CATEGORIES.join(',')
        );
        rawPois = res?.pois || (Array.isArray(res) ? res : []);
      } else if (governorate) {
        const res: any = await geoService.getSitesByGovernorate(governorate, queryCategory);
        rawPois = res?.pois || (Array.isArray(res) ? res : []);
      } else {
        const res: any = await geoService.getPois(
          searchOrigin.lat,
          searchOrigin.lon,
          radius,
          category ? category : HERITAGE_CATEGORIES.join(',')
        );
        rawPois = res?.pois || (Array.isArray(res) ? res : []);
      }

      if (rawPois && rawPois.length > 0) {
        const mapped = rawPois.map((p: any, idx: number) =>
          mapApiPoiToRihlaSite(p, searchOrigin.lat, searchOrigin.lon, idx)
        );
        setSites(enrichSites(mapped));
      } else if (searchActive) {
        setSites([]);
      } else {
        const fallback = localizeFallback(monuments, searchOrigin, isAllEgypt ? '' : governorate, category, radius, isAllEgypt ? false : hasExplicitOrigin);
        setSites(enrichSites(fallback));
      }
    } catch (err: any) {
      console.warn('Explore page data fetch notice:', err?.message || err);
      if (searchActive) {
        setSites([]);
      } else {
        const fallback = localizeFallback(monuments, searchOrigin, isAllEgypt ? '' : governorate, category, radius, isAllEgypt ? false : hasExplicitOrigin);
        setSites(enrichSites(fallback));
      }
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [searchActive, search, searchOrigin.lat, searchOrigin.lon, governorate, category, radius, enrichSites, monuments, hasExplicitOrigin]);

  // Debounced search
  useEffect(() => {
    if (!searchActive) return;
    const t = setTimeout(() => reload(), 300);
    return () => clearTimeout(t);
  }, [searchActive, search, category, reload]);

  // Immediate reload for filters / origin
  useEffect(() => {
    if (searchActive) return;
    reload();
  }, [searchActive, category, governorate, radius, searchOrigin.lat, searchOrigin.lon, reloadKey, reload]);

  useEffect(() => {
    setSelectedSite(null);
    setRoute(null);
  }, [governorate, pin]);

  // Match sites to monuments for ticket blocks
  const monumentForSite = useMemo(() => {
    const map: Record<number, Monument> = {};
    if (monumentLookup.size === 0) return map;
    sites.forEach((s) => {
      const m =
        monumentLookup.get(normalizeName(s.name)) ?? monumentLookup.get(normalizeName(s.nameAr));
      if (m) map[s.id] = m;
    });
    return map;
  }, [sites, monumentLookup]);

  // Client-side filtered monument catalog for the portal section
  const filteredMonuments = useMemo(() => {
    if (monuments.length === 0) return [];
    return monuments.filter((m) => {
      if (searchActive) {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          m.title.toLowerCase().includes(q) ||
          (m.city || '').toLowerCase().includes(q) ||
          (m.governorate || '').toLowerCase().includes(q)
        );
      }
      if (category) {
        const cat = category.toLowerCase();
        if (!(m.category || '').toLowerCase().includes(cat)) return false;
      }
      if (governorate && !isAllEgypt) {
        const mGov = (m.governorate || '').toLowerCase();
        const selGov = governorate.toLowerCase();
        if (mGov && mGov !== selGov) return false;
      } else if (!isAllEgypt) {
        const km = calculateDistanceKm(searchOrigin.lat, searchOrigin.lon, m.latitude, m.longitude);
        if (km > radius / 1000) return false;
      }
      return true;
    });
  }, [monuments, searchActive, search, category, governorate, isAllEgypt, radius, searchOrigin.lat, searchOrigin.lon]);

  const handleMapClick = useCallback(
    (lat: number, lon: number) => {
      setSearch('');
      setGovernorate('');
      setPin({ lat, lon });
      setRoute(null);
    },
    []
  );

  const computeRoute = useCallback(
    async (site: RihlaSite) => {
      const toLat = site.lat ?? searchOrigin.lat;
      const toLon = site.lon ?? searchOrigin.lon;
      setRouteLoading(true);
      setRoute(null);
      try {
        const res = await geoApi.getRoute(
          { latitude: searchOrigin.lat, longitude: searchOrigin.lon },
          { latitude: toLat, longitude: toLon }
        );
        if (res) setRoute({ ...res, origin: { lat: searchOrigin.lat, lon: searchOrigin.lon }, dest: { lat: toLat, lon: toLon } });
      } catch {
        // silent
      } finally {
        setRouteLoading(false);
      }
    },
    [searchOrigin.lat, searchOrigin.lon]
  );

  const selectSite = useCallback(
    (site: RihlaSite) => {
      setSelectedSite(site);
      const sLat = site.lat ?? searchOrigin.lat;
      const sLon = site.lon ?? searchOrigin.lon;
      setFocus((prev) => ({ lat: sLat, lon: sLon, zoom: 13, key: (prev?.key ?? 0) + 1 }));
      computeRoute(site);
    },
    [searchOrigin.lat, searchOrigin.lon, computeRoute]
  );

  const deselectSite = useCallback(() => {
    setSelectedSite(null);
    setRoute(null);
  }, []);

  // Unify monument (🎫) markers into the same selection/popup flow
  const handleTicketSelect = useCallback(
    (t: MapTicketMarker) => {
      const m =
        monuments.find((mm) => mm.id === t.id) ??
        monuments.find(
          (mm) => mm.title === t.title || normalizeName(mm.title) === normalizeName(t.title)
        );
      if (!m) return;
      setSelectedMonument(m);
      const idx = monuments.findIndex((mm) => mm.id === m.id);
      selectSite(monumentToSite(m, idx < 0 ? 0 : idx, searchOrigin));
    },
    [monuments, searchOrigin, selectSite]
  );

  const handlePopupDirections = useCallback(() => {
    if (selectedSite) computeRoute(selectedSite);
  }, [selectedSite, computeRoute]);

  const handlePopupTickets = useCallback(() => {
    const m = selectedSite ? monumentForSite[selectedSite.id] ?? selectedMonument : selectedMonument;
    if (m?.url) window.open(m.url, '_blank', 'noopener');
  }, [selectedSite, monumentForSite, selectedMonument]);

  const handlePopupDetails = useCallback(() => {
    const m = selectedSite ? monumentForSite[selectedSite.id] ?? selectedMonument : selectedMonument;
    router.push(m ? `/app/monuments/${encodeURIComponent(m.id)}` : '/app/monuments');
  }, [selectedSite, monumentForSite, selectedMonument, router]);

  const selectedPopupMonument = useMemo(() => {
    if (!selectedSite) return selectedMonument;
    return monumentForSite[selectedSite.id] ?? selectedMonument;
  }, [selectedSite, monumentForSite, selectedMonument]);

  const selectedDistance = useMemo(() => {
    if (!selectedSite || selectedSite.lat == null || selectedSite.lon == null) return null;
    return calculateDistanceKm(searchOrigin.lat, searchOrigin.lon, selectedSite.lat, selectedSite.lon);
  }, [selectedSite, searchOrigin.lat, searchOrigin.lon]);

  const toggleTripSelect = useCallback((site: RihlaSite) => {
    setTripSelection((prev) => {
      const next = new Set(prev);
      const key = String(site.id);
      if (next.has(key)) next.delete(key);
      else if (next.size < MAX_TRIP_STOPS) next.add(key);
      return next;
    });
    setTripPlan(null);
  }, []);

  const selectedTripSites = useMemo(
    () => sites.filter((s) => tripSelection.has(String(s.id))),
    [sites, tripSelection]
  );

  const planTrip = useCallback(async () => {
    if (selectedTripSites.length < 2) return;
    setTripLoading(true);
    try {
      const geoSites: GeoSite[] = selectedTripSites.map((s) => ({
        id: String(s.id),
        name: s.name,
        nameAr: s.nameAr,
        latitude: s.lat ?? searchOrigin.lat,
        longitude: s.lon ?? searchOrigin.lon,
        category: s.cat,
        governorate: s.gov,
        description: s.story,
        images: s.imgs,
        rating: s.rating,
        visitDuration: 120,
        bestTime: s.bestTime,
        tips: s.tips,
      }));
      const plan = await geoApi.getTrip(
        { latitude: searchOrigin.lat, longitude: searchOrigin.lon },
        geoSites
      );
      if (plan) setTripPlan(plan);
    } catch {
      // silent
    } finally {
      setTripLoading(false);
    }
  }, [selectedTripSites, searchOrigin.lat, searchOrigin.lon]);

  const clearTrip = useCallback(() => {
    setTripSelection(new Set());
    setTripPlan(null);
  }, []);

  const clearPin = useCallback(() => setPin(null), []);

  const tripStops: MapTripStop[] = useMemo(
    () =>
      (tripPlan?.orderedStops || []).map((s, i) => ({
        index: i + 1,
        name: s.name,
        latitude: s.latitude,
        longitude: s.longitude,
      })),
    [tripPlan]
  );

  const ticketMarkers: MapTicketMarker[] = useMemo(
    () =>
      filteredMonuments.map((m) => ({
        id: m.id,
        latitude: m.latitude,
        longitude: m.longitude,
        title: m.title,
        category: m.category,
        egyptianAdult: m.prices.egyptian?.adult ?? null,
        egyptianStudent: m.prices.egyptian?.student ?? null,
        foreignerAdult: m.prices.foreigner?.adult ?? null,
        foreignerStudent: m.prices.foreigner?.student ?? null,
        url: m.url,
        selected: selectedMonument?.id === m.id,
      })),
    [filteredMonuments, selectedMonument]
  );

  const canPlan = tripSelection.size >= 2;
  const locating = locStatus === 'loading' || locStatus === 'requesting';
  const hasLiveLocation = userLat !== null && userLon !== null;
  const loadingNote = routeLoading ? 'Calculating route…' : tripLoading ? 'Optimizing trip…' : null;

  const radiusPills = (() => {
    if (governorate) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 600, color: '#A89880' }}>
          Radius
        </span>
        {RADIUS_OPTIONS.map((r) => {
          const active = radius === r;
          return (
            <button
              key={r}
              onClick={() => setRadius(r)}
              style={{
                background: active ? C.solar : 'transparent',
                border: `1px solid ${active ? C.solar : 'rgba(27,26,23,0.13)'}`,
                borderRadius: 99,
                padding: '4px 13px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '11px',
                fontWeight: active ? 700 : 500,
                color: active ? '#FFFFFF' : '#6B6354',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {r / 1000} km
            </button>
          );
        })}
      </div>
    );
  })();

  const originHint = (() => {
    if (searchActive || governorate) return null;
    const coords = pin ?? (hasLiveLocation ? { lat: userLat, lon: userLon } : DEFAULT_LOCATION);
    const isPin = !!pin;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: isPin ? '#B23A2E' : '#2563EB',
            flexShrink: 0,
          }}
        />
        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#6B6354' }}>
          {isPin
            ? `Searching from pin ${formatCoords(coords.lat, coords.lon)}`
            : hasLiveLocation
              ? `You are here · ${locationLabel}`
              : `You are here · ${formatCoords(coords.lat, coords.lon)}`}
        </span>
        {isPin && (
          <button
            onClick={clearPin}
            style={{
              background: C.limestoneDark,
              border: 'none',
              borderRadius: 99,
              padding: '3px 10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              fontFamily: "'Inter',sans-serif",
              fontSize: '11px',
              color: '#6B6354',
            }}
          >
            <X size={11} /> Clear pin
          </button>
        )}
        {!isPin && !hasLiveLocation && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontFamily: "'Inter',sans-serif",
              fontSize: '11px',
              color: '#B45309',
              background: '#FEF3C7',
              borderRadius: 99,
              padding: '2px 9px',
            }}
          >
            <AlertTriangle size={10} /> Location unavailable — showing Cairo area
          </span>
        )}
      </div>
    );
  })();

  const placesCount = sites.length + (ticketsEnabled ? filteredMonuments.length : 0);

  const filterCard = (
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 950,
        width: isDesktop ? 'min(340px, calc(100% - 24px))' : 'calc(100% - 24px)',
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: 16,
        border: '1px solid rgba(27,26,23,0.1)',
        boxShadow: '0 10px 32px rgba(20,16,8,0.16)',
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '12px 14px',
          borderBottom: filterCollapsed ? 'none' : '1px solid rgba(27,26,23,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${C.nile}, ${C.copper})`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Compass size={16} color={C.limestone} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: '17px',
                fontWeight: 600,
                color: C.nile,
                lineHeight: 1.15,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {isAllEgypt || !governorate ? 'Explore Egypt' : `${governorate} Governorate`}
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#8B7E6A' }}>
              {placesCount} places on map
            </div>
          </div>
        </div>
        <button
          onClick={() => setFilterCollapsed((v) => !v)}
          aria-label={filterCollapsed ? 'Expand filters' : 'Collapse filters'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#8B7E6A',
            padding: 6,
            display: 'inline-flex',
          }}
        >
          <ChevronDown size={18} style={{ transition: 'transform 0.2s', transform: filterCollapsed ? 'rotate(-90deg)' : 'none' }} />
        </button>
      </div>

      {!filterCollapsed && (
        <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ExploreSearchBar
            search={search}
            onSearchChange={setSearch}
            governorates={governorates}
            governorate={governorate}
            onGovernorateChange={(v) => {
              setGovernorate(v);
              setSearch('');
              setGovFitKey((k) => k + 1);
            }}
            category={category}
            onCategoryChange={setCategory}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={requestLocation}
              disabled={locating}
              style={{
                background: locStatus === 'permission_denied' ? '#FEF3C7' : '#EFF6FF',
                color: locStatus === 'permission_denied' ? '#92400E' : '#1D4ED8',
                border: 'none',
                borderRadius: 99,
                padding: '6px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                fontFamily: "'Inter',sans-serif",
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {locating ? <Loader2 size={13} className="spin" /> : <Navigation size={13} />}
              My location
            </button>

            <button
              onClick={() => setClusterPins((v) => !v)}
              style={{
                background: clusterPins ? C.nile : 'transparent',
                border: `1px solid ${clusterPins ? C.nile : 'rgba(27,26,23,0.13)'}`,
                borderRadius: 99,
                padding: '6px 13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                fontFamily: "'Inter',sans-serif",
                fontSize: '12px',
                fontWeight: clusterPins ? 700 : 500,
                color: clusterPins ? '#FFFFFF' : '#6B6354',
              }}
            >
              <Layers size={13} /> {clusterPins ? 'Clusters' : 'All pins'}
            </button>

            <button
              onClick={() => {
                setTicketsEnabled(!ticketsEnabled);
                setSelectedMonument(null);
              }}
              style={{
                background: ticketsEnabled ? C.solar : 'transparent',
                border: `1px solid ${ticketsEnabled ? C.solar : 'rgba(27,26,23,0.13)'}`,
                borderRadius: 99,
                padding: '6px 13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                fontFamily: "'Inter',sans-serif",
                fontSize: '12px',
                fontWeight: ticketsEnabled ? 700 : 500,
                color: ticketsEnabled ? '#FFFFFF' : '#6B6354',
              }}
            >
              <Ticket size={13} /> Official tickets
            </button>

            <button
              onClick={planTrip}
              disabled={!canPlan || tripLoading}
              style={{
                background: C.solar,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 99,
                padding: '7px 16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: canPlan && !tripLoading ? 'pointer' : 'not-allowed',
                opacity: canPlan && !tripLoading ? 1 : 0.5,
                fontFamily: "'Inter',sans-serif",
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {tripLoading ? <Loader2 size={13} className="spin" /> : <Route size={13} />}
              Plan route ({tripSelection.size})
            </button>

            {tripSelection.size > 0 && (
              <button
                onClick={clearTrip}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(27,26,23,0.13)',
                  borderRadius: 99,
                  padding: '6px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  cursor: 'pointer',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '11px',
                  color: '#6B6354',
                }}
              >
                <X size={12} /> Clear selection
              </button>
            )}
          </div>

          {!canPlan && tripSelection.size === 0 && (
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#A89880' }}>
              Select 2+ sites to plan an efficient route
            </span>
          )}

          {originHint}
          {radiusPills}
        </div>
      )}
    </div>
  );

  const routeBanner = route && (
    <div
      style={{
        margin: '12px 18px 0',
        background: '#EFF6FF',
        border: '1px solid #BFDBFE',
        borderRadius: 12,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Navigation size={15} color="#1D4ED8" />
        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 600, color: '#1E3A8A' }}>
          Directions · {(route.distanceMeters / 1000).toFixed(1)} km · {formatDuration(route.durationSeconds)}
          {route.approximate ? ' · Approximate' : ''}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {route.origin && route.dest && (
          <a
            href={googleMapsDirectionsUrl(
              { latitude: route.origin.lat, longitude: route.origin.lon },
              { latitude: route.dest.lat, longitude: route.dest.lon }
            )}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: '#FFFFFF',
              border: '1px solid #BFDBFE',
              borderRadius: 99,
              padding: '5px 11px',
              fontFamily: "'Inter',sans-serif",
              fontSize: '11px',
              fontWeight: 700,
              color: '#1D4ED8',
              textDecoration: 'none',
            }}
          >
            <MapPin size={12} /> Google Maps
          </a>
        )}
        <button
          onClick={() => setRoute(null)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1D4ED8' }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );

  const tripBanner = tripPlan && (
    <div
      style={{
        margin: '12px 18px 0',
        background: '#FFFBEB',
        border: '1px solid #FDE68A',
        borderRadius: 12,
        padding: '10px 14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Route size={15} color="#B45309" />
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 600, color: '#92400E' }}>
            Optimized route · {(tripPlan.distanceMeters / 1000).toFixed(1)} km · {formatDuration(tripPlan.durationSeconds)} · {tripPlan.orderedStops.length} stops
            {tripPlan.approximate ? ' · Approximate' : ''}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {tripPlan.orderedStops.length > 0 && (
            <a
              href={googleMapsTripUrl(
                { latitude: searchOrigin.lat, longitude: searchOrigin.lon },
                tripPlan.orderedStops
              )}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#FFFFFF',
                border: '1px solid #FDE68A',
                borderRadius: 99,
                padding: '5px 11px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                color: '#92400E',
                textDecoration: 'none',
              }}
            >
              <MapPin size={12} /> Google Maps
            </a>
          )}
          <button
            onClick={clearTrip}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400E' }}
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <ol style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {tripPlan.orderedStops.map((stop, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: C.solar,
                color: '#FFF',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Inter',sans-serif",
                fontSize: '10px',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#6B6354' }}>{stop.name}</span>
          </li>
        ))}
      </ol>
    </div>
  );

  const bannerStack = route || tripPlan;

  const mapLayer = (
    <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
      <InteractiveMap
        sites={sites}
        isLoading={loading}
        error={error}
        onRetry={() => setReloadKey((k) => k + 1)}
        selectedGov={isAllEgypt || !governorate ? 'Egypt' : governorate}
        selectedGovCoords={{ lat: searchOrigin.lat, lon: searchOrigin.lon }}
        onSelectSite={selectSite}
        selectedSite={selectedSite}
        activeCategory={category || 'All'}
        routePolyline={route?.coordinates ?? null}
        tripPolyline={tripPlan?.coordinates ?? null}
        tripStops={tripStops}
        ticketMarkers={ticketsEnabled ? ticketMarkers : []}
        pin={pin}
        searchRadius={governorate ? null : radius}
        countryOutline={countryOutline}
        governorateGeometry={governorateGeometry}
        onMapClick={handleMapClick}
        focus={focus}
        originCenter={originCenter}
        govFitKey={govFitKey}
        loadingNote={loadingNote}
        overlay
        clustered={clusterPins}
        onClusteredChange={setClusterPins}
        onSelectTicket={handleTicketSelect}
        governorateFocusPoints={governorateFocusPoints}
      />

      {filterCard}

      {bannerStack && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 12,
            zIndex: 940,
            width: 'min(420px, calc(100% - 24px))',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100% - 140px)',
            overflowY: 'auto',
          }}
        >
          {routeBanner}
          {tripBanner}
        </div>
      )}

      {selectedSite && (
        <SitePopup
          site={selectedSite}
          monument={selectedPopupMonument}
          distanceKm={selectedDistance}
          onClose={deselectSite}
          onDirections={handlePopupDirections}
          onTickets={handlePopupTickets}
          onDetails={handlePopupDetails}
          bottomOffset={bannerStack ? 100 : 16}
        />
      )}
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <TopBar
        location={isAllEgypt ? 'Explore Egypt' : governorate ? `${governorate} Governorate` : 'Around My Location'}
        onRafiq={() => router.push('/app/rafiq')}
      />
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: '#FAF7F0' }}>{mapLayer}</div>
    </div>
  );
}