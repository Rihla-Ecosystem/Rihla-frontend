'use client';

import { useRouter } from 'next/navigation';
import { Glyph } from '@/app/components/atoms';
import { C } from '@/lib/constants/theme';
import { Sparkles } from 'lucide-react';
import { buildRafiqUrl, contextualLabel, type RafiqContext } from '@/lib/rafiq';

type Variant = 'primary' | 'ghost' | 'card';
type Size = 'sm' | 'md';

interface AskRafiqButtonProps {
  context: RafiqContext;
  label?: string;
  variant?: Variant;
  size?: Size;
  icon?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onOpen?: () => void;
}

export function AskRafiqButton({
  context,
  label,
  variant = 'primary',
  size = 'md',
  icon = true,
  className = '',
  style = {},
  onOpen,
}: AskRafiqButtonProps) {
  const router = useRouter();
  const buttonLabel = label ?? contextualLabel(context);
  const url = buildRafiqUrl(context);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpen?.();
    router.push(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as unknown as React.MouseEvent);
    }
  };

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    fontFamily: "'Inter',sans-serif",
    fontWeight: 600,
    transition: 'all 0.15s',
    textDecoration: 'none',
    ...style,
  };

  const variantStyles: Record<Variant, React.CSSProperties> = {
    primary: {
      background: `linear-gradient(135deg,${C.nile},${C.nileMid})`,
      color: C.limestone,
      boxShadow: `0 2px 8px ${C.nile}30`,
    },
    ghost: {
      background: 'transparent',
      color: C.nile,
      border: `1.5px solid ${C.nile}40`,
    },
    card: {
      background: C.limestone,
      color: C.nile,
      border: `1px solid rgba(27,26,23,0.08)`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    },
  };

  const sizeStyles: Record<Size, React.CSSProperties> = {
    sm: { fontSize: '12px', padding: '7px 12px' },
    md: { fontSize: '13px', padding: '9px 16px' },
  };

  const mergedStyle = { ...baseStyle, ...variantStyles[variant], ...sizeStyles[size] };

  return (
    <span
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={mergedStyle}
      className={className}
      aria-label={buttonLabel}
      role="button"
      tabIndex={0}
    >
      {icon && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <Glyph size={size === 'sm' ? 14 : 16} light />
        </span>
      )}
      <span>{buttonLabel}</span>
      {icon && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <Sparkles size={size === 'sm' ? 12 : 14} strokeWidth={2} color={variant === 'primary' ? C.limestone : C.nile} />
        </span>
      )}
    </span>
  );
}