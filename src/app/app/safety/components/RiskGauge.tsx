'use client';

import { ShieldCheck } from 'lucide-react';
import { C } from '@/lib/constants/theme';
import { UI, RihlaCard, CardLabel } from '@/app/components/ui/primitives';
import { riskMeaning } from './alertCopy';
import { RISK_COLOR } from '@/lib/constants/riskMeta';

export function RiskGauge({
  status,
  score,
  gov,
}: {
  status: string | null;
  score: number | null;
  gov: string;
}) {
  const normalized: 'safe' | 'caution' | 'warning' =
    status === 'warning' || status === 'caution' ? status : 'safe';
  const cfg = {
    color: RISK_COLOR[normalized],
    label: normalized === 'warning' ? 'Warning' : normalized === 'caution' ? 'Caution' : 'Safe',
  };
  const clamped = Math.max(0, Math.min(100, score ?? 90));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;

  return (
    <RihlaCard>
      <CardLabel>Overall Risk Level</CardLabel>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 132, height: 132, marginBottom: 12 }}>
          <svg width="132" height="132" viewBox="0 0 120 120" style={{ display: 'block' }}>
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(27,26,23,0.09)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r={radius} fill="none" stroke={cfg.color} strokeWidth="8"
              strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <div style={{ fontFamily: UI.font.sans, fontSize: 28, fontWeight: 800, color: cfg.color, lineHeight: 1 }}>{clamped}</div>
            <div style={{ fontFamily: UI.font.sans, fontSize: 9, color: UI.text.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 3 }}>Index</div>
          </div>
        </div>
        <div style={{ fontFamily: UI.font.serif, fontSize: 22, fontWeight: 600, color: cfg.color, lineHeight: 1.1 }}>{cfg.label}</div>
        <div style={{ fontFamily: UI.font.sans, fontSize: 11, color: UI.text.muted, marginTop: 4, textAlign: 'center' }}>
          {gov} · Egyptian Tourist Safety Index
        </div>
        <div
          style={{
            fontFamily: UI.font.sans,
            fontSize: 11.5,
            color: UI.text.body,
            lineHeight: 1.55,
            marginTop: 12,
            textAlign: 'center',
            padding: '10px 12px',
            background: `${cfg.color}0C`,
            borderRadius: 10,
            border: `1px solid ${cfg.color}22`,
          }}
        >
          {riskMeaning(normalized, RISK_COLOR).meaning}
        </div>
        <div
          style={{
            fontFamily: UI.font.sans,
            fontSize: 11,
            color: UI.text.body,
            lineHeight: 1.5,
            marginTop: 8,
            textAlign: 'center',
            padding: '9px 12px',
            background: UI.surface.flat,
            borderRadius: 10,
            border: `1px solid ${UI.border}`,
            display: 'flex',
            gap: 6,
            alignItems: 'flex-start',
          }}
        >
          <span style={{ color: cfg.color, flexShrink: 0, fontSize: 12, lineHeight: '16px', display: 'inline-flex', marginTop: 1 }}>
            <ShieldCheck size={13} />
          </span>
          <span style={{ flex: 1 }}>{riskMeaning(normalized, RISK_COLOR).action}</span>
        </div>
      </div>
    </RihlaCard>
  );
}