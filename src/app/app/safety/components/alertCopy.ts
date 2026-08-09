import type { SafetyEvent } from '@/services/safetyService';

export interface EventCopy {
  title: string;
  meaning: string;
  action: string;
}

function pickTitle(source: string): string {
  switch (source) {
    case 'openweather_air':
      return 'Air quality';
    case 'openweather_current':
      return 'Weather';
    case 'nasa_firms':
      return 'Fire / heat';
    case 'emsc_seismic':
    case 'usgs':
    case 'iris':
      return 'Earthquake';
    case 'reliefweb':
      return 'News / advisory';
    case 'gdelt':
    case 'gdelt_unrest':
      return 'Unrest watch';
    default:
      return source.replace(/[_-]+/g, ' ');
  }
}

function uvLevel(u: number): { label: string; action: string } {
  if (u < 3) return { label: 'Low UV', action: 'No special protection needed.' };
  if (u < 6) return { label: 'Moderate UV', action: 'Wear SPF 15+ if you will be outside more than 30 minutes.' };
  if (u < 8) return { label: 'High UV', action: 'Wear SPF 30+, a hat and sunglasses; seek shade between 11am and 4pm.' };
  if (u < 11) return { label: 'Very High UV', action: 'SPF 50+ and long sleeves; minimize midday sun exposure.' };
  return { label: 'Extreme UV', action: 'Avoid outdoor activity in the middle of the day; stay in shade with full coverage.' };
}

function aqiLevel(a: number): { label: string; meaning: string } {
  if (a <= 50) return { label: 'Good', meaning: 'Air is clean — no restrictions on outdoor activity.' };
  if (a <= 100) return { label: 'Moderate', meaning: 'Acceptable air for most people; sensitive groups may feel it.' };
  if (a <= 150) return { label: 'Unhealthy (sensitive)', meaning: 'Children, elderly and anyone with respiratory issues should limit time outdoors.' };
  if (a <= 200) return { label: 'Unhealthy', meaning: 'Everyone should limit prolonged outdoor exertion; keep windows closed in traffic.' };
  return { label: 'Very unhealthy', meaning: 'Avoid unnecessary outdoor exposure; use masks in polluted areas.' };
}

function tempLevel(t: number): { label: string; action: string } {
  if (t >= 40) return { label: 'Extreme heat', action: 'Stay indoors at midday, hydrate frequently, and avoid strenuous activity.' };
  if (t >= 34) return { label: 'Very hot', action: 'Drink water often, take air-conditioned breaks, and cover up from the sun.' };
  if (t >= 30) return { label: 'Hot', action: 'Hydrate regularly and carry water; avoid midday walking.' };
  if (t >= 24) return { label: 'Pleasant', action: 'Comfortable conditions — normal travel activity.' };
  if (t >= 16) return { label: 'Mild', action: 'Comfortable; carry a light layer for evenings.' };
  return { label: 'Cool', action: 'Bring a jacket for the evening and early morning.' };
}

function earthquakeLevel(m: number): { label: string; action: string } {
  if (m < 3) return { label: 'Minor tremor', action: 'Usually not felt — no action needed. You are safe.' };
  if (m < 4) return { label: 'Light tremor', action: 'Might be felt briefly. No action needed unless you are in an unstable building.' };
  if (m < 5) return { label: 'Moderate quake', action: 'If you feel shaking, move away from windows and stand under a sturdy doorframe.' };
  if (m < 6) return { label: 'Strong quake', action: 'Drop, cover and hold on if you feel it; avoid elevators and doorways with glass.' };
  return { label: 'Major quake', action: 'Follow local authority guidance; if indoors, take cover and be ready for aftershocks.' };
}

function fireConfidence(c: number): { meaning: string; action: string } {
  if (c < 30)
    return {
      meaning: 'A satellite heat signature was flagged but with very low confidence — most likely an industrial flare or a false positive, not a real fire.',
      action: 'No action needed. We will only alert you if a verified fire is confirmed nearby.',
    };
  if (c < 80)
    return {
      meaning: 'A potential fire was detected by satellite. It may be contained or outside populated areas.',
      action: 'Keep distance from the area and monitor the news; avoid the hotspot if you see smoke.',
    };
  return {
    meaning: 'Satellite data confirms a fire in the area.',
    action: 'Avoid the affected area, follow evacuation instructions if issued, and do not attempt to approach.',
  };
}

