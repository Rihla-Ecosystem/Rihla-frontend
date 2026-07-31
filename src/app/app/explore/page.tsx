'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { C } from '@/lib/constants/theme';
import { Glyph, GlyphFull, Geom } from '@/app/components/atoms';
import {
  MapPin,
  Bell,
  Navigation,
  Wind,
  Thermometer,
  Sun,
  Shield,
  Search,
  Map,
  User,
  AlertTriangle,
  Star,
  Clock,
  Camera,
  ArrowRight,
  Globe,
  Phone,
  CreditCard,
  Wifi,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Menu,
  Home,
  Compass,
  Settings,
  BarChart2,
  Wallet,
  LogOut,
  Zap,
  Filter,
  SlidersHorizontal,
  BookOpen,
  Send,
  Mic,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { TopBar } from '@/app/components/layout/TopBar';
import { SiteCard } from '@/app/components/siteCard';
import { RafiqDrawer } from '@/app/components/rafiqDrawer';

import { ALL_SITES } from '@/app/data/rihla-data';

const EXPLORE_CATS = ['All', 'Temples', 'Museums', 'Archaeological', 'Markets', 'Hidden gems'];
const GOVERNORATES = ['Giza', 'Cairo', 'Luxor', 'Aswan', 'Alexandria', 'Sinai', 'Red Sea'];


export default function ExplorePage() {
  const router = useRouter();
  const [cat, setCat] = useState('All');
  const [gov, setGov] = useState('Giza');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('distance');
  const [rafiq, setRafiq] = useState(false);
  const [selected, setSelected] = useState<(typeof ALL_SITES)[0] | null>(null);

  const filtered = ALL_SITES.filter(
    (s) =>
      cat === 'All' ||
      s.cat === cat ||
      (cat === 'Hidden gems' && s.tag === 'Hidden gem') ||
      (cat === 'Markets' && s.cat === 'Market')
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar location={`${gov} Governorate`} onRafiq={() => setRafiq(true)} />

      {/* Explore header */}
      <div
        style={{
          background: `linear-gradient(135deg,${C.nile},${C.nileMid})`,
          padding: '28px 32px',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div style={{ position: 'absolute', right: -40, top: -40 }}>
          <Geom size={240} color={C.limestone} op={0.032} />
        </div>
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '10px',
                  fontWeight: 600,
                  color: `${C.limestone}50`,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Exploring
              </div>
              <h1
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 'clamp(24px,3vw,36px)',
                  fontWeight: 400,
                  color: C.limestone,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                Discover <span style={{ fontStyle: 'italic', color: C.sand }}>Egypt</span>
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  display: 'flex',
                  background: `${C.limestone}12`,
                  border: `1px solid ${C.limestone}20`,
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                {(['grid', 'list'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    style={{
                      background: view === v ? `${C.limestone}20` : 'transparent',
                      border: 'none',
                      padding: '7px 12px',
                      cursor: 'pointer',
                      color: view === v ? C.limestone : `${C.limestone}45`,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {v === 'grid' ? (
                      <SlidersHorizontal size={15} strokeWidth={2} />
                    ) : (
                      <BookOpen size={15} strokeWidth={2} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Governorate selector */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              paddingBottom: 2,
            }}
          >
            {GOVERNORATES.map((g) => (
              <button
                key={g}
                onClick={() => setGov(g)}
                style={{
                  background: g === gov ? C.limestone : `${C.limestone}12`,
                  border: `1px solid ${g === gov ? C.limestone : `${C.limestone}20`}`,
                  borderRadius: 99,
                  padding: '6px 16px',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '12px',
                  fontWeight: g === gov ? 700 : 400,
                  color: g === gov ? C.nile : `${C.limestone}75`,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.18s',
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: '24px 32px',
          maxWidth: 1100,
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Filters row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {EXPLORE_CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                style={{
                  background: c === cat ? C.nile : 'transparent',
                  border: `1.5px solid ${c === cat ? C.nile : 'rgba(27,26,23,0.13)'}`,
                  borderRadius: 99,
                  padding: '6px 16px',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '13px',
                  fontWeight: c === cat ? 600 : 400,
                  color: c === cat ? C.limestone : '#6B6354',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {c}
              </button>
            ))}
            <button
              style={{
                background: 'transparent',
                border: '1.5px solid rgba(27,26,23,0.13)',
                borderRadius: 99,
                padding: '6px 14px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: '#6B6354',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Filter size={13} strokeWidth={2} /> More filters
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#A89880' }}>
              Sort by:
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                background: '#FAF7F0',
                border: '1.5px solid rgba(27,26,23,0.1)',
                borderRadius: 8,
                padding: '6px 12px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: C.nile,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="distance">Nearest first</option>
              <option value="rating">Highest rated</option>
              <option value="reviews">Most reviewed</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '13px',
              fontWeight: 600,
              color: C.nile,
            }}
          >
            {filtered.length} sites
          </span>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: '#A89880' }}>
            in {gov} Governorate
          </span>
          {filtered.some((s) => s.scam) && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: `${C.alertAmber}12`,
                border: `1px solid ${C.alertAmber}25`,
                borderRadius: 99,
                padding: '3px 10px',
              }}
            >
              <AlertTriangle size={11} color={C.alertAmber} strokeWidth={2.5} />
              <span
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '11px',
                  fontWeight: 600,
                  color: C.alertAmber,
                }}
              >
                {filtered.filter((s) => s.scam).length} with active scam alerts
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
          {/* Site grid */}
          <div>
            {view === 'grid' ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
                  gap: 14,
                }}
              >
                {filtered.map((s) => (
                  <SiteCard key={s.id} s={s} goSite={(id) => router.push(`/app/sites/${id}`)} />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filtered.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      router.push(`/app/sites/${s.id}`);
                    }}
                    style={{
                      background: C.limestone,
                      borderRadius: 14,
                      border: '1px solid rgba(27,26,23,0.07)',
                      display: 'grid',
                      gridTemplateColumns: '100px 1fr auto',
                      gap: 16,
                      alignItems: 'center',
                      padding: '14px 18px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 6px rgba(27,26,23,0.04)',
                    }}
                  >
                    <div
                      style={{
                        width: 100,
                        height: 70,
                        borderRadius: 10,
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={s.img}
                        alt={s.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: "'Inter',sans-serif",
                          fontSize: '14px',
                          fontWeight: 700,
                          color: C.nile,
                          marginBottom: 2,
                        }}
                      >
                        {s.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Cormorant Garamond',serif",
                          fontStyle: 'italic',
                          fontSize: '11px',
                          color: '#A89880',
                          marginBottom: 8,
                        }}
                      >
                        {s.nameAr}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Star size={11} color={C.sand} fill={C.sand} strokeWidth={0} />
                          <span
                            style={{
                              fontFamily: "'Inter',sans-serif",
                              fontSize: '12px',
                              fontWeight: 700,
                              color: C.basalt,
                            }}
                          >
                            {s.rating}
                          </span>
                        </div>
                        <span
                          style={{
                            fontFamily: "'Inter',sans-serif",
                            fontSize: '11px',
                            color: '#A89880',
                            background: C.limestoneDark,
                            padding: '2px 8px',
                            borderRadius: 99,
                          }}
                        >
                          {s.cat}
                        </span>
                        {s.scam && (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              background: `${C.alertAmber}12`,
                              borderRadius: 99,
                              padding: '2px 8px',
                            }}
                          >
                            <AlertTriangle size={10} color={C.alertAmber} strokeWidth={2.5} />
                            <span
                              style={{
                                fontFamily: "'Inter',sans-serif",
                                fontSize: '10px',
                                fontWeight: 600,
                                color: C.alertAmber,
                              }}
                            >
                              Scam alert
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 8,
                      }}
                    >
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#8B7E6A' }}
                      >
                        <Navigation size={12} strokeWidth={2} />
                        <span
                          style={{
                            fontFamily: "'Inter',sans-serif",
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#8B7E6A',
                          }}
                        >
                          {s.dist}
                        </span>
                      </div>
                      <button
                        style={{
                          background: C.nile,
                          border: 'none',
                          borderRadius: 8,
                          padding: '7px 14px',
                          fontFamily: "'Inter',sans-serif",
                          fontSize: '12px',
                          fontWeight: 600,
                          color: C.limestone,
                          cursor: 'pointer',
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right panel: selected site or map placeholder */}
          <div style={{ position: 'sticky', top: 24, alignSelf: 'start' }}>
            <div>
              {/* Map placeholder */}
              <div
                style={{
                  background: `linear-gradient(145deg,${C.limestoneDark},#E0D9C6)`,
                  borderRadius: 16,
                  height: 280,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px dashed rgba(27,26,23,0.15)',
                  marginBottom: 14,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', inset: 0, opacity: 0.06 }}>
                  <Geom size={280} color={C.nile} op={1} />
                </div>
                <Map size={32} color={C.copper} strokeWidth={1.5} style={{ marginBottom: 12 }} />
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontStyle: 'italic',
                    fontSize: '16px',
                    color: C.copper,
                    marginBottom: 6,
                  }}
                >
                  Interactive Map
                </div>
                <div
                  style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#A89880' }}
                >
                  Click a site to see details here
                </div>
              </div>
              {/* Safety summary */}
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
                  Area Safety · {gov}
                </div>
                {[
                  { label: 'Overall Status', val: 'Secure', color: C.safeGreen },
                  { label: 'Active Scam Alerts', val: '2 sites', color: C.alertAmber },
                  { label: 'Restricted Zones', val: 'None nearby', color: C.safeGreen },
                  { label: 'Last Updated', val: '4 min ago', color: '#8B7E6A' },
                ].map(({ label, val, color }) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid rgba(27,26,23,0.05)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Inter',sans-serif",
                        fontSize: '12px',
                        color: '#8B7E6A',
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Inter',sans-serif",
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#8B7E6A',
                      }}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {rafiq && <RafiqDrawer onClose={() => setRafiq(false)} />}
    </div>
  );
}
