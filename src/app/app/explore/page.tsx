'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/auth';
import { C } from '@/lib/constants/theme';
import { Geom } from '@/app/components/atoms';
import {
  AlertTriangle,
  Star,
  Navigation,
  Map,
  Filter,
  SlidersHorizontal,
  BookOpen,
  RefreshCw,
  Search,
  Compass,
  ShieldCheck,
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { TopBar } from '@/app/components/layout/TopBar';
import { SiteCard } from '@/app/components/siteCard';
import { RafiqDrawer } from '@/app/components/rafiqDrawer';
import { geoService } from '@/services/geoService';
import { safetyService, type SafetyData } from '@/services/safetyService';
import { useLocation } from '@/providers/LocationProvider';
import { ALL_SITES, type RihlaSite } from '@/app/data/rihla-data';
import { mapApiPoiToRihlaSite } from '@/lib/poiMapping';

const InteractiveMap = dynamic(
  () => import('@/app/components/ui/InteractiveMap').then((mod) => mod.InteractiveMap),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: 320,
          background: C.limestoneDark,
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Inter', sans-serif",
          fontSize: '12px',
          color: '#8B7E6A',
        }}
      >
        Loading map component...
      </div>
    ),
  }
);

const EXPLORE_CATS = ['All', 'Temples', 'Museums', 'Archaeological', 'Markets', 'Hidden gems'];

interface GovLocation {
  name: string;
  lat: number;
  lon: number;
}

const EGYPT_GOVERNORATES: GovLocation[] = [
  { name: 'Giza', lat: 29.9870, lon: 31.2118 },
  { name: 'Cairo', lat: 30.0444, lon: 31.2357 },
  { name: 'Luxor', lat: 25.6872, lon: 32.6396 },
  { name: 'Aswan', lat: 24.0889, lon: 32.8998 },
  { name: 'Alexandria', lat: 31.2001, lon: 29.9187 },
  { name: 'Sinai', lat: 28.5395, lon: 33.9750 },
  { name: 'Red Sea', lat: 27.2579, lon: 33.8116 },
];



