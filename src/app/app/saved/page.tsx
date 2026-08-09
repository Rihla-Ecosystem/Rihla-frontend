'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { C } from '@/lib/constants/theme';
import { Geom } from '@/app/components/atoms';
import { TopBar } from '@/app/components/layout/TopBar';
import { Bookmark, MapPin, Ticket, Trash2, Compass, ChevronRight, Search, X, MoreHorizontal } from 'lucide-react';
import { placesApi, type Favorite } from '@/lib/api/places';
import { monumentsService, buildMonumentLookup, normalizeName, type Monument } from '@/services/monumentsService';
import { useLocation } from '@/providers/LocationProvider';
import { calculateDistanceKm } from '@/lib/poiMapping';

const CATEGORY_EMOJI: Record<string, string> = {
  archaeological: '🏛️',
  islamic: '🕌',
  christian: '⛪',
  museum: '🏛️',
  temple: '🏛️',
  market: '🛍️',
};

const CATEGORY_ACCENT: Record<string, string> = {
  archaeological: C.sand,
  islamic: C.faience,
  christian: C.faience,
  museum: C.copper,
  temple: C.copper,
  market: C.terracotta,
};

function fmtDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export default function SavedPage() {
  const router = useRouter();
  const { lat, lon } = useLocation();

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [monuments, setMonuments] = useState<Monument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([placesApi.listFavorites(), monumentsService.getMonuments()]).then(
      ([favRes, monRes]) => {
        if (!active) return;
        if (favRes.status === 'fulfilled') setFavorites(favRes.value);
        if (monRes.status === 'fulfilled') setMonuments(monRes.value);
        setLoading(false);
      }
    );
    return () => {
      active = false;
    };
  }, []);

  const monumentLookup = useMemo(() => buildMonumentLookup(monuments), [monuments]);

  const monumentFor = useCallback(
    (f: Favorite): Monument | null =>
      monumentLookup.size === 0 ? null : monumentLookup.get(normalizeName(f.placeName)) ?? null,
    [monumentLookup]
  );

  const enriched = useMemo(
    () => favorites.map((f) => ({ favorite: f, monument: monumentFor(f) })),
    [favorites, monumentFor]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return enriched;
    return enriched.filter(
      ({ favorite: f }) =>
        f.placeName.toLowerCase().includes(q) ||
        (f.governorate || '').toLowerCase().includes(q) ||
        (f.category || '').toLowerCase().includes(q)
    );
  }, [enriched, search]);

  const groups = useMemo(() => {
    const order = Array.from(new Set(filtered.map(({ favorite: f }) => f.governorate || 'Egypt')));
    return order.map((gov) => ({
      gov,
      items: filtered.filter(({ favorite: f }) => (f.governorate || 'Egypt') === gov),
    }));
  }, [filtered]);

  const handleRemove = useCallback(
    (f: Favorite) => {
      setRemoving(f.placeId);
      placesApi
        .removeFavorite(f.placeId)
        .then(() => {
          setFavorites((prev) => prev.filter((x) => x.placeId !== f.placeId));
          placesApi.recordEvent({ event: 'place_unsaved', siteId: f.placeId, siteName: f.placeName });
        })
        .catch(() => {})
        .finally(() => setRemoving(null));
    },
    []
  );

  const handleOpen = useCallback(
    (f: Favorite) => {
      const m = monumentFor(f);
      placesApi.recordEvent({ event: 'saved_open', siteId: f.placeId, siteName: f.placeName });
      if (m) router.push(`/app/monuments/${encodeURIComponent(m.id)}`);
      else router.push(`/app/explore?city=${encodeURIComponent((f.governorate || '').toLowerCase())}`);
    },
    [monumentFor, router]
  );

  const handleShowOnMap = useCallback(
    (f: Favorite) => {
      setMenuFor(null);
      placesApi.recordEvent({ event: 'saved_show_on_map', siteId: f.placeId, siteName: f.placeName });
      if (f.lat != null && f.lon != null) {
        router.push(`/app/explore?focus=${encodeURIComponent(`${f.lat},${f.lon}`)}`);
      } else {
        router.push(`/app/explore?city=${encodeURIComponent((f.governorate || '').toLowerCase())}`);
      }
    },
    [router]
  );

  const origin = useMemo(() => ({ lat: lat ?? 30.0444, lon: lon ?? 31.2357 }), [lat, lon]);

  const govCount = useMemo(() => new Set(filtered.map(({ favorite: f }) => f.governorate || 'Egypt')).size, [filtered]);

  const snippet = (m: Monument | null, f: Favorite) =>
    m?.description && m.description.length > 2
      ? m.description
      : `${f.placeName} is one of the places you shortlisted on your Egypt trip. Tap to view details, tickets and directions.`;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: C.limestone }}>
      <TopBar location="Saved Places" onRafiq={() => router.push('/app/rafiq')} />

      {/* Cart hero */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(145deg, ${C.basalt} 0%, #231A10 45%, ${C.solar} 130%)`,
          color: C.limestone,
        }}
      >
        <div style={{ position: 'absolute', top: -30, left: -20, opacity: 0.8 }}>
          <Geom size={240} color={C.sand} op={0.08} />
        </div>
        <div style={{ position: 'absolute', right: -40, bottom: -60 }}>
          <Geom size={200} color={C.solar} op={0.14} />
        </div>
        <div style={{ position: 'relative', padding: '22px 22px 26px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: 'rgba(245,192,64,0.16)',
              border: '1px solid rgba(245,192,64,0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 10px 24px rgba(0,0,0,0.25)',
            }}
          >
            <Bookmark size={26} color={C.solarGlow} strokeWidth={1.9} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, lineHeight: 1, color: '#FFFFFF' }}>
              Your saved places
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: 'rgba(245,239,224,0.78)', marginTop: 6 }}>
              A shortlist of landmarks worth coming back to on your journey.
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 820, width: '100%', margin: '0 auto' }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ height: 108, background: `${C.limestoneDark}50`, borderRadius: 16, animation: 'pulse 1.5s infinite ease-in-out' }} />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 380, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <span
              style={{
                width: 96,
                height: 96,
                borderRadius: 30,
                background: `linear-gradient(150deg, ${C.limestoneDark}, ${C.solar}22)`,
                border: '1.5px dashed rgba(200,131,26,0.45)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Compass size={40} color={C.solar} strokeWidth={1.6} />
            </span>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700, color: C.nile }}>Your cart is empty</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13.5, color: '#8B7E6A', lineHeight: 1.6 }}>
              Tap the <span style={{ fontWeight: 700, color: C.solar }}>bag icon</span> or the star on any place while exploring to keep it here — prices, routes and details at hand for your trip.
            </div>
            <button
              onClick={() => router.push('/app/explore')}
              style={{
                marginTop: 10,
                background: C.solar,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 99,
                padding: '12px 26px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
                fontFamily: "'Inter',sans-serif",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 12px 26px rgba(200,131,26,0.35)',
              }}
            >
              <Compass size={16} /> Explore places
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 18px 30px' }}>
          <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* Summary + search */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <StatChip label={`${favorites.length}`} suffix=" places" tone="gold" />
                <StatChip label={`${govCount}`} suffix=" governorates" tone="teal" />
                <div style={{ flex: 1 }} />
              </div>
              <div style={{ position: 'relative' }}>
                <Search size={15} color="#A89880" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search your saved places…"
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: '1.5px solid rgba(27,26,23,0.08)',
                    borderRadius: 14,
                    padding: '11px 40px',
                    fontFamily: "'Inter',sans-serif",
                    fontSize: 13.5,
                    color: '#2E2A22',
                    outline: 'none',
                    boxShadow: '0 4px 14px rgba(20,16,8,0.05)',
                  }}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#A89880', padding: 6 }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {filtered.length === 0 && (
              <div style={{ padding: 30, textAlign: 'center', fontFamily: "'Inter',sans-serif", fontSize: 13.5, color: '#8B7E6A', background: '#FFFFFF', borderRadius: 16 }}>
                Nothing matches “{search}” in your saved places.
              </div>
            )}

            {groups.map(
              (g) =>
                g.items.length > 0 && (
                  <section key={g.gov}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 700, color: C.nile }}>{g.gov}</span>
                      <span style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, rgba(201,131,26,0.35), rgba(27,26,23,0.06))' }} />
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#A89880' }}>{g.items.length}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {g.items.map(({ favorite: f, monument: m }) => {
                        const dist = f.lat != null && f.lon != null ? calculateDistanceKm(origin.lat, origin.lon, f.lat, f.lon) : null;
                        const price = m?.prices?.foreigner?.adult ?? null;
                        const accent = CATEGORY_ACCENT[(f.category || '').toLowerCase()] ?? C.solar;
                        const emoji = CATEGORY_EMOJI[(f.category || '').toLowerCase()] ?? '📍';
                        return (
                          <article
                            key={f.id}
                            onClick={() => handleOpen(f)}
                            style={{
                              display: 'flex',
                              gap: 16,
                              background: '#FFFFFF',
                              border: '1px solid rgba(27,26,23,0.07)',
                              borderRadius: 18,
                              padding: 12,
                              cursor: 'pointer',
                              transition: 'transform 0.15s ease, box-shadow 0.2s ease',
                              boxShadow: '0 4px 14px rgba(20,16,8,0.05)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-3px)';
                              e.currentTarget.style.boxShadow = '0 14px 30px rgba(20,16,8,0.12)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'none';
                              e.currentTarget.style.boxShadow = '0 4px 14px rgba(20,16,8,0.05)';
                            }}
                          >
                            {/* Image tile */}
                            <div
                              style={{
                                width: 96,
                                height: 104,
                                borderRadius: 14,
                                overflow: 'hidden',
                                flexShrink: 0,
                                position: 'relative',
                                background: `linear-gradient(150deg, ${accent}33, ${C.limestoneDark})`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {f.img ? (
                                <img src={f.img} alt={f.placeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <span style={{ fontSize: 38, filter: 'saturate(0.85)' }}>{emoji}</span>
                              )}
                              <span
                                style={{
                                  position: 'absolute',
                                  top: 8,
                                  left: 8,
                                  height: 20,
                                  width: 20,
                                  borderRadius: 99,
                                  background: 'rgba(245,239,224,0.92)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Bookmark size={11} fill={C.solar} color={C.solar} strokeWidth={2} />
                              </span>
                            </div>

                            {/* Body */}
                            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 700, color: C.nile, lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {f.placeName}
                                </h3>
                                {m && (
                                  <span
                                    style={{
                                      fontFamily: "'Inter',sans-serif",
                                      fontSize: 10,
                                      fontWeight: 700,
                                      color: '#FFFFFF',
                                      background: C.faience,
                                      borderRadius: 99,
                                      padding: '2px 8px',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    TICKETS
                                  </span>
                                )}
                              </div>

                              <p
                                style={{
                                  margin: 0,
                                  fontFamily: "'Inter',sans-serif",
                                  fontSize: 12.5,
                                  color: '#8B7E6A',
                                  lineHeight: 1.5,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {summarize(m, f)}
                              </p>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                                {dist != null && (
                                  <MetaPill tone="blue" icon={<MapPin size={11} />}>
                                    {fmtDistance(dist)}
                                  </MetaPill>
                                )}
                                {price != null && (
                                  <MetaPill tone="gold" icon={<Ticket size={11} />}>
                                    LE {price} · foreigner
                                  </MetaPill>
                                )}
                                {f.category && (
                                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#A89880', textTransform: 'capitalize' }}>
                                    {f.category}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuFor((v) => (v === f.id ? null : f.id));
                                }}
                                aria-label="More actions"
                                title="More"
                                style={{
                                  background: 'rgba(27,26,23,0.05)',
                                  border: '1px solid rgba(27,26,23,0.1)',
                                  borderRadius: 10,
                                  color: '#6B6354',
                                  cursor: 'pointer',
                                  padding: '7px 9px',
                                  display: 'inline-flex',
                                }}
                              >
                                <MoreHorizontal size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpen(f);
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontFamily: "'Inter',sans-serif",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: C.nile,
                                  padding: 4,
                                }}
                              >
                                Details <ChevronRight size={14} />
                              </button>

                              {menuFor === f.id && (
                                <>
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMenuFor(null);
                                    }}
                                    style={{ position: 'fixed', inset: 0, zIndex: 1190 }}
                                  />
                                  <div
                                    style={{
                                      position: 'absolute',
                                      top: 30,
                                      right: 0,
                                      zIndex: 1200,
                                      background: '#FFFFFF',
                                      border: '1px solid rgba(27,26,23,0.1)',
                                      borderRadius: 12,
                                      boxShadow: '0 14px 34px rgba(20,16,8,0.18)',
                                      padding: 6,
                                      minWidth: 168,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 2,
                                    }}
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleShowOnMap(f);
                                      }}
                                      disabled={f.lat == null || f.lon == null}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 9,
                                        background: 'none',
                                        border: 'none',
                                        cursor: f.lat != null && f.lon != null ? 'pointer' : 'not-allowed',
                                        opacity: f.lat != null && f.lon != null ? 1 : 0.45,
                                        fontFamily: "'Inter',sans-serif",
                                        fontSize: 12.5,
                                        fontWeight: 600,
                                        color: C.nile,
                                        padding: '8px 10px',
                                        borderRadius: 8,
                                        textAlign: 'left',
                                        width: '100%',
                                      }}
                                      onMouseEnter={(ev) => (ev.currentTarget.style.background = 'rgba(15,61,62,0.06)')}
                                      onMouseLeave={(ev) => (ev.currentTarget.style.background = 'none')}
                                    >
                                      <MapPin size={14} /> Show on map
                                    </button>
                                    <div style={{ height: 1, background: 'rgba(27,26,23,0.06)', margin: '2px 6px' }} />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuFor(null);
                                        handleRemove(f);
                                      }}
                                      disabled={removing === f.placeId}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 9,
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontFamily: "'Inter',sans-serif",
                                        fontSize: 12.5,
                                        fontWeight: 600,
                                        color: '#B23A2E',
                                        padding: '8px 10px',
                                        borderRadius: 8,
                                        textAlign: 'left',
                                        width: '100%',
                                      }}
                                      onMouseEnter={(ev) => (ev.currentTarget.style.background = 'rgba(178,58,46,0.07)')}
                                      onMouseLeave={(ev) => (ev.currentTarget.style.background = 'none')}
                                    >
                                      <Trash2 size={14} /> Remove
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                )
            )}

            <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 0' }}>
              <button
                onClick={() => router.push('/app/explore')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'transparent',
                  border: '1.5px dashed rgba(201,131,26,0.5)',
                  borderRadius: 99,
                  padding: '10px 22px',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.solar,
                  cursor: 'pointer',
                }}
              >
                <Compass size={15} /> Discover more places
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatChip({ label, suffix, tone }: { label: string; suffix: string; tone: 'gold' | 'teal' }) {
  const [bg, fg] =
    tone === 'gold'
      ? [`${C.solar}14`, C.terracotta]
      : [`rgba(46,156,147,0.1)`, C.faience];
  return (
    <span
      style={{
        background: bg,
        color: fg,
        borderRadius: 99,
        padding: '5px 13px',
        fontFamily: "'Inter',sans-serif",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {label}
      <span style={{ fontWeight: 500, opacity: 0.85 }}>{suffix}</span>
    </span>
  );
}

function MetaPill({ icon, children, tone }: { icon: React.ReactNode; children: React.ReactNode; tone: 'blue' | 'gold' }) {
  const [bg, fg] =
    tone === 'blue'
      ? ['#EFF6F4', C.nile]
      : ['rgba(139,90,52,0.1)', C.copper];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: bg,
        color: fg,
        fontFamily: "'Inter',sans-serif",
        fontSize: 11,
        fontWeight: 700,
        borderRadius: 99,
        padding: '3px 9px',
      }}
    >
      {icon}
      {children}
    </span>
  );
}

const summarize = (m: Monument | null, f: Favorite) => {
  const snippet =
    m?.description && m.description.length > 2
      ? m.description
      : `${f.placeName} is one of the places you saved while exploring Egypt. Open it for tickets, routes and travel tips.`;
  return snippet.length > 140 ? `${snippet.slice(0, 140)}…` : snippet;
};