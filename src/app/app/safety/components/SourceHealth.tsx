'use client';

import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { C } from '@/lib/constants/theme';

export interface DataSourceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down' | 'offline';
  detail: string;
}

const STATUS_CONFIG = {
  healthy: { icon: CheckCircle2, color: C.safeGreen, bg: `${C.safeGreen}0F` },
  degraded: { icon: AlertTriangle, color: C.alertAmber, bg: `${C.alertAmber}12` },
  down: { icon: XCircle, color: C.signalRed, bg: `${C.signalRed}10` },
  offline: { icon: Info, color: C.copper, bg: `${C.copper}12` },
} as const;

export function SourceHealth({ sources }: { sources: DataSourceStatus[] }) {
  return (
    <div style={{ background: C.limestone, borderRadius: 16, padding: '18px', border: '1px solid rgba(27,26,23,0.07)' }}>
      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, color: '#A89880', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
        Data Source Health
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sources.map((s) => {
          const cfg = STATUS_CONFIG[s.status];
          const Icon = cfg.icon;
          return (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: cfg.bg }}>
              <Icon size={16} color={cfg.color} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 700, color: C.nile }}>{s.name}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', color: '#A89880', lineHeight: 1.4 }}>{s.detail}</div>
              </div>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: cfg.color, flexShrink: 0 }}>{s.status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}