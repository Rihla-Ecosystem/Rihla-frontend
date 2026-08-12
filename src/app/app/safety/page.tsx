'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useLocation, useLocationLabel } from '@/providers/LocationProvider';
import {
  safetyService,
  type SafetyData,
  type SafetyEvent,
  type SourceStatus,
} from '@/services/safetyService';
import { envService } from '@/services/envService';
import { TopBar } from '@/app/components/layout/TopBar';
import { C } from '@/lib/constants/theme';
import { UI, RihlaCard, CardLabel, IconTile } from '@/app/components/ui/primitives';
import { RISK_COLOR, SEVERITY_RANK, STATUS_RANK } from '@/lib/constants/riskMeta';
import { SafetyGuide } from './components/SafetyGuide';
import { TravelStatusHero } from './components/TravelStatusHero';
import { StatusCard } from './components/StatusCard';
import { WhyStatus } from './components/WhyStatus';
import { AlertFeed } from './components/AlertFeed';
import { NearbyGrid } from './components/NearbyGrid';
import { TrustStrip } from './components/TrustStrip';
import { describeEvent, dedupeEvents, riskMeaning, severityCopy } from './components/alertCopy';
import {
  AlertTriangle,
  MapPin,
  Thermometer,
  Sun,
  Wind,
  Globe,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Activity,
  Siren,
  PhoneCall,
  CheckCircle2,
  ListChecks,
  Flag,
} from 'lucide-react';
import { buildSafetyContext } from '@/lib/rafiq';
import { AskRafiqButton, useRafiq } from '@/app/components/rafiq';
import ReportIssueModal from '@/app/components/safety/ReportIssueModal';

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

type Tab = 'here' | 'nearby' | 'plan';

