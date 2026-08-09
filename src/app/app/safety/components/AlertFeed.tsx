'use client';

import { useState } from 'react';
import { MapPin, ChevronDown, Clock, ShieldCheck, Lightbulb } from 'lucide-react';
import { C } from '@/lib/constants/theme';
import { Glyph } from '@/app/components/atoms';
import { UI, RihlaCard, Pill, IconTile, ExplanationRow } from '@/app/components/ui/primitives';
import type { SafetyEvent } from '@/services/safetyService';
import { categoryMeta, relativeAge, severityColor } from './categoryMeta';
import { describeEvent, severityCopy, dedupeEvents } from './alertCopy';

export function AlertFeed({
  events,
  locationLabel,
  onAskRafiq,
}: {
  events: SafetyEvent[];
  locationLabel: string;
  onAskRafiq: (headline: string) => void;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const grouped = dedupeEvents(events);

  if (grouped.length === 0) {
    return (
      <RihlaCard style={{ padding: 24, textAlign: 'center', border: `1px solid ${C.safeGreen}30` }}>
        <ShieldCheck size={22} color={C.safeGreen} style={{ margin: '0 auto 8px' }} />
        <div style={{ fontFamily: UI.font.sans, fontSize: 13, color: C.safeGreen, fontWeight: 600 }}>
          No active alerts for {locationLabel}. Area status is clear.
        </div>
      </RihlaCard>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {grouped.map(({ event: e, count }) => {
        const meta = categoryMeta(e.category);
        const col = severityColor(e.severity);
        const sev = severityCopy(e.severity);
        const copy = describeEvent(e);
        const key = `${e.source}-${e.category}-${e.severity}-${e.headline}-${count}`;
        const open = openKey === key;
        return (
          <div
            key={key}
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              borderLeft: `5px solid ${col}`,
              borderTop: '1px solid rgba(27,26,23,0.08)',
              borderRight: '1px solid rgba(27,26,23,0.08)',
              borderBottom: '1px solid rgba(27,26,23,0.08)',
              boxShadow: open ? `0 2px 18px ${col}1c` : '0 1px 5px rgba(27,26,23,0.05)',
              overflow: 'hidden',
              transition: 'all 0.18s',
              opacity: e.severity === 'info' ? 0.95 : 1,
            }}
          >
            <div style={{ padding: '13px 16px', cursor: 'pointer' }} onClick={() => setOpenKey(open ? null : key)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <IconTile color={meta.color} bg={`${meta.color}18`} size={24} radius={7}>
                  {meta.icon({ size: 13, strokeWidth: 2 })}
                </IconTile>
                <Pill color={col} style={{ padding: '3px 9px' }}>
                  {sev.label}
                </Pill>
                {count > 1 && (
                  <Pill color={C.nile} bg={`${C.nile}10`}>
                    ×{count}
                  </Pill>
                )}
                <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: UI.text.soft, fontFamily: UI.font.sans }}>
                  <Clock size={11} />
                  {relativeAge(e.effectiveTime)}
                </span>
                <ChevronDown
                  size={15}
                  color={UI.text.muted}
                  style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                />
              </div>
              <div style={{ fontFamily: UI.font.sans, fontSize: 13.5, fontWeight: 700, color: C.nile }}>
                {copy.title}
              </div>
              {e.city && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <MapPin size={11} color={UI.text.muted} strokeWidth={2} />
                  <span style={{ fontFamily: UI.font.sans, fontSize: 11, color: UI.text.soft, textTransform: 'capitalize' }}>
                    {e.city}
                  </span>
                </div>
              )}
            </div>

            {open && (
              <div style={{ padding: '14px 16px 14px', borderTop: '1px solid rgba(27,26,23,0.06)' }}>
                <ExplanationRow icon={<Lightbulb size={11} />} color={C.faience} label="What this means">
                  {copy.meaning}
                </ExplanationRow>
                <ExplanationRow icon={<ShieldCheck size={11} />} color={col} label="What to do">
                  {copy.action}
                </ExplanationRow>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', borderTop: '1px dashed rgba(27,26,23,0.1)', paddingTop: 10 }}>
                  <span style={{ fontFamily: UI.font.sans, fontSize: 10.5, color: UI.text.muted }}>
                    {e.lat != null && e.lon != null && e.lat !== 0
                      ? `Near ${e.lat.toFixed(3)}, ${e.lon.toFixed(3)}`
                      : `${meta.label} · ${sev.hint}`}
                    {e.expiresTime ? ` · expires ${relativeAge(e.expiresTime)}` : ''}
                  </span>
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onAskRafiq(copy.title);
                    }}
                    style={{
                      marginLeft: 'auto',
                      background: 'none',
                      border: 'none',
                      color: C.nile,
                      fontFamily: UI.font.sans,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <Glyph size={13} /> Ask Rafiq
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
