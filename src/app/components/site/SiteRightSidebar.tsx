'use client';

import React from 'react';
import { C } from '@/lib/constants/theme';
import { Navigation } from 'lucide-react';

export default function SiteRightSidebar({
  site,
  saved,
  setSaved,
  setRafiq,
}: {
  site: any;
  saved: boolean;
  setSaved: (v: boolean) => void;
  setRafiq: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        position: 'sticky',
        top: 80,
        alignSelf: 'start',
      }}
    >
      <div
        style={{
          background: C.limestone,
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(27,26,23,0.07)',
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg,${C.nile},${C.nileMid})`,
            padding: '16px 18px',
          }}
        >
          <div
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '10px',
              fontWeight: 600,
              color: `${C.limestone}50`,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Plan your visit
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: '16px',
              fontWeight: 500,
              color: C.limestone,
            }}
          >
            {site.name}
          </div>
        </div>
        <div style={{ padding: '16px 18px' }}>
          {[
            { label: 'Opening hours', val: site.hours },
            { label: 'Admission', val: site.admission },
            { label: 'Suggested stay', val: site.duration },
            { label: 'Accessibility', val: site.accessibility },
            { label: 'Built', val: site.built },
            { label: 'Dynasty / Period', val: site.dynasty },
            { label: 'Governorate', val: site.gov },
          ].map(({ label, val }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '9px 0',
                borderBottom: '1px solid rgba(27,26,23,0.05)',
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#A89880',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 3,
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '13px',
                  fontWeight: 600,
                  color: C.nile,
                  lineHeight: 1.4,
                }}
              >
                {val}
              </span>
            </div>
          ))}
          <button
            style={{
              marginTop: 14,
              width: '100%',
              background: C.nile,
              border: 'none',
              borderRadius: 10,
              padding: '12px 16px',
              fontFamily: "'Inter',sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              color: C.limestone,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              boxShadow: `0 4px 16px ${C.nile}35`,
            }}
          >
            <Navigation size={15} strokeWidth={2.5} /> Get Directions
          </button>
        </div>
      </div>

      <div
        style={{
          background: C.limestone,
          borderRadius: 14,
          padding: '16px 18px',
          border: '1px solid rgba(27,26,23,0.07)',
        }}
      >
        <div
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: '10px',
            fontWeight: 600,
            color: '#A89880',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Safety Status
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: site.scam ? C.alertAmber : C.safeGreen,
              boxShadow: `0 0 0 4px ${site.scam ? C.alertAmber : C.safeGreen}25`,
            }}
          />
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              color: site.scam ? C.alertAmber : C.safeGreen,
            }}
          >
            {site.scam ? 'Caution' : 'Secure'}
          </span>
        </div>
        <div
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: '12px',
            color: '#8B7E6A',
            lineHeight: 1.55,
            marginBottom: 12,
          }}
        >
          {site.scam
            ? 'Active scam reports in this area. Stay on marked paths and decline unsolicited offers.'
            : 'No active safety alerts. Normal vigilance applies.'}
        </div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#A89880' }}>
          Tourist Police: <strong style={{ color: C.nile }}>126</strong>
        </div>
      </div>

      <button
        onClick={() => setRafiq(true)}
        style={{
          background: `linear-gradient(135deg,${C.nile},${C.nileMid})`,
          border: 'none',
          borderRadius: 14,
          padding: '16px 18px',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontStyle: 'italic',
            fontSize: '13px',
            color: `${C.limestone}80`,
            lineHeight: 1.55,
          }}
        >
          "When's the best time to visit? What should I not miss? Is it safe right now?"
        </div>
      </button>
    </div>
  );
}
