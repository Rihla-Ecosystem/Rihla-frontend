import type { CSSProperties, ReactNode } from 'react';
import { C } from '@/lib/constants/theme';

/** Shared tokens — single source for the most repeated safety/layout values. */
export const UI = {
  font: C.font,
  radius: C.radius,
  border: C.border,
  borderStrong: C.borderStrong,
  text: C.text,
  surface: C.surface,
};

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
}

/** Raised section card (limestone, 16px radius, hairline border). */
export function RihlaCard({ children, style }: CardProps) {
  return (
    <div
      style={{
        background: UI.surface.card,
        borderRadius: UI.radius.card,
        padding: 18,
        border: `1px solid ${UI.border}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Uppercase small-caps label used atop cards/sections. */
export function CardLabel({ children, accent, style }: { children: ReactNode; accent?: string; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontFamily: UI.font.sans,
        fontSize: 10,
        fontWeight: 600,
        color: accent ?? UI.text.muted,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        marginBottom: 14,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Colored severity/count pill. */
export function Pill({ color, bg, children, style }: { color: string; bg?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{
        fontFamily: UI.font.sans,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color,
        background: bg ?? `${color}10`,
        padding: '3px 9px',
        borderRadius: UI.radius.pill,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** Rounded colored square chip for icons. */
export function IconTile({
  color,
  bg,
  size = 30,
  radius,
  children,
  style,
}: {
  color: string;
  bg?: string;
  size?: number;
  radius?: number;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius ?? UI.radius.tile,
        background: bg ?? `${color}12`,
        color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** "What this means / What to do" pair used inside alert expansion. */
export function ExplanationRow({
  icon,
  color,
  iconBg,
  label,
  children,
}: {
  icon: ReactNode;
  color: string;
  iconBg?: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10 }}>
      <IconTile color={color} bg={iconBg ?? `${color}14`} size={18} radius={6} style={{ marginTop: 1 }}>
        {icon}
      </IconTile>
      <div>
        <div style={{ fontFamily: UI.font.sans, fontSize: 9.5, fontWeight: 700, color: UI.text.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontFamily: UI.font.sans, fontSize: 12.5, color: UI.text.body, lineHeight: 1.55 }}>{children}</div>
      </div>
    </div>
  );
}