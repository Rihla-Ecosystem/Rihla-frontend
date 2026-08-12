'use client';

import React, { useCallback, useState } from 'react';
import { C } from '@/lib/constants/theme';
import { EMERGENCY_NUMBERS } from '@/app/data/safety-data';
import { useLocation } from '@/providers/LocationProvider';
import { incidentReportService } from '@/services/incidentReportService';

export default function EmergencyContacts({
  called,
  setCalled,
}: {
  called: string | null;
  setCalled: (s: string | null) => void;
}) {
  const { lat, lon } = useLocation();
  const [sosStatus, setSosStatus] = useState<'idle' | 'calling' | 'sent'>('idle');
  const [sosError, setSosError] = useState<string | null>(null);

  const dial = useCallback((label: string, num: string) => {
    setCalled(`${label} · ${num}`);
    setSosStatus('idle');
    setSosError(null);
    if (typeof window !== 'undefined') {
      window.location.href = `tel:${num}`;
    }
  }, [setCalled]);

  const pressSos = useCallback(async () => {
    setCalled('Tourist Police · 126');
    setSosStatus('calling');
    setSosError(null);
    if (typeof window !== 'undefined') {
      window.location.href = 'tel:126';
    }
    try {
      await incidentReportService.create({
        type: 'SAFETY',
        severity: 'CRITICAL',
        description: 'SOS activated from the emergency page — user requested tourist police assistance.',
        lat: lat ?? undefined,
        lng: lon ?? undefined,
        relatedSiteName: undefined,
      });
      setSosStatus('sent');
    } catch (err: any) {
      console.warn('SOS report submission failed:', err);
      setSosStatus('idle');
      setSosError('Could not log your SOS report. Call Tourist Police directly on 126.');
    }
  }, [lat, lon, setCalled]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          background: `linear-gradient(160deg,#1A0808,#2A0C0C)`,
          border: `1.5px solid ${C.signalRed}35`,
          borderRadius: 20,
          padding: '28px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: '10px',
            fontWeight: 700,
            color: `${C.signalRed}70`,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          Emergency SOS
        </div>
        <button
          onClick={pressSos}
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: called
              ? `${C.safeGreen}20`
              : `linear-gradient(135deg,${C.signalRed},#8B1E18)`,
            border: `4px solid ${called ? '#4caf50' : C.signalRed}60`,
            boxShadow: called
              ? `0 0 0 12px #4caf5015`
              : `0 0 0 12px ${C.signalRed}20, 0 0 40px ${C.signalRed}30`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            cursor: 'pointer',
            margin: '0 auto 20px',
            transition: 'all 0.3s',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: called ? '#4caf50' : '#fff',
            }}
          />
        </button>
        {called ? (
          <div>
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                color: sosStatus === 'sent' ? '#4caf50' : '#4caf50',
                marginBottom: 4,
              }}
            >
              {sosStatus === 'sent' ? 'SOS logged & calling 126' : `Calling ${called}`}
            </div>
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '12px',
                color: `${C.limestone}40`,
              }}
            >
              {sosStatus === 'sent'
                ? 'Your critical report was logged and your location shared automatically'
                : 'Your location has been shared automatically'}
            </div>
            {sosError && (
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '11px',
                  color: '#ffb300',
                  marginTop: 6,
                }}
              >
                {sosError}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: '16px',
                fontWeight: 500,
                color: C.limestone,
                marginBottom: 4,
              }}
            >
              Press to call Tourist Police
            </div>
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '12px',
                color: `${C.limestone}40`,
              }}
            >
              Shares your GPS location automatically
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          background: '#141210',
          border: `1px solid ${C.limestone}10`,
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '14px 18px 10px', borderBottom: `1px solid ${C.limestone}08` }}>
          <div
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '10px',
              fontWeight: 700,
              color: `${C.limestone}40`,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            Emergency Contacts · Egypt
          </div>
        </div>
        {EMERGENCY_NUMBERS.map((e, i) => (
          <button
            key={e.label}
            onClick={() => dial(e.label, e.num)}
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr auto',
              gap: 12,
              padding: '13px 18px',
              alignItems: 'center',
              background: called === `${e.label} · ${e.num}` ? `${e.color}15` : 'transparent',
              border: 'none',
              borderBottom:
                i < EMERGENCY_NUMBERS.length - 1 ? `1px solid ${C.limestone}06` : 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              transition: 'background 0.15s',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `${e.color}15`,
                border: `1px solid ${e.color}25`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: e.color,
                flexShrink: 0,
              }}
            >
              {e.icon}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '13px',
                  fontWeight: 700,
                  color: C.limestone,
                  marginBottom: 2,
                }}
              >
                {e.label}
              </div>
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '11px',
                  color: `${C.limestone}40`,
                }}
              >
                {e.sub}
              </div>
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: '20px',
                fontWeight: 600,
                color: e.color,
              }}
            >
              {e.num}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
