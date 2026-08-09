'use client';

import { UI } from '@/app/components/ui/primitives';
import { SourceHealth, type DataSourceStatus } from './SourceHealth';
import type { SourceStatus } from '@/services/safetyService';

const SOURCE_LABELS: Record<string, string> = {
  gdelt_unrest: 'GDELT · Unrest monitor',
  fcdo_advisory: 'UK FCDO · Travel advice',
  cdc_travel_health: 'CDC · Travel health',
  usgs_earthquake: 'USGS · Earthquakes',
  emsc_seismic: 'EMSC · Seismicity',
  noaa_tsunami: 'NOAA · Tsunami',
  openweather: 'Open-Meteo · Weather',
  openweather_air: 'OpenWeather · Air quality',
  nasa_firms: 'NASA FIRMS · Fire',
  acled_unrest: 'ACLED · Conflict',
  who_outbreak: 'WHO · Outbreaks',
  reliefweb: 'ReliefWeb · Disasters',
};

export function TrustStrip({ sources }: { sources: SourceStatus[] | null }) {
  const rows: DataSourceStatus[] =
    sources && sources.length > 0
      ? sources.map((s) => ({
          name: SOURCE_LABELS[s.name] ?? s.name,
          status: s.status,
          detail:
            s.status === 'healthy'
              ? `Updated ${s.lastUpdate === 'Never' ? 'recently' : s.lastUpdate}`
              : s.status === 'degraded'
                ? 'Degraded — data may be stale'
                : 'Unavailable — not used for your score',
        }))
      : [{ name: 'Live source feed', status: 'offline', detail: 'Unable to reach the safety feed right now' }];

  return (
    <div>
      <SourceHealth sources={rows} />
      <div style={{ fontFamily: UI.font.sans, fontSize: 10.5, color: UI.text.muted, marginTop: 10 }}>
        <span>Open sources: NASA FIRMS · USGS · EMSC · NOAA · Open-Meteo · GDELT · CDC · FCDO · WHO</span>
      </div>
    </div>
  );
}