'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, FlaskConical, Wifi, Activity, Coins, Trash2, X, ExternalLink, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { C } from '@/lib/constants/theme';
import { useLocation } from '@/providers/LocationProvider';
import { useDemoStore, getDemoStore, setDemoMode, recordVisit, addTokens, resetDemo, VISITABLE_SITES } from '@/lib/demoStore';
import { diagnosticsService, type DiagResult } from '@/services/diagnosticsService';

const GOVS = ['Cairo', 'Giza', 'Luxor', 'Aswan', 'Alexandria', 'Red Sea'];

const PAGES = [
  { label: 'Explore', href: '/app/explore' },
  { label: 'Monuments', href: '/app/monuments' },
  { label: 'History', href: '/app/history' },
  { label: 'Profile', href: '/app/profile' },
  { label: 'Quests', href: '/app/quests' },
  { label: 'Wallet', href: '/app/wallet' },
  { label: 'Safety', href: '/app/safety' },
  { label: 'Rafiq', href: '/app/rafiq' },
  { label: 'Settings', href: '/app/settings' },
];

type Tab = 'demo' | 'visit' | 'diag';

const DFLT_GOV_COORDS: Record<string, { lat: number; lon: number }> = {
  Cairo: { lat: 30.0444, lon: 31.2357 },
  Giza: { lat: 29.9792, lon: 31.1342 },
  Luxor: { lat: 25.6872, lon: 32.6396 },
  Aswan: { lat: 24.0889, lon: 32.8998 },
  Alexandria: { lat: 31.2001, lon: 29.9187 },
  'Red Sea': { lat: 27.2579, lon: 33.8116 },
};

const DIAG_LABELS: Record<string, string> = {
  '/health': 'Core API Health',
  '/users/me': 'Authentication (users/me)',
  '/geo/pois': 'Nearby Places (geo/pois)',
  '/env': 'Environment (env)',
  '/safety': 'Safety (safety)',
  '/memory/history': 'Journey History (memory/history)',
};

