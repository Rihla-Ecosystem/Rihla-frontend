'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { C } from '@/lib/constants/theme';
import { Glyph, Geom } from '@/app/components/atoms';
import { ALL_SITES, JOURNEYS } from '@/app/data/rihla-data';
import {
  Sun,
  Wind,
  Thermometer,
  Map,
  AlertTriangle,
  Camera,
  Phone,
  BarChart2,
  ChevronRight,
} from 'lucide-react';
import { TopBar } from '@/app/components/layout/TopBar';
import { SiteCard } from '@/app/components/siteCard';
import { RafiqDrawer } from '@/app/components/rafiqDrawer';

export default function HomePage() {
  const router = useRouter();
  const [rafiq, setRafiq] = useState(false);
  const { user } = useAuth();
  const displayName = user?.displayName || 'Sara Al-Rashid';
  
  const hour = new Date().getHours();
  const isMorn = hour >= 6 && hour < 12;
  const isEve = hour >= 17 || hour < 6;
  const greeting = isEve ? 'Good evening' : isMorn ? 'Good morning' : 'Good afternoon';
  
  const tg = isEve
    ? `linear-gradient(160deg,#1B1A17 0%,#2A1A0A 40%,${C.nile} 100%)`
    : isMorn
      ? `linear-gradient(160deg,${C.nile} 0%,#1A6B5A 40%,#C4834A 100%)`
      : `linear-gradient(160deg,${C.nile} 0%,#0A3D4A 50%,#1A5253 100%)`;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar onRafiq={() => setRafiq(true)} />
      <div
        style={{
          background: tg,
          padding: '36px 32px 32px',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div style={{ position: 'absolute', right: -60, top: -60 }}>
          <Geom size={280} color={C.limestone} op={0.038} />
        </div>
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'end',
            gap: 32,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: `${C.limestone}55`,
                marginBottom: 4,
              }}
            >
              {greeting},
            </div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 'clamp(28px,3vw,40px)',
                fontWeight: 400,
                color: C.limestone,
                lineHeight: 1.1,
                letterSpacing: '-0.025em',
                marginBottom: 20,
              }}
            >
              {displayName}
            </h1>
            <button
              onClick={() => setRafiq(true)}
              style={{
                background: `${C.limestone}14`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${C.limestone}20`,
                borderRadius: 12,
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer',
                maxWidth: 480,
                textAlign: 'left',
              }}
            >
              <Glyph size={22} light />
              <div>
                <div
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '10px',
                    fontWeight: 600,
                    color: `${C.limestone}55`,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: 3,
                  }}
                >
                  ◈ Ask Rafiq
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontStyle: 'italic',
                    fontSize: '14px',
                    color: C.limestone,
                  }}
                >
                  Ask about history, safety, food, local tips…
                </div>
              </div>
              <ChevronRight
                size={16}
                color={`${C.limestone}40`}
                strokeWidth={2}
                style={{ marginLeft: 'auto', flexShrink: 0 }}
              />
            </button>
          </div>
          <div
            style={{
              background: 'rgba(246,241,231,0.12)',
              backdropFilter: 'blur(14px)',
              border: `1.5px solid ${C.safeGreen}40`,
              borderRadius: 16,
              padding: '18px 22px',
              textAlign: 'center',
              flexShrink: 0,
              minWidth: 180,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: C.safeGreen,
                  boxShadow: `0 0 0 3px ${C.safeGreen}35`,
                }}
              />
              <span
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '16px',
                  fontWeight: 800,
                  color: C.safeGreen,
                  letterSpacing: '0.04em',
                }}
              >
                SECURE
              </span>
            </div>
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '11px',
                color: `${C.limestone}55`,
                marginBottom: 14,
              }}
            >
              Updated 4 min ago
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { icon: <Sun size={12} />, l: 'UV', v: '7' },
                { icon: <Thermometer size={12} />, l: '°C', v: '38' },
                { icon: <Wind size={12} />, l: 'Air', v: '✓' },
              ].map(({ icon, l, v }) => (
                <div
                  key={l}
                  style={{
                    flex: 1,
                    background: `${C.limestone}10`,
                    borderRadius: 8,
                    padding: '6px 4px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      color: `${C.limestone}70`,
                      marginBottom: 2,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {icon}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter',sans-serif",
                      fontSize: '10px',
                      color: `${C.limestone}50`,
                    }}
                  >
                    {l}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter',sans-serif",
                      fontSize: '12px',
                      fontWeight: 700,
                      color: C.limestone,
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          padding: '28px 32px',
          maxWidth: 1100,
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 24,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 14,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: '20px',
                  fontWeight: 500,
                  color: C.nile,
                }}
              >
                Nearby Sites
              </h2>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '13px',
                  fontWeight: 600,
                  color: C.faience,
                  cursor: 'pointer',
                }}
              >
                Explore all →
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {['All', 'Temples', 'Museums', 'Hidden gems', 'Markets'].map((cat, i) => (
                <button
                  key={cat}
                  style={{
                    background: i === 0 ? C.nile : 'transparent',
                    border: `1.5px solid ${i === 0 ? C.nile : 'rgba(27,26,23,0.13)'}`,
                    borderRadius: 99,
                    padding: '5px 14px',
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '12px',
                    fontWeight: i === 0 ? 600 : 400,
                    color: i === 0 ? C.limestone : '#6B6354',
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
                gap: 12,
              }}
            >
              {ALL_SITES.slice(0, 4).map((s) => (
                <SiteCard key={s.id} s={s} goSite={(id) => router.push(`/app/sites/${id}`)} />
              ))}
            </div>
          </div>
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 14,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: '20px',
                  fontWeight: 500,
                  color: C.nile,
                }}
              >
                Your Journeys
              </h2>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '13px',
                  fontWeight: 600,
                  color: C.faience,
                  cursor: 'pointer',
                }}
              >
                See all →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {JOURNEYS.map((j) => (
                <div
                  key={j.name}
                  style={{
                    background: C.limestone,
                    borderRadius: 14,
                    padding: '16px 18px',
                    border: '1px solid rgba(27,26,23,0.07)',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 16,
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Inter',sans-serif",
                          fontSize: '14px',
                          fontWeight: 600,
                          color: C.nile,
                        }}
                      >
                        {j.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Inter',sans-serif",
                          fontSize: '12px',
                          color: '#A89880',
                        }}
                      >
                        {j.done}/{j.total} sites
                      </div>
                    </div>
                    <div
                      style={{
                        height: 5,
                        background: '#EDE6D6',
                        borderRadius: 99,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${j.progress}%`,
                          background: `linear-gradient(90deg,${j.color},${j.color}99)`,
                          borderRadius: 99,
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontSize: '22px',
                      fontWeight: 600,
                      color: j.color,
                      minWidth: 48,
                      textAlign: 'right',
                    }}
                  >
                    {j.progress}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: 'linear-gradient(160deg,#FAF3E4,#F0E5C8)',
              borderRadius: 16,
              padding: 18,
              border: `1px solid ${C.sand}28`,
            }}
          >
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '10px',
                fontWeight: 600,
                color: C.copper,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              ◈ Rafiq's Local Tip
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontStyle: 'italic',
                fontSize: '15px',
                color: C.nile,
                lineHeight: 1.65,
                marginBottom: 10,
              }}
            >
              "Visit the Sphinx after 3pm — afternoon light hits the face directly, and crowds thin
              by 40%."
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#A89880' }}>
              Based on 340 recent traveler patterns
            </div>
          </div>
          <div
            style={{
              background: C.limestone,
              borderRadius: 16,
              padding: 18,
              border: '1px solid rgba(27,26,23,0.07)',
            }}
          >
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#A89880',
                marginBottom: 12,
              }}
            >
              Quick actions
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { icon: <Map size={18} strokeWidth={1.8} />, label: 'Map', color: C.nile },
                {
                  icon: <Camera size={18} strokeWidth={1.8} />,
                  label: 'Identify',
                  color: C.faience,
                },
                {
                  icon: <Phone size={18} strokeWidth={1.8} />,
                  label: 'Emergency',
                  color: C.signalRed,
                },
                {
                  icon: <BarChart2 size={18} strokeWidth={1.8} />,
                  label: 'Currency',
                  color: C.copper,
                },
              ].map(({ icon, label, color }) => (
                <button
                  key={label}
                  style={{
                    background: '#FAF7F0',
                    border: '1px solid rgba(27,26,23,0.07)',
                    borderRadius: 10,
                    padding: '12px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ color }}>{icon}</div>
                  <span
                    style={{
                      fontFamily: "'Inter',sans-serif",
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#6B6354',
                    }}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div
            style={{
              background: `linear-gradient(135deg,${C.nile},${C.nileMid})`,
              borderRadius: 16,
              padding: 18,
            }}
          >
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: `${C.limestone}50`,
                marginBottom: 10,
              }}
            >
              Your progress
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: '16px',
                  fontWeight: 500,
                  color: C.limestone,
                }}
              >
                Level 4 · Explorer
              </div>
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '13px',
                  fontWeight: 700,
                  color: C.sand,
                }}
              >
                1,250 XP
              </div>
            </div>
            <div
              style={{
                height: 5,
                background: `${C.limestone}15`,
                borderRadius: 99,
                marginBottom: 10,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: '63%',
                  background: `linear-gradient(90deg,${C.sand},${C.faience})`,
                  borderRadius: 99,
                }}
              />
            </div>
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '11px',
                color: `${C.limestone}45`,
              }}
            >
              490 XP to Level 5 · Historian
            </div>
          </div>
          <div
            style={{
              background: `${C.alertAmber}10`,
              border: `1px solid ${C.alertAmber}30`,
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              gap: 11,
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: `${C.alertAmber}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              <AlertTriangle size={15} color={C.alertAmber} strokeWidth={2.5} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  color: C.alertAmber,
                  marginBottom: 4,
                  letterSpacing: '0.06em',
                }}
              >
                ACTIVE SCAM · Giza
              </div>
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '12px',
                  color: '#5C5346',
                  lineHeight: 1.6,
                }}
              >
                "Free gift" vendors near the east path — walk past confidently.
              </div>
            </div>
          </div>
        </div>
      </div>
      {rafiq && <RafiqDrawer onClose={() => setRafiq(false)} />}
    </div>
  );
}
