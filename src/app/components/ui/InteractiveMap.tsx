'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from '@/providers/LocationProvider';
import type { RihlaSite } from '@/app/data/rihla-data';
import type { GeoJsonGeometry } from '@/lib/api/geo-types';
import { C } from '@/lib/constants/theme';
import { MapPin, Navigation, RefreshCw, AlertTriangle, Compass, Layers, Star, LocateFixed } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export interface MapTripStop {
  index: number;
  name: string;
  latitude: number;
  longitude: number;
}

// Category-coded marker styles (mirrors Project B / WiredClient)
export const CATEGORY_STYLE: Record<string, { color: string; emoji: string }> = {
  archaeological: { color: '#d97706', emoji: '🏛️' },
  islamic: { color: '#059669', emoji: '🕌' },
  christian: { color: '#2563eb', emoji: '⛪' },
  infrastructure: { color: '#7c3aed', emoji: '🏗️' },
  museum: { color: '#0f766e', emoji: '🏛️' },
  temple: { color: '#b45309', emoji: '🏛️' },
  market: { color: '#b45309', emoji: '🛍️' },
  __default: { color: '#a16207', emoji: '📍' },
};

const categoryStyle = (cat: string) =>
  CATEGORY_STYLE[cat.toLowerCase()] || CATEGORY_STYLE.__default;

export interface MapTicketMarker {
  id?: string;
  latitude: number;
  longitude: number;
  title: string;
  category?: string;
  egyptianAdult?: number | null;
  egyptianStudent?: number | null;
  foreignerAdult?: number | null;
  foreignerStudent?: number | null;
  url?: string;
  selected?: boolean;
}

