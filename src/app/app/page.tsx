'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/api';
import { C } from '@/lib/constants/theme';
import { Glyph, Geom } from '@/app/components/atoms';
import {
  Sun,
  Wind,
  Thermometer,
  Map,
  AlertTriangle,
  Camera,
  Phone,
  BarChart2,
  ChevronRight,
  RefreshCw,
  MapPinOff,
} from 'lucide-react';
import { TopBar } from '@/app/components/layout/TopBar';
import { SiteCard } from '@/app/components/siteCard';
import { RafiqDrawer } from '@/app/components/rafiqDrawer';
import { useLocation } from '@/providers/LocationProvider';
import { geoService } from '@/services/geoService';
import { envService } from '@/services/envService';

export default function HomePage() {
  const router = useRouter();
  const [rafiq, setRafiq] = useState(false);
  const { user, isInitialized } = useAuth();
  const displayName = user?.displayName || user?.email || 'Traveler';

  const { lat, lon, accuracy, status, errorMessage, locationName, requestLocation } = useLocation();

  const [envData, setEnvData] = useState<any>(null);
  const [nearbySites, setNearbySites] = useState<any[]>([]);
  const [journeys, setJourneys] = useState<any[]>([]);
  const [riskAlert, setRiskAlert] = useState<any>(null);
  const [selectedCat, setSelectedCat] = useState('All');
  const [isLoadingPois, setIsLoadingPois] = useState(false);
  const [isLoadingEnv, setIsLoadingEnv] = useState(false);

  const filteredSites = React.useMemo(() => {
    if (selectedCat === 'All') return nearbySites;
    if (selectedCat === 'Hidden gems') return nearbySites.filter(s => s.tag === 'Hidden gem');
    if (selectedCat === 'Temples') return nearbySites.filter(s => s.cat === 'Temple' || s.name.includes('Temple'));
    if (selectedCat === 'Museums') return nearbySites.filter(s => s.cat === 'Museum');
    if (selectedCat === 'Markets') return nearbySites.filter(s => s.cat === 'Market');
    return nearbySites;
  }, [selectedCat, nearbySites]);

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login');
    }
  }, [isInitialized, user, router]);

  useEffect(() => {
    let isMounted = true;
    const fetchLocationData = async () => {
      if (!user) return;
      if (status !== 'success' || lat === null || lon === null) return;

      setIsLoadingPois(true);
      setIsLoadingEnv(true);

      try {
        const [envRes, sitesRes] = await Promise.all([
          envService.getEnv(lat, lon).catch((err) => {
            console.error("Failed to fetch /env:", err);
            return null;
          }),
          geoService.getPois(lat, lon).catch((err) => {
            console.error("Failed to fetch /geo/pois:", err);
            return null;
          }),
        ]);

        if (!isMounted) return;

        if (envRes) {
          setEnvData(envRes);
        }

        const parsedSites = sitesRes?.pois;
        if (parsedSites && Array.isArray(parsedSites)) {
          setNearbySites(parsedSites.map((p: any) => ({
            id: p.id,
            name: p.name_en || p.name,
            desc: p.details || (p.categories && p.categories.length > 0 ? p.categories[0] : 'Historical site'),
            img: p.imageUrl || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?auto=format&fit=crop&q=80&w=600',
            tag: (p.categories && p.categories.length > 0) ? p.categories[0] : 'Attraction',
            cat: (p.categories && p.categories.length > 0) ? p.categories[0] : 'Attraction',
            rating: p.rating || 4.5,
            reviews: 120,
            coords: [p.lat, p.lon]
          })));
        } else {
          setNearbySites([]);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        if (isMounted) {
          setIsLoadingPois(false);
          setIsLoadingEnv(false);
        }
      }
    };

    fetchLocationData();
    return () => { isMounted = false; };
  }, [user, lat, lon, status]);

  // Fetch user journeys and initial metadata
  useEffect(() => {
    let isMounted = true;
    const fetchJourneys = async () => {
      if (!user) return;
      try {
        const { data, error } = await (apiClient.GET as any)('/memory/history', {});
        if (!error && data && Array.isArray((data as any).history)) {
          if (isMounted) {
            setJourneys((data as any).history.map((j: any) => ({
              name: j.title || j.name || 'Journey',
              done: j.completedSites || 0,
              total: j.totalSites || 1,
              progress: j.progress || 0,
              color: C.nile,
            })));
          }
        }
      } catch (e) {
        console.warn('Could not fetch journeys:', e);
      }
    };
    fetchJourneys();
    return () => { isMounted = false; };
  }, [user]);

  const hour = new Date().getHours();
  const isMorn = hour >= 6 && hour < 12;
  const isEve = hour >= 17 || hour < 6;
  const greeting = isEve ? 'Good evening' : isMorn ? 'Good morning' : 'Good afternoon';
  
  const tg = isEve
    ? `linear-gradient(160deg,#1B1A17 0%,#2A1A0A 40%,${C.nile} 100%)`
    : isMorn
      ? `linear-gradient(160deg,${C.nile} 0%,#1A6B5A 40%,#C4834A 100%)`
      : `linear-gradient(160deg,${C.nile} 0%,#0A3D4A 50%,#1A5253 100%)`;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar onRafiq={() => setRafiq(true)} />
      <div
        style={{
          background: tg,
          padding: '36px 32px 32px',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div style={{ position: 'absolute', right: -60, top: -60 }}>
          <Geom size={280} color={C.limestone} op={0.038} />
        </div>
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'end',
            gap: 32,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: `${C.limestone}55`,
                marginBottom: 4,
              }}
            >
              {greeting},
            </div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 'clamp(28px,3vw,40px)',
                fontWeight: 400,
                color: C.limestone,
                lineHeight: 1.1,
                letterSpacing: '-0.025em',
                marginBottom: 20,
              }}
            >
              {displayName}
            </h1>
            <button
              onClick={() => setRafiq(true)}
              style={{
                background: `${C.limestone}14`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${C.limestone}20`,
                borderRadius: 12,
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer',
                maxWidth: 480,
                textAlign: 'left',
              }}
            >
              <Glyph size={22} light />
              <div>
                <div
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '10px',
                    fontWeight: 600,
                    color: `${C.limestone}55`,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: 3,
                  }}
                >
                  ◈ Ask Rafiq
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontStyle: 'italic',
                    fontSize: '14px',
                    color: C.limestone,
                  }}
                >
                  Ask about history, safety, food, local tips…
                </div>
              </div>
              <ChevronRight
                size={16}
                color={`${C.limestone}40`}
                strokeWidth={2}
                style={{ marginLeft: 'auto', flexShrink: 0 }}
              />
            </button>
          </div>
          <div
            style={{
              background: 'rgba(246,241,231,0.12)',
              backdropFilter: 'blur(14px)',
              border: `1.5px solid ${status === 'success' ? `${C.safeGreen}40` : `${C.alertAmber}40`}`,
              borderRadius: 16,
              padding: '18px 22px',
              textAlign: 'center',
              flexShrink: 0,
              minWidth: 180,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: status === 'success' ? C.safeGreen : C.alertAmber,
                  boxShadow: `0 0 0 3px ${status === 'success' ? `${C.safeGreen}35` : `${C.alertAmber}35`}`,
                }}
              />
              <span
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '16px',
                  fontWeight: 800,
                  color: status === 'success' ? C.safeGreen : C.alertAmber,
                  letterSpacing: '0.04em',
                }}
              >
                {status === 'success' ? 'SECURE' : status === 'requesting' ? 'LOCATING' : 'LOCATION OFF'}
              </span>
            </div>
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '11px',
                color: `${C.limestone}55`,
                marginBottom: 14,
              }}
            >
              {status === 'success' ? 'Live Coordinates' : 'Location Pending'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { icon: <Sun size={12} />, l: 'UV', v: isLoadingEnv ? '...' : (envData?.uv !== undefined ? envData.uv : '--') },
                { icon: <Thermometer size={12} />, l: '°C', v: isLoadingEnv ? '...' : (envData?.temperature ? String(envData.temperature).replace('C', '') : '--') },
                { icon: <Wind size={12} />, l: 'Air', v: isLoadingEnv ? '...' : (envData?.airQuality || '--') },
              ].map(({ icon, l, v }) => (
                <div
                  key={l}
                  style={{
                    flex: 1,
                    background: `${C.limestone}10`,
                    borderRadius: 8,
                    padding: '6px 4px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      color: `${C.limestone}70`,
                      marginBottom: 2,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {icon}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter',sans-serif",
                      fontSize: '10px',
                      color: `${C.limestone}50`,
                    }}
                  >
                    {l}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter',sans-serif",
                      fontSize: '12px',
                      fontWeight: 700,
                      color: C.limestone,
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          padding: '28px 32px',
          maxWidth: 1100,
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 24,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Location status notification banner if permission is denied or unavailable */}
          {status === 'permission_denied' && (
            <div
              style={{
                background: '#FFFBEB',
                border: '1.5px solid #FCD34D',
                borderRadius: 14,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <MapPinOff size={22} color="#D97706" />
                <div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '14px', fontWeight: 700, color: '#92400E' }}>
                    Location Permission Required
                  </div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#B45309', marginTop: 2 }}>
                    Please allow location permissions in your browser to view nearby historical sites and get real-time environmental context.
                  </div>
                </div>
              </div>
              <button
                onClick={requestLocation}
                style={{
                  background: '#D97706',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <RefreshCw size={14} /> Enable Location
              </button>
            </div>
          )}

          {status === 'location_unavailable' && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1.5px solid #FCA5A5',
                borderRadius: 14,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <AlertTriangle size={22} color="#DC2626" />
                <div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '14px', fontWeight: 700, color: '#991B1B' }}>
                    Location Unavailable
                  </div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#B91C1C', marginTop: 2 }}>
                    {errorMessage || 'Unable to retrieve location from your device. Please ensure location services are enabled.'}
                  </div>
                </div>
              </div>
              <button
                onClick={requestLocation}
                style={{
                  background: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          )}

          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 14,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: '20px',
                  fontWeight: 500,
                  color: C.nile,
                }}
              >
                Nearby Sites
              </h2>
              <button
                onClick={() => router.push('/app/explore')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '13px',
                  fontWeight: 600,
                  color: C.faience,
                  cursor: 'pointer',
                }}
              >
                Explore all →
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {['All', 'Temples', 'Museums', 'Hidden gems', 'Markets'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  style={{
                    background: selectedCat === cat ? C.nile : 'transparent',
                    border: `1.5px solid ${selectedCat === cat ? C.nile : 'rgba(27,26,23,0.13)'}`,
                    borderRadius: 99,
                    padding: '5px 14px',
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '12px',
                    fontWeight: selectedCat === cat ? 600 : 400,
                    color: selectedCat === cat ? C.limestone : '#6B6354',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Skeletons while requesting / loading */}
            {(status === 'requesting' || status === 'loading' || isLoadingPois) && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
                  gap: 12,
                }}
              >
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: 220,
                      background: 'rgba(27,26,23,0.06)',
                      borderRadius: 14,
                      animation: 'pulse 1.5s infinite',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Empty state when permission denied or location unavailable */}
            {(status === 'permission_denied' || status === 'location_unavailable') && !isLoadingPois && (
              <div
                style={{
                  background: C.limestone,
                  border: '1px dashed rgba(27,26,23,0.15)',
                  borderRadius: 14,
                  padding: '32px 20px',
                  textAlign: 'center',
                }}
              >
                <MapPinOff size={32} color="#A89880" style={{ marginBottom: 8 }} />
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '14px', fontWeight: 600, color: C.nile }}>
                  Nearby sites unavailable without location
                </div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#A89880', marginTop: 4 }}>
                  Grant browser location permission to discover real historical landmarks around you.
                </div>
              </div>
            )}

            {/* Success state with POIs list or empty response */}
            {status === 'success' && !isLoadingPois && filteredSites.length === 0 && (
              <div
                style={{
                  background: C.limestone,
                  border: '1px dashed rgba(27,26,23,0.15)',
                  borderRadius: 14,
                  padding: '32px 20px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '14px', fontWeight: 600, color: C.nile }}>
                  No nearby sites found for your location
                </div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#A89880', marginTop: 4 }}>
                  Coordinates ({lat?.toFixed(4)}°, {lon?.toFixed(4)}°) returned no indexed landmarks.
                </div>
              </div>
            )}

            {status === 'success' && !isLoadingPois && filteredSites.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
                  gap: 12,
                }}
              >
                {filteredSites.slice(0, 4).map((s) => (
                  <SiteCard key={s.id} s={s} goSite={(id) => router.push(`/app/sites/${id}`)} />
                ))}
              </div>
            )}
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 14,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: '20px',
                  fontWeight: 500,
                  color: C.nile,
                }}
              >
                Your Journeys
              </h2>
              <button
                onClick={() => router.push('/app/history')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '13px',
                  fontWeight: 600,
                  color: C.faience,
                  cursor: 'pointer',
                }}
              >
                See all →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {journeys.length === 0 ? (
                <div style={{ background: C.limestone, borderRadius: 14, padding: 16, border: '1px solid rgba(27,26,23,0.07)', fontSize: '13px', color: '#A89880' }}>
                  No active journeys found. Start exploring to record your trips!
                </div>
              ) : (
                journeys.map((j) => (
                  <div
                    key={j.name}
                    style={{
                      background: C.limestone,
                      borderRadius: 14,
                      padding: '16px 18px',
                      border: '1px solid rgba(27,26,23,0.07)',
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: 16,
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Inter',sans-serif",
                            fontSize: '14px',
                            fontWeight: 600,
                            color: C.nile,
                          }}
                        >
                          {j.name}
                        </div>
                        <div
                          style={{
                            fontFamily: "'Inter',sans-serif",
                            fontSize: '12px',
                            color: '#A89880',
                          }}
                        >
                          {j.done}/{j.total} sites
                        </div>
                      </div>
                      <div
                        style={{
                          height: 5,
                          background: '#EDE6D6',
                          borderRadius: 99,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${j.progress}%`,
                            background: `linear-gradient(90deg,${j.color},${j.color}99)`,
                            borderRadius: 99,
                          }}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: '22px',
                        fontWeight: 600,
                        color: j.color,
                        minWidth: 48,
                        textAlign: 'right',
                      }}
                    >
                      {j.progress}%
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: 'linear-gradient(160deg,#FAF3E4,#F0E5C8)',
              borderRadius: 16,
              padding: 18,
              border: `1px solid ${C.sand}28`,
            }}
          >
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '10px',
                fontWeight: 600,
                color: C.copper,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              ◈ Rafiq's Local Tip
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontStyle: 'italic',
                fontSize: '15px',
                color: C.nile,
                lineHeight: 1.65,
                marginBottom: 10,
              }}
            >
              "Visit historic monuments during early morning hours to enjoy Direct sun alignment and minimal crowd density."
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#A89880' }}>
              Based on traveler patterns for your region
            </div>
          </div>

          <div
            style={{
              background: C.limestone,
              borderRadius: 16,
              padding: 18,
              border: '1px solid rgba(27,26,23,0.07)',
            }}
          >
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#A89880',
                marginBottom: 12,
              }}
            >
              Quick actions
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { icon: <Map size={18} strokeWidth={1.8} />, label: 'Map', color: C.nile },
                {
                  icon: <Camera size={18} strokeWidth={1.8} />,
                  label: 'Identify',
                  color: C.faience,
                },
                {
                  icon: <Phone size={18} strokeWidth={1.8} />,
                  label: 'Emergency',
                  color: C.signalRed,
                },
                {
                  icon: <BarChart2 size={18} strokeWidth={1.8} />,
                  label: 'Currency',
                  color: C.copper,
                },
              ].map(({ icon, label, color }) => (
                <button
                  key={label}
                  onClick={() => {
                    if (label === 'Map') router.push('/app/explore');
                    if (label === 'Identify') router.push('/app/explore');
                    if (label === 'Emergency') router.push('/app/safety');
                    if (label === 'Currency') router.push('/app/wallet');
                  }}
                  style={{
                    background: '#FAF7F0',
                    border: '1px solid rgba(27,26,23,0.07)',
                    borderRadius: 10,
                    padding: '12px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = '#F0EBE1')}
                  onMouseOut={(e) => (e.currentTarget.style.background = '#FAF7F0')}
                >
                  <div style={{ color }}>{icon}</div>
                  <span
                    style={{
                      fontFamily: "'Inter',sans-serif",
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#6B6354',
                    }}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              background: `linear-gradient(135deg,${C.nile},${C.nileMid})`,
              borderRadius: 16,
              padding: 18,
            }}
          >
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: `${C.limestone}50`,
                marginBottom: 10,
              }}
            >
              Your progress
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: '16px',
                  fontWeight: 500,
                  color: C.limestone,
                }}
              >
                Level {(user as any)?.level || 1} · Explorer
              </div>
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '13px',
                  fontWeight: 700,
                  color: C.sand,
                }}
              >
                {(user as any)?.xp || 0} XP
              </div>
            </div>
            <div
              style={{
                height: 5,
                background: `${C.limestone}15`,
                borderRadius: 99,
                marginBottom: 10,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, (((user as any)?.xp || 0) / 1000) * 100)}%`,
                  background: `linear-gradient(90deg,${C.sand},${C.faience})`,
                  borderRadius: 99,
                }}
              />
            </div>
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '11px',
                color: `${C.limestone}45`,
              }}
            >
              {1000 - (((user as any)?.xp || 0) % 1000)} XP to Next Level
            </div>
          </div>
        </div>
      </div>
      {rafiq && <RafiqDrawer onClose={() => setRafiq(false)} />}
    </div>
  );
}
