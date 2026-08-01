'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useLocation } from '@/providers/LocationProvider';
import { safetyService, type SafetyData } from '@/services/safetyService';
import { envService } from '@/services/envService';
import { TopBar } from '@/app/components/layout/TopBar';
import { RafiqDrawer } from '@/app/components/rafiqDrawer';
import { Geom, Glyph } from '@/app/components/atoms';
import { C } from '@/lib/constants/theme';
import { 
  AlertTriangle, 
  MapPin, 
  ChevronRight, 
  Thermometer, 
  Sun, 
  Wind, 
  Globe, 
  Phone, 
  CheckCircle, 
  Shield,
  RefreshCw
} from 'lucide-react';

interface GovStatusItem {
  name: string;
  status: string;
  alerts: number;
  color: string;
}

export default function PageSafety() {
  const router = useRouter();
  const { user, isInitialized } = useAuth();
  const { lat, lon, locationName } = useLocation();

  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [rafiq, setRafiq] = useState(false);

  const [safetyData, setSafetyData] = useState<SafetyData | null>(null);
  const [govStatuses, setGovStatuses] = useState<GovStatusItem[]>([]);
  const [envData, setEnvData] = useState<any>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login');
    }
  }, [isInitialized, user, router]);

  // Determine active governorate from locationName or fallback to Giza
  const currentGov = React.useMemo(() => {
    if (!locationName) return 'Giza';
    const lower = locationName.toLowerCase();
    if (lower.includes('cairo')) return 'Cairo';
    if (lower.includes('luxor')) return 'Luxor';
    if (lower.includes('aswan')) return 'Aswan';
    if (lower.includes('alexandria')) return 'Alexandria';
    if (lower.includes('sinai')) return 'Sinai';
    if (lower.includes('red sea') || lower.includes('hurghada')) return 'Red Sea';
    return 'Giza';
  }, [locationName]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const targetLat = lat ?? 29.9792;
      const targetLon = lon ?? 31.1342;

      // 1. Fetch current location safety data
      const currentSafety = await safetyService.getSafetyInfo(targetLat, targetLon, currentGov);
      setSafetyData(currentSafety);

      // 2. Fetch environmental data
      const envRes = await envService.getEnv(targetLat, targetLon).catch((err) => {
        console.warn('Failed to fetch env data:', err);
        return null;
      });
      setEnvData(envRes);

      // 3. Fetch governorate statuses dynamically
      const govList = ['Giza', 'Cairo', 'Luxor', 'Aswan', 'Alexandria', 'Sinai', 'Red Sea'];
      const govResults = await Promise.allSettled(
        govList.map((g) => safetyService.getSafetyInfo(undefined, undefined, g))
      );

      const parsedGovs: GovStatusItem[] = govList.map((name, idx) => {
        const res = govResults[idx];
        if (res.status === 'fulfilled' && res.value) {
          const val = res.value;
          const isSecure = val.status === 'safe';
          return {
            name: val.governorate || name,
            status: val.safetyLevel || (isSecure ? 'Secure' : 'Caution'),
            alerts: val.activeAlertsCount || 0,
            color: isSecure ? C.safeGreen : val.status === 'warning' ? C.signalRed : C.alertAmber,
          };
        }
        return {
          name,
          status: 'Secure',
          alerts: 0,
          color: C.safeGreen,
        };
      });

      setGovStatuses(parsedGovs);
    } catch (err: any) {
      console.error('Failed to load safety data:', err);
      setError(err?.message || 'Failed to fetch safety intelligence from Core Server.');
    } finally {
      setIsLoading(false);
    }
  }, [lat, lon, currentGov]);

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

  // Construct dynamic safety tips/alerts items
  const dynamicAlerts = React.useMemo(() => {
    if (!safetyData) return [];

    return (safetyData.safetyTips || []).map((tip, idx) => ({
      id: `tip-${idx}`,
      severity: idx === 0 ? 'high' : 'medium',
      title: idx === 0 ? `Safety Advisory for ${safetyData.governorate}` : `Local Travel Guidance`,
      location: `${safetyData.governorate} Governorate`,
      gov: safetyData.governorate,
      body: tip,
      reports: (safetyData.scamAlertsCount || 1) + idx * 2,
      updated: 'Verified by API',
      tag: idx === 0 ? 'Safety Notice' : 'Travel Tip',
      color: idx === 0 ? C.signalRed : C.alertAmber,
    }));
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

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar location={locationName || `${currentGov}, Egypt`} onRafiq={() => setRafiq(true)} />

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
              Monitoring Core Server API · Egyptian Tourist Safety Index · Updated {safetyData?.updatedAt ? new Date(safetyData.updatedAt).toLocaleTimeString() : 'Just now'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { 
                label: 'Overall', 
                val: isLoading ? '...' : (safetyData?.safetyLevel?.toUpperCase() || 'SAFE'), 
                col: safetyData?.status === 'warning' ? C.signalRed : safetyData?.status === 'caution' ? C.alertAmber : C.safeGreen 
              },
              { label: safetyData?.governorate || currentGov, val: `${safetyData?.safetyScore || 90}%`, col: C.safeGreen },
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
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: `${C.signalRed}10`, border: `1px solid ${C.signalRed}25`, borderRadius: 99, padding: '3px 10px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.signalRed, animation: 'pulse 2s infinite' }} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 700, color: C.signalRed }}>LIVE API</span>
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
                {dynamicAlerts.map(alert => (
                  <div key={alert.id} onClick={() => setActiveAlert(activeAlert === alert.id ? null : alert.id)} style={{ background: C.limestone, borderRadius: 14, border: `1.5px solid ${activeAlert === alert.id ? alert.color : 'rgba(27,26,23,0.07)'}`, boxShadow: activeAlert === alert.id ? `0 2px 20px ${alert.color}15` : '0 1px 6px rgba(27,26,23,0.04)', cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s' }}>
                    <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${alert.color}12`, border: `1.5px solid ${alert.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <AlertTriangle size={18} color={alert.color} strokeWidth={2.2} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '14px', fontWeight: 700, color: C.nile }}>{alert.title}</span>
                          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 700, background: `${alert.color}15`, color: alert.color, padding: '2px 8px', borderRadius: 99, letterSpacing: '0.04em' }}>{alert.tag}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} color="#A89880" strokeWidth={2} /><span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#8B7E6A' }}>{alert.location}</span></div>
                          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#C4B89A' }}>·</span>
                          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#A89880' }}>Verified by Core Server API</span>
                        </div>
                      </div>
                      <ChevronRight size={16} color="#C4B89A" strokeWidth={2} style={{ transform: activeAlert === alert.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                    </div>
                    {activeAlert === alert.id && (
                      <div style={{ padding: '0 18px 16px 72px', borderTop: `1px solid ${alert.color}12` }}>
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: '#5C5346', lineHeight: 1.75, marginBottom: 12, marginTop: 12 }}>{alert.body}</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={e => { e.stopPropagation(); setRafiq(true); }} style={{ background: C.nile, border: 'none', borderRadius: 8, padding: '8px 16px', fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 700, color: C.limestone, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Glyph size={13} /> Ask Rafiq for advice
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Governorate status grid */}
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontWeight: 500, color: C.nile, marginBottom: 14 }}>Governorate Safety Status</h2>
            {isLoading ? (
              <div style={{ background: C.limestone, borderRadius: 13, padding: '20px', textAlign: 'center', color: '#A89880', fontSize: '12px' }}>
                Fetching governorates safety indexes...
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10 }}>
                {govStatuses.map(({ name, status, alerts, color }) => (
                  <div key={name} style={{ background: C.limestone, borderRadius: 13, padding: '14px 16px', border: `1.5px solid ${color}20`, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', fontWeight: 700, color: C.nile }}>{name}</span>
                      {alerts > 0 && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 700, background: `${C.alertAmber}15`, color: C.alertAmber, padding: '2px 7px', borderRadius: 99 }}>{alerts} alert</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 0 3px ${color}25` }} />
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 600, color }}>{status}</span>
                    </div>
                  </div>
                ))}
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

          {/* Rafiq safety tip */}
          <div style={{ background: 'linear-gradient(145deg,#FAF3E4,#F0E8D0)', borderRadius: 16, padding: '18px', border: `1px solid ${C.sand}25` }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, color: C.copper, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>◈ Rafiq Safety Briefing</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '14px', color: C.nile, lineHeight: 1.7, marginBottom: 10 }}>
              "{safetyData?.safetyTips && safetyData.safetyTips.length > 0 ? safetyData.safetyTips[0] : `${safetyData?.governorate || currentGov} is currently clear. Maintain standard travel awareness and carry official ID.`}"
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#A89880', marginBottom: 12 }}>Updated from Core Server for {safetyData?.governorate || currentGov}</div>
            <button onClick={() => setRafiq(true)} style={{ width: '100%', background: C.nile, border: 'none', borderRadius: 9, padding: '10px 16px', fontFamily: "'Inter',sans-serif", fontSize: '13px', fontWeight: 700, color: C.limestone, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <Glyph size={15} light /> Ask Rafiq about safety
            </button>
          </div>

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
        </div>
      </div>
      {rafiq && <RafiqDrawer onClose={() => setRafiq(false)} />}
    </div>
  );
}
