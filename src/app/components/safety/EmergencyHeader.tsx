'use client';

import React from 'react';
import { C } from '@/lib/constants/theme';
import { MapPin, ChevronLeft } from 'lucide-react';

export default function EmergencyHeader({
  goBack,
  locShared,
  setLocShared,
}: {
  goBack: () => void;
  locShared: boolean;
  setLocShared: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg,#1A0808,${C.signalRed}25,#0D0B09)`,
        borderBottom: `1px solid ${C.signalRed}25`,
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={goBack}
          style={{
            background: 'none',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: "'Inter',sans-serif",
            fontSize: '13px',
            fontWeight: 600,
            color: `${C.limestone}55`,
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={16} strokeWidth={2} /> Back to Safety
        </button>
        <div style={{ width: 1, height: 20, background: `${C.limestone}15` }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: C.signalRed,
              boxShadow: `0 0 0 4px ${C.signalRed}30`,
            }}
          />
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              color: C.signalRed,
              letterSpacing: '0.1em',
            }}
          >
            EMERGENCY MODE
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            background: locShared ? `${C.safeGreen}15` : `${C.limestone}08`,
            border: `1px solid ${locShared ? C.safeGreen : C.limestone}25`,
            borderRadius: 8,
            padding: '7px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            cursor: 'pointer',
          }}
          onClick={() => setLocShared(true)}
        >
          <MapPin size={13} color={locShared ? '#4caf50' : `${C.limestone}55`} strokeWidth={2} />
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '12px',
              fontWeight: 600,
              color: locShared ? '#4caf50' : `${C.limestone}55`,
            }}
          >
            {locShared ? 'Location shared' : 'Share location'}
          </span>
        </div>
        <div
          style={{
            background: `${C.limestone}08`,
            border: `1px solid ${C.limestone}15`,
            borderRadius: 8,
            padding: '7px 14px',
          }}
        >
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '12px',
              color: `${C.limestone}55`,
            }}
          >
            Giza Plateau, Cairo · 30°N 31°E
          </span>
        </div>
      </div>
    </div>
  );
}
