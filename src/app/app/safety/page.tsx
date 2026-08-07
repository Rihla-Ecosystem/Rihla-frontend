'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useLocation, useLocationLabel } from '@/providers/LocationProvider';
import { safetyService, type SafetyData } from '@/services/safetyService';
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
  Shield,
  RefreshCw
} from 'lucide-react';

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

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
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
    } catch (err: any) {
      console.error('Failed to load safety data:', err);
      setError(err?.message || 'Failed to fetch safety intelligence from Core Server.');
    } finally {
      setIsLoading(false);
    }
  }, [activeCoords.lat, activeCoords.lon, activeGov]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const goEmergency = () => {
    router.push('/app/safety/emergency');
  };

  // Format emergency contacts list from API response
  const emergencyContactsList = React.useMemo(() => {
    const contacts = safetyData?.emergencyContacts;
    return [
      { label: 'Tourist Police', number: contacts?.touristPolice || '126', icon: <Shield size={18} strokeWidth={2} />, color: C.nile, desc: '24/7 · English spoken' },
      { label: 'Ambulance', number: contacts?.ambulance || '123', icon: <Phone size={18} strokeWidth={2} />, color: C.signalRed, desc: 'Emergency medical' },
      { label: 'Fire Brigade', number: '180', icon: <AlertTriangle size={18} strokeWidth={2} />, color: C.terracotta, desc: 'Fire & rescue' },
      { label: 'General Emergency', number: contacts?.generalEmergency || '112', icon: <Shield size={18} strokeWidth={2} />, color: C.copper, desc: 'National emergency' },
      { label: 'Rihla Emergency', number: 'In-app', icon: <Glyph size={18} />, color: C.faience, desc: 'Direct AI + human support' },
    ];
  }, [safetyData]);

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
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, color: `${C.limestone}45`, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>Real-time Safety Intelligence</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(22px,3vw,34px)', fontWeight: 400, color: C.limestone, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Safety &amp; <span style={{ fontStyle: 'italic', color: C.alertAmber }}>Alerts</span>
            </h1>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: `${C.limestone}50`, lineHeight: 1.6, maxWidth: 480 }}>
              {safetyData?.source === 'offline'
                ? 'Core Server unreachable — showing built-in safety estimate from cached profile.'
                : 'Monitoring Core Server API · Egyptian Tourist Safety Index · '}
              {safetyData?.updatedAt && !isLoading ? `Updated ${new Date(safetyData.updatedAt).toLocaleTimeString()}` : 'Just now'}
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
                label: 'Overall', 
                val: isLoading ? '...' : (safetyData?.safetyLevel?.toUpperCase() || 'SAFE'), 
                col: safetyData?.status === 'warning' ? C.signalRed : safetyData?.status === 'caution' ? C.alertAmber : C.safeGreen 
              },
              { label: safetyData?.governorate || activeGov, val: `${safetyData?.safetyScore || 90}%`, col: C.safeGreen },
              { label: 'Active alerts', val: String(safetyData?.activeAlertsCount ?? 0), col: C.signalRed }
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
              <button onClick={loadData} style={{ background: '#DC2626', color: '#FFF', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                Retry
              </button>
            </div>
          )}

          {/* Active alerts */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontWeight: 500, color: C.nile }}>Active Alerts &amp; Advisories</h2>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: `${safetyData?.source === 'offline' ? C.alertAmber : C.signalRed}10`, border: `1px solid ${safetyData?.source === 'offline' ? C.alertAmber : C.signalRed}25`, borderRadius: 99, padding: '3px 10px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: safetyData?.source === 'offline' ? C.alertAmber : C.signalRed, animation: 'pulse 2s infinite' }} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 700, color: safetyData?.source === 'offline' ? C.alertAmber : C.signalRed }}>{safetyData?.source === 'offline' ? 'OFFLINE ESTIMATE' : 'LIVE API'}</span>
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
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* SOS button */}
          <div style={{ background: `linear-gradient(160deg,${C.signalRed},#8B1E18)`, borderRadius: 16, padding: '22px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, color: `${C.limestone}55`, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>Emergency</div>
            <button onClick={goEmergency} style={{ width: 80, height: 80, borderRadius: '50%', background: C.limestone, border: `4px solid ${C.limestone}30`, boxShadow: `0 0 0 8px ${C.limestone}15, 0 8px 24px rgba(0,0,0,0.35)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, cursor: 'pointer', margin: '0 auto 12px' }}>
              <Phone size={24} color={C.signalRed} strokeWidth={2.5} />
            </button>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '18px', fontWeight: 500, color: C.limestone, marginBottom: 4 }}>Emergency SOS</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: `${C.limestone}55` }}>Opens emergency mode with guided response</div>
          </div>

          {/* Emergency contacts */}
          <div style={{ background: C.limestone, borderRadius: 16, padding: '18px', border: '1px solid rgba(27,26,23,0.07)' }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, color: '#A89880', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Emergency Contacts</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {emergencyContactsList.map(({ label, number, icon, color, desc }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(27,26,23,0.05)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}12`, border: `1px solid ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', fontWeight: 700, color: C.nile }}>{label}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#A89880' }}>{desc}</div>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '18px', fontWeight: 600, color, flexShrink: 0 }}>{number}</div>
                </div>
              ))}
            </div>
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
