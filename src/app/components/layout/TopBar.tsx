"use client";

import { MapPin, Bell, Search, RefreshCw, Menu } from "lucide-react";
import { C } from "@/lib/constants/theme";
import { useRouter } from 'next/navigation';
import { useLocation, useLocationLabel } from "@/providers/LocationProvider";
import { useAuth } from "@/lib/auth";
import { Glyph, PyramidSkyline } from "@/app/components/atoms";

const PARTICLES = [
  { left: '6%',  top: '42%', delay: '0s',    dur: '11s', size: 3 },
  { left: '18%', top: '30%', delay: '2.2s',  dur: '13s', size: 2 },
  { left: '34%', top: '52%', delay: '4.1s',  dur: '10s', size: 2.5 },
  { left: '52%', top: '35%', delay: '1.4s',  dur: '12s', size: 2 },
  { left: '64%', top: '58%', delay: '5.5s',  dur: '9s',  size: 3 },
  { left: '78%', top: '28%', delay: '3.3s',  dur: '12s', size: 2 },
  { left: '88%', top: '46%', delay: '0.8s',  dur: '10s', size: 2.5 },
  { left: '93%', top: '62%', delay: '6.2s',  dur: '13s', size: 2 },
];

const SUN_RAYS = Array.from({ length: 12 }, (_, i) => (i * 30));

