'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useLocation, useLocationLabel } from '@/providers/LocationProvider';
import { safetyService, FALLBACK_GOV_PROFILES, type SafetyData } from '@/services/safetyService';
import { envService } from '@/services/envService';
import { TopBar } from '@/app/components/layout/TopBar';
import { Geom, Glyph } from '@/app/components/atoms';
import { C } from '@/lib/constants/theme';
import { SourceHealth, type DataSourceStatus } from './components/SourceHealth';
import { SafetyGuide } from './components/SafetyGuide';
import {
  AlertTriangle,
  MapPin,
  Thermometer,
  Sun,
  Wind,
  Globe,
  Phone,
  CheckCircle,
  ShieldAlert,
  Compass,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { RiskGauge } from './components/RiskGauge';

const SAFETY_POLL_MS = 60000;

const SAFETY_CITIES: { name: string; gov: string; lat: number; lon: number }[] = [
  { name: 'Cairo', gov: 'Cairo', lat: 30.0444, lon: 31.2357 },
  { name: 'Giza', gov: 'Giza', lat: 29.987, lon: 31.2118 },
  { name: 'Alexandria', gov: 'Alexandria', lat: 31.2001, lon: 29.9187 },
  { name: 'Luxor', gov: 'Luxor', lat: 25.6872, lon: 32.6396 },
  { name: 'Aswan', gov: 'Aswan', lat: 24.0889, lon: 32.8998 },
  { name: 'Hurghada', gov: 'Red Sea', lat: 27.2579, lon: 33.8116 },
  { name: 'Sharm El Sheikh', gov: 'South Sinai', lat: 27.9158, lon: 34.33 },
  { name: 'Dahab', gov: 'South Sinai', lat: 28.5025, lon: 34.5164 },
  { name: 'Marsa Alam', gov: 'Red Sea', lat: 25.0682, lon: 34.8909 },
  { name: 'Siwa Oasis', gov: 'Matrouh', lat: 29.2032, lon: 25.5197 },
];

export default function PageSafety() {
  const router = useRouter();
  const { user, isInitialized } = useAuth();
  const { lat, lon, locationName, governorate: providerGov } = useLocation();
  const locationLabel = useLocationLabel();

  const [activeAlert, setActiveAlert] = useState<string | null>(null);

  const [safetyData, setSafetyData] = useState<SafetyData | null>(null);
  const [envData, setEnvData] = useState<any>(null);
  const [envSource, setEnvSource] = useState<'live' | 'offline'>('offline');
  const [selectedCity, setSelectedCity] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const inFlightRef = React.useRef(false);

  // Authentication check
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login');
    }
  }, [isInitialized, user, router]);

  // Determine active governorate: provider's resolved governorate first, then
  // fall back to a keyword scan of the location name, then Giza.
  const currentGov = React.useMemo(() => {
    if (providerGov) return providerGov;
    if (!locationName) return 'Giza';
    const lower = locationName.toLowerCase();
    if (lower.includes('cairo')) return 'Cairo';
    if (lower.includes('luxor')) return 'Luxor';
    if (lower.includes('aswan')) return 'Aswan';
    if (lower.includes('alexandria')) return 'Alexandria';
    if (lower.includes('sinai')) return 'Sinai';
    if (lower.includes('red sea') || lower.includes('hurghada')) return 'Red Sea';
    if (lower.includes('giza') || lower.includes('pyramid')) return 'Giza';
    if (lower.includes('mansoura') || lower.includes('dakahlia')) return 'Dakahlia';
    if (lower.includes('fayoum') || lower.includes('faiyum')) return 'Faiyum';
    if (lower.includes('qena')) return 'Qena';
    if (lower.includes('matrouh') || lower.includes('siwa')) return 'Matrouh';
    return 'Giza';
  }, [providerGov, locationName]);

  const activeCity = React.useMemo(
    () => SAFETY_CITIES.find((c) => c.name === selectedCity) ?? null,
    [selectedCity]
  );
  const activeGov = activeCity?.gov ?? currentGov;
  const activeCoords = activeCity
    ? { lat: activeCity.lat, lon: activeCity.lon }
    : { lat: lat ?? 29.9792, lon: lon ?? 31.1342 };

  const loadData = useCallback(async (opts?: { silent?: boolean }) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const silent = opts?.silent === true;
    if (!silent) setIsLoading(true);
    if (!silent) setError(null);
    try {
      const targetLat = activeCoords.lat;
      const targetLon = activeCoords.lon;

      // 1. Fetch current location safety data
      const currentSafety = await safetyService.getSafetyInfo(targetLat, targetLon, activeGov);
      setSafetyData(currentSafety);

      // 2. Fetch environmental data
      const envSnap = await envService.getEnvSnapshot(targetLat, targetLon).catch((err) => {
        console.warn('Failed to fetch env data:', err);
        return null;
      });
      setEnvData(envSnap?.data ?? null);
      setEnvSource(envSnap?.source ?? 'offline');
      setLastUpdated(new Date());
    } catch (err: any) {
      if (!silent) {
        console.error('Failed to load safety data:', err);
        setError(err?.message || 'Failed to fetch safety intelligence from Core Server.');
      }
    } finally {
      inFlightRef.current = false;
      if (!silent) setIsLoading(false);
    }
  }, [activeCoords.lat, activeCoords.lon, activeGov]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  // Live-poll safety + env data while the tab is visible; skip when hidden.
  // The visibility guard avoids wasted network calls in background tabs.
  useEffect(() => {
    if (!user) return;
    let hidden = document.hidden;
    const tick = () => {
      if (!hidden && !document.hidden) {
        loadData({ silent: true });
      }
    };
    const onVisibility = () => {
      hidden = document.hidden;
      if (!hidden) tick();
    };
    document.addEventListener('visibilitychange', onVisibility);
    const id = window.setInterval(tick, SAFETY_POLL_MS);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [user, loadData]);

  const goEmergency = () => {
    router.push('/app/safety/emergency');
  };

  // Construct dynamic safety tips/alerts items (severity color-coded like EventsList)
  const dynamicAlerts = React.useMemo(() => {
    if (!safetyData) return [];

    const baseStatus = safetyData.status;

    const severityFor = (idx: number): { key: string; label: string; color: string; bg: string } => {
      if (idx === 0 && baseStatus === 'warning')
        return { key: 'critical', label: 'Critical', color: C.signalRed, bg: `${C.signalRed}12` };
      if ((idx === 0 && baseStatus === 'caution') || (idx === 0 && (safetyData.safetyScore ?? 90) < 70))
        return { key: 'warning', label: 'Warning', color: C.alertAmber, bg: `${C.alertAmber}12` };
      if (idx === 0)
        return { key: 'advisory', label: 'Advisory', color: C.solar, bg: `${C.solar}12` };
      return { key: 'info', label: 'Info', color: C.faience, bg: `${C.faience}12` };
    };

    return (safetyData.safetyTips || []).map((tip, idx) => {
      const meta = severityFor(idx);
      return {
        id: `tip-${idx}`,
        ...meta,
        severityKey: meta.key,
        title:
          idx === 0
            ? `${meta.label} for ${safetyData.governorate}`
            : `${meta.label} · Local Travel Guidance`,
        location: `${safetyData.governorate} Governorate`,
        gov: safetyData.governorate,
        body: tip,
        reports: (safetyData.scamAlertsCount || 1) + idx * 2,
        updated: safetyData.source === 'offline' ? 'Built-in guidance' : 'Verified by Core Server API',
        tag: meta.label,
      };
    });
  }, [safetyData]);

  // Extract environmental metrics dynamically
  const envMetrics = React.useMemo(() => {
    const weather = envData?.weather as any;
    const airQuality = envData?.airQuality as any;

    const temp = weather?.temperature ?? weather?.temp ?? 32;
    const feels = weather?.feelsLike ?? weather?.feels_like ?? temp;
    const uvi = weather?.uvIndex ?? weather?.uv ?? 7;
    const aqi = airQuality?.aqi ?? airQuality?.index ?? 42;
    const aqiText = aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : 'Unhealthy';
    const vis = weather?.visibility ? `${weather.visibility} km` : 'Clear';

    return [
      { icon: <Thermometer size={16} strokeWidth={1.8} />, label: 'Temperature', val: `${temp}°C`, sub: `Feels like ${feels}°C`, col: C.terracotta },
      { icon: <Sun size={16} strokeWidth={1.8} />, label: 'UV Index', val: `${uvi}`, sub: uvi >= 8 ? 'Very High · SPF 50+' : 'Moderate', col: C.alertAmber },
      { icon: <Wind size={16} strokeWidth={1.8} />, label: 'Air Quality', val: aqiText, sub: `AQI ${aqi}`, col: C.safeGreen },
      { icon: <Globe size={16} strokeWidth={1.8} />, label: 'Visibility', val: vis, sub: 'Local area', col: C.faience },
    ];
  }, [envData]);

  // Scam radar — surfaced as an actionable awareness item for the current area.
  const scamRadar = React.useMemo(() => {
    const level = (safetyData?.scamRiskLevel || 'Low').toLowerCase();
    const count = safetyData?.scamAlertsCount ?? 0;
    const cfg =
      level === 'high'
        ? { color: C.signalRed, bg: `${C.signalRed}10`, advice: 'Elevated scam activity near popular sites. Verify any official-looking vendors and never pay before receiving a service.' }
        : level === 'moderate'
        ? { color: C.alertAmber, bg: `${C.alertAmber}12`, advice: 'Some scam reports nearby. Agree fares before riding, decline unsolicited guides, and keep valuables secured.' }
        : { color: C.safeGreen, bg: `${C.safeGreen}0F`, advice: 'No significant scam activity reported in your area. Stay aware in crowded tourist spots.' };
    return { level, count, label: level.charAt(0).toUpperCase() + level.slice(1), ...cfg };
  }, [safetyData]);

  // Nearby safety overview — cities closest to the traveler's current context, not a full comparison.
  const nearbyOverview = React.useMemo(() => {
    const refLat = activeCoords.lat;
    const refLon = activeCoords.lon;
    const distKm = (lat: number, lon: number) => {
      const R = 6371;
      const dLat = ((lat - refLat) * Math.PI) / 180;
      const dLon = ((lon - refLon) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos((refLat * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
      return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    };
    const profileFor = (gov: string) =>
      FALLBACK_GOV_PROFILES[gov] ?? FALLBACK_GOV_PROFILES[gov === 'South Sinai' ? 'Sinai' : ''] ?? FALLBACK_GOV_PROFILES.Cairo;
    return SAFETY_CITIES
      .map((c) => {
        const p = profileFor(c.gov);
        return {
          name: c.name,
          gov: c.gov,
          distance: distKm(c.lat, c.lon),
          score: p.score,
          status: p.status,
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
  }, [activeCoords.lat, activeCoords.lon]);

  // Data source health transparency (live vs offline fallback)
  const dataSources: DataSourceStatus[] = React.useMemo(() => {
    const live = safetyData?.source === 'live';
    return [
      {
        name: 'Core Server · Safety API',
        status: live ? 'healthy' : 'offline',
        detail: live
          ? `Live for ${safetyData?.governorate || currentGov}`
          : 'Using built-in Egypt safety estimates',
      },
      {
        name: 'Environment · Weather',
        status: envSource === 'live' ? 'healthy' : 'offline',
        detail: envSource === 'live' ? 'Live conditions' : 'Using built-in weather estimates',
      },
      {
        name: 'Emergency Services Directory',
        status: 'healthy',
        detail: 'Built-in · always available',
      },
    ];
  }, [safetyData, envData, currentGov, envSource]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar onRafiq={() => router.push('/app/rafiq')} />

      {/* Safety header */}
      <div style={{ background: `linear-gradient(135deg,#1A1209 0%,${C.basalt} 60%,#2A1A0A 100%)`, padding: '28px 32px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -40, top: -40 }}><Geom size={240} color={C.alertAmber} op={0.025} /></div>
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 32 }}>
          <div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, color: `${C.limestone}45`, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>Stay Aware · Stay Informed</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(22px,3vw,34px)', fontWeight: 400, color: C.limestone, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Your Safety, <span style={{ fontStyle: 'italic', color: C.alertAmber }}>Made Simple</span>
            </h1>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: `${C.limestone}50`, lineHeight: 1.6, maxWidth: 480 }}>
              {safetyData?.source === 'offline'
                ? 'Live sources unreachable — showing a trusted built-in estimate for your area.'
                : 'Trusted, up-to-date guidance for your journey — what to know and how to act. '}
              {lastUpdated && !isLoading ? `Updated ${lastUpdated.toLocaleTimeString()}` : safetyData?.updatedAt && !isLoading ? `Updated ${new Date(safetyData.updatedAt).toLocaleTimeString()}` : 'Just now'}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: `${C.limestone}08`, border: `1px solid ${C.limestone}15`, borderRadius: 12, padding: '6px 8px 6px 12px' }}>
              <MapPin size={13} color={C.sand} strokeWidth={2} style={{ flexShrink: 0 }} />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: C.limestone,
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                <option value="">My location ({locationLabel})</option>
                {SAFETY_CITIES.map((c) => (
                  <option key={c.name} value={c.name} style={{ color: '#1A1209' }}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
            {[
              { 
                label: 'Your status', 
                val: isLoading ? '...' : (safetyData?.safetyLevel?.toUpperCase() || 'SAFE'), 
                col: safetyData?.status === 'warning' ? C.signalRed : safetyData?.status === 'caution' ? C.alertAmber : C.safeGreen 
              },
              { label: safetyData?.governorate || activeGov, val: `${safetyData?.safetyScore || 90}%`, col: C.safeGreen },
              { label: 'Things to know', val: String(safetyData?.activeAlertsCount ?? 0), col: C.signalRed }
            ].map(({ label, val, col }) => (
              <div key={label} style={{ background: `${C.limestone}08`, border: `1px solid ${col}30`, borderRadius: 12, padding: '14px 18px', textAlign: 'center', minWidth: 100 }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', color: `${C.limestone}45`, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '16px', fontWeight: 800, color: col, letterSpacing: '0.04em' }}>{val}</div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px 32px', maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Error Banner */}
          {error && (
            <div style={{ background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={18} color="#DC2626" />
                <div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', fontWeight: 700, color: '#991B1B' }}>Failed to update safety data</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#7F1D1D' }}>{error}</div>
                </div>
              </div>
              <button onClick={() => loadData()} style={{ background: '#DC2626', color: '#FFF', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                Retry
              </button>
            </div>
          )}

          {/* Active alerts */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontWeight: 500, color: C.nile }}>What to Know Near You</h2>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: `${safetyData?.source === 'offline' ? C.alertAmber : C.signalRed}10`, border: `1px solid ${safetyData?.source === 'offline' ? C.alertAmber : C.signalRed}25`, borderRadius: 99, padding: '3px 10px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: safetyData?.source === 'offline' ? C.alertAmber : C.signalRed, animation: 'pulse 2s infinite' }} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 700, color: safetyData?.source === 'offline' ? C.alertAmber : C.signalRed }}>{safetyData?.source === 'offline' ? 'OFFLINE ESTIMATE' : 'LIVE API'}</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: `${C.faience}10`, border: `1px solid ${C.faience}25`, borderRadius: 99, padding: '3px 10px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.faience, animation: 'pulse 2s infinite' }} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 700, color: C.faience }}>AUTO-REFRESH 60S</span>
              </div>
            </div>

            {isLoading ? (
              <div style={{ background: C.limestone, borderRadius: 14, padding: '32px', textAlign: 'center', color: '#A89880', fontFamily: "'Inter',sans-serif", fontSize: '13px' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
                Loading safety intelligence from Core Server...
              </div>
            ) : dynamicAlerts.length === 0 ? (
              <div style={{ background: C.limestone, borderRadius: 14, padding: '24px', textAlign: 'center', color: C.safeGreen, fontFamily: "'Inter',sans-serif", fontSize: '13px', border: `1px solid ${C.safeGreen}30` }}>
                <CheckCircle size={24} style={{ margin: '0 auto 8px auto' }} />
                No active safety warnings reported for {safetyData?.governorate || currentGov}. Area status is clear.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {dynamicAlerts.map(alert => {
                  const expanded = activeAlert === alert.id;
                  return (
                    <div
                      key={alert.id}
                      onClick={() => setActiveAlert(expanded ? null : alert.id)}
                      style={{
                        background: '#FFFFFF',
                        borderRadius: 12,
                        borderLeft: `5px solid ${alert.color}`,
                        borderTop: '1px solid rgba(27,26,23,0.08)',
                        borderRight: '1px solid rgba(27,26,23,0.08)',
                        borderBottom: '1px solid rgba(27,26,23,0.08)',
                        boxShadow: expanded ? `0 2px 18px ${alert.color}18` : '0 1px 5px rgba(27,26,23,0.05)',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        transition: 'all 0.18s',
                      }}
                    >
                      <div style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span
                            style={{
                              fontFamily: "'Inter',sans-serif",
                              fontSize: '10px',
                              fontWeight: 800,
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              color: alert.color,
                              background: alert.bg,
                              padding: '3px 9px',
                              borderRadius: 99,
                            }}
                          >
                            {alert.tag}
                          </span>
                          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#A89880' }}>{alert.updated}</span>
                        </div>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '14px', fontWeight: 700, color: C.nile, marginBottom: 5 }}>
                          {alert.title}
                        </div>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '12.5px', color: '#5C5346', lineHeight: 1.6, margin: 0 }}>
                          {alert.body}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', marginTop: 9 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} color="#A89880" strokeWidth={2} /><span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#8B7E6A' }}>{alert.location}</span></div>
                          <button
                            onClick={e => { e.stopPropagation(); router.push('/app/rafiq'); }}
                            style={{
                              marginLeft: 'auto',
                              background: 'none',
                              border: 'none',
                              color: C.nile,
                              fontFamily: "'Inter',sans-serif",
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            <Glyph size={13} /> Ask Rafiq
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Nearby Safety Overview — cities close to the traveler's current context */}
          <div style={{ background: C.limestone, borderRadius: 16, padding: '18px', border: '1px solid rgba(27,26,23,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: `${C.faience}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.faience, flexShrink: 0 }}>
                <Compass size={15} />
              </div>
              <div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', fontWeight: 700, color: C.nile }}>Nearby Safety Overview</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#A89880' }}>Places around your current location</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 8, marginTop: 12 }}>
              {nearbyOverview.map((place) => {
                const isActive = place.name === selectedCity || (selectedCity === '' && place.name === nearbyOverview[0]?.name);
                const col = place.status === 'caution' ? C.alertAmber : C.safeGreen;
                return (
                  <button
                    key={place.name}
                    onClick={() => setSelectedCity(isActive && selectedCity === place.name ? '' : place.name)}
                    style={{
                      background: isActive ? `${col}10` : '#FAF7F0',
                      border: `1px solid ${isActive ? col : 'rgba(27,26,23,0.07)'}`,
                      borderRadius: 12,
                      padding: '12px 13px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12.5px', fontWeight: 700, color: C.nile }}>{place.name}</span>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '14px', fontWeight: 800, color: col }}>{place.score}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: col, flexShrink: 0 }} />
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', color: '#A89880' }}>
                        {place.status === 'caution' ? 'Caution' : 'Safe'} · {place.distance} km
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 10, fontFamily: "'Inter',sans-serif", fontSize: '10px', color: '#A89880' }}>
              Estimated from built-in profiles · tap a city to preview its safety
            </div>
          </div>

          {/* Rafiq assistance — actionable, decision-support CTA */}
          <div style={{ background: `linear-gradient(135deg,${C.solar}14,#FAF3E4)`, border: `1px solid ${C.solar}30`, borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: `${C.solar}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.solar, flexShrink: 0 }}>
              <Sparkles size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '13.5px', fontWeight: 700, color: C.nile, marginBottom: 2 }}>Ask Rafiq for a personal safety read</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '11.5px', color: '#6B6354', lineHeight: 1.5 }}>
                Get trip-specific guidance, scam checks for your route, and what to avoid — tuned to you.
              </div>
            </div>
            <button
              onClick={() => router.push('/app/rafiq')}
              style={{
                background: C.nile,
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '9px 14px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                flexShrink: 0,
              }}
            >
              Ask Rafiq <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Overall risk — traveler's personal status */}
          <RiskGauge
            status={safetyData?.status ?? null}
            score={safetyData?.safetyScore ?? null}
            gov={activeGov}
          />

          {/* SOS button */}
          <div style={{ background: `linear-gradient(160deg,${C.signalRed},#8B1E18)`, borderRadius: 16, padding: '22px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, color: `${C.limestone}55`, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>Emergency</div>
            <button onClick={goEmergency} style={{ width: 80, height: 80, borderRadius: '50%', background: C.limestone, border: `4px solid ${C.limestone}30`, boxShadow: `0 0 0 8px ${C.limestone}15, 0 8px 24px rgba(0,0,0,0.35)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, cursor: 'pointer', margin: '0 auto 12px' }}>
              <Phone size={24} color={C.signalRed} strokeWidth={2.5} />
            </button>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '18px', fontWeight: 500, color: C.limestone, marginBottom: 4 }}>Emergency SOS</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: `${C.limestone}55` }}>Opens emergency mode with guided response</div>
          </div>

          {/* Scam radar — nearby risk awareness */}
          <div style={{ background: C.limestone, borderRadius: 16, padding: '18px', border: '1px solid rgba(27,26,23,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: scamRadar.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: scamRadar.color, flexShrink: 0 }}>
                <ShieldAlert size={15} />
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, color: '#A89880', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Nearby Scam Awareness</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '22px', fontWeight: 800, color: scamRadar.color }}>{scamRadar.label}</span>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#A89880' }}>
                {scamRadar.count > 0 ? `${scamRadar.count} recent report${scamRadar.count === 1 ? '' : 's'}` : 'No recent reports'}
              </span>
            </div>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#5C5346', lineHeight: 1.55, margin: 0 }}>{scamRadar.advice}</p>
          </div>

          {/* AI Safety Guide (streams a live briefing, falls back to tips offline) */}
          <SafetyGuide
            gov={activeGov}
            riskLevel={safetyData?.safetyLevel || null}
            score={safetyData?.safetyScore ?? null}
            alerts={[]}
            coords={{ lat: activeCoords.lat, lon: activeCoords.lon }}
            nationality={user?.nationality}
            staticFallback={
              safetyData?.safetyTips && safetyData.safetyTips.length > 0
                ? safetyData.safetyTips
                : [`${activeGov} is currently clear. Maintain standard travel awareness and carry official ID.`]
            }
          />

          {/* Environment widget */}
          <div style={{ background: C.limestone, borderRadius: 16, padding: '18px', border: '1px solid rgba(27,26,23,0.07)' }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, color: '#A89880', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Environment · {currentGov} Now</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {envMetrics.map(({ icon, label, val, sub, col }) => (
                <div key={label} style={{ background: '#FAF7F0', borderRadius: 11, padding: '12px 13px', border: '1px solid rgba(27,26,23,0.06)' }}>
                  <div style={{ color: col, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', color: '#A89880', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '15px', fontWeight: 800, color: C.nile }}>{val}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', color: '#A89880', marginTop: 2 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Data source health */}
          <SourceHealth sources={dataSources} />
        </div>
      </div>

    </div>
  );
}
