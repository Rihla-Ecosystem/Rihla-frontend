'use client';

import { MapPin, RefreshCw, ShieldAlert, Umbrella } from 'lucide-react';
import { C } from '@/lib/constants/theme';
import { UI } from '@/app/components/ui/primitives';
import { riskMeaning } from './alertCopy';
import { RISK_COLOR, type RiskStatus } from '@/lib/constants/riskMeta';

interface TravelStatusHeroProps {
  status: RiskStatus | null;
  gov: string;
  locationLabel: string;
  isLoading: boolean;
  live: boolean;
  lastUpdated: Date | null;
  countdown: number;
  topReasons: string[];
  selectedCity: string;
  onCityChange: (city: string) => void;
  cities: { name: string }[];
}

const STATUS_VERDICT: Record<RiskStatus, string> = {
  safe: 'You can travel normally right now.',
  caution: 'You can travel, but pay extra attention today.',
  warning: 'Travel is not advisable unless it is essential.',
  critical: 'Avoid travel in this area right now.',
};

export function TravelStatusHero({
  status,
  gov,
  locationLabel,
  isLoading,
  live,
  lastUpdated,
  countdown,
  topReasons,
  selectedCity,
  onCityChange,
  cities,
}: TravelStatusHeroProps) {
  const resolved: RiskStatus = status ?? 'safe';
  const meta = riskMeaning(resolved, RISK_COLOR);
  const verdict = STATUS_VERDICT[resolved];
  const accent = RISK_COLOR[resolved];

  return (
    <div
      style={{
        background: `linear-gradient(135deg,#1A1209 0%,${C.basalt} 60%,#2A1A0A 100%)`,
        padding: '24px 32px',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, color: `${C.limestone}50`, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6 }}>
          Travel Safety Status
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(44px,7vw,72px)', fontWeight: 600, lineHeight: 1, color: accent, letterSpacing: '-0.02em' }}>
            {isLoading ? '…' : meta.label}
          </span>
          <div style={{ flex: 1, minWidth: 220, paddingBottom: 6 }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(13px,1.6vw,15px)', fontWeight: 700, color: C.limestone }}>
              Am I okay to travel right now?
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12.5px', color: `${C.limestone}65`, lineHeight: 1.5, marginTop: 2 }}>
              {isLoading ? 'Checking live sources…' : verdict}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${C.limestone}08`, border: `1px solid ${C.limestone}18`, borderRadius: 99, padding: '4px 12px' }}>
            <MapPin size={12} color={accent} strokeWidth={2.2} />
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: C.limestone, fontFamily: "'Inter',sans-serif", fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', padding: '2px 0' }}
            >
              <option value="">{locationLabel || gov}</option>
              {cities.map((c) => (
                <option key={c.name} value={c.name} style={{ color: '#1A1209' }}>
                  {c.name}
                </option>
              ))}
            </select>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${C.limestone}08`, border: `1px solid ${C.limestone}18`, borderRadius: 999, padding: '4px 12px', fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 600, color: `${C.limestone}75` }}>
            <RefreshCw size={11} color={live ? C.safeGreen : C.alertAmber} />
            {isLoading
              ? 'Refreshing…'
              : lastUpdated
                ? `Last updated ${lastUpdated.toLocaleTimeString()} · ${countdown}s`
                : 'Not updated yet'}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${live ? C.safeGreen : C.alertAmber}18`, border: `1px solid ${live ? C.safeGreen : C.alertAmber}40`, borderRadius: 999, padding: '4px 12px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: live ? C.safeGreen : C.alertAmber, animation: 'pulse 2s infinite' }} />
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 700, color: live ? C.safeGreen : C.alertAmber }}>
              {live ? 'LIVE' : 'ESTIMATE'}
            </span>
          </span>
        </div>

        {(topReasons.length > 0 || meta.action) && (
          <div style={{ marginTop: 14, background: 'rgba(253,247,235,0.05)', border: `1px solid ${C.limestone}12`, borderRadius: 14, padding: '14px 16px' }}>
            {topReasons.length > 0 && (
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 700, color: `${C.limestone}50`, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                Why
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {topReasons.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', fontFamily: "'Inter',sans-serif", fontSize: '12px', color: `${C.limestone}78`, lineHeight: 1.45 }}>
                  <span style={{ color: accent, fontWeight: 800, lineHeight: '16px' }}>›</span>
                  <span>{r}</span>
                </div>
              ))}
              {meta.action && (
                <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', fontFamily: "'Inter',sans-serif", fontSize: '12.5px', color: C.limestone, marginTop: topReasons.length > 0 ? 4 : 0 }}>
                  <ShieldAlert size={14} color={accent} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontWeight: 600 }}>{meta.action}</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', fontFamily: "'Inter',sans-serif", fontSize: '11px', color: `${C.limestone}45`, fontStyle: 'italic', marginTop: 8 }}>
              <Umbrella size={12} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>More detail in · Why this status? · below.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}