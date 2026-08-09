'use client';

import { UI, RihlaCard, CardLabel } from '@/app/components/ui/primitives';
import { C } from '@/lib/constants/theme';
import { CATEGORY_ORDER, categoryMeta } from './categoryMeta';
import type { EventCategory } from '@/services/safetyService';

export function ScoreBreakdown({
  categories,
  total,
}: {
  categories: Partial<Record<EventCategory, number>>;
  total: number;
}) {
  const active = CATEGORY_ORDER.map((cat) => ({ cat, count: categories[cat] ?? 0 })).filter(
    (x) => x.count > 0
  );
  const max = active.reduce((acc, x) => acc + x.count, 0);

  if (max === 0) {
    return (
      <RihlaCard>
        <CardLabel>What&apos;s Driving Your Score</CardLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.safeGreen, fontFamily: UI.font.sans, fontSize: 12.5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.safeGreen, flexShrink: 0 }} />
          No active risks detected — your score is steady
        </div>
      </RihlaCard>
    );
  }

  return (
    <RihlaCard>
      <CardLabel>What's Driving Your Score</CardLabel>

      {/* Stacked bar */}
      <div style={{ display: 'flex', width: '100%', height: 10, borderRadius: 99, overflow: 'hidden', background: UI.border }}>
        {active.map(({ cat, count }) => {
          const pct = max > 0 ? (count / max) * 100 : 0;
          return <div key={cat} style={{ width: `${pct}%`, background: categoryMeta(cat).color }} />;
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 14px', marginTop: 12 }}>
        {active.map(({ cat, count }) => {
          const meta = categoryMeta(cat);
          return (
            <div key={cat} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: meta.color, flexShrink: 0 }} />
              <span style={{ fontFamily: UI.font.sans, fontSize: 11, color: UI.text.body }}>
                {meta.label}
              </span>
              <span style={{ fontFamily: UI.font.sans, fontSize: 11, fontWeight: 800, color: C.nile }}>
                {count}
              </span>
            </div>
          );
        })}
        <div style={{ fontFamily: UI.font.sans, fontSize: 10.5, color: UI.text.muted, marginLeft: 'auto' }}>
          {total > 0 ? `${total} tracked signal${total === 1 ? '' : 's'}` : ''}
        </div>
      </div>
    </RihlaCard>
  );
}