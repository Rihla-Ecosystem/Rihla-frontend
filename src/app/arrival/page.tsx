'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { C } from '@/lib/constants/theme';
import { Glyph } from '@/app/components/atoms';
import {
  MapPin,
  Navigation,
  CreditCard,
  Shield,
  Wifi,
  CheckCircle,
  X,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

const WEB_TIPS = [
  {
    id: 'sim',
    color: C.faience,
    tag: 'SIM Card',
    icon: <Wifi size={20} strokeWidth={1.8} />,
    headline: 'Get your SIM from official booths only',
    body: 'At Cairo International Airport, head to the official Vodafone, Orange, Etisalat, or WE kiosks inside the arrivals hall. A tourist SIM with 20GB data costs ≈ EGP 120–180 (~$4).',
    checks: [
      { ok: true, t: 'Official Vodafone / Orange / Etisalat / WE booths' },
      { ok: true, t: 'Inside arrivals hall, past customs' },
      { ok: false, t: 'Men approaching you before baggage claim' },
      { ok: false, t: 'Booths outside the terminal building' },
    ],
  },
  {
    id: 'taxi',
    color: C.terracotta,
    tag: 'Transport',
    icon: <Navigation size={20} strokeWidth={1.8} />,
    headline: 'Use ride apps — never unlicensed taxis',
    body: 'Uber and Careem operate from Cairo Airport. A metered ride to Downtown Cairo is ≈ EGP 180–260 (~$6–9). White airport taxis use meters too.',
    checks: [
      { ok: true, t: 'Uber / Careem from the app (most reliable)' },
      { ok: true, t: 'White official airport taxis with meters' },
      { ok: false, t: "Men offering 'fixed price' outside arrivals" },
      { ok: false, t: 'Any car without a meter or app booking' },
    ],
  },
  {
    id: 'currency',
    color: C.copper,
    tag: 'Currency',
    icon: <CreditCard size={20} strokeWidth={1.8} />,
    headline: 'ATMs beat airport exchange counters',
    body: 'Use CIB or Banque Misr ATMs inside the terminal. Withdraw EGP directly. A fair rate today is ≈ 30–31 EGP per USD. Avoid exchanging more than you need.',
    checks: [
      { ok: true, t: 'CIB or Banque Misr ATMs inside terminal' },
      { ok: true, t: 'Visa / Mastercard widely accepted in hotels' },
      { ok: false, t: 'Airport exchange kiosks (worse rate)' },
      { ok: false, t: "Street money changers with 'great deals'" },
    ],
  },
  {
    id: 'rules',
    color: C.safeGreen,
    tag: 'First 24hrs',
    icon: <Shield size={20} strokeWidth={1.8} />,
    headline: 'Your first day: three golden rules',
    body: 'Egypt is safe and welcoming — a little preparation makes it effortless. Most tourist difficulties happen in the first few hours.',
    checks: [
      { ok: true, t: 'Keep passport and backup cash separate' },
      { ok: true, t: 'Screenshot your hotel address in Arabic' },
      { ok: true, t: 'Save Tourist Police number: 126' },
      { ok: false, t: "Don't accept unsolicited 'free' gifts or tours" },
    ],
  },
];

export default function ArrivalPage() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const tip = WEB_TIPS[idx];
  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 860 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: `${C.faience}15`,
              border: `1px solid ${C.faience}30`,
              borderRadius: 99,
              padding: '6px 16px 6px 10px',
              marginBottom: 20,
            }}
          >
            <MapPin size={12} color={C.faience} strokeWidth={2.5} />
            <span
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '11px',
                fontWeight: 600,
                color: C.faience,
                letterSpacing: '0.06em',
              }}
            >
              CAIRO INTERNATIONAL AIRPORT · CAI
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 'clamp(32px,5vw,52px)',
              fontWeight: 300,
              color: C.nile,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: 10,
            }}
          >
            Welcome to <span style={{ fontStyle: 'italic', color: C.terracotta }}>Egypt.</span>
          </h1>
          <p
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '16px',
              color: '#8B7E6A',
              lineHeight: 1.65,
            }}
          >
            Before you leave the airport, four things every smart traveler knows.
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            marginBottom: 28,
            flexWrap: 'wrap',
          }}
        >
          {WEB_TIPS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setIdx(i)}
              style={{
                background: i === idx ? C.nile : 'transparent',
                border: `1.5px solid ${i === idx ? C.nile : 'rgba(27,26,23,0.15)'}`,
                borderRadius: 99,
                padding: '8px 18px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                fontWeight: i === idx ? 600 : 400,
                color: i === idx ? C.limestone : '#6B6354',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t.tag}
            </button>
          ))}
        </div>
        <div
          style={{
            background: C.limestone,
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(15,61,62,0.10)',
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg,${tip.color}20,${tip.color}08)`,
              borderBottom: `1px solid ${tip.color}20`,
              padding: '28px 32px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 18,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: `${tip.color}20`,
                border: `1.5px solid ${tip.color}35`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tip.color,
                flexShrink: 0,
              }}
            >
              {tip.icon}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '10px',
                  fontWeight: 700,
                  color: tip.color,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                ◈ Arrival Tip · {tip.tag}
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 'clamp(18px,2.5vw,24px)',
                  fontWeight: 500,
                  color: C.nile,
                  lineHeight: 1.3,
                }}
              >
                {tip.headline}
              </div>
            </div>
          </div>
          <div
            style={{
              padding: '28px 32px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 32,
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '14px',
                  color: '#5C5346',
                  lineHeight: 1.8,
                  marginBottom: 20,
                }}
              >
                {tip.body}
              </p>
              <div
                style={{
                  background: `linear-gradient(135deg,${C.nile},${C.nileMid})`,
                  borderRadius: 13,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Glyph size={20} light />
                <div>
                  <div
                    style={{
                      fontFamily: "'Inter',sans-serif",
                      fontSize: '10px',
                      fontWeight: 600,
                      color: `${C.limestone}60`,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginBottom: 3,
                    }}
                  >
                    Ask Rafiq
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontStyle: 'italic',
                      fontSize: '13px',
                      color: C.limestone,
                      lineHeight: 1.4,
                    }}
                  >
                    "Which SIM plan is best for 10 days?"
                  </div>
                </div>
                <ChevronRight
                  size={15}
                  color={`${C.limestone}45`}
                  strokeWidth={2}
                  style={{ marginLeft: 'auto', flexShrink: 0 }}
                />
              </div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#A89880',
                  marginBottom: 14,
                }}
              >
                Quick reference
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tip.checks.map(({ ok, t }) => (
                  <div
                    key={t}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 13px',
                      background: ok ? `${C.safeGreen}08` : `${C.signalRed}06`,
                      borderRadius: 10,
                      border: `1px solid ${ok ? C.safeGreen : C.signalRed}18`,
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: ok ? `${C.safeGreen}20` : `${C.signalRed}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {ok ? (
                        <CheckCircle size={12} color={C.safeGreen} strokeWidth={2.5} />
                      ) : (
                        <X size={12} color={C.signalRed} strokeWidth={2.5} />
                      )}
                    </div>
                    <span
                      style={{
                        fontFamily: "'Inter',sans-serif",
                        fontSize: '13px',
                        color: ok ? '#3E5C3E' : '#6B2A24',
                        fontWeight: ok ? 500 : 400,
                      }}
                    >
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            style={{
              borderTop: '1px solid rgba(27,26,23,0.07)',
              padding: '20px 32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', gap: 6 }}>
              {WEB_TIPS.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setIdx(i)}
                  style={{
                    width: i === idx ? 20 : 7,
                    height: 7,
                    borderRadius: 99,
                    background: i === idx ? C.solar : C.limestoneDark,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                onClick={() => router.push('/app')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '13px',
                  color: '#A89880',
                  cursor: 'pointer',
                }}
              >
                Skip
              </button>
              {idx < WEB_TIPS.length - 1 ? (
                <button
                  onClick={() => setIdx(idx + 1)}
                  style={{
                    background: C.solar,
                    border: 'none',
                    borderRadius: 9,
                    padding: '10px 22px',
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '14px',
                    fontWeight: 700,
                    color: C.basalt,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: `0 3px 14px ${C.solar}40`,
                  }}
                >
                  Next tip <ChevronRight size={15} strokeWidth={2} />
                </button>
              ) : (
                <button
                  onClick={() => router.push('/app')}
                  style={{
                    background: C.solar,
                    border: 'none',
                    borderRadius: 9,
                    padding: '10px 22px',
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '14px',
                    fontWeight: 700,
                    color: C.basalt,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: `0 3px 14px ${C.solar}40`,
                  }}
                >
                  Unlock Egypt <ArrowRight size={15} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
