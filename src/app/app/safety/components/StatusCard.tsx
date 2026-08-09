'use client';

import { ShieldCheck } from 'lucide-react';
import { C } from '@/lib/constants/theme';
import { UI, RihlaCard, CardLabel } from '@/app/components/ui/primitives';
import { riskMeaning } from './alertCopy';
import { RISK_COLOR, type RiskStatus } from '@/lib/constants/riskMeta';

export function StatusCard({
  status,
  gov,
}: {
  status: RiskStatus | null;
  gov: string;
}) {
  const resolved: RiskStatus = status ?? 'safe';
  const meta = riskMeaning(resolved, RISK_COLOR);
  const color = RISK_COLOR[resolved];

  return (
    <RihlaCard>
      <CardLabel>Travel Status</CardLabel>
      <div style={{ fontFamily: UI.font.serif, fontSize: 26, fontWeight: 600, color, lineHeight: 1.1 }}>
        {meta.label}
      </div>
      <div style={{ fontFamily: UI.font.sans, fontSize: 11, color: UI.text.muted, marginTop: 4 }}>
        {gov} · right now
      </div>
      <div
        style={{
          fontFamily: UI.font.sans,
          fontSize: 11.5,
          color: UI.text.body,
          lineHeight: 1.55,
          marginTop: 12,
          padding: '10px 12px',
          background: `${color}0C`,
          borderRadius: 10,
          border: `1px solid ${color}22`,
        }}
      >
        {meta.meaning}
      </div>
      <div
        style={{
          fontFamily: UI.font.sans,
          fontSize: 11,
          color: UI.text.body,
          lineHeight: 1.5,
          marginTop: 8,
          padding: '9px 12px',
          background: UI.surface.flat,
          borderRadius: 10,
          border: `1px solid ${UI.border}`,
          display: 'flex',
          gap: 6,
          alignItems: 'flex-start',
        }}
      >
        <span style={{ color, flexShrink: 0, fontSize: 12, lineHeight: '16px', display: 'inline-flex', marginTop: 1 }}>
          <ShieldCheck size={13} />
        </span>
        <span style={{ flex: 1 }}>{meta.action}</span>
      </div>
    </RihlaCard>
  );
}