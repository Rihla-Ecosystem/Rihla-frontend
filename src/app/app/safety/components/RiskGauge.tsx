'use client';

import { C } from '@/lib/constants/theme';

const LEVEL_CONFIG = {
  safe: { color: C.safeGreen, label: 'Safe' },
  caution: { color: C.alertAmber, label: 'Caution' },
  warning: { color: C.signalRed, label: 'Warning' },
} as const;

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
  const cfg = LEVEL_CONFIG[normalized];
  const clamped = Math.max(0, Math.min(100, score ?? 90));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;

  return (
    <div style={{ background: C.limestone, borderRadius: 16, padding: '18px', border: '1px solid rgba(27,26,23,0.07)' }}>
      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, color: '#A89880', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
        Overall Risk Level
      </div>
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
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '28px', fontWeight: 800, color: cfg.color, lineHeight: 1 }}>{clamped}</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '9px', color: '#A89880', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 3 }}>Index</div>
          </div>
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '22px', fontWeight: 600, color: cfg.color, lineHeight: 1.1 }}>{cfg.label}</div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#A89880', marginTop: 4, textAlign: 'center' }}>
          {gov} · Egyptian Tourist Safety Index
        </div>
      </div>
    </div>
  );
}