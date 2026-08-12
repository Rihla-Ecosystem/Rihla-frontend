'use client';

import { useRouter, useParams } from 'next/navigation';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { C } from '@/lib/constants/theme';
import { Glyph } from '@/app/components/atoms';
import { ChevronLeft, Star } from 'lucide-react';
import { TopBar } from '@/app/components/layout/TopBar';
import SiteHero from '@/app/components/site/SiteHero';
import SiteBodyLeft from '@/app/components/site/SiteBodyLeft';
import SiteRightSidebar from '@/app/components/site/SiteRightSidebar';
import { monumentsService, type Monument } from '@/services/monumentsService';
import { buildMonumentSite } from '@/app/data/monument-catalog';
import { ALL_SITES, type RihlaSite } from '@/app/data/rihla-data';
import { geoApi, googleMapsDirectionsUrl } from '@/lib/api/geo';
import { placesApi } from '@/lib/api/places';
import { useLocation } from '@/providers/LocationProvider';
import { buildExploreContext } from '@/lib/rafiq';
import { useRafiq } from '@/app/components/rafiq/RafiqProvider';

export default function MonumentDetailPage() {
  const router = useRouter();
  const { openRafiq } = useRafiq();
  const params = useParams();
  const id = params?.id as string;
  const { lat, lon } = useLocation();

  const [monuments, setMonuments] = useState<Monument[] | null>(null);
  const [saved, setSaved] = useState(false);
  const [route, setRoute] = useState<{ distanceMeters: number; durationSeconds: number } | null>(null);

  const origin = useMemo(
    () => ({ lat: lat ?? 30.0444, lon: lon ?? 31.2357 }),
    [lat, lon]
  );

  const monument = useMemo(
    () => monuments?.find((m) => m.id === id) ?? null,
    [monuments, id]
  );

  const index = useMemo(
    () => (monuments ? monuments.findIndex((m) => m.id === id) : -1),
    [monuments, id]
  );

  const site: RihlaSite | null = useMemo(
    () => (monument && index >= 0 ? buildMonumentSite(monument, index, origin) : null),
    [monument, index, origin]
  );

  useEffect(() => {
    monumentsService
      .getMonuments()
      .then(setMonuments)
      .catch(() => setMonuments([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    let active = true;
    placesApi
      .isFavorited(id)
      .then((fav) => {
        if (active) setSaved(fav);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [id]);

  const toggleSave = useMemo(
    () => () => {
      const m = monument;
      if (!m) return;
      const next = !saved;
      setSaved(next);
      if (next) {
        placesApi.addFavorite({
          placeId: m.id,
          placeName: m.title,
          category: m.category,
          governorate: m.governorate ?? undefined,
          lat: m.latitude,
          lon: m.longitude,
          img: m.images[0] ?? undefined,
        }).catch(() => {});
        placesApi.recordEvent({ event: 'place_saved', siteId: m.id, siteName: m.title });
      } else {
        placesApi.removeFavorite(m.id).catch(() => {});
        placesApi.recordEvent({ event: 'place_unsaved', siteId: m.id, siteName: m.title });
      }
    },
    [monument, saved]
  );

  const askRafiq = useCallback(() => {
    const m = monument;
    const s = site;
    const name = m?.title || s?.name || 'this place';
    const ctx = buildExploreContext(s!, null); // distance not needed here
    openRafiq({ context: ctx });
  }, [monument, site, openRafiq]);

  useEffect(() => {
    if (!monument) return;
    let active = true;
    geoApi
      .getRoute(
        { latitude: origin.lat, longitude: origin.lon },
        { latitude: monument.latitude, longitude: monument.longitude }
      )
      .then((r: any) => {
        if (active) setRoute(r ?? null);
      })
      .catch(() => {
        if (active) setRoute(null);
      });
    return () => {
      active = false;
    };
  }, [monument, origin]);

  useEffect(() => {
    if (monuments && !monument) {
      router.replace('/app/monuments');
    }
  }, [monuments, monument, router]);

  if (!monument || !site) {
    return null;
  }

  const nearby = (site.nearby ?? [])
    .map((nid) => ALL_SITES.find((s) => s.id === nid))
    .filter(Boolean) as typeof ALL_SITES;

  const openDirections = () => {
    window.open(
      googleMapsDirectionsUrl(
        { latitude: origin.lat, longitude: origin.lon },
        { latitude: monument.latitude, longitude: monument.longitude }
      ),
      '_blank'
    );
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar location="Monument Details" onRafiq={() => openRafiq()} />

      {/* Sticky detail nav */}
      <div
        style={{
          background: 'rgba(246,241,231,0.95)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(27,26,23,0.08)',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 60,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => router.push('/app/monuments')}
          style={{
            background: 'none',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: "'Inter',sans-serif",
            fontSize: '13px',
            fontWeight: 600,
            color: C.nile,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <ChevronLeft size={17} strokeWidth={2.5} /> Monuments
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={toggleSave}
            style={{
              background: saved ? `${C.terracotta}12` : '#FAF7F0',
              border: `1.5px solid ${saved ? C.terracotta : 'rgba(27,26,23,0.1)'}`,
              borderRadius: 8,
              padding: '7px 14px',
              fontFamily: "'Inter',sans-serif",
              fontSize: '12px',
              fontWeight: 600,
              color: saved ? C.terracotta : '#6B6354',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Star size={13} fill={saved ? C.terracotta : 'none'} strokeWidth={2} />{' '}
            {saved ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={askRafiq}
            style={{
              background: C.nile,
              border: 'none',
              borderRadius: 8,
              padding: '7px 14px',
              fontFamily: "'Inter',sans-serif",
              fontSize: '12px',
              fontWeight: 600,
              color: C.limestone,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Glyph size={13} light /> Ask Rafiq
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SiteHero site={site} />

        <div
          className="grid grid-cols-1 lg:grid-cols-[1fr_320px]"
          style={{
            width: '100%',
            maxWidth: 1100,
            margin: '0 auto',
            padding: '28px 20px',
            gap: 36,
          }}
        >
          <SiteBodyLeft site={site} nearby={nearby} monument={monument} />
          <SiteRightSidebar
            site={site}
            saved={saved}
            setSaved={toggleSave}
            setRafiq={askRafiq}
            onDirections={openDirections}
          />
        </div>

        {route && (
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px 40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FAF7F0', border: '1px solid rgba(27,26,23,0.1)', borderRadius: 99, padding: '8px 16px', fontFamily: "'Inter',sans-serif", fontSize: '12px', color: C.nile, fontWeight: 600 }}>
              Route from your location: {(route.distanceMeters / 1000).toFixed(1)} km · {Math.round(route.durationSeconds / 60)} min
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