function parseNumber(text: string): number | null {
  const m = text.replace(',', '.').match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

function describeEarthquake(e: SafetyEvent): EventCopy {
  const raw = parseNumber(e.headline.replace('M', '')) ?? null;
  const mag = raw;
  const region = e.headline.replace(/^M\d+(\.\d+)?\s*[—–-]\s*/, '').replace(/_/g, ' ').trim();
  const lv = mag != null ? earthquakeLevel(mag) : { label: 'Earthquake reported', action: 'Stay calm and be aware of official guidance.' };
  return {
    title: `Earthquake ${mag != null ? `M${mag}` : 'reported'}${region ? ` — ${region}` : ''}`,
    meaning: `Seismic event detected${mag != null ? ` of magnitude ${mag}` : ''}. Distance from you determines whether you feel it; most events recorded near Egypt are in neighbouring regions.`,
    action: lv.action,
  };
}

function describeWeather(e: SafetyEvent): EventCopy {
  const head = e.headline;
  const city = (e.city ?? '').replace(/_/g, ' ').trim();

  if (/uv/i.test(head)) {
    const uv = parseNumber(head);
    const lv = uv != null ? uvLevel(uv) : { label: 'UV level', action: 'Wear sun protection when outdoors.' };
    return {
      title: `High UV (${uv != null ? Math.round(uv) : '—'})${city ? ` in ${city}` : ''}`,
      meaning: `The UV index is ${uv != null ? Math.round(uv) : 'elevated'} — strong sunlight exposure can burn skin quickly.`,
      action: lv.action,
    };
  }

  if (/aqi|pm/i.test(head)) {
    const aqi = parseNumber(head.replace(/pm\d?\.?\d?:?/i, ''));
    const lv = aqi != null ? aqiLevel(aqi) : { label: 'Air quality', meaning: 'Air quality signal received from local sensors.' };
    return {
      title: `Air quality: ${lv.label}${city ? ` (${city})` : ''}`,
      meaning: lv.meaning,
      action: lv.label === 'Good' ? 'No precautions needed.' : 'Limit heavy outdoor exercise if you are sensitive to pollution.',
    };
  }

  const temp = parseNumber(head);
  if (temp != null && /c/i.test(head)) {
    const lv = tempLevel(temp);
    return {
      title: `${lv.label} — ${Math.round(temp)}°C${city ? ` in ${city}` : ''}`,
      meaning: `Local temperature is about ${Math.round(temp)}°C.`,
      action: lv.action,
    };
  }

  return {
    title: head.charAt(0).toUpperCase() + head.slice(1),
    meaning: 'Weather signal reported for this area.',
    action: 'Stay aware of the forecast before heading out.',
  };
}

function describeFire(e: SafetyEvent): EventCopy {
  const m = e.headline.match(/confidence\s*(\d+)/i);
  const conf = m ? parseInt(m[1], 10) : null;
  const lv = conf != null ? fireConfidence(conf) : { meaning: 'A fire signal was detected near the area.', action: 'Keep clear and follow local instructions.' };
  return {
    title: conf != null && conf < 30 ? 'Heat signature flagged' : 'Fire detected',
    meaning: lv.meaning,
    action: lv.action,
  };
}

function describeUnrest(e: SafetyEvent): EventCopy {
  const title = e.headline.replace(/\(Last Updated[^)]*\)/g, '').replace(/\([^)]*\)/g, '').trim();
  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    meaning:
      e.severity === 'critical'
        ? 'A serious incident or conflict-related report was published. Check whether it concerns your exact area before changing plans.'
        : 'A news or advisory report is being monitored. Not necessarily a direct threat to tourists.',
    action:
      e.severity === 'critical'
        ? 'Avoid affected districts, keep your embassy number saved, and follow official guidance.'
        : 'No immediate action needed; stay informed through local news.',
  };
}

