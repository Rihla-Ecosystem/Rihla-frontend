'use client';

import {
  Activity,
  HeartPulse,
  Megaphone,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { UI, RihlaCard, CardLabel } from '@/app/components/ui/primitives';
import { C } from '@/lib/constants/theme';
import type { SafetyEvent } from '@/services/safetyService';
import { categoryMeta } from './categoryMeta';
import { describeEvent } from './alertCopy';

export interface StatusFactor {
  icon: ReactNode;
  title: string;
  detail: string;
  color: string;
}

interface WhyStatusProps {
  events: SafetyEvent[];
  gov: string;
  weather?: { temp: number | null; uvi: number | null; aqi: number | null; aqiLabel: string | null } | null;
}

function aqiHuman(aqi: number | null): string | null {
  if (aqi == null) return null;
  if (aqi <= 50) return 'Air quality is good — comfortable to spend time outdoors.';
  if (aqi <= 100) return 'Air quality is moderate — most travelers are fine; sensitive groups may notice it.';
  if (aqi <= 150) return 'Air quality is unhealthy for sensitive groups — reduce long outdoor stretches.';
  if (aqi <= 200) return 'Air quality is unhealthy — limit time outdoors and keep windows closed.';
  return 'Air quality is very unhealthy — avoid outdoor exposure where possible.';
}

function uviHuman(uvi: number | null): string | null {
  if (uvi == null) return null;
  if (uvi < 3) return 'UV is low — standard sun protection is enough.';
  if (uvi < 6) return 'UV is moderate — SPF 15+ before any time outdoors.';
  if (uvi < 8) return 'UV is high — use SPF 30+, a hat, and shade between 11am and 4pm.';
  if (uvi < 11) return 'UV is very high — SPF 50+, long sleeves, and avoid midday sun.';
  return 'UV is extreme — stay indoors midday and use full-sun protection outdoors.';
}

function tempHuman(temp: number | null): string | null {
  if (temp == null) return null;
  if (temp >= 40) return 'Extreme heat right now — hydrate often and avoid midday exertion.';
  if (temp >= 34) return 'It is very hot — drink water regularly and take cool breaks.';
  if (temp >= 30) return 'It is hot — stay hydrated and carry water while exploring.';
  if (temp >= 24) return 'Conditions are pleasant — comfortable for normal activities.';
  return 'Temperatures are mild — a light layer may help in the evening.';
}

export function WhyStatus({ events, gov, weather }: WhyStatusProps) {
  const factors: StatusFactor[] = [];

  const tempNote = tempHuman(weather?.temp ?? null);
  const uviNote = uviHuman(weather?.uvi ?? null);
  const aqiNote = aqiHuman(weather?.aqi ?? null);

  if (tempNote) {
    factors.push({
      icon: <Thermometer size={14} />,
      title: `${Math.round(weather!.temp!)}°C feels`,
      detail: tempNote,
      color: C.terracotta,
    });
  }
  if (uviNote) {
    factors.push({
      icon: <Sun size={14} />,
      title: `UV index ${weather!.uvi != null ? Math.round(weather!.uvi * 10) / 10 : '—'}`,
      detail: uviNote,
      color: C.alertAmber,
    });
  }
  if (aqiNote) {
    factors.push({
      icon: <Wind size={14} />,
      title: `Air ${weather!.aqiLabel ?? 'quality'}`,
      detail: aqiNote,
      color: C.faience,
    });
  }

  const incidents = events.filter((e) =>
    e.severity !== 'info' && ['unrest', 'crime', 'advisory', 'health'].includes(e.category)
  );
  if (incidents.length > 0) {
    const top = incidents[0];
    const meta = categoryMeta(top.category);
    factors.push({
      icon: meta.icon({ size: 14, strokeWidth: 2 }),
      title: describeEvent(top).title,
      detail: describeEvent(top).meaning,
      color: meta.color,
    });
    if (incidents.length > 1) {
      factors.push({
        icon: <Megaphone size={14} />,
        title: `${incidents.length - 1} more reports`,
        detail: 'Additional reports are being monitored — review the alerts below for detail.',
        color: C.copper,
      });
    }
  }

  const hazards = events.filter((e) =>
    e.severity !== 'info' && ['fire', 'seismic', 'flood', 'tsunami'].includes(e.category)
  );
  if (hazards.length > 0) {
    const top = hazards[0];
    const meta = categoryMeta(top.category);
    factors.push({
      icon: meta.icon({ size: 14, strokeWidth: 2 }),
      title: describeEvent(top).title,
      detail: describeEvent(top).meaning,
      color: meta.color,
    });
    if (hazards.length > 1) {
      factors.push({
        icon: <Activity size={14} />,
        title: `${hazards.length - 1} more environmental signal`,
        detail: 'Other fire, seismic or water signals are being monitored.',
        color: C.copper,
      });
    }
  }

  const health = events.filter((e) => e.severity === 'info' && e.category === 'health');
  if (health.length > 0) {
    const top = health[0];
    factors.push({
      icon: <HeartPulse size={14} />,
      title: describeEvent(top).title,
      detail: describeEvent(top).meaning,
      color: C.safeGreen,
    });
  }

  const emptyState =
    factors.length === 0
      ? {
          icon: <Sun size={20} />,
          title: 'Nothing significant to report',
          detail: `We keep watching weather, incidents and environmental signals in ${gov}. Conditions look routine right now.`,
          color: C.safeGreen,
        }
      : null;

  return (
    <RihlaCard>
      <CardLabel>Why this status?</CardLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {emptyState ? <FactorRow {...emptyState} /> : factors.map((f, i) => <FactorRow key={i} {...f} />)}
      </div>
    </RihlaCard>
  );
}

function FactorRow({ icon, title, detail, color }: StatusFactor) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${color}14`,
          color,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: UI.font.sans, fontSize: 12.5, fontWeight: 700, color: C.nile }}>{title}</div>
        <div style={{ fontFamily: UI.font.sans, fontSize: 11.5, color: UI.text.body, lineHeight: 1.5, marginTop: 1 }}>
          {detail}
        </div>
      </div>
    </div>
  );
}