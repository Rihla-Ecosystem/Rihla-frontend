'use client';

import React from 'react';
import { C } from '@/lib/constants/theme';
import { MapPin } from 'lucide-react';
import { Glyph } from '@/app/components/atoms';

export default function EmergencyRightColumn({
  locShared,
  setLocShared,
  setRafiq,
}: {
  locShared: boolean;
  setLocShared: (v: boolean) => void;
  setRafiq: (v: boolean) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        style={{
          background: `linear-gradient(145deg,#0F2A1A,#0A1E12)`,
          border: `1px solid ${C.safeGreen}25`,
          borderRadius: 16,
          padding: '18px 20px',
        }}
      >
        <div
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontStyle: 'italic',
            fontSize: '14px',
            color: `${C.limestone}80`,
            lineHeight: 1.7,
            marginBottom: 10,
          }}
        >
          'Stay calm. Egypt has well-trained Tourist Police available at every major site. You are
          not alone.'
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4caf50' }} />
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              color: '#4caf50',
            }}
          >
            Rafiq is monitoring your location
          </span>
        </div>
      </div>

      <div
        style={{
          background: '#141210',
          border: `1px solid ${C.limestone}10`,
          borderRadius: 16,
          padding: '18px',
          flex: 0,
        }}
      >
        <div
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: '10px',
            fontWeight: 700,
            color: `${C.limestone}40`,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          Essential Arabic · Say it now
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { arabic: 'مساعدة', romanised: "mosa'ada", meaning: 'Help!' },
            { arabic: 'الشرطة', romanised: 'el-shurta', meaning: 'Police' },
            { arabic: 'مستشفى', romanised: 'mustashfa', meaning: 'Hospital' },
            { arabic: 'لا شكرا', romanised: 'la shukran', meaning: 'No thank you' },
            { arabic: 'أين أنا؟', romanised: 'ayna ana?', meaning: 'Where am I?' },
          ].map((p, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                padding: '10px 0',
                borderBottom: i < 4 ? `1px solid ${C.limestone}07` : 'none',
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: '20px',
                    color: '#ffb300',
                    direction: 'rtl',
                    marginBottom: 2,
                  }}
                >
                  {p.arabic}
                </div>
                <div
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '11px',
                    color: `${C.limestone}35`,
                    fontStyle: 'italic',
                  }}
                >
                  {p.romanised}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '13px',
                  fontWeight: 600,
                  color: `${C.limestone}70`,
                }}
              >
                {p.meaning}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: '#141210',
          border: `1px solid ${C.limestone}10`,
          borderRadius: 14,
          padding: '16px 18px',
        }}
      >
        <div
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: '10px',
            fontWeight: 700,
            color: `${C.limestone}40`,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Your Location
        </div>
        <div
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            color: C.limestone,
            marginBottom: 4,
          }}
        >
          Giza Plateau, Cairo
        </div>
        <div
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: '12px',
            color: `${C.limestone}40`,
            marginBottom: 12,
          }}
        >
          30.0280° N, 31.1325° E · Accuracy: ±8m
        </div>
        <div
          style={{
            background: `${C.limestone}06`,
            borderRadius: 10,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, opacity: 0.08 }}>
            <img src="/placeholder.svg" width="200" alt="" style={{ opacity: 1 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <MapPin size={20} color={C.signalRed} strokeWidth={2.5} />
            <span
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '10px',
                color: `${C.limestone}40`,
              }}
            >
              Map unavailable offline
            </span>
          </div>
        </div>
        <button
          onClick={() => setLocShared(true)}
          style={{
            width: '100%',
            background: locShared ? `${C.safeGreen}15` : C.signalRed,
            border: `1.5px solid ${locShared ? C.safeGreen : C.signalRed}`,
            borderRadius: 9,
            padding: '10px 16px',
            fontFamily: "'Inter',sans-serif",
            fontSize: '13px',
            fontWeight: 700,
            color: locShared ? '#4caf50' : '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            transition: 'all 0.2s',
          }}
        >
          <MapPin size={14} strokeWidth={2.5} />
          {locShared ? 'Location shared ✓' : 'Share my location'}
        </button>
      </div>

      <div
        style={{
          background: `linear-gradient(135deg,${C.nile},${C.nileMid})`,
          borderRadius: 14,
          padding: '16px 18px',
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
          <Glyph size={20} light />
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              color: `${C.limestone}70`,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Rafiq Emergency
          </span>
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontStyle: 'italic',
            fontSize: '13px',
            color: `${C.limestone}70`,
            lineHeight: 1.6,
            marginBottom: 12,
          }}
        >
          Describe what's happening. Rafiq will guide you and can alert the nearest Tourist Police
          station.
        </div>
        <div
          style={{
            background: `${C.limestone}10`,
            border: `1px solid ${C.limestone}18`,
            borderRadius: 9,
            padding: '10px 14px',
            display: 'flex',
            gap: 10,
          }}
        >
          <input
            placeholder="Describe the emergency…"
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              flex: 1,
              fontFamily: "'Inter',sans-serif",
              fontSize: '13px',
              color: C.limestone,
            }}
          />
          <button
            style={{
              background: '#8e24aa',
              border: 'none',
              borderRadius: 7,
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <div style={{ width: 12, height: 12, background: '#fff', borderRadius: 2 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
