'use client';

import React, { useState } from 'react';
import { MapPin, Ticket, Clock, ExternalLink, ChevronRight } from 'lucide-react';
import { C } from '@/lib/constants/theme';
import type { Monument } from '@/services/monumentsService';

const priceCell = (v: number | null | undefined) => (v != null ? `LE ${v}` : 'N/A');

const CATEGORY_EMOJI: Record<string, string> = {
  archaeological: '🏛️',
  islamic: '🕌',
  christian: '⛪',
  infrastructure: '🏗️',
};

const CATEGORY_GRADIENT: Record<string, string> = {
  archaeological: 'linear-gradient(135deg, rgba(217,119,6,0.38), rgba(217,119,6,0.06))',
  islamic: 'linear-gradient(135deg, rgba(16,185,129,0.34), rgba(16,185,129,0.05))',
  christian: 'linear-gradient(135deg, rgba(59,130,246,0.34), rgba(59,130,246,0.05))',
  infrastructure: 'linear-gradient(135deg, rgba(139,92,246,0.34), rgba(139,92,246,0.05))',
};

const categoryGradient = (cat: string) =>
  CATEGORY_GRADIENT[cat.toLowerCase()] || 'linear-gradient(135deg, rgba(140,120,90,0.34), rgba(140,120,90,0.05))';
const categoryEmoji = (cat: string) => CATEGORY_EMOJI[cat.toLowerCase()] || '🎫';

interface MonumentCardProps {
  m: Monument;
  onSelect?: () => void;
}

export function MonumentCard({ m, onSelect }: MonumentCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const hours: { label: string; value?: string | null }[] = [
    { label: 'Summer', value: m.opening_hours?.summer },
    { label: 'Winter', value: m.opening_hours?.winter },
    { label: 'Ramadan', value: m.opening_hours?.ramadan },
  ].filter((h) => !!h.value);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.();
        }
      }}
      style={{
        width: '100%',
        minWidth: 0,
        flexShrink: 0,
        flexGrow: 0,
        textAlign: 'left',
        background: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(27,26,23,0.1)',
        boxShadow: '0 1px 8px rgba(27,26,23,0.06)',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'all 0.18s',
        display: 'block',
      }}
    >
      {/* Image header */}
      <div style={{ position: 'relative', width: '100%', height: 170, flexShrink: 0, background: C.limestoneDark }}>
        {m.images?.[0] && !imgFailed ? (
          <img src={m.images[0]} alt={m.title} loading="lazy" onError={() => setImgFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: categoryGradient(m.category) }}>
            <span style={{ fontSize: 44, lineHeight: 1, opacity: 0.9 }}>{categoryEmoji(m.category)}</span>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 45%,rgba(27,26,23,0.4) 100%)' }} />
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '10px',
              fontWeight: 600,
              color: C.limestone,
              background: 'rgba(27,26,23,0.55)',
              backdropFilter: 'blur(4px)',
              padding: '3px 8px',
              borderRadius: 99,
              textTransform: 'capitalize',
            }}
          >
            {m.category || 'Monument'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 16px 15px' }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontWeight: 600, lineHeight: 1.15, color: C.nile }}>
          {m.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#8B7E6A', margin: '7px 0 12px' }}>
          <MapPin size={12} color={C.copper} strokeWidth={2} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 500 }}>
            {[m.city, m.governorate].filter(Boolean).join(' · ') || 'Egypt'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Ticket size={13} color={C.solar} strokeWidth={2.5} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 700, color: C.solar }}>
            Tickets available
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontFamily: "'Inter',sans-serif", color: '#6B6354' }}>Egyptian</span>
            <span style={{ fontFamily: "'Inter',sans-serif", color: C.nile, fontWeight: 600 }}>
              adult {priceCell(m.prices.egyptian?.adult)} · student {priceCell(m.prices.egyptian?.student)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontFamily: "'Inter',sans-serif", color: '#6B6354' }}>Foreigner</span>
            <span style={{ fontFamily: "'Inter',sans-serif", color: C.nile, fontWeight: 600 }}>
              adult {priceCell(m.prices.foreigner?.adult)} · student {priceCell(m.prices.foreigner?.student)}
            </span>
          </div>
        </div>

        {hours.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {hours.map((h) => (
              <div key={h.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11.5px', color: '#6B6354' }}>
                <Clock size={11} color="#A89880" style={{ flexShrink: 0 }} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, minWidth: 58 }}>{h.label}:</span>
                <span style={{ fontFamily: "'Inter',sans-serif" }}>{h.value}</span>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            marginTop: 10,
            paddingTop: 9,
            borderTop: '1px solid rgba(27,26,23,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {m.url ? (
            <a
              href={m.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                color: C.solar,
                fontFamily: "'Inter',sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Buy tickets <ExternalLink size={11} />
            </a>
          ) : (
            <span />
          )}
          {onSelect && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                color: '#8B7E6A',
                fontFamily: "'Inter',sans-serif",
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              View details <ChevronRight size={12} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}