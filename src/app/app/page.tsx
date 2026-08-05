'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { useAuth } from '@/lib/auth';
import { C } from '@/lib/constants/theme';
import { Glyph, GlyphFull, Geom } from '@/app/components/atoms';
import { WeatherWidget } from '@/app/components/weather/WeatherWidget';
import {
  ArrowRight,
  MapPin,
  ShieldCheck,
  Bot,
  Sparkles,
  Compass,
} from 'lucide-react';

const FEATURES = [
  {
    icon: <Bot size={22} strokeWidth={1.8} />,
    color: C.faience,
    title: 'Chat with Rafiq',
    body: 'Your AI travel companion. Ask anything in natural language and get answers that feel like a knowledgeable local friend.',
    href: '/app/rafiq',
  },
  {
    icon: <Compass size={22} strokeWidth={1.8} />,
    color: C.terracotta,
    title: 'Explore Egypt',
    body: 'Discover 6,600+ verified heritage sites across 27 governorates — with live maps, routes and monument details.',
    href: '/app/explore',
  },
  {
    icon: <ShieldCheck size={22} strokeWidth={1.8} />,
    color: C.safeGreen,
    title: 'Stay safe',
    body: 'Scam alerts, safety advisories and emergency help — continuously monitored from 15 live sources.',
    href: '/app/safety',
  },
];

const STATS = [
  { value: '6,600+', label: 'Verified sites' },
  { value: '11', label: 'Cities covered' },
  { value: '3', label: 'AI personas' },
  { value: '15', label: 'Live safety sources' },
];

const CITIES = [
  { name: 'Cairo', nameAr: 'القاهرة' },
  { name: 'Luxor', nameAr: 'الأقصر' },
  { name: 'Aswan', nameAr: 'أسوان' },
  { name: 'Alexandria', nameAr: 'الإسكندرية' },
  { name: 'Sharm El Sheikh', nameAr: 'شرم الشيخ' },
  { name: 'Hurghada', nameAr: 'الغردقة' },
  { name: 'Giza', nameAr: 'الجيزة' },
  { name: 'Mansoura', nameAr: 'المنصورة' },
  { name: 'Fayoum', nameAr: 'الفيوم' },
  { name: 'Siwa', nameAr: 'سيوة' },
  { name: 'Abu Simbel', nameAr: 'أبو سمبل' },
];

export default function HomePage() {
  const router = useRouter();
  const { user, isInitialized } = useAuth();
  const displayName = user?.displayName || user?.email || 'Traveler';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.limestone }}>
      {/* Hero */}
      <div
        style={{
          background: `linear-gradient(165deg,${C.basalt} 0%,${C.nile} 52%,#0B2D2E 100%)`,
          minHeight: '62vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div style={{ position: 'absolute', top: -80, right: -80, pointerEvents: 'none' }}>
          <Geom size={420} color={C.limestone} op={0.03} />
        </div>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '56px 32px', width: '100%', position: 'relative', zIndex: 10 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: `${C.solar}18`,
              border: `1px solid ${C.solar}40`,
              borderRadius: 99,
              padding: '5px 14px 5px 9px',
              marginBottom: 24,
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
              fontSize: 'clamp(36px,4.5vw,60px)',
              fontWeight: 300,
              color: C.limestone,
              lineHeight: 1.06,
              letterSpacing: '-0.03em',
              marginBottom: 16,
            }}
          >
            Ahlan, {displayName}
            <br />
            <span style={{ fontStyle: 'italic', color: C.solarBright }}>Your key to Egypt.</span>
          </h1>
          <p
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '16px',
              color: `${C.limestone}60`,
              lineHeight: 1.7,
              fontWeight: 300,
              maxWidth: 460,
              marginBottom: 28,
            }}
          >
            AI safety intelligence, cultural storytelling, and real-time guidance — in one quiet,
            confident travel companion.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/app/rafiq')}
              style={{
                background: C.solar,
                border: 'none',
                borderRadius: 10,
                padding: '13px 26px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '15px',
                fontWeight: 700,
                color: C.basalt,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: `0 4px 24px ${C.solar}50`,
              }}
            >
              <Bot size={17} strokeWidth={2.2} />
              Start chatting <ArrowRight size={17} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => router.push('/app/explore')}
              style={{
                background: `${C.limestone}10`,
                border: `1.5px solid ${C.limestone}28`,
                borderRadius: 10,
                padding: '13px 24px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '15px',
                fontWeight: 500,
                color: `${C.limestone}75`,
                cursor: 'pointer',
              }}
            >
              Explore sites
            </button>
          </div>

          {/* Live weather */}
          <div style={{ marginTop: 28, maxWidth: 640 }}>
            <WeatherWidget />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: C.basalt }}>
        <div
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            padding: '24px 32px',
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {STATS.map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '26px', fontWeight: 500, color: C.solarBright }}>
                {value}
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 500, color: `${C.limestone}40`, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '72px 32px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
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
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,4vw,42px)', fontWeight: 300, color: C.nile }}>
            Not a guide. <span style={{ fontStyle: 'italic', color: C.solar }}>A key.</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 16 }}>
          {FEATURES.map(({ icon, color, title, body, href }) => (
            <button
              key={title}
              onClick={() => router.push(href)}
              style={{
                background: '#FAF7F0',
                borderRadius: 16,
                padding: '26px 22px',
                border: '1px solid rgba(27,26,23,0.06)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'box-shadow 0.18s, transform 0.18s',
                fontFamily: 'inherit',
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: `${color}15`,
                  border: `1px solid ${color}25`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color,
                  marginBottom: 14,
                }}
              >
                {icon}
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '15px', fontWeight: 700, color: C.nile, marginBottom: 6 }}>
                {title}
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: '#6B6354', lineHeight: 1.65 }}>
                {body}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cities */}
      <div style={{ background: '#F1ECE2', padding: '64px 32px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
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
              Destinations
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,4vw,42px)', fontWeight: 300, color: C.nile }}>
              Where will your journey take <span style={{ fontStyle: 'italic', color: C.solar }}>you?</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
            {CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => router.push(`/app/explore`)}
                style={{
                  background: '#FAF7F0',
                  borderRadius: 12,
                  border: '1px solid rgba(27,26,23,0.08)',
                  padding: '16px 14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '17px', fontWeight: 500, color: C.nile }}>
                  {city.name}
                </div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#A89880', marginTop: 3 }}>
                  {city.nameAr}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: `linear-gradient(135deg,${C.nile},${C.nileMid})`, padding: '64px 32px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <GlyphFull size={64} light />
          <div
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 'clamp(26px,3.5vw,38px)',
              fontWeight: 400,
              color: C.limestone,
              lineHeight: 1.2,
              margin: '20px 0 10px',
            }}
          >
            Ready to unlock <span style={{ fontStyle: 'italic', color: C.solarBright }}>Egypt, your way?</span>
          </div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '14px', color: `${C.limestone}55`, marginBottom: 26, lineHeight: 1.6 }}>
            Continue your journey — pick up right where you left off.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/app/rafiq')}
              style={{
                background: C.solar,
                border: 'none',
                borderRadius: 10,
                padding: '13px 26px',
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
              <Sparkles size={16} /> Continue exploring <ArrowRight size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => router.push('/app/safety')}
              style={{
                background: `${C.limestone}12`,
                border: `1.5px solid ${C.limestone}25`,
                borderRadius: 10,
                padding: '13px 22px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                color: `${C.limestone}75`,
                cursor: 'pointer',
              }}
            >
              Safety first
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
