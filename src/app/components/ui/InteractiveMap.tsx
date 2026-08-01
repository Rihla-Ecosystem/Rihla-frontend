'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from '@/providers/LocationProvider';
import type { RihlaSite } from '@/app/data/rihla-data';
import { C } from '@/lib/constants/theme';
import { MapPin, Navigation, RefreshCw, AlertTriangle, Compass, Layers, Star, X, Info } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface InteractiveMapProps {
  sites: RihlaSite[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  selectedGov?: string;
  selectedGovCoords?: { lat: number; lon: number };
  onSelectSite?: (site: RihlaSite) => void;
  activeCategory?: string;
}

export function InteractiveMap({
  sites,
  isLoading = false,
  error = null,
  onRetry,
  selectedGov = 'Giza',
  selectedGovCoords = { lat: 29.9870, lon: 31.2118 },
  onSelectSite,
  activeCategory = 'All',
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapInstance = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  const { lat: userLat, lon: userLon, status: locStatus, requestLocation } = useLocation();
  const [selectedSite, setSelectedSite] = useState<RihlaSite | null>(null);
  const [isClustered, setIsClustered] = useState(true);

  // Center coordinates preference: real user location > selected gov coords > default Giza
  const centerLat = userLat ?? selectedGovCoords.lat;
  const centerLon = userLon ?? selectedGovCoords.lon;

  // Initialize Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    let isMounted = true;

    async function initMap() {
      const L = (await import('leaflet')).default;

      if (!isMounted || !mapRef.current) return;

      // Clean up previous map if exists
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
        zoom: 13,
        zoomControl: false,
      });

      // Add Zoom Control on bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // CartoDB Voyager tiles (clean, beautiful aesthetic matching Rihla branding, no API key required)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      leafletMapInstance.current = map;

      // Group for POI markers
      const markersLayer = L.layerGroup().addTo(map);
      markersGroupRef.current = markersLayer;

      // Render User Location Marker if available
      if (userLat !== null && userLon !== null) {
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
        userMarker.bindTooltip("You are here", { permanent: false, direction: 'top' });
        userMarker.addTo(map);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }
    };
  }, [centerLat, centerLon, userLat, userLon]);

  // Update POI Markers on sites/category change
  useEffect(() => {
    if (!leafletMapInstance.current || !markersGroupRef.current) return;

    async function updateMarkers() {
      const L = (await import('leaflet')).default;
      const map = leafletMapInstance.current;
      const markersLayer = markersGroupRef.current;

      markersLayer.clearLayers();

      if (!sites || sites.length === 0) return;

      // Filter sites if activeCategory is set
      const displaySites = activeCategory === 'All'
        ? sites
        : sites.filter((s) => s.cat.toLowerCase() === activeCategory.toLowerCase());

      if (displaySites.length === 0) return;

      const bounds: [number, number][] = [];

      if (userLat !== null && userLon !== null) {
        bounds.push([userLat, userLon]);
      }

      // Simple cluster logic: group sites within ~0.008 deg (~800m) if clustering is enabled and count > 8
      const useClusters = isClustered && displaySites.length > 6;

      if (useClusters) {
        const clusters: { centerLat: number; centerLon: number; items: RihlaSite[] }[] = [];

        displaySites.forEach((site) => {
          const sLat = site.lat ?? selectedGovCoords.lat;
          const sLon = site.lon ?? selectedGovCoords.lon;
          bounds.push([sLat, sLon]);

          let addedToCluster = false;
          for (const c of clusters) {
            const dist = Math.sqrt(Math.pow(c.centerLat - sLat, 2) + Math.pow(c.centerLon - sLon, 2));
            if (dist < 0.015) { // Cluster radius threshold
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
            // Cluster marker
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

      // Auto fit map bounds if we have valid site markers
      if (bounds.length > 0 && map) {
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

      // Color coding by category
      let pinBg = C.copper; // Default
      if (site.cat.toLowerCase().includes('museum')) pinBg = C.nile;
      if (site.cat.toLowerCase().includes('archaeological') || site.cat.toLowerCase().includes('temple')) pinBg = C.sand;
      if (site.cat.toLowerCase().includes('market')) pinBg = C.alertAmber;
      if (site.cat.toLowerCase().includes('hidden')) pinBg = '#059669';

      const pinIcon = L.divIcon({
        className: 'custom-poi-pin',
        html: `
          <div style="
            position: relative;
            background: ${pinBg};
            color: ${C.limestone};
            border-radius: 99px;
            padding: 4px 10px;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.25);
            border: 2px solid ${C.limestone};
            cursor: pointer;
            white-space: nowrap;
            font-family: 'Inter', sans-serif;
            font-size: 11px;
            font-weight: 700;
            transition: transform 0.15s ease;
          ">
            <span>${site.name.length > 18 ? site.name.slice(0, 16) + '…' : site.name}</span>
            ${site.scam ? `<span style="background: ${C.alertAmber}; color: #fff; width: 6px; height: 6px; border-radius: 50%;"></span>` : ''}
          </div>
        `,
        iconSize: [120, 30],
        iconAnchor: [60, 15],
      });

      const marker = L.marker([sLat, sLon], { icon: pinIcon });

      marker.on('click', () => {
        setSelectedSite(site);
        if (onSelectSite) onSelectSite(site);
        map.panTo([sLat, sLon], { animate: true });
      });

      marker.addTo(layer);
    }

    updateMarkers();
  }, [sites, activeCategory, isClustered, userLat, userLon, selectedGovCoords, onSelectSite]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 340,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(27,26,23,0.12)',
        background: C.limestoneDark,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              color: C.nile,
            }}
          >
            {selectedGov} Map
          </span>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '11px',
              color: '#8B7E6A',
              borderLeft: '1px solid #E5DFD3',
              paddingLeft: 8,
            }}
          >
            {sites.length} Core POIs
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6, pointerEvents: 'auto' }}>
          <button
            onClick={() => setIsClustered(!isClustered)}
            title="Toggle marker clustering"
            style={{
              background: isClustered ? C.nile : 'rgba(255, 255, 255, 0.92)',
              color: isClustered ? C.limestone : C.nile,
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
            {isClustered ? 'Clusters' : 'All Pins'}
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

      {/* Primary Map Container */}
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 340, flex: 1 }} />

      {/* MAP STATE: Loading Overlay */}
      {isLoading && (
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
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '16px',
              fontStyle: 'italic',
              color: C.nile,
            }}
          >
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

      {/* MAP STATE: Permission Denied Notice */}
      {locStatus === 'permission_denied' && !error && !isLoading && (
        <div
          style={{
            position: 'absolute',
            bottom: selectedSite ? 180 : 16,
            left: 16,
            right: 16,
            zIndex: 850,
            background: 'rgba(255, 251, 235, 0.95)',
            border: '1px solid #FCD34D',
            borderRadius: 10,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Navigation size={15} color="#D97706" />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#92400E' }}>
              Enable location access to show live distance and center on your position.
            </span>
          </div>
          <button
            onClick={requestLocation}
            style={{
              background: '#D97706',
              color: '#FFF',
              border: 'none',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Grant Location
          </button>
        </div>
      )}

      {/* MAP STATE: No Nearby Sites */}
      {!isLoading && !error && sites.length === 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 800,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'rgba(250, 247, 240, 0.92)',
              backdropFilter: 'blur(4px)',
              border: '1px dashed rgba(27,26,23,0.2)',
              borderRadius: 14,
              padding: '16px 24px',
              textAlign: 'center',
              pointerEvents: 'auto',
            }}
          >
            <MapPin size={24} color={C.copper} style={{ marginBottom: 6 }} />
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 700, color: C.nile }}>
              No Markers Rendered
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#8B7E6A' }}>
              Core Server returned 0 sites for {selectedGov}.
            </div>
          </div>
        </div>
      )}

      {/* CLICKED MARKER: Selected Site Card Popover */}
      {selectedSite && (
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: 14,
            right: 14,
            zIndex: 900,
            background: C.limestone,
            borderRadius: 14,
            padding: '14px 16px',
            border: '1.5px solid rgba(27,26,23,0.12)',
            boxShadow: '0 8px 24px rgba(27,26,23,0.15)',
            display: 'grid',
            gridTemplateColumns: '80px 1fr auto',
            gap: 12,
            alignItems: 'center',
            animation: 'fadeInUp 0.2s ease-out',
          }}
        >
          <div
            style={{
              width: 80,
              height: 70,
              borderRadius: 10,
              overflow: 'hidden',
              background: '#EAE6DF',
            }}
          >
            <img
              src={selectedSite.img}
              alt={selectedSite.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 2,
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px',
                  fontWeight: 700,
                  color: C.nile,
                }}
              >
                {selectedSite.name}
              </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '10px',
                  color: '#8B7E6A',
                  background: C.limestoneDark,
                  padding: '1px 6px',
                  borderRadius: 4,
                }}
              >
                {selectedSite.cat}
              </span>
            </div>

            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontSize: '11px',
                color: '#A89880',
                marginBottom: 6,
              }}
            >
              {selectedSite.nameAr}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Star size={11} color={C.sand} fill={C.sand} strokeWidth={0} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 700 }}>
                  {selectedSite.rating}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#8B7E6A' }}>
                <Navigation size={10} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600 }}>
                  {selectedSite.dist} away
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <button
              onClick={() => setSelectedSite(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#A89880',
                padding: 2,
              }}
            >
              <X size={16} />
            </button>
            {onSelectSite && (
              <button
                onClick={() => onSelectSite(selectedSite)}
                style={{
                  background: C.nile,
                  color: C.limestone,
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                View Details
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
