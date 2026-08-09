import {
  Activity,
  CloudRain,
  CloudSun,
  Flame,
  HeartPulse,
  Info,
  Megaphone,
  ShieldAlert,
  Waves,
  type LucideProps,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { EventCategory, EventSeverity } from '@/services/safetyService';
import { C } from '@/lib/constants/theme';

export const CATEGORY_ORDER: EventCategory[] = [
  'unrest',
  'crime',
  'weather',
  'fire',
  'flood',
  'seismic',
  'tsunami',
  'health',
  'advisory',
];

const ICONS: Record<EventCategory, (p: LucideProps) => ReactNode> = {
  seismic: (p) => <Activity {...p} />,
  weather: (p) => <CloudSun {...p} />,
  fire: (p) => <Flame {...p} />,
  flood: (p) => <CloudRain {...p} />,
  unrest: (p) => <Megaphone {...p} />,
  health: (p) => <HeartPulse {...p} />,
  crime: (p) => <ShieldAlert {...p} />,
  advisory: (p) => <Info {...p} />,
  tsunami: (p) => <Waves {...p} />,
};

const COLORS: Record<EventCategory, string> = {
  seismic: '#B8883A',
  weather: C.faience,
  fire: C.terracotta,
  flood: C.nile,
  unrest: C.signalRed,
  health: C.safeGreen,
  crime: C.alertAmber,
  advisory: C.copper,
  tsunami: C.nileMid,
};

const LABELS: Record<EventCategory, string> = {
  seismic: 'Seismic',
  weather: 'Weather',
  fire: 'Fire',
  flood: 'Flood',
  unrest: 'Unrest',
  health: 'Health',
  crime: 'Crime',
  advisory: 'Advisory',
  tsunami: 'Tsunami',
};

export function categoryMeta(category: string): {
  label: string;
  color: string;
  icon: (p: LucideProps) => ReactNode;
} {
  const key = (CATEGORY_ORDER as string[]).includes(category) ? (category as EventCategory) : 'advisory';
  return {
    label: LABELS[key],
    color: COLORS[key],
    icon: ICONS[key],
  };
}

export function severityLabel(severity: EventSeverity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

export function severityColor(severity: EventSeverity): string {
  if (severity === 'critical' || severity === 'warning') return C.signalRed;
  if (severity === 'advisory') return C.alertAmber;
  return C.faience;
}

/** Human "12m ago" / "2h ago" / "3d ago". */
export function relativeAge(iso: string | null | undefined): string {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '—';
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}