export default function PageSafety() {
  const router = useRouter();
  const { openRafiq } = useRafiq();
  const { user, isInitialized } = useAuth();
  const { lat, lon, locationName, governorate: providerGov } = useLocation();
  const locationLabel = useLocationLabel();

  const [tab, setTab] = useState<Tab>('here');
  const [safetyData, setSafetyData] = useState<SafetyData | null>(null);
  const [envData, setEnvData] = useState<any>(null);
  const [envSource, setEnvSource] = useState<'live' | 'offline'>('offline');
  const [sources, setSources] = useState<SourceStatus[] | null>(null);
  const [dynamicCities, setDynamicCities] = useState<Array<{ name: string; gov: string; lat: number; lon: number }>>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(SAFETY_POLL_MS / 1000);
  const inFlightRef = React.useRef(false);
  const prevStatusRef = React.useRef<string | null>(null);
  const [riskNotice, setRiskNotice] = useState<{ title: string; body: string } | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    if (isInitialized && !user) router.push('/login');
  }, [isInitialized, user, router]);

  const currentGov = React.useMemo(() => {
    if (providerGov) return providerGov;
    if (!locationName) return 'Giza';
    const lower = locationName.toLowerCase();
    if (lower.includes('cairo')) return 'Cairo';
    if (lower.includes('luxor')) return 'Luxor';
    if (lower.includes('aswan')) return 'Aswan';
    if (lower.includes('alexandria')) return 'Alexandria';
    if (lower.includes('sinai')) return 'South Sinai';
    if (lower.includes('red sea') || lower.includes('hurghada')) return 'Red Sea';
    if (lower.includes('giza') || lower.includes('pyramid')) return 'Giza';
    if (lower.includes('matrouh') || lower.includes('siwa')) return 'Matrouh';
    return 'Giza';
  }, [providerGov, locationName]);

  const activeCity = React.useMemo(
    () => dynamicCities.find((c) => c.name === selectedCity) ?? null,
    [selectedCity, dynamicCities]
  );
  const activeGov = activeCity?.gov ?? currentGov;
  const activeCoords = activeCity
    ? { lat: activeCity.lat, lon: activeCity.lon }
    : { lat: lat ?? 29.9792, lon: lon ?? 31.1342 };

  const loadData = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      const silent = opts?.silent === true;
      if (!silent) setIsLoading(true);
      if (!silent) setError(null);
      try {
        const [currentSafety, sourcesHealth, dynamicCities] = await Promise.all([
          safetyService.getSafetyInfo(activeCoords.lat, activeCoords.lon, activeGov),
          safetyService.getSourcesHealth(),
          safetyService.getCitiesFromSafety(activeCoords.lat, activeCoords.lon, activeGov),
        ]);
        if (currentSafety) setSafetyData(currentSafety);
        if (Array.isArray(sourcesHealth)) setSources(sourcesHealth);
        if (Array.isArray(dynamicCities)) setDynamicCities(dynamicCities);

        const envSnap = await envService.getEnvSnapshot(activeCoords.lat, activeCoords.lon).catch(() => null);
        setEnvData(envSnap?.data ?? null);
        setEnvSource(envSnap?.source ?? 'offline');
        setLastUpdated(new Date());
        setCountdown(SAFETY_POLL_MS / 1000);
      } catch (err: any) {
        if (!silent) {
          console.error('Failed to load safety data:', err);
          setError(err?.message || 'Failed to fetch safety intelligence from Core Server.');
        }
      } finally {
        inFlightRef.current = false;
        if (!silent) setIsLoading(false);
      }
    },
    [activeCoords.lat, activeCoords.lon, activeGov]
  );

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  // Live-poll while visible; skip background tabs.
  useEffect(() => {
    if (!user) return;
    let hidden = document.hidden;
    const tick = () => !hidden && !document.hidden && loadData({ silent: true });
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

  // Refresh countdown (1s ticker).
  useEffect(() => {
    if (!lastUpdated) return;
    const id = window.setInterval(
      () => setCountdown((c) => (c > 0 ? c - 1 : SAFETY_POLL_MS / 1000)),
      1000
    );
    return () => window.clearInterval(id);
  }, [lastUpdated]);

  // Detect risk-level change between polls and surface an in-page notice.
  const lastSeenStatusRef = React.useRef<string | null>(null);
  useEffect(() => {
    const status = safetyData?.status ?? null;
    const prev = lastSeenStatusRef.current;
    lastSeenStatusRef.current = status;
    if (!status || prev === null || prev === status) return;
    const escalated =
      (STATUS_RANK[status as keyof typeof STATUS_RANK] ?? 0) >
      (STATUS_RANK[prev as keyof typeof STATUS_RANK] ?? 0);
    if (!escalated) return;
    setRiskNotice({
      title: `Risk level changed for ${activeGov}`,
      body:
        status === 'warning'
          ? 'Live sources now report Warning in this area. Review the alerts and take the recommended actions.'
          : status === 'caution'
            ? 'A caution-level signal appeared nearby. Stay on main routes and follow the checklists.'
            : 'No active alerts — the area is clear.',
    });
  }, [safetyData?.status, activeGov]);

  const dynamicAlerts = React.useMemo<SafetyEvent[]>(() => {
    if (!safetyData) return [];
    return [...(safetyData.events ?? [])].sort(
      (a, b) => (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0)
    );
  }, [safetyData]);

  const activeAlerts = dynamicAlerts.filter((e) => e.severity !== 'info');
  const monitoring = dynamicAlerts.filter((e) => e.severity === 'info').slice(0, 8);

  const activeDeduped = React.useMemo(() => dedupeEvents(activeAlerts), [activeAlerts]);

  // "Why" — the strongest signals in plain language for the hero.
  const topReasons = React.useMemo(() => {
    if (!safetyData) return [] as string[];
    if (activeAlerts.length === 0) return [] as string[];
    const reasons: string[] = [];
    const seen = new Set<string>();
    for (const a of [...activeDeduped.map((x) => x.event)].slice(0, 3)) {
      const copy = describeEvent(a);
      const text = `${severityCopy(a.severity).label}: ${copy.title}`;
      if (!seen.has(text)) {
        seen.add(text);
        reasons.push(text);
      }
    }
    return reasons;
  }, [safetyData, activeAlerts, activeDeduped]);



  const scamRadar = React.useMemo(() => {
    const level = (safetyData?.scamRiskLevel || 'low').toLowerCase();
    const cfg =
      level === 'high'
        ? { color: C.signalRed, bg: `${C.signalRed}10`, advice: 'Elevated scam activity near popular sites. Verify any official-looking vendors and never pay before receiving a service.' }
        : level === 'moderate'
          ? { color: C.alertAmber, bg: `${C.alertAmber}12`, advice: 'Some scam reports nearby. Agree fares before riding, decline unsolicited guides, and keep valuables secured.' }
          : { color: C.safeGreen, bg: `${C.safeGreen}0F`, advice: 'No significant scam activity reported in your area. Stay aware in crowded tourist spots.' };
    return { level: level.charAt(0).toUpperCase() + level.slice(1), ...cfg };
  }, [safetyData]);

  // Environment metrics.
  const envMetrics = React.useMemo(() => {
    const weather = envData?.weather as any;
    const airQuality = envData?.airQuality as any;
    const temp = weather?.temperature ?? weather?.temp ?? 32;
    const feels = weather?.feelsLike ?? weather?.feels_like ?? temp;
    const uvi = weather?.uvIndex ?? weather?.uv ?? 7;
    const aqi = airQuality?.aqi ?? airQuality?.index ?? 42;
    const aqiText = aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : 'Unhealthy';
    const vis = weather?.visibility ? `${weather.visibility} km` : 'Clear';
    const tempR = Number.isFinite(temp) ? Math.round(temp) : 32;
    const feelsR = Number.isFinite(feels) ? Math.round(feels) : tempR;
    const uviR = Number.isFinite(uvi) ? Math.round(uvi * 10) / 10 : 7;
    const aqiR = Number.isFinite(aqi) ? Math.round(aqi) : 42;
    return [
      { icon: <Thermometer size={15} strokeWidth={1.8} />, label: 'Temperature', val: `${tempR}°C`, sub: `Feels like ${feelsR}°C`, col: C.terracotta },
      { icon: <Sun size={15} strokeWidth={1.8} />, label: 'UV Index', val: `${uviR}`, sub: uviR >= 8 ? 'Very High · SPF 50+' : 'Moderate', col: C.alertAmber },
      { icon: <Wind size={15} strokeWidth={1.8} />, label: 'Air Quality', val: aqiText, sub: `AQI ${aqiR}`, col: C.safeGreen },
      { icon: <Globe size={15} strokeWidth={1.8} />, label: 'Visibility', val: vis, sub: 'Local area', col: C.faience },
    ];
  }, [envData]);

  const goEmergency = () => router.push('/app/safety/emergency');

  const askRafiq = useCallback((headline: string) => {
    const ctx = buildSafetyContext(safetyData!, activeGov);
    openRafiq({ context: ctx, initialQuery: headline });
  }, [safetyData, activeGov, openRafiq]);

  const contacts = React.useMemo(() => {
    const fallback = [
      { label: 'General Emergency', num: '112', note: 'Police, ambulance & fire' },
      { label: 'Tourist Police', num: '126', note: 'English-speaking help' },
      { label: 'Ambulance', num: '123', note: 'Medical emergency' },
    ];
    const list = safetyData?.liveContacts;
    if (!Array.isArray(list) || list.length === 0) return fallback;
    return list.map((c: any) => {
      const type = String(c?.type ?? '').replace(/[_]+/g, ' ');
      const label =
        c?.name ||
        (type ? type.replace(/\b\w/g, (x) => x.toUpperCase()) : 'Emergency');
      return {
        label,
        num: String(c?.phone ?? c?.number ?? '112'),
        note:
          c?.type === 'tourist_police' || c?.type === 'tourist' ? 'English-speaking help' : 'Emergency services',
      };
    });
  }, [safetyData?.liveContacts]);

  const planItems = [
    { icon: <PhoneCall size={14} />, text: 'Emergency numbers work nationwide — save all three before you travel.' },
    { icon: <ShieldAlert size={14} />, text: 'Use licensed taxis or ride-hailing apps and agree the fare first.' },
    { icon: <CheckCircle2 size={14} />, text: 'Keep passport photocopies + your hotel card separate from originals.' },
    { icon: <Sun size={14} />, text: 'Heat + UV can reach Very High — hydrate, wear SPF 50+, cover up midday.' },
    { icon: <ListChecks size={14} />, text: 'Carry bottled water; street exchanges are for tourists — use banks.' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <TopBar onRafiq={() => openRafiq()} />

      {/* Government security notice for the current location */}
      <div style={{ padding: '10px 32px 0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            background: `linear-gradient(135deg,${C.nile},#0F3D3E)`,
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 14,
            padding: '12px 16px',
          }}
        >
          <span style={{ width: 34, height: 34, borderRadius: 10, background: `${C.solar}20`, color: C.solarBright, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldAlert size={17} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 700, color: `${C.limestone}75`, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
              Government security note · {activeGov}
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12.5px', color: C.limestone, lineHeight: 1.55 }}>
              {safetyData?.govNote && safetyData.govNote.trim()
                ? safetyData.govNote
                : `${activeGov} is under standard tourist safety monitoring. Follow official guidance and keep emergency numbers saved.`}
            </div>
          </div>
        </div>
      </div>

      {/* Hero — decision-focused status */}
      <TravelStatusHero
        status={safetyData?.status ?? null}
        gov={activeGov}
        locationLabel={locationLabel}
        isLoading={isLoading}
        live={safetyData?.source === 'live'}
        lastUpdated={lastUpdated}
        countdown={countdown}
        topReasons={topReasons}
        selectedCity={selectedCity}
        onCityChange={(city) => setSelectedCity(city)}
        cities={dynamicCities.length > 0 ? dynamicCities : SAFETY_CITIES}
      />

      {/* Body */}
      <div className="rihla-safety-body" style={{ flex: 1, padding: '20px 32px', maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <style>{`
          .rihla-safety-grid { display: grid; grid-template-columns: 1fr 360px; gap: 24; align-items: start; }
          .rihla-safety-sticky { position: sticky; top: 84px; display: flex; flex-direction: column; gap: 16; }
          @media (max-width: 900px) {
            .rihla-safety-grid { grid-template-columns: 1fr; }
            .rihla-safety-sticky { position: static; }
            .rihla-safety-body { padding: 16px; }
          }
        `}</style>

        {error && (
          <div style={{ background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={17} color="#DC2626" />
              <div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12.5px', fontWeight: 700, color: '#991B1B' }}>Failed to update safety data</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#7F1D1D' }}>{error}</div>
              </div>
            </div>
            <button onClick={() => loadData()} style={{ background: '#DC2626', color: '#FFF', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>Retry</button>
          </div>
        )}

        {riskNotice && (
          <div style={{ background: '#FFF7ED', border: `1px solid ${C.alertAmber}50`, borderLeft: `5px solid ${C.signalRed}`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: `${C.signalRed}12`, color: C.signalRed, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Siren size={17} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12.5px', fontWeight: 700, color: C.nile }}>{riskNotice.title}</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '11.5px', color: '#6B6354', lineHeight: 1.5 }}>{riskNotice.body}</div>
            </div>
            <button onClick={() => setRiskNotice(null)} style={{ background: 'none', border: 'none', color: UI.text.muted, cursor: 'pointer', fontSize: '14px', padding: 4, lineHeight: 1 }} aria-label="Dismiss" title="Dismiss">
              ×
            </button>
          </div>
        )}

        <div className="rihla-safety-grid">
          {/* Left — tabs + content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(
                [
                  { id: 'here', label: 'Here & Now', icon: <Activity size={14} /> },
                  { id: 'nearby', label: 'Nearby Cities', icon: <MapPin size={14} /> },
                  { id: 'plan', label: 'Your Plan', icon: <ListChecks size={14} /> },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '9px 14px',
                    borderRadius: 10,
                    border: 'none',
                    background: tab === t.id ? C.nile : C.limestone,
                    color: tab === t.id ? C.limestone : UI.text.body,
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: tab === t.id ? `0 6px 16px ${C.nile}22` : '0 1px 4px rgba(27,26,23,0.06)',
                  }}
                >
                  {t.icon}
                  {t.label}
                  {t.id === 'here' && activeDeduped.length > 0 && (
                    <span style={{ background: tab === t.id ? C.signalRed : C.signalRed, color: '#FFF', borderRadius: 99, minWidth: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, padding: '0 5px' }}>
                      {activeDeduped.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === 'here' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {!isLoading && safetyData && (
                  <WhyStatus
                    events={safetyData.events}
                    gov={activeGov}
                    weather={{
                      temp: envData?.weather?.temperature ?? envData?.weather?.feelsLike ?? null,
                      uvi: envData?.weather?.uvIndex ?? envData?.weather?.uv ?? null,
                      aqi: envData?.airQuality?.aqi ?? envData?.airQuality?.index ?? null,
                      aqiLabel: envData?.airQuality?.aqiLabel ?? null,
                    }}
                  />
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                    <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '19px', fontWeight: 500, color: C.nile, margin: 0 }}>Active Alerts</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button
                        onClick={() => setReportOpen(true)}
                        style={{
                          background: 'none',
                          border: `1px solid ${C.signalRed}40`,
                          color: C.signalRed,
                          borderRadius: 999,
                          padding: '5px 12px',
                          fontFamily: "'Inter',sans-serif",
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <Flag size={12} /> Report a travel issue
                      </button>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: UI.text.muted }}>{activeGov} · live feed</span>
                    </div>
                  </div>
                  {isLoading ? (
                    <div style={{ background: C.limestone, borderRadius: 14, padding: '32px', textAlign: 'center', color: UI.text.muted, fontFamily: "'Inter',sans-serif", fontSize: '13px' }}>
                      <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
                      Loading safety intelligence from Core Server...
                    </div>
                  ) : (
                    <AlertFeed events={activeAlerts} locationLabel={safetyData?.governorate || activeGov} onAskRafiq={askRafiq} />
                  )}
                </div>

                {monitoring.length > 0 && (
                  <div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 700, color: UI.text.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                      Monitoring · low-priority signals
                    </div>
                    <AlertFeed events={monitoring} locationLabel={safetyData?.governorate || activeGov} onAskRafiq={askRafiq} />
                  </div>
                )}
              </div>
            )}

            {tab === 'nearby' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {safetyData && safetyData.cities.length > 0 ? (
                  <NearbyGrid
                    cities={safetyData.cities}
                    activeName={selectedCity}
                    onSelect={(name) => setSelectedCity(name)}
                  />
                ) : (
                  <div style={{ background: C.limestone, borderRadius: 14, padding: '24px', textAlign: 'center', color: UI.text.muted, fontFamily: "'Inter',sans-serif", fontSize: '13px' }}>
                    Live city data unavailable right now.
                  </div>
                )}
                <div style={{ background: `linear-gradient(135deg,${C.solar}14,#FAF3E4)`, border: `1px solid ${C.solar}30`, borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.solar}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.solar, flexShrink: 0 }}>
                    <Sparkles size={17} />
                  </div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', fontWeight: 700, color: C.nile }}>Plan the safer route</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '11.5px', color: '#6B6354', lineHeight: 1.5 }}>
                      Ask Rafiq to compare two cities or build a leg-by-leg safety read for your itinerary.
                    </div>
                  </div>
                  {safetyData && (
                    <AskRafiqButton
                      context={buildSafetyContext(safetyData, activeGov)}
                      label="Ask Rafiq to plan route"
                      variant="ghost"
                      size="sm"
                    />
                  )}
                </div>
              </div>
            )}

            {tab === 'plan' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <RihlaCard>
                  <CardLabel accent={C.signalRed}>Emergency Contacts</CardLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {contacts.map((c) => (
                      <a
                        key={c.num}
                        href={`tel:${c.num}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px', background: UI.surface.flat, borderRadius: 11, border: `1px solid ${UI.border}`, textDecoration: 'none' }}
                      >
                        <IconTile color={C.signalRed} size={34} radius={10}>
                          <PhoneCall size={15} />
                        </IconTile>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: UI.font.sans, fontSize: 13, fontWeight: 700, color: C.nile }}>{c.label}</div>
                          <div style={{ fontFamily: UI.font.sans, fontSize: 10.5, color: UI.text.soft }}>{c.note}</div>
                        </div>
                        <span style={{ fontFamily: UI.font.sans, fontSize: 16, fontWeight: 800, color: C.nile }}>{c.num}</span>
                      </a>
                    ))}
                  </div>
                  <button onClick={goEmergency} style={{ marginTop: 10, width: '100%', background: C.signalRed, color: '#FFF', border: 'none', borderRadius: 11, padding: '11px 16px', fontFamily: UI.font.sans, fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                    <Siren size={15} /> Open Emergency Mode
                  </button>
                </RihlaCard>

                <RihlaCard>
                <CardLabel>Travel Checklist</CardLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {planItems.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <IconTile color={C.faience} size={28} radius={8}>
                          {item.icon}
                        </IconTile>
                        <span style={{ fontFamily: UI.font.sans, fontSize: 12, color: UI.text.body, lineHeight: 1.5 }}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </RihlaCard>

                <RihlaCard>
                  <CardLabel>Nearby Scam Awareness</CardLabel>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontFamily: UI.font.sans, fontSize: 20, fontWeight: 800, color: scamRadar.color }}>{scamRadar.level}</span>
                  </div>
                  <p style={{ fontFamily: UI.font.sans, fontSize: 12, color: UI.text.body, lineHeight: 1.55, margin: 0 }}>{scamRadar.advice}</p>
                </RihlaCard>

                <SafetyGuide
                  gov={activeGov}
                  riskLevel={safetyData?.safetyLevel || null}
                  score={null}
                  alerts={[]}
                  coords={{ lat: activeCoords.lat, lon: activeCoords.lon }}
                  nationality={user?.nationality}
                  staticFallback={
                    safetyData?.safetyTips && safetyData.safetyTips.length > 0
                      ? safetyData.safetyTips
                      : [`${activeGov} status: ${riskMeaning(safetyData?.status ?? null, RISK_COLOR).label.toLowerCase()}. Maintain standard travel awareness and carry official ID.`]
                  }
                />
              </div>
            )}
          </div>

          {/* Right column — always-visible context */}
          <div className="rihla-safety-sticky">
            <StatusCard status={safetyData?.status ?? null} gov={activeGov} />

            <div style={{ background: `linear-gradient(160deg,${C.signalRed},#8B1E18)`, borderRadius: 16, padding: '18px 20px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '9px', fontWeight: 600, color: `${C.limestone}55`, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>Emergency</div>
              <button onClick={goEmergency} style={{ width: 72, height: 72, borderRadius: '50%', background: C.limestone, border: `4px solid ${C.limestone}30`, boxShadow: `0 0 0 8px ${C.limestone}15, 0 8px 24px rgba(0,0,0,0.35)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer', margin: '0 auto 10px' }}>
                <PhoneCall size={22} color={C.signalRed} strokeWidth={2.5} />
              </button>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '17px', fontWeight: 500, color: C.limestone }}>Emergency SOS</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: `${C.limestone}55`, marginTop: 2 }}>Guided response mode</div>
            </div>

            <RihlaCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <IconTile color={scamRadar.color} bg={scamRadar.bg} size={30} radius={9}>
                  <ShieldAlert size={15} />
                </IconTile>
                <div style={{ fontFamily: UI.font.sans, fontSize: 10, fontWeight: 600, color: UI.text.muted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Scam Radar</div>
              </div>
              <div style={{ fontFamily: UI.font.sans, fontSize: 21, fontWeight: 800, color: scamRadar.color, marginBottom: 4 }}>{scamRadar.level}</div>
              <p style={{ fontFamily: UI.font.sans, fontSize: 11.5, color: UI.text.body, lineHeight: 1.5, margin: 0 }}>{scamRadar.advice}</p>
            </RihlaCard>

            <RihlaCard>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontFamily: UI.font.sans, fontSize: 10, fontWeight: 600, color: UI.text.muted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Environment · Now</div>
                <span style={{ fontFamily: UI.font.sans, fontSize: 9, fontWeight: 700, color: envSource === 'live' ? C.safeGreen : C.alertAmber, textTransform: 'uppercase' }}>
                  {envSource === 'live' ? 'Live' : 'Estimate'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {envMetrics.map(({ icon, label, val, sub, col }) => (
                  <div key={label} style={{ background: UI.surface.flat, borderRadius: 11, padding: '11px 12px', border: `1px solid ${UI.border}` }}>
                    <div style={{ color: col, marginBottom: 6 }}>{icon}</div>
                    <div style={{ fontFamily: UI.font.sans, fontSize: 9.5, color: UI.text.muted, marginBottom: 3 }}>{label}</div>
                    <div style={{ fontFamily: UI.font.sans, fontSize: 14, fontWeight: 800, color: C.nile }}>{val}</div>
                    <div style={{ fontFamily: UI.font.sans, fontSize: 9.5, color: UI.text.muted, marginTop: 2 }}>{sub}</div>
                  </div>
                ))}
              </div>
            </RihlaCard>

            <TrustStrip sources={sources} />
          </div>
        </div>
      </div>

      {/* Floating SOS */}
      <button
        onClick={goEmergency}
        aria-label="Emergency SOS"
        title="Emergency SOS"
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          zIndex: 1200,
          width: 58,
          height: 58,
          borderRadius: '50%',
          background: `linear-gradient(160deg,${C.signalRed},#8B1E18)`,
          border: `3px solid ${C.limestone}`,
          boxShadow: `0 0 0 7px ${C.signalRed}25, 0 12px 30px rgba(0,0,0,0.3)`,
          color: C.limestone,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Siren size={24} strokeWidth={2.4} />
      </button>

      <ReportIssueModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
