'use client';

import React, { useState } from 'react';
import { Navigation, MapPin, Ticket, CheckSquare, Square, ExternalLink, AlertTriangle } from 'lucide-react';
import { C } from '@/lib/constants/theme';
import type { RihlaSite } from '@/app/data/rihla-data';
import type { Monument } from '@/services/monumentsService';
import type { AppUnits } from '@/lib/settingsStore';

interface ExploreSiteCardProps {
  site: RihlaSite;
  distanceKm?: number | null;
  units?: AppUnits;
  selected: boolean;
  selectable: boolean;
  selectedForTrip: boolean;
  onToggleSelect: () => void;
  onSelect: () => void;
  onDirections: () => void;
  ticket: Monument | null;
}

export function formatDistanceKm(km: number | null | undefined, units: AppUnits = 'metric'): string {
  if (km == null || Number.isNaN(km)) return '';
  if (units === 'imperial') {
    const mi = km * 0.621371;
    if (mi < 0.1) return `${Math.round(mi * 1609.344)} ft`;
    return `${mi.toFixed(1)} mi`;
  }
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

const priceCell = (v: number | null | undefined) =>
  v != null ? `LE ${v}` : 'N/A';

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

const categoryEmoji = (cat: string) => CATEGORY_EMOJI[cat.toLowerCase()] || '📍';
const categoryGradient = (cat: string) => CATEGORY_GRADIENT[cat.toLowerCase()] || 'linear-gradient(135deg, rgba(140,120,90,0.34), rgba(140,120,90,0.05))';

const CATEGORY_ACCENT: Record<string, string> = {
  archaeological: '#d97706',
  islamic: '#059669',
  christian: '#2563eb',
  infrastructure: '#7c3aed',
};
const categoryAccent = (cat: string) => CATEGORY_ACCENT[cat.toLowerCase()] || '#a16207';

export function ExploreSiteCard({
  site,
  distanceKm,
  units = 'metric',
  selected,
  selectable,
  selectedForTrip,
  onToggleSelect,
  onSelect,
  onDirections,
  ticket,
}: ExploreSiteCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
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
        border: selected ? `1.5px solid ${C.solar}` : '1px solid rgba(27,26,23,0.1)',
        boxShadow: selected ? `0 0 0 3px ${C.solar}18` : '0 1px 8px rgba(27,26,23,0.06)',
        cursor: 'pointer',
        transition: 'all 0.18s',
        display: 'block',
      }}
    >
      {/* Image header */}
      <div style={{ position: 'relative', width: '100%', height: 172, flexShrink: 0, background: C.limestoneDark }}>
        {site.img && !imgFailed ? (
          <img
            src={site.img}
            alt={site.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              background: categoryGradient(site.cat),
            }}
          >
            <span style={{ fontSize: 58, lineHeight: 1, opacity: 0.9 }}>{categoryEmoji(site.cat)}</span>
          </div>
        )}
        {site.img && !imgFailed && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg,transparent 40%,rgba(27,26,23,0.45) 100%)',
            }}
          />
        )}

        {/* Category badge */}
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              color: C.limestone,
              background: 'rgba(27,26,23,0.55)',
              backdropFilter: 'blur(4px)',
              padding: '4px 10px',
              borderRadius: 99,
              textTransform: 'capitalize',
            }}
          >
            {site.cat}
          </span>
        </div>

        {/* Trip checkbox */}
        {selectable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
            title="Add to trip"
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: selectedForTrip ? C.solar : 'rgba(255,255,255,0.9)',
              border: `1.5px solid ${selectedForTrip ? C.solar : 'rgba(27,26,23,0.15)'}`,
              borderRadius: 10,
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              color: selectedForTrip ? '#FFFFFF' : '#6B6354',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
          >
            {selectedForTrip ? <CheckSquare size={14} /> : <Square size={14} />}
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 700 }}>Trip</span>
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '16px 16px 15px' }}>
        {/* Title row: name + distance */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: '21px',
                fontWeight: 600,
                lineHeight: 1.15,
                color: C.nile,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={site.name}
            >
              {site.name}
            </div>
            {site.nameAr && (
              <div
                dir="rtl"
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontStyle: 'italic',
                  fontSize: '13px',
                  color: '#A89880',
                  marginTop: 1,
                }}
              >
                {site.nameAr}
              </div>
            )}
          </div>
          {distanceKm != null && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                flexShrink: 0,
                marginTop: 4,
                background: C.limestoneDark,
                borderRadius: 99,
                padding: '5px 11px',
              }}
            >
              <Navigation size={12} color={C.copper} strokeWidth={2.5} />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 600, color: C.nile }}>
                {formatDistanceKm(distanceKm, units)}
              </span>
            </div>
          )}
        </div>

        {/* Governorate */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#8B7E6A', marginTop: 7 }}>
          <MapPin size={12} color={C.copper} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 500 }}>
            {site.gov || 'Egypt'}
          </span>
        </div>

        {site.scam && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: `${C.alertAmber}12`,
              border: `1px solid ${C.alertAmber}25`,
              borderRadius: 99,
              padding: '3px 10px',
              marginTop: 9,
            }}
          >
            <AlertTriangle size={11} color={C.alertAmber} strokeWidth={2.5} />
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 600, color: C.alertAmber }}>
              Scam alert
            </span>
          </div>
        )}

        {/* Ticket price block */}
        {ticket && (
          <div style={{ marginTop: 12, background: `${C.solar}08`, border: `1px solid ${C.solar}25`, borderRadius: 12, padding: '11px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
              <Ticket size={13} color={C.solar} strokeWidth={2.5} />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 700, color: C.solar }}>
                Tickets available
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontFamily: "'Inter',sans-serif", color: '#6B6354' }}>Egyptian</span>
                <span style={{ fontFamily: "'Inter',sans-serif", color: C.nile, fontWeight: 600 }}>
                  adult {priceCell(ticket.prices.egyptian?.adult)} · student {priceCell(ticket.prices.egyptian?.student)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontFamily: "'Inter',sans-serif", color: '#6B6354' }}>Foreigner</span>
                <span style={{ fontFamily: "'Inter',sans-serif", color: C.nile, fontWeight: 600 }}>
                  adult {priceCell(ticket.prices.foreigner?.adult)} · student {priceCell(ticket.prices.foreigner?.student)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(27,26,23,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDirections();
            }}
            style={{
              background: '#EFF6FF',
              color: '#1D4ED8',
              border: 'none',
              borderRadius: 10,
              padding: '8px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              fontFamily: "'Inter',sans-serif",
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <Navigation size={13} /> Directions
          </button>
          {ticket?.url && (
            <a
              href={ticket.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                color: C.solar,
                fontFamily: "'Inter',sans-serif",
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Buy tickets <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
