'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { C } from '@/lib/constants/theme';
import { GlyphFull, PyramidSkyline } from '@/app/components/atoms';
import { WeatherWidget } from '@/app/components/weather/WeatherWidget';
import {
  ArrowRight,
  MapPin,
  ShieldCheck,
  Bot,
  Compass,
  Ticket,
  Banknote,
  Landmark,
  Clock,
  Wallet,
  User,
  Settings,
} from 'lucide-react';

const CARDS = [
  {
    icon: <Bot size={20} strokeWidth={2} />,
    color: C.faience,
    title: 'Rafiq',
    tag: 'AI Travel Companion',
    body: 'Ask anything — itineraries, local customs, live guidance.',
    href: '/app/rafiq',
  },
  {
    icon: <Compass size={20} strokeWidth={2} />,
    color: C.terracotta,
    title: 'Explore',
    tag: '6,600+ heritage sites',
    body: 'Discover verified monuments, maps and routes across Egypt.',
    href: '/app/explore',
  },
  {
    icon: <ShieldCheck size={20} strokeWidth={2} />,
    color: C.safeGreen,
    title: 'Safety',
    tag: 'Live advisories',
    body: 'Scam alerts and emergency help, monitored from live sources.',
    href: '/app/safety',
  },
  {
    icon: <Ticket size={20} strokeWidth={2} />,
    color: C.copper,
    title: 'Tickets',
    tag: 'Book ahead',
    body: 'Entry tickets and plans for top sites — skip the queue.',
    href: '/app/tickets',
  },
  {
    icon: <Banknote size={20} strokeWidth={2} />,
    color: C.solar,
    title: 'Currency',
    tag: 'Live FX rates',
    body: 'Check today’s exchange rates before you pay.',
    href: '/app/currency',
  },
  {
    icon: <Landmark size={20} strokeWidth={2} />,
    color: C.faience,
    title: 'Quests',
    tag: 'Earn & discover',
    body: 'Complete journey steps and unlock badges and XP.',
    href: '/app/quests',
  },
  {
    icon: <Clock size={20} strokeWidth={2} />,
    color: C.nile,
    title: 'History',
    tag: 'Your journey',
    body: 'Revisit past trips, favorites and your activity log.',
    href: '/app/history',
  },
  {
    icon: <Wallet size={20} strokeWidth={2} />,
    color: C.brass,
    title: 'Wallet',
    tag: 'Payments & balance',
    body: 'Manage balance and bookings in one secure place.',
    href: '/app/wallet',
  },
];

const ACCOUNT_LINKS = [
  { icon: <User size={15} strokeWidth={2} />, label: 'Profile', href: '/app/profile' },
  { icon: <Settings size={15} strokeWidth={2} />, label: 'Settings', href: '/app/settings' },
];