export default function ExplorePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lat: userLat, lon: userLon, locationName, governorate: userGov, status: locStatus } = useLocation();

  const [cat, setCat] = useState('All');
  const [gov, setGov] = useState(userGov || 'Giza');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('distance');
  const [rafiq, setRafiq] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sites, setSites] = useState<RihlaSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [safetyData, setSafetyData] = useState<SafetyData | null>(null);
  const [safetyLoading, setSafetyLoading] = useState<boolean>(true);
  const [safetyError, setSafetyError] = useState<string | null>(null);

  // Sync gov with userGov when userGov changes (e.g. from LocationTester)
  useEffect(() => {
    if (userGov && EGYPT_GOVERNORATES.some(g => g.name.toLowerCase() === userGov.toLowerCase())) {
      setGov(userGov);
    }
  }, [userGov]);

  const activeGovObj = useMemo(() => {
    return EGYPT_GOVERNORATES.find((g) => g.name.toLowerCase() === gov.toLowerCase()) || EGYPT_GOVERNORATES[0];
  }, [gov]);

  const fetchSafetyInfo = useCallback(async () => {
    setSafetyLoading(true);
    setSafetyError(null);
    try {
      const data = await safetyService.getSafetyInfo(
        userLat || activeGovObj.lat,
        userLon || activeGovObj.lon,
        gov
      );
      setSafetyData(data);
    } catch (err: any) {
      console.error('Failed to fetch area safety data:', err);
      setSafetyError(err?.message || 'Failed to fetch safety info');
    } finally {
      setSafetyLoading(false);
    }
  }, [userLat, userLon, activeGovObj, gov, reloadKey]);

  const fetchExploreSites = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let rawPois: any[] = [];
      const queryCategory = cat === 'All' ? undefined : cat;

      if (searchQuery.trim().length > 0) {
        const searchRes = await geoService.searchPlaces(
          searchQuery.trim(),
          userLat || activeGovObj.lat,
          userLon || activeGovObj.lon
        );
        rawPois = (searchRes as any)?.pois || [];
      } else {
        const targetLat = userLat && gov === 'Giza' ? userLat : activeGovObj.lat;
        const targetLon = userLon && gov === 'Giza' ? userLon : activeGovObj.lon;

        const poiRes = await geoService.getPois(targetLat, targetLon, 35000, queryCategory);
        rawPois = (poiRes as any)?.pois || [];
      }

      if (rawPois && rawPois.length > 0) {
        const mapped = rawPois.map((p: any, idx: number) =>
          mapApiPoiToRihlaSite(p, userLat, userLon, idx)
        );
        setSites(mapped);
      } else {
        const fallbackSites = ALL_SITES.filter(
          (s) => s.gov.toLowerCase() === gov.toLowerCase() || gov === 'Egypt'
        );
        setSites(fallbackSites.length > 0 ? fallbackSites : ALL_SITES);
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to fetch points of interest from Core Server API.';
      console.warn('Explore page data fetch notice:', errMsg);
      const fallbackSites = ALL_SITES.filter(
        (s) => s.gov.toLowerCase() === gov.toLowerCase() || gov === 'Egypt'
      );
      setSites(fallbackSites.length > 0 ? fallbackSites : ALL_SITES);
    } finally {
      setIsLoading(false);
    }
  }, [cat, gov, searchQuery, userLat, userLon, activeGovObj, reloadKey]);

  useEffect(() => {
    let isMounted = true;
    if (user) {
      fetchExploreSites();
      fetchSafetyInfo();
    }
    return () => {
      isMounted = false;
    };
  }, [user, fetchExploreSites, fetchSafetyInfo]);

  const filtered = useMemo(() => {
    let result = [...sites];

    if (cat !== 'All') {
      result = result.filter(
        (s) =>
          s.cat.toLowerCase() === cat.toLowerCase() ||
          (cat === 'Hidden gems' && s.tag === 'Hidden gem') ||
          (cat === 'Markets' && (s.cat === 'Market' || s.cat === 'Markets'))
      );
    }

    if (sort === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'reviews') {
      result.sort((a, b) => b.reviews - a.reviews);
    }

    return result;
  }, [sites, cat, sort]);

  const handleGovChange = (gName: string) => {
    setGov(gName);
    setSearchQuery('');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar
        location={locationName ? `${locationName}` : `${gov} Governorate`}
        onRafiq={() => setRafiq(true)}
      />

      <div
        style={{
          background: `linear-gradient(135deg,${C.nile},${C.nileMid})`,
          padding: '28px 32px',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div style={{ position: 'absolute', right: -40, top: -40 }}>
          <Geom size={240} color={C.limestone} op={0.032} />
        </div>
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '10px',
                  fontWeight: 600,
                  color: `${C.limestone}50`,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Exploring
              </div>
              <h1
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 'clamp(24px,3vw,36px)',
                  fontWeight: 400,
                  color: C.limestone,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                Discover <span style={{ fontStyle: 'italic', color: C.sand }}>Egypt</span>
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative', width: 220 }}>
                <input
                  type="text"
                  placeholder="Search places..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    background: `${C.limestone}15`,
                    border: `1px solid ${C.limestone}25`,
                    borderRadius: 99,
                    padding: '7px 14px 7px 34px',
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '12px',
                    color: C.limestone,
                    outline: 'none',
                  }}
                />
                <Search
                  size={14}
                  color={`${C.limestone}70`}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  background: `${C.limestone}12`,
                  border: `1px solid ${C.limestone}20`,
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                {(['grid', 'list'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    style={{
                      background: view === v ? `${C.limestone}20` : 'transparent',
                      border: 'none',
                      padding: '7px 12px',
                      cursor: 'pointer',
                      color: view === v ? C.limestone : `${C.limestone}45`,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {v === 'grid' ? (
                      <SlidersHorizontal size={15} strokeWidth={2} />
                    ) : (
                      <BookOpen size={15} strokeWidth={2} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              paddingBottom: 2,
            }}
          >
            {EGYPT_GOVERNORATES.map((g) => (
              <button
                key={g.name}
                onClick={() => handleGovChange(g.name)}
                style={{
                  background: g.name === gov ? C.limestone : `${C.limestone}12`,
                  border: `1px solid ${g.name === gov ? C.limestone : `${C.limestone}20`}`,
                  borderRadius: 99,
                  padding: '6px 16px',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '12px',
                  fontWeight: g.name === gov ? 700 : 400,
                  color: g.name === gov ? C.nile : `${C.limestone}75`,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.18s',
                }}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: '24px 32px',
          maxWidth: 1100,
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {EXPLORE_CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                style={{
                  background: c === cat ? C.nile : 'transparent',
                  border: `1.5px solid ${c === cat ? C.nile : 'rgba(27,26,23,0.13)'}`,
                  borderRadius: 99,
                  padding: '6px 16px',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '13px',
                  fontWeight: c === cat ? 600 : 400,
                  color: c === cat ? C.limestone : '#6B6354',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#A89880' }}>
              Sort by:
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                background: '#FAF7F0',
                border: '1.5px solid rgba(27,26,23,0.1)',
                borderRadius: 8,
                padding: '6px 12px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: C.nile,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="distance">Nearest first</option>
              <option value="rating">Highest rated</option>
              <option value="reviews">Most reviewed</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '13px',
              fontWeight: 600,
              color: C.nile,
            }}
          >
            {isLoading ? '...' : filtered.length} sites
          </span>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: '#A89880' }}>
            in {gov} Governorate
          </span>
          {filtered.some((s) => s.scam) && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: `${C.alertAmber}12`,
                border: `1px solid ${C.alertAmber}25`,
                borderRadius: 99,
                padding: '3px 10px',
              }}
            >
              <AlertTriangle size={11} color={C.alertAmber} strokeWidth={2.5} />
              <span
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '11px',
                  fontWeight: 600,
                  color: C.alertAmber,
                }}
              >
                {filtered.filter((s) => s.scam).length} with scam alerts
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
          <div>
            {isLoading ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
                  gap: 14,
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    style={{
                      background: C.limestone,
                      borderRadius: 16,
                      height: 240,
                      border: '1px solid rgba(27,26,23,0.07)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      opacity: 0.7,
                    }}
                  >
                    <div style={{ height: 140, background: '#EAE6DF' }} />
                    <div style={{ padding: '12px 13px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ height: 16, width: '75%', background: '#EAE6DF', borderRadius: 4 }} />
                      <div style={{ height: 12, width: '45%', background: '#EAE6DF', borderRadius: 4 }} />
                      <div style={{ height: 14, width: '90%', background: '#EAE6DF', borderRadius: 4, marginTop: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div
                style={{
                  background: '#FFF5F5',
                  border: '1px solid #FECACA',
                  borderRadius: 16,
                  padding: '32px 24px',
                  textAlign: 'center',
                }}
              >
                <AlertTriangle size={36} color="#DC2626" style={{ marginBottom: 12 }} />
                <h3
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#991B1B',
                    margin: '0 0 8px 0',
                  }}
                >
                  Failed to Load Explore Data
                </h3>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: '#7F1D1D', margin: '0 0 16px 0' }}>
                  {error}
                </p>
                <button
                  onClick={() => setReloadKey((prev) => prev + 1)}
                  style={{
                    background: '#DC2626',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <RefreshCw size={14} /> Retry Request
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  background: C.limestone,
                  borderRadius: 16,
                  padding: '48px 24px',
                  textAlign: 'center',
                  border: '1.5px dashed rgba(27,26,23,0.15)',
                }}
              >
                <Compass size={40} color={C.copper} style={{ marginBottom: 12 }} />
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: '20px',
                    color: C.nile,
                    margin: '0 0 8px 0',
                  }}
                >
                  No Sites Found
                </h3>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: '#8B7E6A', margin: '0 0 16px 0' }}>
                  Core Server returned 0 points of interest matching your filter criteria in {gov}.
                </p>
                <button
                  onClick={() => {
                    setCat('All');
                    setSearchQuery('');
                  }}
                  style={{
                    background: C.nile,
                    color: C.limestone,
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : view === 'grid' ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
                  gap: 14,
                }}
              >
                {filtered.map((s) => (
                  <SiteCard key={s.id} s={s} goSite={(id) => router.push(`/app/sites/${id}`)} />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filtered.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      router.push(`/app/sites/${s.id}`);
                    }}
                    style={{
                      background: C.limestone,
                      borderRadius: 14,
                      border: '1px solid rgba(27,26,23,0.07)',
                      display: 'grid',
                      gridTemplateColumns: '100px 1fr auto',
                      gap: 16,
                      alignItems: 'center',
                      padding: '14px 18px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 6px rgba(27,26,23,0.04)',
                    }}
                  >
                    <div
                      style={{
                        width: 100,
                        height: 70,
                        borderRadius: 10,
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={s.img}
                        alt={s.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: "'Inter',sans-serif",
                          fontSize: '14px',
                          fontWeight: 700,
                          color: C.nile,
                          marginBottom: 2,
                        }}
                      >
                        {s.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Cormorant Garamond',serif",
                          fontStyle: 'italic',
                          fontSize: '11px',
                          color: '#A89880',
                          marginBottom: 8,
                        }}
                      >
                        {s.nameAr}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Star size={11} color={C.sand} fill={C.sand} strokeWidth={0} />
                          <span
                            style={{
                              fontFamily: "'Inter',sans-serif",
                              fontSize: '12px',
                              fontWeight: 700,
                              color: C.basalt,
                            }}
                          >
                            {s.rating}
                          </span>
                        </div>
                        <span
                          style={{
                            fontFamily: "'Inter',sans-serif",
                            fontSize: '11px',
                            color: '#A89880',
                            background: C.limestoneDark,
                            padding: '2px 8px',
                            borderRadius: 99,
                          }}
                        >
                          {s.cat}
                        </span>
                        {s.scam && (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              background: `${C.alertAmber}12`,
                              borderRadius: 99,
                              padding: '2px 8px',
                            }}
                          >
                            <AlertTriangle size={10} color={C.alertAmber} strokeWidth={2.5} />
                            <span
                              style={{
                                fontFamily: "'Inter',sans-serif",
                                fontSize: '10px',
                                fontWeight: 600,
                                color: C.alertAmber,
                              }}
                            >
                              Scam alert
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 8,
                      }}
                    >
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#8B7E6A' }}
                      >
                        <Navigation size={12} strokeWidth={2} />
                        <span
                          style={{
                            fontFamily: "'Inter',sans-serif",
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#8B7E6A',
                          }}
                        >
                          {s.dist}
                        </span>
                      </div>
                      <button
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
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'sticky', top: 24, alignSelf: 'start' }}>
            <div>
              <div style={{ height: 340, marginBottom: 14 }}>
                <InteractiveMap
                  sites={sites}
                  isLoading={isLoading}
                  error={error}
                  onRetry={() => setReloadKey((prev) => prev + 1)}
                  selectedGov={gov}
                  selectedGovCoords={{ lat: activeGovObj.lat, lon: activeGovObj.lon }}
                  onSelectSite={(site) => router.push(`/app/sites/${site.id}`)}
                  activeCategory={cat}
                />
              </div>

              <div
                style={{
                  background: C.limestone,
                  borderRadius: 14,
                  padding: '16px 18px',
                  border: '1px solid rgba(27,26,23,0.07)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Inter',sans-serif",
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#A89880',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Area Safety · {gov}
                  </div>
                  {safetyLoading ? (
                    <span
                      style={{
                        fontFamily: "'Inter',sans-serif",
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: '#E5E7EB',
                        color: '#4B5563',
                      }}
                    >
                      Loading...
                    </span>
                  ) : safetyError ? (
                    <span
                      style={{
                        fontFamily: "'Inter',sans-serif",
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: '#FEE2E2',
                        color: '#DC2626',
                      }}
                    >
                      Error
                    </span>
                  ) : (
                    <span
                      style={{
                        fontFamily: "'Inter',sans-serif",
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background:
                          safetyData?.status === 'safe'
                            ? '#DCFCE7'
                            : safetyData?.status === 'warning'
                            ? '#FEE2E2'
                            : '#FEF3C7',
                        color:
                          safetyData?.status === 'safe'
                            ? '#166534'
                            : safetyData?.status === 'warning'
                            ? '#991B1B'
                            : '#92400E',
                      }}
                    >
                      {safetyData?.safetyLevel || 'Safe'}
                    </span>
                  )}
                </div>

                {safetyLoading ? (
                  <div
                    style={{
                      padding: '16px 0',
                      textAlign: 'center',
                      fontFamily: "'Inter',sans-serif",
                      fontSize: '12px',
                      color: '#A89880',
                    }}
                  >
                    <RefreshCw size={16} className="animate-spin" style={{ margin: '0 auto 6px auto' }} />
                    Fetching safety information...
                  </div>
                ) : safetyError ? (
                  <div
                    style={{
                      background: '#FFF5F5',
                      border: '1px solid #FECACA',
                      borderRadius: 8,
                      padding: '10px 12px',
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#B91C1C',
                        fontWeight: 600,
                        fontSize: '12px',
                      }}
                    >
                      <AlertTriangle size={14} /> Safety Info Unavailable
                    </div>
                    <div
                      style={{
                        fontFamily: "'Inter',sans-serif",
                        fontSize: '11px',
                        color: '#7F1D1D',
                        marginTop: 4,
                        lineHeight: 1.4,
                      }}
                    >
                      {safetyError}
                    </div>
                    <button
                      onClick={fetchSafetyInfo}
                      style={{
                        marginTop: 8,
                        background: '#DC2626',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: 4,
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Retry
                    </button>
                  </div>
                ) : safetyData ? (
                  <>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#FFF',
                        borderRadius: 8,
                        padding: '10px 12px',
                        marginBottom: 12,
                        border: '1px solid rgba(27,26,23,0.05)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ShieldCheck size={18} color="#166534" />
                        <div>
                          <div
                            style={{
                              fontFamily: "'Inter',sans-serif",
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#1B1A17',
                            }}
                          >
                            Safety Index
                          </div>
                          <div
                            style={{
                              fontFamily: "'Inter',sans-serif",
                              fontSize: '10px',
                              color: '#8B7E6A',
                            }}
                          >
                            Score: {safetyData.safetyScore}/100
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          fontFamily: "'Inter',sans-serif",
                          fontSize: '18px',
                          fontWeight: 800,
                          color:
                            safetyData.safetyScore >= 80
                              ? '#166534'
                              : safetyData.safetyScore >= 60
                              ? '#92400E'
                              : '#991B1B',
                        }}
                      >
                        {safetyData.safetyScore}%
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '1px solid rgba(27,26,23,0.05)',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Inter',sans-serif",
                          fontSize: '12px',
                          color: '#8B7E6A',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <ShieldAlert size={14} color="#D97706" />
                        Scam Risk Level
                      </span>
                      <span
                        style={{
                          fontFamily: "'Inter',sans-serif",
                          fontSize: '12px',
                          fontWeight: 700,
                          color:
                            safetyData.scamRiskLevel === 'Low'
                              ? '#166534'
                              : safetyData.scamRiskLevel === 'Moderate'
                              ? '#D97706'
                              : '#DC2626',
                        }}
                      >
                        {safetyData.scamRiskLevel} ({safetyData.scamAlertsCount} alerts)
                      </span>
                    </div>

                    {safetyData.emergencyContacts && (
                      <div
                        style={{
                          padding: '10px 0 4px 0',
                          borderBottom: '1px solid rgba(27,26,23,0.05)',
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Inter',sans-serif",
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#1B1A17',
                            marginBottom: 6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <PhoneCall size={12} color="#8B7E6A" /> Emergency Contacts
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 6,
                            fontFamily: "'Inter',sans-serif",
                            fontSize: '11px',
                            color: '#555',
                          }}
                        >
                          <div>Police: <strong style={{ color: '#1B1A17' }}>{safetyData.emergencyContacts.touristPolice}</strong></div>
                          <div>Ambulance: <strong style={{ color: '#1B1A17' }}>{safetyData.emergencyContacts.ambulance}</strong></div>
                        </div>
                      </div>
                    )}

                    {safetyData.safetyTips && safetyData.safetyTips.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <div
                          style={{
                            fontFamily: "'Inter',sans-serif",
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#1B1A17',
                            marginBottom: 4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Info size={12} color="#8B7E6A" /> Safety Tip
                        </div>
                        <div
                          style={{
                            fontFamily: "'Inter',sans-serif",
                            fontSize: '11px',
                            color: '#666',
                            lineHeight: 1.35,
                          }}
                        >
                          {safetyData.safetyTips[0]}
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      {rafiq && <RafiqDrawer onClose={() => setRafiq(false)} />}
    </div>
  );
}
