'use client';

import { useEffect, useState } from 'react';
import { MapPin, Droplets, Wind, Sun, Loader2, Radio, Sparkles } from 'lucide-react';
import { C } from '@/lib/constants/theme';
import { envService } from '@/services/envService';
import { useLocation, useLocationLabel } from '@/providers/LocationProvider';
import { useAppSettings } from '@/lib/settingsStore';

const CAIRO_FALLBACK = { lat: 30.0444, lon: 31.2357 };

type UvLevel = { word: string; color: string };
function uvLevel(uvi: number): UvLevel {
  if (uvi <= 2) return { word: 'Low', color: C.safeGreen };
  if (uvi <= 5) return { word: 'Moderate', color: C.alertAmber };
  if (uvi <= 7) return { word: 'High', color: '#D97706' };
  if (uvi <= 10) return { word: 'Very high', color: C.signalRed };
  return { word: 'Extreme', color: '#7C3AED' };
}

function uvAdvice(uvi: number): string {
  if (uvi <= 2) return 'No protection needed';
  if (uvi <= 5) return 'Some shade around midday';
  if (uvi <= 7) return 'Sunscreen + shade needed';
  if (uvi <= 10) return 'Sunscreen, hat & shade';
  return 'Avoid the midday sun';
}

function aqiInfo(aqi: number): { word: string; color: string } {
  if (aqi <= 50) return { word: 'Good', color: C.safeGreen };
  if (aqi <= 100) return { word: 'Moderate', color: C.alertAmber };
  if (aqi <= 150) return { word: 'Unhealthy', color: '#D97706' };
  return { word: 'Hazardous', color: C.signalRed };
}

function touristTip(temp: number | null, feels: number | null, uvi: number | null, aqi: number | null, condition: string | null): string | null {
  if (condition && /rain|drizzle|shower|thunder/i.test(condition)) {
    return 'Rain expected today — carry a light umbrella or plan indoor sites like the museums.';
  }
  const feel = feels ?? temp;
  if (feel != null && feel >= 40) {
    return 'Very hot — plan visits for early morning or late afternoon and always carry water.';
  }
  if (feel != null && feel >= 34) {
    return 'Hot day — drink plenty of water, wear sunscreen and take shade breaks.';
  }
  if (uvi != null && uvi >= 8) {
    return 'Extreme sun today — use SPF 50+, wear a hat and sunglasses, and reapply often.';
  }
  if (aqi != null && aqi > 100) {
    return 'Air quality is lower today — consider a mask if you are sensitive.';
  }
  return 'Clear, pleasant day — a great time to explore. Enjoy Egypt!';
}

export function WeatherWidget() {
  const { lat, lon, locationName, governorate } = useLocation();
  const { units } = useAppSettings();
  const area = useLocationLabel();

  const [env, setEnv] = useState<{ data: any; source: 'live' | 'offline' } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const run = async () => {
      const usedLat = lat ?? CAIRO_FALLBACK.lat;
      const usedLon = lon ?? CAIRO_FALLBACK.lon;
      const snapshot = await envService.getEnvSnapshot(usedLat, usedLon).catch(() => ({
        data: null,
        source: 'offline' as const,
      }));
      if (!active) return;
      setEnv(snapshot.data ? snapshot : null);
      setLoading(false);
    };
    run();
    return () => {
      active = false;
    };
  }, [lat, lon, locationName, governorate]);

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
  const uv = uvi != null && Number.isFinite(uvi) ? uvLevel(Math.round(uvi * 10) / 10) : null;
  const air = aqi != null && Number.isFinite(aqi) ? aqiInfo(Math.round(aqi)) : null;
  const tip = temp != null || uvi != null || aqi != null || condition != null ? touristTip(temp, feels, uvi, aqi, condition) : null;

  const windDisplay =
    wind == null
      ? '--'
      : units === 'imperial'
        ? `${Math.round(wind * 0.621371)} mph`
        : `${Math.round(wind)} km/h`;

  const tile = (
    icon: React.ReactNode,
    value: string,
    label: string,
    sub: string | null,
    color: string,
    subColor?: string
  ) => (
    <div
      style={{
        background: `${C.limestone}0a`,
        border: `1px solid ${C.limestone}14`,
        borderRadius: 12,
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: color }}>
        {icon}
        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: `${C.limestone}55` }}>
          {label}
        </span>
      </div>
      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '15px', fontWeight: 700, color: color, lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', color: subColor ?? `${C.limestone}55`, lineHeight: 1.3 }}>
          {sub}
        </div>
      )}
    </div>
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: 'rgba(20,16,8,0.40)',
        border: `1px solid ${C.limestone}1f`,
        borderRadius: 18,
        padding: '16px 18px',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Header: condition + location + source */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 30, lineHeight: 1 }}>
            {loading ? <Loader2 size={24} color={`${C.limestone}55`} className="animate-spin" /> : condition ? weatherIcon(condition) : '🌤️'}
          </span>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '17px', fontWeight: 500, color: C.limestone, lineHeight: 1.1 }}>
              Current weather
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, color: `${C.limestone}65` }}>
              <MapPin size={10} color={C.solarBright} strokeWidth={2.2} />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 500 }}>{area}</span>
            </div>
          </div>
        </div>
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
      </div>

      {/* Big temperature */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '50px', lineHeight: 0.95, color: C.limestone }}>
          {loading ? '—' : toDisplay(temp)}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', fontWeight: 600, color: `${C.limestone}90` }}>
            {condition ?? 'Current conditions'}
          </span>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: `${C.limestone}60` }}>
            Feels like {toDisplay(feels)}
          </span>
        </div>
      </div>

      {/* Stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(118px,1fr))', gap: 8 }}>
        {uv != null &&
          tile(
            <Sun size={14} color={uv.color} strokeWidth={2.2} />,
            `UV ${Math.round(uvi * 10) / 10}`,
            'Sun',
            `${uv.word} · ${uvAdvice(Math.round(uvi * 10) / 10)}`,
            uv.color
          )}
        {air != null &&
          tile(
            <span style={{ fontSize: 13 }}>🌫️</span>,
            air.word,
            'Air quality',
            aqi != null ? `AQI ${Math.round(aqi)}` : null,
            air.color
          )}
        {humidity != null &&
          tile(
            <Droplets size={14} color={`${C.limestone}75`} strokeWidth={2.2} />,
            `${humidity}%`,
            'Humidity',
            null,
            `${C.limestone}95`
          )}
        {wind != null &&
          tile(
            <Wind size={14} color={`${C.limestone}75`} strokeWidth={2.2} />,
            windDisplay,
            'Wind',
            null,
            `${C.limestone}95`
          )}
      </div>

      {/* Tourist tip */}
      {tip && !loading && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
            background: `${C.solar}14`,
            border: `1px solid ${C.solar}35`,
            borderRadius: 12,
            padding: '9px 12px',
          }}
        >
          <Sparkles size={14} color={C.solarBright} strokeWidth={2.2} style={{ marginTop: 1, flexShrink: 0 }} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', lineHeight: 1.55, color: `${C.limestone}88` }}>{tip}</span>
        </div>
      )}
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