const PARTICLES = [
  { left: '5%',  top: '40%', delay: '0s',   dur: '11s', size: 3 },
  { left: '16%', top: '26%', delay: '2.4s', dur: '13s', size: 2 },
  { left: '30%', top: '52%', delay: '4.2s', dur: '10s', size: 2.5 },
  { left: '46%', top: '34%', delay: '1.3s', dur: '12s', size: 2 },
  { left: '62%', top: '58%', delay: '5.6s', dur: '9s',  size: 3 },
  { left: '74%', top: '24%', delay: '3.1s', dur: '12s', size: 2 },
  { left: '85%', top: '44%', delay: '0.9s', dur: '10s', size: 2.5 },
  { left: '94%', top: '60%', delay: '6.4s', dur: '13s', size: 2 },
];

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email || 'Traveler';
  const level = user?.level ?? 1;
  const xp = user?.xp ?? 0;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.limestone, overflowY: 'auto' }}>
      <style>{`
        @keyframes rihlaGrad {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes rihlaSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes rihlaFloat {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes rihlaParticle {
          0%   { transform: translateY(0) scale(1); opacity: 0; }
          12%  { opacity: 0.9; }
          70%  { opacity: 0.5; }
          100% { transform: translateY(-140px) scale(0.3); opacity: 0; }
        }
        @keyframes rihlaFadeUp {
          0%   { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes rihlaRise {
          0%   { transform: translateY(8px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* ── Header ── */}
      <div
        style={{
          background: `linear-gradient(-60deg, ${C.basalt}, ${C.nile}, #0B2D2E, ${C.basalt})`,
          backgroundSize: '300% 300%',
          animation: 'rihlaGrad 14s ease infinite',
          padding: '34px 32px 30px',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Rotating solar disc */}
        <div
          style={{
            position: 'absolute',
            right: '-4%',
            top: -120,
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'repeating-conic-gradient(from 0deg, rgba(232,168,32,0) 0deg 9deg, rgba(232,168,32,0.09) 9deg 18deg)',
            animation: 'rihlaSpin 60s linear infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '4%',
            top: -40,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,168,32,0.30) 0%, rgba(232,168,32,0.08) 55%, transparent 75%)',
            pointerEvents: 'none',
          }}
        />

        {/* Pyramid skyline */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: -8, animation: 'rihlaFloat 7s ease-in-out 0.4s infinite', pointerEvents: 'none' }}>
          <PyramidSkyline size={720} op={0.55} color={C.sand} />
        </div>

        {/* Sand particles */}
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: C.solarBright,
              opacity: 0,
              animation: `rihlaParticle ${p.dur}s linear ${p.delay} infinite`,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Horizon glow */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 2,
            background: 'linear-gradient(90deg, transparent, rgba(232,168,32,0.7), rgba(245,192,64,0.9), rgba(232,168,32,0.7), transparent)',
            backgroundSize: '200% 100%',
            animation: 'rihlaGrad 6s ease infinite',
          }}
        />

        <div style={{ maxWidth: 1040, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ animation: 'rihlaRise 0.5s ease-out both' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: `${C.solar}18`,
              border: `1px solid ${C.solar}40`,
              borderRadius: 99,
              padding: '5px 14px 5px 9px',
              marginBottom: 16,
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
              EGYPT · AI-POWERED TRAVEL COMPANION
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <h1
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 'clamp(30px,4vw,46px)',
                  fontWeight: 300,
                  color: C.limestone,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  marginBottom: 8,
                }}
              >
                Ahlan, {displayName}
              </h1>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '14px', color: `${C.limestone}60`, lineHeight: 1.6, maxWidth: 460 }}>
                Your dashboard — live conditions, quick access to every Rihla service, and one tap away from your next stop.
              </p>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14, flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '12px',
                    fontWeight: 600,
                    color: C.solarBright,
                    background: `${C.solar}16`,
                    border: `1px solid ${C.solar}35`,
                    borderRadius: 99,
                    padding: '5px 12px',
                  }}
                >
                  Level {level}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '12px',
                    fontWeight: 600,
                    color: C.limestone,
                    background: `${C.limestone}10`,
                    border: `1px solid ${C.limestone}22`,
                    borderRadius: 99,
                    padding: '5px 12px',
                  }}
                >
                  {xp} XP
                </span>
              </div>
            </div>
            <div style={{ width: 'min(100%, 520px)' }}>
              <WeatherWidget />
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* ── Dashboard nav ── */}
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '22px', fontWeight: 400, color: C.nile }}>
            Everything you need, <span style={{ fontStyle: 'italic', color: C.solar }}>in one place</span>
          </h2>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: `${C.nile}55` }}>
            Services
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 14 }}>
          {CARDS.map(({ icon, color, title, tag, body, href }) => (
            <button
              key={title}
              onClick={() => router.push(href)}
              style={{
                background: '#FAF7F0',
                borderRadius: 16,
                padding: '20px 18px',
                border: '1px solid rgba(27,26,23,0.06)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'box-shadow 0.18s, transform 0.18s, border-color 0.18s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 10px 30px rgba(20,16,8,0.10)`;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = `${color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'rgba(27,26,23,0.06)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
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
                  }}
                >
                  {icon}
                </div>
                <ArrowRight size={16} strokeWidth={2} color={`${C.nile}30`} />
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '16px', fontWeight: 700, color: C.nile }}>
                {title}
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color, margin: '2px 0 8px' }}>
                {tag}
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12.5px', color: '#6B6354', lineHeight: 1.6 }}>
                {body}
              </div>
            </button>
          ))}
        </div>

        {/* ── Account strip ── */}
        <div
          style={{
            marginTop: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#EDE4CC',
            border: '1px solid rgba(27,26,23,0.06)',
            borderRadius: 16,
            padding: '12px 16px',
            flexWrap: 'wrap',
          }}
        >
          <GlyphFull size={26} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', fontWeight: 600, color: C.nile, marginRight: 'auto' }}>
            Your account
          </span>
          {ACCOUNT_LINKS.map(({ icon, label, href }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                background: '#FAF7F0',
                border: '1px solid rgba(27,26,23,0.08)',
                borderRadius: 10,
                padding: '9px 14px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                color: C.nile,
                cursor: 'pointer',
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