interface InteractiveMapProps {
  sites: RihlaSite[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  selectedGov?: string;
  selectedGovCoords?: { lat: number; lon: number };
  onSelectSite?: (site: RihlaSite) => void;
  selectedSite?: RihlaSite | null;
  onClearSelection?: () => void;
  activeCategory?: string;
  routePolyline?: [number, number][] | null;
  tripPolyline?: [number, number][] | null;
  tripStops?: MapTripStop[];
  ticketMarkers?: MapTicketMarker[];
  pin?: { lat: number; lon: number } | null;
  searchRadius?: number | null;
  countryOutline?: GeoJsonGeometry | null;
  governorateGeometry?: GeoJsonGeometry | null;
  onMapClick?: (lat: number, lon: number) => void;
  focus?: { lat: number; lon: number; zoom?: number; key: number } | null;
  originCenter?: { lat: number; lon: number; key: number } | null;
  govFitKey?: number;
  loadingNote?: string | null;
  overlay?: boolean;
  onSelectTicket?: (t: MapTicketMarker) => void;
  clustered?: boolean;
  onClusteredChange?: (v: boolean) => void;
  governorateFocusPoints?: { lat: number; lon: number }[] | null;
}

export function InteractiveMap({
  sites,
  isLoading = false,
  error = null,
  onRetry,
  selectedGov = 'Giza',
  selectedGovCoords = { lat: 29.9870, lon: 31.2118 },
  onSelectSite,
  selectedSite = null,
  activeCategory = 'All',
  routePolyline = null,
  tripPolyline = null,
  tripStops = [],
  ticketMarkers = [],
  pin = null,
  searchRadius = null,
  countryOutline = null,
  governorateGeometry = null,
  onMapClick,
  focus = null,
  originCenter = null,
  govFitKey = 0,
  loadingNote = null,
  overlay = false,
  onSelectTicket,
  clustered,
  onClusteredChange,
  governorateFocusPoints = null,
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapInstance = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const routeEndsRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const pinLayerRef = useRef<any>(null);
  const boundaryLayerRef = useRef<any>(null);
  const tripLayerRef = useRef<any>(null);
  const ticketLayerRef = useRef<any>(null);

  const { lat: userLat, lon: userLon, status: locStatus, requestLocation } = useLocation();
  const [isClustered, setIsClustered] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const clusterEnabled = clustered ?? isClustered;
  const setClusterEnabled = onClusteredChange ?? setIsClustered;

  // Center coordinates preference: real user location > selected gov coords > default Giza
  const centerLat = userLat ?? selectedGovCoords.lat;
  const centerLon = userLon ?? selectedGovCoords.lon;

  // Initialize Map (once — do not destroy/recreate on location changes)
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    let isMounted = true;

    async function initMap() {
      const L = (await import('leaflet')).default;

      if (!isMounted || !mapRef.current) return;

      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }

      // Fix default Leaflet icon assets
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center: [centerLat, centerLon],
        zoom: 12,
        zoomControl: false,
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
        maxBounds: [[22.0, 25.0], [31.5, 37.0]],
        maxBoundsViscosity: 0.4,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      map.on('click', (e: any) => {
        if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
      });

      leafletMapInstance.current = map;

      const markersLayer = L.layerGroup().addTo(map);
      markersGroupRef.current = markersLayer;

      const boundaryLayer = L.layerGroup().addTo(map);
      boundaryLayerRef.current = boundaryLayer;

      const pinLayer = L.layerGroup().addTo(map);
      pinLayerRef.current = pinLayer;

      const tripLayer = L.layerGroup().addTo(map);
      tripLayerRef.current = tripLayer;

      const ticketLayer = L.layerGroup().addTo(map);
      ticketLayerRef.current = ticketLayer;

      setMapReady(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Follow the user: render live marker + center the map on their real location
  useEffect(() => {
    const map = leafletMapInstance.current;
    if (!mapReady || !map || userLat === null || userLon === null) return;
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled) return;

      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }

      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 24px; height: 24px; background: rgba(59, 130, 246, 0.35); border-radius: 50%; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 14px; height: 14px; background: #2563EB; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const userMarker = L.marker([userLat, userLon], { icon: userIcon, zIndexOffset: 1000 });
      userMarker.bindTooltip('You are here', { permanent: false, direction: 'top' });
      userMarker.addTo(map);
      userMarkerRef.current = userMarker;

      // Center on the user only if no pin has been dropped by the user
      if (!pin) {
        map.setView([userLat, userLon], Math.max(map.getZoom(), 12), { animate: true });
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, userLat, userLon, pin]);

  // Center/focus the map on an explicit target (site selection, monument selection, etc.)
  useEffect(() => {
    const map = leafletMapInstance.current;
    if (!mapReady || !map || !focus) return;
    map.setView([focus.lat, focus.lon], focus.zoom ?? 13, { animate: true });
  }, [mapReady, focus]);

  // Keep the map centered on the effective search origin (live location, pin, or
  // default fallback) whenever it moves, so the view always matches the data.
  useEffect(() => {
    const map = leafletMapInstance.current;
    if (!mapReady || !map || !originCenter) return;
    map.setView([originCenter.lat, originCenter.lon], 12, { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, originCenter?.key]);

  // Fit the map to the selected governorate on demand: backend boundary geometry
  // if available, otherwise local focus points (monument markers / centroid).
  useEffect(() => {
    const map = leafletMapInstance.current;
    if (!mapReady || !map || govFitKey === 0 || selectedGov === 'Egypt') return;
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled) return;
      if (governorateGeometry) {
        try {
          const layer = L.geoJSON(governorateGeometry as any);
          map.fitBounds(layer.getBounds(), { padding: [40, 40], maxZoom: 12 });
          return;
        } catch (e) {
          // ignore
        }
      }
      if (governorateFocusPoints && governorateFocusPoints.length > 0) {
        try {
          const pts: [number, number][] = governorateFocusPoints.map((p) => [p.lat, p.lon]);
          if (pts.length === 1) {
            map.setView(pts[0], 9);
          } else {
            map.fitBounds(pts, { padding: [50, 50], maxZoom: 11 });
          }
          return;
        } catch (e) {
          // ignore
        }
      }
      const pts: [number, number][] = sites
        .filter((s) => s.lat != null && s.lon != null)
        .map((s) => [s.lat!, s.lon!]);
      if (pts.length > 1) {
        try {
          map.fitBounds(pts, { padding: [40, 40], maxZoom: 13 });
        } catch (e) {
          // ignore
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, govFitKey, governorateGeometry, governorateFocusPoints, selectedGov]);

  // Render country outline + governorate boundary
  useEffect(() => {
    const map = leafletMapInstance.current;
    if (!mapReady || !map || !boundaryLayerRef.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled) return;
      const layer = boundaryLayerRef.current;
      layer.clearLayers();

      if (countryOutline) {
        L.geoJSON(countryOutline as any, {
          style: { color: '#94a3b8', weight: 1.5, dashArray: '4 4', fill: false, interactive: false },
        }).addTo(layer);
      }

      if (governorateGeometry) {
        L.geoJSON(governorateGeometry as any, {
          style: { color: '#d97706', weight: 2, fillColor: '#d97706', fillOpacity: 0.06 },
        }).addTo(layer);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mapReady, countryOutline, governorateGeometry]);

  // Render search pin + radius circle
  useEffect(() => {
    const map = leafletMapInstance.current;
    if (!mapReady || !map || !pinLayerRef.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled) return;
      const layer = pinLayerRef.current;
      layer.clearLayers();

      if (searchRadius && searchRadius > 0) {
        const circleLat = pin?.lat ?? originCenter?.lat;
        const circleLon = pin?.lon ?? originCenter?.lon;
        if (circleLat != null && circleLon != null) {
          L.circle([circleLat, circleLon], {
            radius: searchRadius,
            color: '#2563eb',
            weight: 1.5,
            dashArray: '6 6',
            fillColor: '#2563eb',
            fillOpacity: 0.06,
          }).addTo(layer);
        }
      }

      if (pin) {
        const pinIcon = L.divIcon({
          className: 'custom-search-pin',
          html: `
            <div style="width: 22px; height: 22px; background: #B23A2E; border: 2.5px solid #FFFFFF; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 3px 8px rgba(0,0,0,0.35);"></div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        const pinMarker = L.marker([pin.lat, pin.lon], { icon: pinIcon, zIndexOffset: 1050 });
        pinMarker.bindTooltip('Search point', { permanent: false, direction: 'top' });
        pinMarker.addTo(layer);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mapReady, pin, searchRadius, originCenter?.lat, originCenter?.lon]);

  // Update POI Markers on sites/category change
  useEffect(() => {
    if (!mapReady || !leafletMapInstance.current || !markersGroupRef.current) return;

    async function updateMarkers() {
      const L = (await import('leaflet')).default;
      const map = leafletMapInstance.current;
      const markersLayer = markersGroupRef.current;

      markersLayer.clearLayers();

      if (!sites || sites.length === 0) return;

      const displaySites = activeCategory === 'All'
        ? sites
        : sites.filter((s) => s.cat.toLowerCase() === activeCategory.toLowerCase());

      if (displaySites.length === 0) return;

      const bounds: [number, number][] = [];

      const useClusters = clusterEnabled && displaySites.length > 8;

      if (useClusters) {
        const clusters: { centerLat: number; centerLon: number; items: RihlaSite[] }[] = [];

        displaySites.forEach((site) => {
          const sLat = site.lat ?? selectedGovCoords.lat;
          const sLon = site.lon ?? selectedGovCoords.lon;
          bounds.push([sLat, sLon]);

          let addedToCluster = false;
          for (const c of clusters) {
            const dist = Math.sqrt(Math.pow(c.centerLat - sLat, 2) + Math.pow(c.centerLon - sLon, 2));
            if (dist < 0.015) {
              c.items.push(site);
              addedToCluster = true;
              break;
            }
          }

          if (!addedToCluster) {
            clusters.push({ centerLat: sLat, centerLon: sLon, items: [site] });
          }
        });

        clusters.forEach((cluster) => {
          if (cluster.items.length === 1) {
            const site = cluster.items[0];
            createSingleMarker(site, L, map, markersLayer);
          } else {
            const clusterIcon = L.divIcon({
              className: 'custom-cluster-marker',
              html: `
                <div style="
                  background: linear-gradient(135deg, ${C.nile}, ${C.nileMid});
                  color: ${C.limestone};
                  width: 36px;
                  height: 36px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-family: 'Inter', sans-serif;
                  font-weight: 700;
                  font-size: 13px;
                  border: 2px solid ${C.limestone};
                  box-shadow: 0 4px 12px rgba(27,26,23,0.3);
                  cursor: pointer;
                ">
                  ${cluster.items.length}
                </div>
              `,
              iconSize: [36, 36],
              iconAnchor: [18, 18],
            });

            const clusterMarker = L.marker([cluster.centerLat, cluster.centerLon], { icon: clusterIcon });
            clusterMarker.on('click', () => {
              map.setView([cluster.centerLat, cluster.centerLon], map.getZoom() + 2);
            });
            clusterMarker.addTo(markersLayer);
          }
        });
      } else {
        displaySites.forEach((site) => {
          const sLat = site.lat ?? selectedGovCoords.lat;
          const sLon = site.lon ?? selectedGovCoords.lon;
          bounds.push([sLat, sLon]);
          createSingleMarker(site, L, map, markersLayer);
        });
      }

      // Auto fit map bounds if we have valid site markers AND no higher-priority geometry
      // (user location / route / trip / governorate). Otherwise leave the view alone.
      const hasPriority = userLat !== null && userLon !== null;
      if (bounds.length > 1 && !hasPriority && !routePolyline && !tripPolyline && !governorateGeometry) {
        try {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        } catch (e) {
          // ignore fit error
        }
      }
    }

    function createSingleMarker(site: RihlaSite, L: any, map: any, layer: any) {
      const sLat = site.lat ?? selectedGovCoords.lat;
      const sLon = site.lon ?? selectedGovCoords.lon;
      const style = categoryStyle(site.cat);
      const isSelected = selectedSite?.id === site.id;
      const size = isSelected ? 40 : 32;
      const emojiSize = isSelected ? 18 : 15;

      const pinIcon = L.divIcon({
        className: 'custom-poi-pin',
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;width:${size}px;">
            <div style="width:${size}px;height:${size}px;border-radius:50%;background:${style.color};border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font-size:${emojiSize}px;">
              <span style="line-height:1;">${style.emoji}</span>
            </div>
            <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${style.color};"></div>
          </div>
        `,
        iconSize: [size, size + 8],
        iconAnchor: [size / 2, size + 8],
      });

      const marker = L.marker([sLat, sLon], { icon: pinIcon });
      marker.bindTooltip(site.name, { direction: 'top', offset: [0, -10] });

      marker.on('click', () => {
        if (onSelectSite) onSelectSite(site);
        map.panTo([sLat, sLon], { animate: true });
      });

      marker.addTo(layer);
    }

    updateMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, sites, activeCategory, clusterEnabled, userLat, userLon, selectedGovCoords, onSelectSite, routePolyline, tripPolyline, governorateGeometry, selectedSite]);

  // Render route polyline (single OSRM route — solid blue)
  useEffect(() => {
    const map = leafletMapInstance.current;
    if (!mapReady || !map) return;
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled) return;
      if (routeLayerRef.current) {
        routeLayerRef.current.remove();
        routeLayerRef.current = null;
      }
      if (routeEndsRef.current) {
        routeEndsRef.current.clearLayers();
        routeEndsRef.current = null;
      }
      if (routePolyline && routePolyline.length > 1) {
        routeLayerRef.current = L.polyline(routePolyline, {
          color: '#2563eb',
          weight: 4,
          opacity: 0.85,
        }).addTo(map);

        const endsLayer = L.layerGroup().addTo(map);
        routeEndsRef.current = endsLayer;
        const dot = (lat: number, lng: number, color: string, title: string) => {
          const icon = L.divIcon({
            className: 'custom-route-end',
            html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
          const m = L.marker([lat, lng], { icon, zIndexOffset: 950 });
          m.bindTooltip(title, { direction: 'top', offset: [0, -8] });
          m.addTo(endsLayer);
        };
        dot(routePolyline[0][0], routePolyline[0][1], '#16a34a', 'Start');
        dot(
          routePolyline[routePolyline.length - 1][0],
          routePolyline[routePolyline.length - 1][1],
          '#dc2626',
          'Destination'
        );

        try {
          map.fitBounds(routeLayerRef.current.getBounds(), { paddingTopLeft: [50, 50], paddingBottomRight: [50, 90], maxZoom: 15 });
        } catch (e) {
          // ignore
        }
      }
    })();
    return () => {
      cancelled = true;
      if (routeLayerRef.current) {
        routeLayerRef.current.remove();
        routeLayerRef.current = null;
      }
      if (routeEndsRef.current) {
        routeEndsRef.current.remove();
        routeEndsRef.current = null;
      }
    };
  }, [mapReady, routePolyline]);

  // Render trip polyline (amber dashed) + numbered trip stops
  useEffect(() => {
    const map = leafletMapInstance.current;
    if (!mapReady || !map || !tripLayerRef.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled) return;
      const layer = tripLayerRef.current;
      layer.clearLayers();

      if (tripPolyline && tripPolyline.length > 1) {
        L.polyline(tripPolyline, {
          color: '#d97706',
          weight: 5,
          opacity: 0.9,
          dashArray: '8 8',
        }).addTo(layer);
      }

      tripStops.forEach((stop) => {
        const stopIcon = L.divIcon({
          className: 'custom-trip-stop',
          html: `
            <div style="
              width: 26px; height: 26px;
              background: #C8831A;
              color: #FFF;
              border: 2px solid #FFF;
              border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              font-family: 'Inter', sans-serif;
              font-size: 11px; font-weight: 700;
              box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            ">${stop.index}</div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        const m = L.marker([stop.latitude, stop.longitude], { icon: stopIcon, zIndexOffset: 600 + stop.index });
        m.bindTooltip(`${stop.index}. ${stop.name}`, { permanent: false, direction: 'top' });
        m.addTo(layer);
      });

      if (tripPolyline && tripPolyline.length > 1) {
        try {
          map.fitBounds(L.polyline(tripPolyline).getBounds(), { padding: [50, 50], maxZoom: 15 });
        } catch (e) {
          // ignore
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mapReady, tripPolyline, tripStops]);

  // Render ticket monument markers (🎫)
  useEffect(() => {
    const map = leafletMapInstance.current;
    if (!mapReady || !map || !ticketLayerRef.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled) return;
      const layer = ticketLayerRef.current;
      layer.clearLayers();

      ticketMarkers.forEach((t) => {
        let bg = C.copper;
        const cat = (t.category || '').toLowerCase();
        if (cat.includes('museum')) bg = C.nile;
        if (cat.includes('temple') || cat.includes('archaeological')) bg = C.sand;
        if (cat.includes('christian')) bg = '#2563eb';
        if (cat.includes('islamic') || cat.includes('mosque')) bg = '#059669';

        const icon = L.divIcon({
          className: 'custom-ticket-marker',
          html: `
            <div style="
              width: 30px; height: 34px;
              background: ${bg};
              color: #FFF;
              border: 2px solid #FFF;
              border-radius: 4px 4px 8px 8px;
              display: flex; align-items: center; justify-content: center;
              font-size: 14px;
              box-shadow: 0 3px 8px rgba(0,0,0,0.3);
              cursor: pointer;
            ">🎫</div>
          `,
          iconSize: [30, 34],
          iconAnchor: [15, 34],
        });

        const marker = L.marker([t.latitude, t.longitude], {
          icon,
          zIndexOffset: t.selected ? 800 : 500,
        });

        marker.bindTooltip(t.title, { permanent: false, direction: 'top' });
        marker.on('click', () => {
          if (onSelectTicket) onSelectTicket(t);
          map.panTo([t.latitude, t.longitude], { animate: true });
        });
        marker.addTo(layer);
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [mapReady, ticketMarkers, onSelectTicket]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 340,
        borderRadius: 0,
        overflow: 'hidden',
        border: 'none',
        background: C.limestoneDark,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {!overlay && (
        <>
      {/* Map Control Header Bar */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          right: 12,
          zIndex: 800,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          rowGap: 6,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(27,26,23,0.1)',
            borderRadius: 99,
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            pointerEvents: 'auto',
          }}
        >
          <Compass size={15} color={C.copper} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 700, color: C.nile }}>
            {selectedGov ? `${selectedGov} Map` : 'Egypt Map'}
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#8B7E6A', borderLeft: '1px solid #E5DFD3', paddingLeft: 8 }}>
            {sites.length} Core POIs
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6, pointerEvents: 'auto' }}>
          <button
            onClick={() => setClusterEnabled(!clusterEnabled)}
            title="Toggle marker clustering"
            style={{
              background: clusterEnabled ? C.nile : 'rgba(255, 255, 255, 0.92)',
              color: clusterEnabled ? C.limestone : C.nile,
              border: '1px solid rgba(27,26,23,0.1)',
              borderRadius: 99,
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <Layers size={13} />
            {clusterEnabled ? 'Clusters' : 'All Pins'}
          </button>

          {locStatus === 'permission_denied' && (
            <button
              onClick={requestLocation}
              style={{
                background: '#FEF3C7',
                color: '#92400E',
                border: '1px solid #FCD34D',
                borderRadius: 99,
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Navigation size={12} /> Enable GPS
            </button>
          )}
        </div>
      </div>
        </>
      )}

      {/* Primary Map Container */}
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 340, flex: 1, cursor: 'grab' }} />

      {/* Re-center to my location (Google-Maps style round button) */}
      <button
        onClick={() => {
          const map = leafletMapInstance.current;
          if (!map) return;
          if (userLat !== null && userLon !== null) {
            map.setView([userLat, userLon], Math.max(map.getZoom(), 12), { animate: true });
          } else {
            requestLocation();
          }
        }}
        title="Return to my location"
        aria-label="Return to my location"
        style={{
          position: 'absolute',
          bottom: 76,
          right: 16,
          zIndex: 1100,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: '#FFFFFF',
          color: '#2563EB',
          border: '1px solid rgba(27,26,23,0.12)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LocateFixed size={18} />
      </button>

      {/* Floating route/trip loading chip */}
      {loadingNote && (
        <div
          style={{
            position: 'absolute',
            bottom: 70,
            left: 16,
            zIndex: 850,
            background: '#FFFFFF',
            border: '1px solid rgba(27,26,23,0.1)',
            borderRadius: 12,
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
          }}
        >
          <RefreshCw size={13} color={C.solar} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, color: C.nile }}>
            {loadingNote}
          </span>
        </div>
      )}

      {/* MAP STATE: Loading Overlay */}
      {isLoading && sites.length === 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 900,
            background: 'rgba(250, 247, 240, 0.82)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <RefreshCw size={28} color={C.copper} style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', fontStyle: 'italic', color: C.nile }}>
            Fetching backend POIs for map...
          </div>
        </div>
      )}

      {/* MAP STATE: API Error */}
      {error && !isLoading && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            zIndex: 950,
            background: '#FFF5F5',
            border: '1px solid #FECACA',
            borderRadius: 12,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} color="#DC2626" />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#991B1B', fontWeight: 600 }}>
              {error}
            </span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                background: '#DC2626',
                color: '#FFF',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
              }}
            >
              <RefreshCw size={12} /> Retry
            </button>
          )}
        </div>
      )}

      {/* MAP STATE: No sites — small non-blocking note so the map stays usable */}
      {!isLoading && !error && sites.length === 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 850,
            pointerEvents: 'none',
            background: 'rgba(250, 247, 240, 0.94)',
            border: '1px solid rgba(27,26,23,0.12)',
            borderRadius: 999,
            padding: '7px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            boxShadow: '0 2px 10px rgba(27,26,23,0.08)',
            maxWidth: 'calc(100% - 32px)',
          }}
        >
          <MapPin size={13} color={C.copper} style={{ flexShrink: 0 }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, color: C.nile, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            No sites here — widen the radius, pick a governorate, or click the map.
          </span>
        </div>
      )}

      {/* CLICKED MARKER: popup rendered by the parent (explore page) overlay */}
    </div>
  );
}