/** Turns a raw engine event into plain language a traveler understands. */
export function describeEvent(e: SafetyEvent): EventCopy {
  switch (e.category) {
    case 'seismic':
      return describeEarthquake(e);
    case 'weather':
      return describeWeather(e);
    case 'fire':
      return describeFire(e);
    case 'unrest':
    case 'advisory':
      return describeUnrest(e);
    case 'crime':
      return {
        title: e.headline.charAt(0).toUpperCase() + e.headline.slice(1),
        meaning: 'A safety incident was reported in the area.',
        action: 'Stay alert, avoid isolated spots at night, and keep valuables out of sight.',
      };
    case 'flood':
      return {
        title: e.headline.charAt(0).toUpperCase() + e.headline.slice(1),
        meaning: 'Flood or water-related risk reported nearby.',
        action: 'Avoid flooded streets and underpasses; never drive through standing water.',
      };
    case 'health':
      return {
        title: e.headline.charAt(0).toUpperCase() + e.headline.slice(1),
        meaning: 'A health-related advisory was published for the area.',
        action: 'Follow local health advice; keep water bottles sealed and practice good hygiene.',
      };
    default:
      return {
        title: e.headline.charAt(0).toUpperCase() + e.headline.slice(1),
        meaning: `A ${pickTitle(e.source)} signal was reported for this area.`,
        action: 'No action needed unless marked critical — stay aware.',
      };
  }
}

export interface RiskMeaning {
  label: string;
  meaning: string;
  action: string;
  color: string;
}

/** What each travel status actually means for the traveler. */
export function riskMeaning(
  status: string | null,
  colorMap: { safe: string; caution: string; warning: string; critical?: string }
): RiskMeaning {
  switch (status) {
    case 'critical':
      return {
        label: 'Critical',
        meaning: 'A serious, active threat is reported in this area — travel is not advised right now.',
        action: 'Avoid the area, follow official evacuation or security guidance, and contact emergency services if needed.',
        color: colorMap.critical ?? colorMap.warning,
      };
    case 'warning':
      return {
        label: 'Warning',
        meaning: 'An active threat is reported in this area — conditions need attention.',
        action: 'Postpone non-essential visits, follow official guidance, and keep SOS reachable.',
        color: colorMap.warning,
      };
    case 'caution':
      return {
        label: 'Caution',
        meaning: 'Some elevated signals nearby — general areas remain usable.',
        action: 'Stay on main routes, avoid isolated areas at night, and keep valuables hidden.',
        color: colorMap.caution,
      };
    default:
      return {
        label: 'Safe',
        meaning: 'No significant safety signals in this area right now.',
        action: 'Proceed normally with standard traveler awareness.',
        color: colorMap.safe,
      };
  }
}

/** Renders a human-friendly label for a severity level. */
export function severityCopy(severity: SafetyEvent['severity']): { label: string; hint: string } {
  switch (severity) {
    case 'critical':
      return { label: 'Critical', hint: 'Active threat — take action now' };
    case 'warning':
      return { label: 'Warning', hint: 'Confirmed risk — stay alert' };
    case 'advisory':
      return { label: 'Advisory', hint: 'Elevated signal — be aware' };
    default:
      return { label: 'Notice', hint: 'Informational — no action needed' };
  }
}

/** Groups near-identical engine rows (e.g. 8x "Fire hotspot confidence 0%") into one card. */
export function dedupeEvents(events: SafetyEvent[]): { event: SafetyEvent; count: number }[] {
  const groups = new Map<string, { event: SafetyEvent; count: number }>();
  for (const e of events) {
    const stem = e.headline
      .replace(/confidence\s*\d+%/i, 'confidence {n}%')
      .replace(/[\d.]+/g, '{n}')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    const key = `${e.category}|${e.severity}|${e.source}|${stem}`;
    const existing = groups.get(key);
    if (existing) existing.count += 1;
    else groups.set(key, { event: e, count: 1 });
  }
  return Array.from(groups.values());
}