export function TestHub() {
  const router = useRouter();
  const { lat, lon, setLocationOverride, requestLocation } = useLocation();
  const demo = useDemoStore();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('demo');
  const [flash, setFlash] = useState<string | null>(null);
  const [diag, setDiag] = useState<DiagResult[] | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  const notify = useCallback((msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash(null), 2500);
  }, []);

  const onTeleport = useCallback(
    (site: { lat?: number; lon?: number }, name: string, gov: string) => {
      const c = site.lat != null && site.lon != null
        ? { lat: site.lat, lon: site.lon }
        : DFLT_GOV_COORDS[gov] || { lat: 30.0444, lon: 31.2357 };
      setLocationOverride(c.lat, c.lon, name, gov);
      notify(`Teleported to ${name}`);
    },
    [setLocationOverride, notify]
  );

  const onVisit = useCallback(
    (siteId: number) => {
      const site = VISITABLE_SITES.find((s) => s.id === siteId);
      if (!site) return;
      const { lat: slat, lon: slon, name, gov } = site;
      const c = slat != null && slon != null ? { lat: slat, lon: slon } : DFLT_GOV_COORDS[site.gov] || { lat: 30.0444, lon: 31.2357 };
      setLocationOverride(c.lat, c.lon, name, site.gov);
      const next = recordVisit(site);
      const v = next.visits[next.visits.length - 1];
      notify(v?.badge ? `Visited ${name} · +${v.xp} XP · 🏅 ${v.badge}` : `Visited ${name} · +${v.xp} XP`);
      router.push('/app/history');
    },
    [setLocationOverride, notify, router]
  );

  const runDiagnostics = useCallback(async () => {
    setDiagLoading(true);
    setDiag(null);
    const target = { lat: lat ?? 29.9792, lon: lon ?? 31.1342 };
    const results = await diagnosticsService.runAll(target.lat, target.lon);
    setDiag(results);
    setDiagLoading(false);
    notify('Backend diagnostics complete');
  }, [lat, lon, notify]);

  const connected = diag ? diag.filter((d) => d.ok).length : null;
  const backends = diag ? diag.filter((d) => d.ok && d.source === 'backend').length : null;

  return (
    <div style={{ position: 'fixed', bottom: 24, left: 92, zIndex: 9999, fontFamily: "'Inter',sans-serif" }}>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            marginBottom: 12,
            background: '#FAF7F0',
            border: '1px solid rgba(27,26,23,0.12)',
            borderRadius: 16,
            boxShadow: '0 16px 40px rgba(27,26,23,0.18)',
            width: 320,
            maxHeight: '70vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid rgba(27,26,23,0.08)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.nile, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FlaskConical size={15} color={C.terracotta} /> Test Hub
              </div>
              <div style={{ fontSize: 10, color: '#A89880', marginTop: 2 }}>Demo Mode &amp; backend diagnostics</div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B7E6A' }}>
              <X size={16} />
            </button>
          </div>

          {flash && (
            <div style={{ background: `${C.faience}14`, border: `1px solid ${C.faience}30`, color: C.nile, fontSize: 11, fontWeight: 600, padding: '7px 12px' }}>
              {flash}
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2, padding: '8px 10px 0' }}>
            {(
              [
                { id: 'demo', label: 'Demo' },
                { id: 'visit', label: 'Visit' },
                { id: 'diag', label: 'Backend' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  background: tab === t.id ? C.nile : 'transparent',
                  color: tab === t.id ? C.limestone : '#8B7E6A',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '10px 12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tab === 'demo' && (
              <>
                {/* Demo Mode toggle */}
                <div style={{ background: C.limestone, borderRadius: 12, padding: 12, border: `1px solid ${demo.mode === 'on' ? C.safeGreen : 'rgba(27,26,23,0.08)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.nile }}>Demo Mode</div>
                      <div style={{ fontSize: 10, color: '#8B7E6A', marginTop: 2 }}>Simulate a full user journey without a backend</div>
                    </div>
                    <button
                      onClick={() => {
                        setDemoMode(demo.mode === 'on' ? 'off' : 'on');
                        notify(demo.mode === 'on' ? 'Demo Mode OFF — live API is default' : 'Demo Mode ON — pages now use simulated data');
                      }}
                      style={{ width: 42, height: 22, borderRadius: 99, background: demo.mode === 'on' ? C.safeGreen : '#D4CBB8', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}
                    >
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: demo.mode === 'on' ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
                    </button>
                  </div>
                  {demo.mode === 'on' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 10 }}>
                      {[
                        { label: 'XP', val: String(demo.xp) },
                        { label: 'Badges', val: String(demo.badges.length) },
                        { label: 'Visits', val: String(demo.visits.length) },
                      ].map((s) => (
                        <div key={s.label} style={{ background: 'rgba(27,26,23,0.05)', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: C.copper }}>{s.val}</div>
                          <div style={{ fontSize: 9, color: '#8B7E6A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick actions */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => addTokens(500)} style={{ ...actionBtn, background: `${C.sand}18`, border: `1px solid ${C.sand}50`, color: '#7A5A1E' }}>
                    <Coins size={13} /> +500 tokens
                  </button>
                  <button
                    onClick={() => {
                      resetDemo();
                      notify('Demo data reset');
                    }}
                    style={{ ...actionBtn, background: `${C.signalRed}0F`, border: `1px solid ${C.signalRed}35`, color: C.signalRed }}
                  >
                    <Trash2 size={13} /> Reset demo
                  </button>
                </div>

                {/* Teleport */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#A89880', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Teleport to governorate</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {GOVS.map((g) => (
                      <button key={g} onClick={() => onTeleport({}, g, g)} style={{ ...chipBtn, borderColor: govActive(g, lat, lon) ? C.faience : 'rgba(27,26,23,0.12)', color: govActive(g, lat, lon) ? C.faience : '#6B6354' }}>
                        <MapPin size={11} /> {g}
                      </button>
                    ))}
                    <button onClick={() => { requestLocation(); notify('Reset to GPS'); }} style={{ ...chipBtn, borderColor: 'rgba(27,26,23,0.12)', color: '#6B6354' }}>
                      <Activity size={11} /> My GPS
                    </button>
                  </div>
                </div>
              </>
            )}

            {tab === 'visit' && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#A89880', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Visit a site — teleports you, records the visit, awards XP &amp; badges
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {VISITABLE_SITES.map((site) => (
                    <button key={site.id} onClick={() => onVisit(site.id)} style={{ ...siteBtn }}>
                      <MapPin size={13} color={C.terracotta} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.nile }}>{site.name}</div>
                        <div style={{ fontSize: 10, color: '#8B7E6A' }}>{site.gov} · {site.cat}</div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: C.copper }}>+{Math.round((site.rating ?? 4.5) * 40)} XP</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {tab === 'diag' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={runDiagnostics} disabled={diagLoading} style={{ ...actionBtn, background: C.nile, border: '1px solid C.nile', color: C.limestone, flex: 1 }}>
                    {diagLoading ? <Loader2 size={13} className="animate-spin" /> : <Wifi size={13} />} {diagLoading ? 'Checking...' : 'Run backend diagnostics'}
                  </button>
                </div>

                {connected != null && (
                  <div style={{ background: C.limestone, borderRadius: 10, padding: '9px 12px', border: `1px solid ${connected === 6 ? C.safeGreen : C.alertAmber}40` }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: C.nile }}>
                      {connected === 6 ? 'Backend fully connected ✓' : `${connected}/6 endpoints reachable`}
                    </div>
                    <div style={{ fontSize: 10, color: '#8B7E6A', marginTop: 2 }}>
                      {backends}/{connected} responding with real data from the server.
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(diag ?? []).map((d) => (
                    <div key={d.endpoint} style={{ background: '#fff', borderRadius: 10, padding: '9px 11px', border: '1px solid rgba(27,26,23,0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        {d.ok ? <CheckCircle2 size={14} color={C.safeGreen} style={{ flexShrink: 0 }} /> : <XCircle size={14} color={C.signalRed} style={{ flexShrink: 0 }} />}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: C.nile }}>{DIAG_LABELS[d.endpoint] || d.endpoint}</div>
                          <div style={{ fontSize: 10, color: '#8B7E6A' }}>{d.detail}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: d.status != null && d.status >= 200 && d.status < 400 ? C.safeGreen : C.signalRed }}>
                            {d.status ?? 'ERR'}
                          </div>
                          <div style={{ fontSize: 9, color: '#A89880' }}>{d.ms}ms</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 5, display: 'flex', gap: 5 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: d.source === 'backend' ? `${C.safeGreen}14` : 'rgba(27,26,23,0.07)', color: d.source === 'backend' ? C.safeGreen : '#8B7E6A' }}>
                          {d.source === 'backend' ? 'Backend' : d.source === 'demo' ? 'Demo' : 'Offline'}
                        </span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: d.hasData ? `${C.faience}14` : 'transparent', color: d.hasData ? C.faience : '#A89880' }}>
                          {d.hasData ? 'Real data received' : 'No data'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Pages */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#A89880', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Open a page</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                {PAGES.map((p) => (
                  <button
                    key={p.href}
                    onClick={() => router.push(p.href)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: C.limestone, border: '1px solid rgba(27,26,23,0.08)', borderRadius: 8, padding: '7px 4px', fontSize: 11, fontWeight: 600, color: C.nile, cursor: 'pointer' }}
                  >
                    {p.label} <ExternalLink size={10} color="#A89880" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setTab('demo');
        }}
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: demo.mode === 'on' ? C.safeGreen : C.terracotta,
          color: C.limestone,
          border: 'none',
          boxShadow: demo.mode === 'on' ? '0 8px 24px rgba(46,122,84,0.35)' : '0 8px 24px rgba(196,98,58,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          transform: isOpen ? 'scale(0.95)' : 'scale(1)',
        }}
      >
        <FlaskConical size={24} />
      </button>
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '7px 12px',
  borderRadius: 9,
  fontSize: 11,
  fontWeight: 700,
  cursor: 'pointer',
};

const chipBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '4px 10px',
  borderRadius: 99,
  fontSize: 11,
  fontWeight: 600,
  background: '#FAF7F0',
  border: '1px solid',
  cursor: 'pointer',
};

const siteBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '9px 11px',
  background: '#FAF7F0',
  border: '1px solid rgba(27,26,23,0.08)',
  borderRadius: 10,
  cursor: 'pointer',
};

function govActive(gov: string, lat: number | null, lon: number | null): boolean {
  if (lat == null || lon == null) return false;
  const c = DFLT_GOV_COORDS[gov];
  if (!c) return false;
  const dLat = Math.abs(lat - c.lat);
  const dLon = Math.abs(lon - c.lon);
  return dLat < 0.5 && dLon < 0.5;
}