export function TopBar({ location: locationProp, onRafiq }: { location?: string; onRafiq?: () => void }) {
  const router = useRouter();
  const { status, requestLocation } = useLocation();
  const liveLocation = useLocationLabel();
  const { user } = useAuth();
  const initial = (user?.displayName || "Traveler").charAt(0).toUpperCase();

  const pageTitle = locationProp || 'Rihla';

  return (
    <>
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
          50%      { transform: translateY(-7px); }
        }
        @keyframes rihlaParticle {
          0%   { transform: translateY(0) scale(1); opacity: 0; }
          12%  { opacity: 0.9; }
          70%  { opacity: 0.5; }
          100% { transform: translateY(-120px) scale(0.3); opacity: 0; }
        }
        @keyframes rihlaPing {
          0%   { transform: scale(0.6); opacity: 0.9; }
          80%, 100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes rihlaShimmer {
          0%   { transform: translateX(-120%) skewX(-18deg); }
          100% { transform: translateX(220%) skewX(-18deg); }
        }
        @keyframes rihlaWiggle {
          0%, 100% { transform: rotate(0deg); }
          20%      { transform: rotate(12deg); }
          40%      { transform: rotate(-10deg); }
          60%      { transform: rotate(6deg); }
          80%      { transform: rotate(-4deg); }
        }
        @keyframes rihlaGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(232,168,32,0.45); }
          50%      { box-shadow: 0 0 0 8px rgba(232,168,32,0); }
        }
        @keyframes rihlaFadeUp {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes rihlaPulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.35; }
        }
      `}</style>

      <div
        style={{
          background: `linear-gradient(-60deg, ${C.basalt}, ${C.nile}, #0B2D2E, ${C.basalt})`,
          backgroundSize: '300% 300%',
          animation: 'rihlaGrad 14s ease infinite',
          borderBottom: '1px solid rgba(232,168,32,0.22)',
          height: 68,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 20,
          overflow: 'hidden',
        }}
      >
        {/* ── Rotating solar disc ── */}
        <div
          style={{
            position: 'absolute',
            right: '8%',
            top: -110,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'repeating-conic-gradient(from 0deg, rgba(232,168,32,0) 0deg 9deg, rgba(232,168,32,0.10) 9deg 18deg)',
            animation: 'rihlaSpin 60s linear infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '13%',
            top: -52,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,168,32,0.35) 0%, rgba(232,168,32,0.10) 55%, transparent 75%)',
            pointerEvents: 'none',
          }}
        />

        {/* ── Pyramid skyline ── */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: -6, animation: 'rihlaFloat 7s ease-in-out 0.4s infinite', pointerEvents: 'none' }}>
          <PyramidSkyline size={560} op={0.6} color={C.sand} />
        </div>

        {/* ── Floating sand particles ── */}
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

        {/* ── Horizon glow line ── */}
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

        {/* ── Content ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            height: '100%',
            padding: '0 26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            animation: 'rihlaFadeUp 0.6s ease-out both',
          }}
        >
          {/* Brand + page title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <button
              onClick={() => router.push('/app')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, padding: 0, flexShrink: 0 }}
            >
              <Glyph size={54} light />
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontWeight: 500, color: C.limestone, letterSpacing: '0.02em' }}>رحلة Rihla</span>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: `${C.sand}90`, marginTop: 3 }}>AI Travel Companion</span>
              </span>
            </button>
            <span style={{ width: 1, height: 22, background: `${C.limestone}18`, flexShrink: 0 }} />
            <span
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: '16px',
                fontWeight: 400,
                color: `${C.limestone}80`,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {pageTitle}
            </span>
          </div>

          {/* Location chip */}
          <span
            title={liveLocation}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: 'rgba(245,239,224,0.08)',
              border: '1px solid rgba(245,239,224,0.18)',
              backdropFilter: 'blur(6px)',
              borderRadius: 99,
              padding: '6px 14px',
              minWidth: 0,
              position: 'relative',
            }}
          >
            <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
              <MapPin size={14} color={status === 'success' ? C.solarBright : C.copper} strokeWidth={2.4} style={{ position: 'relative', zIndex: 1 }} />
              {status === 'success' && (
                <span style={{ position: 'absolute', inset: -1, borderRadius: '50%', background: C.solarBright, animation: 'rihlaPing 1.8s ease-out infinite' }} />
              )}
            </span>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12.5px', fontWeight: 600, color: C.limestone, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{liveLocation}</span>
            {status === 'success' && (
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '10.5px', color: C.solarBright, fontWeight: 700, letterSpacing: '0.05em' }}>
                ● LIVE
              </span>
            )}
          </span>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                background: 'rgba(245,239,224,0.07)',
                border: '1px solid rgba(245,239,224,0.16)',
                borderRadius: 10,
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: 210,
                cursor: 'text',
                position: 'relative',
                overflow: 'hidden',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(232,168,32,0.55)';
                e.currentTarget.style.background = 'rgba(245,239,224,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(245,239,224,0.16)';
                e.currentTarget.style.background = 'rgba(245,239,224,0.07)';
              }}
            >
              <Search size={14} color={`${C.limestone}55`} strokeWidth={2} />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: `${C.limestone}50` }}>Search places, stories…</span>
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: '45%',
                  background: 'linear-gradient(100deg, transparent, rgba(232,168,32,0.18), transparent)',
                  transform: 'translateX(-120%) skewX(-18deg)',
                  animation: 'rihlaShimmer 3.4s ease-in-out infinite',
                }}
              />
            </div>

            <button
              style={{
                background: 'rgba(245,239,224,0.07)',
                border: '1px solid rgba(245,239,224,0.16)',
                borderRadius: 10,
                width: 38,
                height: 38,
                position: 'relative',
                cursor: 'pointer',
                color: `${C.limestone}80`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = C.solarBright;
                e.currentTarget.style.borderColor = 'rgba(232,168,32,0.55)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = `${C.limestone}80`;
                e.currentTarget.style.borderColor = 'rgba(245,239,224,0.16)';
              }}
            >
              <Bell size={17} strokeWidth={1.9} style={{ animation: 'rihlaWiggle 5s ease-in-out infinite' }} />
              <span style={{ position: 'absolute', top: -2, right: -2, width: 9, height: 9, borderRadius: '50%', background: C.alertAmber, border: '2px solid #162C2C' }}>
                <span style={{ position: 'absolute', inset: -2, borderRadius: '50%', background: C.alertAmber, animation: 'rihlaPing 1.8s ease-out infinite' }} />
              </span>
            </button>

            <div
              onClick={() => router.push('/app/profile')}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: `linear-gradient(135deg,${C.sand}55,${C.copper}55)`,
                border: '2px solid rgba(232,168,32,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                animation: 'rihlaGlow 3s ease-in-out infinite',
              }}
            >
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '15px', fontWeight: 500, color: C.limestone }}>{initial}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
