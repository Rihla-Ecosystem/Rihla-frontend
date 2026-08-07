'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { MapPin, ArrowRight, Shield, Globe, Zap, Star } from 'lucide-react';
import { C } from '@/lib/constants/theme';
import { Glyph, GlyphFull, PyramidSkyline } from '@/app/components/atoms';

export default function Page() {
  const router = useRouter();

  return (
    <div style={{ background: C.limestone, minHeight: '100vh' }}>
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(246,241,231,0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(27,26,23,0.08)',
          padding: '0 48px',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Glyph size={28} />
            <div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: '19px',
                  fontWeight: 500,
                  color: C.nile,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                رحلة Rihla
              </div>
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '9px',
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: C.bronze,
                }}
              >
                AI Travel Companion
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => router.push('/login')}
              style={{
                background: 'transparent',
                border: 'none',
                fontFamily: "'Inter',sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                color: '#6B6354',
                cursor: 'pointer',
                padding: '8px 16px',
              }}
            >
              Sign in
            </button>
            <button
              onClick={() => router.push('/signup')}
              style={{
                background: C.solar,
                border: 'none',
                borderRadius: 8,
                padding: '9px 20px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                color: C.basalt,
                cursor: 'pointer',
                boxShadow: `0 3px 14px ${C.solar}40`,
              }}
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      <div
        style={{
          background: `linear-gradient(165deg,${C.basalt} 0%,${C.nile} 52%,#0B2D2E 100%)`,
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', bottom: -8, left: 0, right: 0, pointerEvents: 'none' }}>
          <PyramidSkyline size={900} op={0.55} color={C.sand} />
        </div>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '80px 48px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 80,
            alignItems: 'center',
            width: '100%',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: `${C.solar}18`,
                border: `1px solid ${C.solar}40`,
                borderRadius: 99,
                padding: '5px 14px 5px 9px',
                marginBottom: 28,
              }}
            >
              <MapPin size={11} color={C.solarBright} strokeWidth={2.5} />
              <span
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '11px',
                  fontWeight: 600,
                  color: C.solarBright,
                  letterSpacing: '0.06em',
                }}
              >
                EGYPT · 27 GOVERNORATES · AI-POWERED
              </span>
            </div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 'clamp(42px,5vw,68px)',
                fontWeight: 300,
                color: C.limestone,
                lineHeight: 1.06,
                letterSpacing: '-0.03em',
                marginBottom: 20,
              }}
            >
              Your key
              <br />
              <span style={{ fontStyle: 'italic', color: C.solarBright }}>to Egypt.</span>
            </h1>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '17px',
                color: `${C.limestone}60`,
                lineHeight: 1.75,
                fontWeight: 300,
                maxWidth: 420,
                marginBottom: 36,
              }}
            >
              AI safety intelligence, cultural storytelling, and real-time guidance — in one quiet,
              confident travel companion.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
              <button
                onClick={() => router.push('/signup')}
                style={{
                  background: C.solar,
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px 28px',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '16px',
                  fontWeight: 700,
                  color: C.basalt,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: `0 4px 24px ${C.solar}50`,
                }}
              >
                Unlock Egypt <ArrowRight size={18} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => router.push('/login')}
                style={{
                  background: `${C.limestone}10`,
                  border: `1.5px solid ${C.limestone}28`,
                  borderRadius: 10,
                  padding: '14px 28px',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '16px',
                  fontWeight: 500,
                  color: `${C.limestone}75`,
                  cursor: 'pointer',
                }}
              >
                Sign in
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex' }}>
                {[C.terracotta, C.faience, C.copper, C.safeGreen, C.alertAmber].map((col, i) => (
                  <div
                    key={i}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: col,
                      border: `2px solid ${C.nile}`,
                      marginLeft: i === 0 ? 0 : -9,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: C.limestone,
                    }}
                  >
                    {['S', 'A', 'M', 'L', 'K'][i]}
                  </div>
                ))}
              </div>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: `${C.limestone}55` }}>
                <strong style={{ color: `${C.limestone}85`, fontWeight: 600 }}>12,400+</strong> travelers trust Rihla
              </span>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 32,
              position: 'relative',
            }}
          >
            {/* Radial glow behind logo */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
                width: 320,
                height: 320,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${C.solar}12 0%, transparent 70%)`,
                pointerEvents: 'none',
              }}
            />
            <GlyphFull size={120} light />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
              {[
                { src: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=500&h=280&fit=crop', h: 160 },
                { src: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=500&h=280&fit=crop', h: 160 },
              ].map(({ src, h }, i) => (
                <div key={i} style={{ borderRadius: 12, overflow: 'hidden', height: h, position: 'relative' }}>
                  <img
                    src={src}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(180deg,transparent 30%,${C.basalt}60 100%)`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: C.basalt }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '28px 48px',
            display: 'flex',
            justifyContent: 'space-around',
          }}
        >
          {[
            { v: '27', l: 'Governorates covered' },
            { v: '6,600+', l: 'Verified sites' },
            { v: '15', l: 'Live safety sources' },
            { v: '3', l: 'AI personas' },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: '28px',
                  fontWeight: 500,
                  color: C.solarBright,
                }}
              >
                {v}
              </div>
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '11px',
                  fontWeight: 500,
                  color: `${C.limestone}40`,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginTop: 4,
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: C.copper,
              marginBottom: 8,
            }}
          >
            What Rihla does
          </div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 'clamp(32px,4vw,48px)',
              fontWeight: 300,
              color: C.nile,
            }}
          >
            Not a guide. <span style={{ fontStyle: 'italic', color: C.solar }}>A key.</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
          {[
            {
              icon: <Shield size={22} strokeWidth={1.8} />,
              color: C.safeGreen,
              title: 'Real-time Safety Intelligence',
              body: 'Scam alerts, restricted zones, environmental hazards, and emergency contacts — continuously monitored from 15 live sources.',
            },
            {
              icon: <Glyph size={22} />,
              color: C.faience,
              title: 'Rafiq — Your AI Companion',
              body: 'Ask anything in natural language. Get answers that feel like a knowledgeable local friend, with cultural depth.',
            },
            {
              icon: <Globe size={22} strokeWidth={1.8} />,
              color: C.terracotta,
              title: 'Cultural Storytelling',
              body: 'Every site has a story. Rihla surfaces it as a journal entry — tailored to where you are, enriched with history.',
            },
            {
              icon: <Zap size={22} strokeWidth={1.8} />,
              color: C.copper,
              title: 'Journey Progress & Rewards',
              body: 'Collect experiences like fragments of a story. Earn badges, unlock governorates, track your Egypt journey.',
            },
          ].map(({ icon, color, title, body }) => (
            <div
              key={title}
              style={{
                background: '#FAF7F0',
                borderRadius: 16,
                padding: '28px 24px',
                border: '1px solid rgba(27,26,23,0.06)',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 13,
                  background: `${color}15`,
                  border: `1px solid ${color}25`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color,
                  marginBottom: 16,
                }}
              >
                {icon}
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '15px', fontWeight: 700, color: C.nile, marginBottom: 8 }}>
                {title}
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: '#6B6354', lineHeight: 1.7 }}>
                {body}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: `linear-gradient(135deg,${C.nile},${C.nileMid})`, padding: '80px 48px' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 64,
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} color={C.sand} fill={C.sand} strokeWidth={0} />
              ))}
            </div>
            <blockquote
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontStyle: 'italic',
                fontSize: 'clamp(18px,2.5vw,24px)',
                color: C.limestone,
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              "Rihla warned me about a scam at Khan el-Khalili before I even reached the gate. Then it told me the story
              of the mosque I would have walked right past."
            </blockquote>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg,${C.faience},${C.nile})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: '17px',
                    fontWeight: 500,
                    color: C.limestone,
                  }}
                >
                  M
                </span>
              </div>
              <div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '14px', fontWeight: 600, color: C.limestone }}>
                  Mia Hoffmann
                </div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: `${C.limestone}55` }}>
                  Solo traveler · Berlin, Germany
                </div>
              </div>
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 'clamp(26px,3vw,36px)',
                fontWeight: 400,
                color: C.limestone,
                lineHeight: 1.2,
                marginBottom: 12,
              }}
            >
              Ready to unlock
              <br />
              <span style={{ fontStyle: 'italic', color: C.solarBright }}>Egypt, your way?</span>
            </div>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '14px',
                color: `${C.limestone}55`,
                marginBottom: 28,
                lineHeight: 1.6,
              }}
            >
              Free to start. No credit card required. Works on any device.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => router.push('/signup')}
                style={{
                  background: C.solar,
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px 28px',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '15px',
                  fontWeight: 700,
                  color: C.basalt,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  boxShadow: `0 4px 20px ${C.solar}45`,
                }}
              >
                Unlock Egypt free <ArrowRight size={17} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => router.push('/login')}
                style={{
                  background: `${C.limestone}12`,
                  border: `1.5px solid ${C.limestone}25`,
                  borderRadius: 10,
                  padding: '14px 24px',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '14px',
                  fontWeight: 500,
                  color: `${C.limestone}75`,
                  cursor: 'pointer',
                }}
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: C.basalt, padding: '32px 48px' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Glyph size={18} />
            <span
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontStyle: 'italic',
                fontSize: '14px',
                color: `${C.limestone}50`,
              }}
            >
              رحلة · Your Egyptian Journey Companion
            </span>
          </div>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: `${C.limestone}30` }}>
            © 2026 Rihla · All rights reserved
          </span>
        </div>
      </div>
    </div>
  );
}

