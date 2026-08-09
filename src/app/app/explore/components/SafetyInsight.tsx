'use client';

import { AlertTriangle, CheckCircle2, Clock3, Info } from 'lucide-react';
import { C } from '@/lib/constants/theme';
import type { SafetyData } from '@/services/safetyService';

interface SafetyInsightProps {
  data: SafetyData | null;
  source: 'live' | 'offline' | null;
  bestTime?: string;
  tips?: string[];
}

const STATUS_COPY = {
  safe: { label: 'Low concern', color: '#15803D', background: '#F0FDF4', icon: CheckCircle2 },
  caution: { label: 'Be aware', color: '#B45309', background: '#FFFBEB', icon: AlertTriangle },
  warning: { label: 'Check before visiting', color: '#C2410C', background: '#FFF7ED', icon: AlertTriangle },
  critical: { label: 'Check before visiting', color: '#B91C1C', background: '#FEF2F2', icon: AlertTriangle },
} as const;

export function SafetyInsight({ data, source, bestTime, tips = [] }: SafetyInsightProps) {
  const live = source === 'live' && data;
  const status = live && data.status ? STATUS_COPY[data.status] : null;
  const StatusIcon = status?.icon;
  const alerts = live ? data.events.slice(0, 2) : [];
  const updated = live && data.updatedAt ? new Date(data.updatedAt).toLocaleString() : null;

  return (
    <section style={{ margin: '0 16px 14px', border: '1px solid rgba(15,61,62,0.13)', borderRadius: 12, background: '#FBFAF6', padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 800, color: C.nile, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Safety insights
        </div>
        {status && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: status.background, color: status.color, borderRadius: 99, padding: '4px 8px', fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 800 }}>
            {StatusIcon && <StatusIcon size={11} />} {status.label}
          </span>
        )}
      </div>

      {!live && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8B7E6A', fontFamily: "'Inter',sans-serif", fontSize: 11 }}>
          <Info size={13} /> Safety information unavailable right now.
        </div>
      )}

      {live && alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 8 }}>
          {alerts.map((alert, index) => (
            <div key={`${alert.source}-${alert.headline}-${index}`} style={{ display: 'flex', gap: 6, color: '#6B6354', fontFamily: "'Inter',sans-serif", fontSize: 11, lineHeight: 1.35 }}>
              <AlertTriangle size={12} color={C.alertAmber} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{alert.headline}</span>
            </div>
          ))}
        </div>
      )}

      {live && alerts.length === 0 && (
        <div style={{ color: '#6B6354', fontFamily: "'Inter',sans-serif", fontSize: 11, marginBottom: 8 }}>
          No active alerts returned for this area.
        </div>
      )}

      {(bestTime || tips.length > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, color: '#6B6354', fontFamily: "'Inter',sans-serif", fontSize: 11, lineHeight: 1.4 }}>
          {bestTime && <div><Clock3 size={12} style={{ verticalAlign: '-2px', marginRight: 5 }} />Recommended visiting time: {bestTime}</div>}
          {tips.slice(0, 2).map((tip) => <div key={tip}>• {tip}</div>)}
        </div>
      )}

      {updated && <div style={{ color: '#A89880', fontFamily: "'Inter',sans-serif", fontSize: 9, marginTop: 8 }}>Updated {updated}</div>}
    </section>
  );
}
