'use client';

import { Compass } from 'lucide-react';
import { C } from '@/lib/constants/theme';
import { UI, RihlaCard, IconTile } from '@/app/components/ui/primitives';
import { RISK_COLOR } from '@/lib/constants/riskMeta';
import type { CityState } from '@/services/safetyService';

export function NearbyGrid({
  cities,
  activeName,
  onSelect,
}: {
  cities: CityState[];
  activeName: string;
  onSelect: (name: string) => void;
}) {
  const sorted = [...cities]
    .filter((c) => c.distanceKm != null)
    .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

  return (
    <RihlaCard>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <IconTile color={C.faience}>
          <Compass size={15} />
        </IconTile>
        <div>
          <div style={{ fontFamily: UI.font.sans, fontSize: 13, fontWeight: 700, color: C.nile }}>
            Nearby Cities · Live
          </div>
          <div style={{ fontFamily: UI.font.sans, fontSize: 11, color: UI.text.muted }}>
            Real-time risk from the live feed
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 8, marginTop: 12 }}>
        {sorted.map((city) => {
          const isActive = city.name === activeName;
          const col = RISK_COLOR[city.status];
          const alerts = city.events.filter((e) => e.severity !== 'info').length;
          return (
            <button
              key={city.key}
              onClick={() => onSelect(isActive ? '' : city.name)}
              style={{
                background: isActive ? `${col}10` : UI.surface.flat,
                border: `1px solid ${isActive ? col : UI.border}`,
                borderRadius: 12,
                padding: '12px 13px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <span style={{ fontFamily: UI.font.sans, fontSize: 12.5, fontWeight: 700, color: C.nile }}>{city.name}</span>
                <span style={{ fontFamily: UI.font.sans, fontSize: 11, fontWeight: 800, color: col, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {city.status === 'warning' ? 'Warning' : city.status === 'caution' ? 'Caution' : city.status === 'critical' ? 'Critical' : 'Safe'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: col, flexShrink: 0 }} />
                <span style={{ fontFamily: UI.font.sans, fontSize: 10, color: UI.text.muted }}>
                  {alerts > 0 ? `${alerts} alert${alerts === 1 ? '' : 's'}` : 'No active alerts'} · {city.distanceKm} km
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 10, fontFamily: UI.font.sans, fontSize: 10, color: UI.text.muted }}>
        Tap a city to preview its live safety · distances from your current location
      </div>
    </RihlaCard>
  );
}