'use client';

import React from 'react';
import { C } from '@/lib/constants/theme';
import { Navigation, Ticket, ExternalLink, Star, X, AlertTriangle, MapPin, Compass, Sparkles } from 'lucide-react';
import type { RihlaSite } from '@/app/data/rihla-data';
import type { Monument } from '@/services/monumentsService';
import type { SafetyData } from '@/services/safetyService';
import { SafetyInsight } from './SafetyInsight';

interface SitePopupProps {
  site: RihlaSite;
  monument: Monument | null;
  distanceKm?: number | null;
  bottomOffset?: number;
  saved?: boolean;
  onClose: () => void;
  onDirections: () => void;
  onTickets: () => void;
  onDetails: () => void;
  onToggleSave?: () => void;
  onRafiq?: () => void;
  safetyData?: SafetyData | null;
  safetySource?: 'live' | 'offline' | null;
}

const CATEGORY_EMOJI: Record<string, string> = {
  archaeological: '🏛️',
  islamic: '🕌',
  christian: '⛪',
  museum: '🏛️',
  temple: '🏛️',
  market: '🛍️',
};

export function SitePopup({
  site,
  monument,
  distanceKm,
  bottomOffset = 16,
  saved = false,
  onClose,
  onDirections,
  onTickets,
  onDetails,
  onToggleSave,
  onRafiq,
  safetyData = null,
  safetySource = null,
}: SitePopupProps) {
  const rating = site.rating > 0 ? site.rating : null;
  const hasTickets = !!monument?.url;
  const catEmoji = CATEGORY_EMOJI[site.cat?.toLowerCase()] ?? '📍';
  const dist =
    distanceKm != null && !Number.isNaN(distanceKm)
      ? distanceKm < 1
        ? `${Math.round(distanceKm * 1000)} m`
        : `${distanceKm.toFixed(1)} km`
      : null;

  const prices = monument?.prices;
  const hasPriceGrid = Boolean(
    prices &&
      (prices.foreigner?.adult != null ||
        prices.foreigner?.student != null ||
        prices.egyptian?.adult != null ||
        prices.egyptian?.student != null)
  );

  return (
    <div
      style={{
        position: 'absolute',
        bottom: bottomOffset,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1200,
        width: 'min(560px, calc(100% - 24px))',
        background: 'rgba(255, 255, 255, 0.97)',
        backdropFilter: 'blur(10px)',
        borderRadius: 16,
        border: '1px solid rgba(27,26,23,0.12)',
        boxShadow: '0 12px 36px rgba(20,16,8,0.22)',
        padding: 0,
        overflow: 'hidden',
        animation: 'fadeInUp 0.25s ease-out',
      }}
    >
      <div style={{ display: 'flex', gap: 14, padding: '14px 16px' }}>
        {/* Thumb */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 12,
            overflow: 'hidden',
            background: C.limestoneDark,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {site.img ? (
            <img src={site.img} alt={site.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 30 }}>{catEmoji}</span>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '19px', fontWeight: 600, color: C.nile, lineHeight: 1.15, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {site.name}
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', color: '#8B7E6A', marginTop: 2 }}>
                {site.cat} · {site.gov || 'Egypt'}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A89880', padding: 2, flexShrink: 0 }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
            {rating && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 700, color: C.sand }}>
                <Star size={12} fill={C.sand} strokeWidth={0} /> {rating.toFixed(1)}
              </span>
            )}
            {dist && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#6B6354' }}>
                <MapPin size={11} /> {dist} away
              </span>
            )}
            {site.scam && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: `${C.alertAmber}1a`, color: C.alertAmber, fontSize: '10px', fontWeight: 700, borderRadius: 99, padding: '2px 8px' }}>
                <AlertTriangle size={9} strokeWidth={2.5} /> Scam alert
              </span>
            )}
            {monument?.prices?.foreigner?.adult != null && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 700, color: C.copper }}>
                <Ticket size={11} /> LE {monument.prices.foreigner.adult}
              </span>
            )}
          </div>

          {/* Price grid */}
          {hasPriceGrid && (
            <div
              style={{
                marginTop: 10,
                border: '1px solid rgba(15,61,62,0.14)',
                borderRadius: 10,
                overflow: 'hidden',
                background: '#FBFAF6',
              }}
            >
              <PriceGridRow
                label="Foreigner"
                adult={prices!.foreigner?.adult ?? null}
                student={prices!.foreigner?.student ?? null}
              />
              <PriceGridRow
                label="Egyptian"
                adult={prices!.egyptian?.adult ?? null}
                student={prices!.egyptian?.student ?? null}
              />
            </div>
          )}
        </div>
      </div>

      <SafetyInsight
        data={safetyData}
        source={safetySource}
        bestTime={site.bestTime}
        tips={site.tips}
      />

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 14px' }}>
        <button onClick={onDirections} style={actionStyle(C.nile, '#FFFFFF')}>
          <Navigation size={14} strokeWidth={2.4} /> Directions
        </button>
        {hasTickets && (
          <button onClick={onTickets} style={actionStyle(C.copper, '#FFFFFF')}>
            <Ticket size={14} strokeWidth={2.4} /> Tickets
          </button>
        )}
        <button
          onClick={onDetails}
          style={{
            ...actionStyle('transparent', C.nile),
            border: `1.5px solid rgba(15,61,62,0.25)`,
            flex: 1,
          }}
        >
          <Compass size={14} strokeWidth={2.4} /> Details
          <ExternalLink size={11} style={{ opacity: 0.7 }} />
        </button>
      </div>

      {/* Secondary row: Rafiq + Save */}
      {(onRafiq || onToggleSave) && (
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 14px' }}>
          {onRafiq && (
            <button
              onClick={onRafiq}
              style={{
                ...actionStyle('transparent', C.nile),
                border: `1.5px solid rgba(15,61,62,0.25)`,
              }}
            >
              <Sparkles size={14} strokeWidth={2.2} /> Ask Rafiq
            </button>
          )}
          {onToggleSave && (
            <button
              onClick={onToggleSave}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: saved ? `${C.solar}14` : 'transparent',
                color: saved ? '#B23A2E' : '#6B6354',
                border: `1.5px solid ${saved ? C.solar : 'rgba(27,26,23,0.18)'}`,
                borderRadius: 10,
                padding: '9px 12px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Star size={14} fill={saved ? C.solar : 'none'} strokeWidth={2} /> {saved ? 'Saved' : 'Save'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PriceGridRow({ label, adult, student }: { label: string; adult: number | null; student: number | null }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '5px 10px' }}>
      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, color: '#8B7E6A' }}>{label}</span>
      <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {adult != null && (
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', color: '#4A4438' }}>Adult <b>LE {adult}</b></span>
        )}
        {student != null && (
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', color: '#4A4438' }}>Student <b>LE {student}</b></span>
        )}
      </span>
    </div>
  );
}

function actionStyle(bg: string, color: string): React.CSSProperties {
  return {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    background: bg,
    color,
    border: 'none',
    borderRadius: 10,
    padding: '9px 12px',
    fontFamily: "'Inter',sans-serif",
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };
}
