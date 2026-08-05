'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Droplets, Wind, Sun, Loader2, Radio } from 'lucide-react';
import { C } from '@/lib/constants/theme';
import { envService } from '@/services/envService';
import { useLocation } from '@/providers/LocationProvider';
import { useAppSettings } from '@/lib/settingsStore';

const CAIRO_FALLBACK = { lat: 30.0444, lon: 31.2357 };

export function WeatherWidget() {
  const { lat, lon, locationName, governorate } = useLocation();
  const { units } = useAppSettings();
  const mounted = useRef(false);

  const [env, setEnv] = useState<{ data: any; source: 'live' | 'offline' } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const run = async () => {
      const usedLat = lat ?? CAIRO_FALLBACK.lat;
      const usedLon = lon ?? CAIRO_FALLBACK.lon;
      const snapshot = await envService.getEnvSnapshot(usedLat, usedLon).catch(() => ({
        data: null,
        source: 'offline' as const,
      }));
      setEnv(snapshot.data ? snapshot : null);
      setLoading(false);
    };
    run();
  }, [lat, lon]);

  const area = governorate || locationName || 'Cairo';

  const toDisplay = (celsius: number | null | undefined) => {
    if (celsius == null || Number.isNaN(celsius)) return '--';
    if (units === 'imperial') return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    return `${Math.round(celsius)}°C`;
  };

  const weather = env?.data?.weather ?? {};
  const airQuality = env?.data?.airQuality ?? {};
  const temp = weather?.temperature ?? null;
  const feels = weather?.feels_like ?? weather?.feelsLike ?? temp;
  const uvi = weather?.uv_index ?? weather?.uvIndex ?? null;
  const aqi = airQuality?.aqi ?? airQuality?.index ?? null;
  const humidity = weather?.humidity ?? null;
  const wind = weather?.wind_speed ?? null;
  const condition = weather?.condition ?? weather?.summary ?? null;

  const live = env?.source === 'live';
  const aqiLabel = aqi == null ? null : aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : aqi <= 150 ? 'Unhealthy' : 'Hazardous';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        background: `${C.limestone}08`,
        border: `1px solid ${C.limestone}1f`,
        borderRadius: 16,
        padding: '14px 20px',
        backdropFilter: 'blur(6px)',
      }}
    >
      {/* Temp */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 34, lineHeight: 1 }}>{condition ? weatherIcon(condition) : <Loader2 size={26} color={`${C.limestone}55`} className="animate-spin" />}</div>
        <div>
          {loading ? (
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '26px', color: `${C.limestone}50` }}>Loading…</div>
          ) : (
            <>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '28px', fontWeight: 500, color: C.limestone, lineHeight: 1.05 }}>
                {toDisplay(temp)}
                <span style={{ fontSize: '15px', fontWeight: 300, color: `${C.limestone}60`, marginLeft: 6 }}>feels {toDisplay(feels)}</span>
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: `${C.limestone}70`, marginTop: 2 }}>{condition ?? 'Current conditions'}</div>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {aqi != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15 }}>🌫️</span>
            <div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 600, color: aqi <= 100 ? C.safeGreen : C.signalRed }}>{aqiLabel}</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', color: `${C.limestone}50` }}>AQI {aqi}</div>
            </div>
          </div>
        )}
        {uvi != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sun size={16} color={C.solarBright} strokeWidth={2} />
            <div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 600, color: C.solarBright }}>UV {uvi}</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', color: `${C.limestone}50` }}>index</div>
            </div>
          </div>
        )}
        {humidity != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Droplets size={16} color={`${C.limestone}70`} strokeWidth={2} />
            <div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 600, color: `${C.limestone}90` }}>{humidity}%</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', color: `${C.limestone}50` }}>humidity</div>
            </div>
          </div>
        )}
        {wind != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Wind size={16} color={`${C.limestone}70`} strokeWidth={2} />
            <div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 600, color: `${C.limestone}90` }}>{units === 'imperial' ? `${Math.round(wind * 0.621371)} mph` : `${Math.round(wind)} km/h`}</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', color: `${C.limestone}50` }}>wind</div>
            </div>
          </div>
        )}
      </div>

      {/* Source + location */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, marginLeft: 'auto', flexShrink: 0 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            fontFamily: "'Inter',sans-serif",
            background: live ? `${C.faience}22` : `${C.solar}22`,
            color: live ? C.faience : C.solarBright,
            border: `1px solid ${live ? `${C.faience}55` : `${C.solar}50`}`,
            borderRadius: 99,
            padding: '3px 10px',
          }}
        >
          <Radio size={10} strokeWidth={2.5} /> {live ? 'LIVE' : 'ESTIMATE'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: `${C.limestone}65` }}>
          <MapPin size={11} color={C.solarBright} strokeWidth={2.2} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 500 }}>{area}</span>
        </div>
      </div>
    </div>
  );
}

function weatherIcon(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes('thunder')) return '⛈️';
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return '🌧️';
  if (c.includes('snow')) return '🌨️';
  if (c.includes('fog') || c.includes('mist')) return '🌫️';
  if (c.includes('cloud')) return '☁️';
  if (c.includes('clear')) return '☀️';
  return '🌤️';
}
