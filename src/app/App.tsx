"use client";

// @web-version
import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  MapPin, Bell, Navigation, Wind, Thermometer, Sun, Shield,
  Search, Map, User, AlertTriangle, Star, Clock, Camera,
  ArrowRight, Globe, Phone, CreditCard, Wifi,
  CheckCircle, X, ChevronLeft, ChevronRight, Menu,
  Home, Compass, Settings, BarChart2, Wallet, LogOut, Zap,
  Filter, SlidersHorizontal, BookOpen, Send, Mic, ChevronDown, RefreshCw
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  // Surfaces — warm papyrus/linen
  limestone:     "#F5EFE0",
  limestoneDark: "#EDE4CC",
  bg:            "#E8E0CC",
  // Dark — obsidian pyramid shadow
  basalt:        "#141008",
  // Teal — trust / depth
  nile:          "#0F3D3E",
  nileMid:       "#1A5253",
  // Solar action system — keyhole glow (logo DNA)
  solar:         "#C8831A",
  solarBright:   "#E8A820",
  solarGlow:     "#F5C040",
  // Egyptian material palette
  terracotta:    "#C4623A",
  sand:          "#D4A84E",
  faience:       "#2E9C93",
  copper:        "#8A5A34",
  bronze:        "#7A5530",
  brass:         "#B8883A",
  // Status
  safeGreen:     "#2E7A54",
  alertAmber:    "#D98E2C",
  signalRed:     "#B23A2E",
};

const hour    = new Date().getHours();
const isEve   = hour >= 17 || hour < 6;
const isMorn  = hour >= 6  && hour < 12;
const greeting = isEve ? "Good evening" : isMorn ? "Good morning" : "Good afternoon";
const isEvening = isEve;
const isMorning  = isMorn;
// ─── Shared atoms (web) ───────────────────────────────────────────────────────
// Pyramid-key icon: wide Egyptian pyramid + keyhole void
// viewBox 36×30 — wider than tall to match Giza proportions
function Glyph({ size = 28, light = false }: { size?: number; light?: boolean }) {
  // light=true → cream pyramid on dark bg  |  light=false → bronze pyramid on light bg
  const faceL  = light ? C.limestone : "#2C1E08";   // shadow (left) face
  const faceR  = light ? "#B8883A"   : "#7A5020";   // lit (right) face
  const hole   = light ? C.basalt    : C.solarGlow; // keyhole void
  const w = size;
  const h = Math.round(size * (30 / 36));
  return (
    <svg width={w} height={h} viewBox="0 0 36 30" fill="none">
      {/* Left (shadow) face: apex (18,2) → base left (1,28) */}
      <path d="M18 2L1 28H18V2Z" fill={faceL}/>
      {/* Right (lit) face: apex → base right (35,28) */}
      <path d="M18 2L35 28H18V2Z" fill={faceR}/>
      {/* Keyhole — centered, at ~62% of pyramid height */}
      <circle cx="18" cy="17" r="4.8" fill={hole}/>
      <rect x="15.5" y="17" width="5" height="7" rx="0.9" fill={hole}/>
    </svg>
  );
}

// Full pyramid-key mark with sun rays, crescent arc, and key shaft
// Accurately derived from the uploaded Rihla logo
// viewBox 60×96, aspect ratio 1:1.6
function GlyphFull({ size = 80, light = false }: { size?: number; light?: boolean }) {
  const faceL  = light ? C.limestone          : "#2C1E08";
  const faceR  = light ? "#C09848"            : "#7A5020";
  const rayCol = light ? C.solarBright        : C.solar;
  const shaft  = light ? C.limestone          : "#3A2A0C";
  const hole   = light ? C.basalt             : C.solarGlow;

  // 11 sun rays from apex (30,20), spanning −155° to −25°
  // They originate at the apex; the pyramid (painted later) covers the inner portions
  // Only the portions above & outside the pyramid are visible — exactly like the logo
  const rays = Array.from({ length: 11 }, (_, i) => {
    const t   = i / 10;
    const deg = -155 + t * 130;               // −155° … −25°
    const rad = deg * Math.PI / 180;
    const lng = i % 3 !== 1;                  // 8 long, 3 short
    const r   = lng ? 30 : 21;
    return { x2: 30 + r * Math.cos(rad), y2: 20 + r * Math.sin(rad), lng };
  });

  return (
    <svg width={size} height={Math.round(size * 1.6)} viewBox="0 0 60 96" fill="none">
      {/* ── Layer 1: sun rays from apex (painted first; pyramid covers inner ends) */}
      {rays.map((r, i) => (
        <line key={i} x1={30} y1={20} x2={r.x2} y2={r.y2}
          stroke={rayCol}
          strokeWidth={r.lng ? "1.8" : "1.1"}
          strokeLinecap="round"
          opacity="0.92"/>
      ))}

      {/* ── Layer 2: crescent arc — full circle stroke behind pyramid
            cx=30, cy=36, r=24  →  wings are visible on each side of the pyramid:
            at y=28 left pyramid edge ≈ x=20, circle left ≈ x=7  →  13px wing ✓  */}
      <circle cx="30" cy="36" r="24"
        stroke={rayCol} strokeWidth="2.8" fill="none" opacity="0.60"/>

      {/* ── Layer 3: pyramid (covers center of rays and arc, leaving only the tips) */}
      {/* Left shadow face */}
      <path d="M30 20L4 50H30V20Z" fill={faceL}/>
      {/* Right lit face */}
      <path d="M30 20L56 50H30V20Z" fill={faceR}/>

      {/* ── Layer 4: keyhole — centered at 57% of pyramid height */}
      {/* Circle (tombstone top) */}
      <circle cx="30" cy="37" r="6.5" fill={hole}/>
      {/* Rectangular slot below */}
      <rect x="26.4" y="37" width="7.2" height="10" rx="1.3" fill={hole}/>

      {/* ── Layer 5: key shaft */}
      <rect x="27" y="50" width="6" height="28" rx="3" fill={shaft}/>

      {/* ── Layer 6: key bit teeth (right side) */}
      <rect x="33" y="63"   width="11"  height="3.4" rx="1.7" fill={shaft}/>
      <rect x="33" y="68.5" width="7"   height="2.8" rx="1.4" fill={shaft}/>
    </svg>
  );
}

// Concentric pyramid wireframes — architectural decorative from logo DNA
function Geom({ size = 280, color = C.limestone, op = 0.06 }: { size?: number; color?: string; op?: number }) {
  const cx = size / 2;
  const ay = size * 0.06;
  const bw = size * 0.90;
  const by = size * 0.96;
  const steps = 9;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" style={{ display: "block" }}>
      {Array.from({ length: steps }, (_, i) => {
        const t = (i + 1) / steps;
        const lx = cx - (bw * 0.5) * t;
        const rx = cx + (bw * 0.5) * t;
        const y  = ay + (by - ay) * t;
        return (
          <path key={i} d={`M${cx},${ay} L${rx},${y} L${lx},${y} Z`}
            stroke={color} strokeWidth="0.6" fill="none"
            opacity={op * (11 - i) * 1.1}/>
        );
      })}
      {/* Horizontal contour lines */}
      {Array.from({ length: 5 }, (_, i) => {
        const t = (i + 1) / 6;
        const y  = ay + (by - ay) * t;
        const hw = (bw * 0.5) * t;
        return (
          <line key={`h${i}`} x1={cx - hw} y1={y} x2={cx + hw} y2={y}
            stroke={color} strokeWidth="0.3" opacity={op * 4}/>
        );
      })}
    </svg>
  );
}

function WebField({ label, placeholder, type = "text", value, onChange }: { label: string; placeholder: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  const [f, setF] = useState(false);
  return (
    <div>
      <label style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.nile, display: "block", marginBottom: 7, letterSpacing: "0.04em" }}>{label}</label>
      <div style={{ background: f ? "#fff" : "#FAF7F0", border: `1.5px solid ${f ? C.solar : "rgba(27,26,23,0.13)"}`, borderRadius: 10, padding: "12px 14px", boxShadow: f ? `0 0 0 3px ${C.solar}18` : "none", transition: "all 0.2s" }}>
        <input type={type} placeholder={placeholder} value={value} onChange={onChange} onFocus={() => setF(true)} onBlur={() => setF(false)} style={{ background: "transparent", border: "none", outline: "none", fontFamily: "'Inter',sans-serif", fontSize: "15px", color: C.basalt, width: "100%" }}/>
      </div>
    </div>
  );
}

const GoogleSVG = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

// ─── SCREEN: Landing (web) ─────────────────────────────────────────────────────
function WebLanding({ go }: { go: (s: string) => void }) {
  return (
    <div style={{ background: C.limestone, minHeight: "100vh" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(246,241,231,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(27,26,23,0.08)", padding: "0 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Glyph size={28}/>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "19px", fontWeight: 500, color: C.nile, lineHeight: 1, letterSpacing: "-0.02em" }}>رحلة Rihla</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "9px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: C.bronze }}>AI Travel Companion</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => go("login")} style={{ background: "transparent", border: "none", fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 500, color: "#6B6354", cursor: "pointer", padding: "8px 16px" }}>Sign in</button>
            <button onClick={() => go("signup")} style={{ background: C.solar, border: "none", borderRadius: 8, padding: "9px 20px", fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 600, color: C.basalt, cursor: "pointer", boxShadow: `0 3px 14px ${C.solar}40` }}>Get started</button>
          </div>
        </div>
      </nav>

      <div style={{ background: `linear-gradient(165deg,${C.basalt} 0%,${C.nile} 52%,#0B2D2E 100%)`, minHeight: "90vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80 }}><Geom size={520} color={C.limestone} op={0.028}/></div>
        <div style={{ position: "absolute", bottom: -120, left: -60 }}><Geom size={400} color={C.solar} op={0.018}/></div>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", width: "100%" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${C.solar}18`, border: `1px solid ${C.solar}40`, borderRadius: 99, padding: "5px 14px 5px 9px", marginBottom: 28 }}>
              <MapPin size={11} color={C.solarBright} strokeWidth={2.5}/>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: C.solarBright, letterSpacing: "0.06em" }}>EGYPT · 27 GOVERNORATES · AI-POWERED</span>
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(42px,5vw,68px)", fontWeight: 300, color: C.limestone, lineHeight: 1.06, letterSpacing: "-0.03em", marginBottom: 20 }}>
              Your key<br/><span style={{ fontStyle: "italic", color: C.solarBright }}>to Egypt.</span>
            </h1>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "17px", color: `${C.limestone}60`, lineHeight: 1.75, fontWeight: 300, maxWidth: 420, marginBottom: 36 }}>
              AI safety intelligence, cultural storytelling, and real-time guidance — in one quiet, confident travel companion.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 36 }}>
              <button onClick={() => go("signup")} style={{ background: C.solar, border: "none", borderRadius: 10, padding: "14px 28px", fontFamily: "'Inter',sans-serif", fontSize: "16px", fontWeight: 700, color: C.basalt, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: `0 4px 24px ${C.solar}50` }}>
                Unlock Egypt <ArrowRight size={18} strokeWidth={2.5}/>
              </button>
              <button onClick={() => go("login")} style={{ background: `${C.limestone}10`, border: `1.5px solid ${C.limestone}28`, borderRadius: 10, padding: "14px 28px", fontFamily: "'Inter',sans-serif", fontSize: "16px", fontWeight: 500, color: `${C.limestone}75`, cursor: "pointer" }}>Sign in</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex" }}>
                {[C.terracotta, C.faience, C.copper, C.safeGreen, C.alertAmber].map((col, i) => (
                  <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: col, border: `2px solid ${C.nile}`, marginLeft: i === 0 ? 0 : -9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: C.limestone }}>{["S","A","M","L","K"][i]}</div>
                ))}
              </div>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: `${C.limestone}55` }}><strong style={{ color: `${C.limestone}85`, fontWeight: 600 }}>12,400+</strong> travelers trust Rihla</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32, position: "relative" }}>
            {/* Radial glow behind logo */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(circle, ${C.solar}12 0%, transparent 70%)`, pointerEvents: "none" }}/>
            <GlyphFull size={120} light/>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
              {[{ src: "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=500&h=280&fit=crop", h: 160 }, { src: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=500&h=280&fit=crop", h: 160 }].map(({ src, h }, i) => (
                <div key={i} style={{ borderRadius: 12, overflow: "hidden", height: h, position: "relative" }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}/>
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg,transparent 30%,${C.basalt}60 100%)` }}/>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: C.basalt }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 48px", display: "flex", justifyContent: "space-around" }}>
          {[{ v: "27", l: "Governorates covered" }, { v: "6,600+", l: "Verified sites" }, { v: "15", l: "Live safety sources" }, { v: "3", l: "AI personas" }].map(({ v, l }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "28px", fontWeight: 500, color: C.solarBright }}>{v}</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 500, color: `${C.limestone}40`, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 48px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: C.copper, marginBottom: 8 }}>What Rihla does</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(32px,4vw,48px)", fontWeight: 300, color: C.nile }}>Not a guide. <span style={{ fontStyle: "italic", color: C.solar }}>A key.</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          {[{ icon: <Shield size={22} strokeWidth={1.8}/>, color: C.safeGreen, title: "Real-time Safety Intelligence", body: "Scam alerts, restricted zones, environmental hazards, and emergency contacts — continuously monitored from 15 live sources." }, { icon: <Glyph size={22}/>, color: C.faience, title: "Rafiq — Your AI Companion", body: "Ask anything in natural language. Get answers that feel like a knowledgeable local friend, with cultural depth." }, { icon: <Globe size={22} strokeWidth={1.8}/>, color: C.terracotta, title: "Cultural Storytelling", body: "Every site has a story. Rihla surfaces it as a journal entry — tailored to where you are, enriched with history." }, { icon: <Zap size={22} strokeWidth={1.8}/>, color: C.copper, title: "Journey Progress & Rewards", body: "Collect experiences like fragments of a story. Earn badges, unlock governorates, track your Egypt journey." }].map(({ icon, color, title, body }) => (
            <div key={title} style={{ background: "#FAF7F0", borderRadius: 16, padding: "28px 24px", border: "1px solid rgba(27,26,23,0.06)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: `${color}15`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", color, marginBottom: 16 }}>{icon}</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "15px", fontWeight: 700, color: C.nile, marginBottom: 8 }}>{title}</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#6B6354", lineHeight: 1.7 }}>{body}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: `linear-gradient(135deg,${C.nile},${C.nileMid})`, padding: "80px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>{[1,2,3,4,5].map(s => <Star key={s} size={14} color={C.sand} fill={C.sand} strokeWidth={0}/>)}</div>
            <blockquote style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "clamp(18px,2.5vw,24px)", color: C.limestone, lineHeight: 1.6, marginBottom: 24 }}>"Rihla warned me about a scam at Khan el-Khalili before I even reached the gate. Then it told me the story of the mosque I would have walked right past."</blockquote>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg,${C.faience},${C.nile})`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "17px", fontWeight: 500, color: C.limestone }}>M</span></div>
              <div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 600, color: C.limestone }}>Mia Hoffmann</div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.limestone}55` }}>Solo traveler · Berlin, Germany</div></div>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(26px,3vw,36px)", fontWeight: 400, color: C.limestone, lineHeight: 1.2, marginBottom: 12 }}>Ready to unlock<br/><span style={{ fontStyle: "italic", color: C.solarBright }}>Egypt, your way?</span></div>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: `${C.limestone}55`, marginBottom: 28, lineHeight: 1.6 }}>Free to start. No credit card required. Works on any device.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => go("signup")} style={{ background: C.solar, border: "none", borderRadius: 10, padding: "14px 28px", fontFamily: "'Inter',sans-serif", fontSize: "15px", fontWeight: 700, color: C.basalt, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, boxShadow: `0 4px 20px ${C.solar}45` }}>Unlock Egypt free <ArrowRight size={17} strokeWidth={2.5}/></button>
              <button onClick={() => go("login")} style={{ background: `${C.limestone}12`, border: `1.5px solid ${C.limestone}25`, borderRadius: 10, padding: "14px 24px", fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 500, color: `${C.limestone}75`, cursor: "pointer" }}>Sign in</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: C.basalt, padding: "32px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Glyph size={18} light/><span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "14px", color: `${C.limestone}50` }}>رحلة · Your Egyptian Journey Companion</span></div>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.limestone}30` }}>© 2026 Rihla · All rights reserved</span>
        </div>
      </div>
    </div>
  );
}

// ─── Auth split shell ──────────────────────────────────────────────────────────
function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 64px", background: C.limestone, overflow: "auto" }}>{children}</div>
      <div style={{ background: `linear-gradient(160deg,${C.basalt} 0%,${C.nile} 55%,#0B2D2E 100%)`, display: "flex", flexDirection: "column", justifyContent: "center", padding: "64px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60 }}><Geom size={400} color={C.limestone} op={0.030}/></div>
        <div style={{ position: "absolute", bottom: -80, left: -40 }}><Geom size={320} color={C.solar} op={0.018}/></div>
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}><GlyphFull size={40} light/><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "22px", fontWeight: 500, color: C.limestone }}>رحلة Rihla</div></div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(32px,3.5vw,46px)", fontWeight: 300, color: C.limestone, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 16 }}>Egypt is not<br/>a backdrop.<br/><span style={{ fontStyle: "italic", color: C.solarBright }}>Egypt is the material.</span></h2>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "15px", color: `${C.limestone}55`, lineHeight: 1.75, maxWidth: 380, marginBottom: 40 }}>Every color, texture, and interaction in Rihla is derived from something physically Egyptian.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 48 }}>
            {[{ icon: <Shield size={15} strokeWidth={2}/>, color: C.safeGreen, text: "Real-time safety across 27 governorates" }, { icon: <Glyph size={15}/>, color: C.faience, text: "Rafiq — your AI companion, not a chatbot" }, { icon: <Globe size={15} strokeWidth={2}/>, color: C.terracotta, text: "Cultural stories, scam alerts, hidden gems" }].map(({ icon, color, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}25`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>{icon}</div>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: `${C.limestone}70` }}>{text}</span>
              </div>
            ))}
          </div>
          <div style={{ background: `${C.limestone}10`, border: `1px solid ${C.limestone}15`, borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "14px", color: `${C.limestone}80`, lineHeight: 1.6, marginBottom: 10 }}>"Rihla felt like having a local friend who happened to be a historian."</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.limestone}45` }}>— James O'Brien · Dublin, Ireland</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: Sign Up ───────────────────────────────────────────────────────────
function WebSignUp({ go }: { go: (s: string) => void }) {
  const { register, login, isLoading, error, clearError } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "", nationality: "", gender: "", style: "" });
  const [localErr, setLocalErr] = useState<string | null>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setLocalErr(null);
    clearError();
    setForm(f => ({ ...f, [k]: e.target.value }));
  };

  const handleNextStep = () => {
    if (!form.name || !form.email || !form.password) {
      setLocalErr("Please fill in your name, email, and password.");
      return;
    }
    if (form.password.length < 8) {
      setLocalErr("Password must be at least 8 characters long.");
      return;
    }
    setLocalErr(null);
    clearError();
    setStep(2);
  };

  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLocalErr(null);
    clearError();
    try {
      const genderVal = form.gender.toUpperCase() === "FEMALE" ? "FEMALE" : "MALE";
      await register({
        email: form.email,
        password: form.password,
        display_name: form.name,
        gender: genderVal,
        nationality: form.nationality || "Egyptian",
        language: ["English"],
        travel_style: form.style || "Explorer",
      });
      // Attempt login immediately after successful registration
      try {
        await login({ email: form.email, password: form.password });
        go("arrival");
      } catch {
        go("login");
      }
    } catch {
      // Error handled by AuthContext and displayed below
    }
  };

  const activeError = localErr || error;

  return (
    <AuthShell>
      <button onClick={() => { clearError(); step === 1 ? go("landing") : setStep(1); }} style={{ background: "none", border: "none", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#8B7E6A", cursor: "pointer", marginBottom: 32, padding: 0 }}>
        <ChevronLeft size={15} strokeWidth={2}/> Back
      </button>
      <div style={{ display: "flex", gap: 6, marginBottom: 28, alignItems: "center" }}>
        {[1,2].map(s => <div key={s} style={{ height: 3, width: s === step ? 32 : 16, borderRadius: 99, background: s <= step ? C.nile : C.limestoneDark, transition: "all 0.3s ease" }}/>)}
        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880", marginLeft: 8 }}>Step {step} of 2</span>
      </div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,3vw,36px)", fontWeight: 400, color: C.nile, letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: 6 }}>{step === 1 ? "Create your account" : "Your travel profile"}</h1>
      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "#8B7E6A", marginBottom: 28 }}>{step === 1 ? "Start your Egyptian journey — free forever." : "Helps Rafiq personalise every recommendation."}</p>
      
      {activeError && (
        <div style={{ background: `${C.signalRed}12`, border: `1px solid ${C.signalRed}30`, borderRadius: 10, padding: "10px 14px", marginBottom: 18, color: C.signalRed, fontFamily: "'Inter',sans-serif", fontSize: "13px", display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={16} color={C.signalRed} style={{ flexShrink: 0 }} />
          <span>{activeError}</span>
        </div>
      )}

      {step === 1 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <WebField label="Full Name" placeholder="Sara Al-Rashid" value={form.name} onChange={set("name")}/>
          <WebField label="Email Address" placeholder="sara@example.com" type="email" value={form.email} onChange={set("email")}/>
          <WebField label="Password" placeholder="Minimum 8 characters" type="password" value={form.password} onChange={set("password")}/>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}><div style={{ flex: 1, height: 1, background: "rgba(27,26,23,0.1)" }}/><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#A89880" }}>or</span><div style={{ flex: 1, height: 1, background: "rgba(27,26,23,0.1)" }}/></div>
          <button style={{ width: "100%", background: "#FAF7F0", border: "1.5px solid rgba(27,26,23,0.12)", borderRadius: 10, padding: 13, fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 600, color: C.basalt, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><GoogleSVG/> Continue with Google</button>
          <button onClick={handleNextStep} style={{ width: "100%", background: C.solar, border: "none", borderRadius: 10, padding: "13px 24px", fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.basalt, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: `0 4px 18px ${C.solar}40` }}>Continue <ArrowRight size={16} strokeWidth={2.5}/></button>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#A89880", textAlign: "center" }}>By continuing you agree to Rihla's <span style={{ color: C.faience, fontWeight: 600 }}>Terms</span> and <span style={{ color: C.faience, fontWeight: 600 }}>Privacy Policy</span></p>
        </div>
      ) : (
        <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.nile, display: "block", marginBottom: 7 }}>Nationality</label><div style={{ background: "#FAF7F0", border: "1.5px solid rgba(27,26,23,0.12)", borderRadius: 10, padding: "12px 14px" }}><select value={form.nationality} onChange={set("nationality")} style={{ background: "transparent", border: "none", outline: "none", fontFamily: "'Inter',sans-serif", fontSize: "15px", color: form.nationality ? C.basalt : "#A89880", width: "100%", cursor: "pointer" }}><option value="" disabled>Select your nationality</option>{["German","British","American","French","Italian","Japanese","Australian","Canadian","Egyptian","Other"].map(o => <option key={o} value={o}>{o}</option>)}</select></div></div>
          <div><label style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.nile, display: "block", marginBottom: 7 }}>Gender</label><div style={{ display: "flex", gap: 8 }}>{["Male","Female"].map(g => <button type="button" key={g} onClick={() => setForm(f => ({ ...f, gender: g }))} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1.5px solid ${form.gender === g ? C.nile : "rgba(27,26,23,0.12)"}`, background: form.gender === g ? `${C.nile}08` : "#FAF7F0", fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: form.gender === g ? 700 : 400, color: form.gender === g ? C.nile : "#8B7E6A", cursor: "pointer" }}>{g}</button>)}</div></div>
          <div><label style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.nile, display: "block", marginBottom: 7 }}>Travel Style</label><div style={{ background: "#FAF7F0", border: "1.5px solid rgba(27,26,23,0.12)", borderRadius: 10, padding: "12px 14px" }}><select value={form.style} onChange={set("style")} style={{ background: "transparent", border: "none", outline: "none", fontFamily: "'Inter',sans-serif", fontSize: "15px", color: form.style ? C.basalt : "#A89880", width: "100%", cursor: "pointer" }}><option value="" disabled>How do you like to travel?</option>{["Explorer","Cultural","Adventure","Relaxation","Family","Business"].map(o => <option key={o} value={o}>{o}</option>)}</select></div></div>
          <div style={{ background: "linear-gradient(145deg,#FAF3E4,#F0E8D0)", borderRadius: 12, padding: "13px 15px", border: `1px solid ${C.sand}25` }}><div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "13px", color: C.nile, lineHeight: 1.65 }}>"This helps Rafiq personalise your experience."</div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880", marginTop: 6 }}>◈ Your data is never sold or shared.</div></div>
          <button type="submit" disabled={isLoading} style={{ width: "100%", background: C.solar, border: "none", borderRadius: 10, padding: "13px 24px", fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.basalt, cursor: isLoading ? "wait" : "pointer", opacity: isLoading ? 0.7 : 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: `0 4px 18px ${C.solar}40` }}>
            {isLoading ? "Creating Account..." : "Create my account"} {!isLoading && <ArrowRight size={16} strokeWidth={2.5}/>}
          </button>
        </form>
      )}
      <div style={{ textAlign: "center", marginTop: 20 }}><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#8B7E6A" }}>Already have an account? </span><button onClick={() => { clearError(); go("login"); }} style={{ background: "none", border: "none", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.faience, cursor: "pointer" }}>Sign in</button></div>
    </AuthShell>
  );
}

// ─── SCREEN: Login ─────────────────────────────────────────────────────────────
function WebLogin({ go }: { go: (s: string) => void }) {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw]       = useState("");

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearError();
    try {
      await login({ email, password: pw });
      go("home");
    } catch {
      // Error is stored in AuthContext and displayed
    }
  };

  return (
    <AuthShell>
      <button onClick={() => { clearError(); go("landing"); }} style={{ background: "none", border: "none", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#8B7E6A", cursor: "pointer", marginBottom: 36, padding: 0 }}><ChevronLeft size={15} strokeWidth={2}/> Back to Rihla</button>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,3vw,36px)", fontWeight: 400, color: C.nile, letterSpacing: "-0.025em", marginBottom: 6 }}>Welcome back.</h1>
      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "#8B7E6A", marginBottom: 28 }}>Continue your Egyptian journey.</p>
      
      {error && (
        <div style={{ background: `${C.signalRed}12`, border: `1px solid ${C.signalRed}30`, borderRadius: 10, padding: "10px 14px", marginBottom: 18, color: C.signalRed, fontFamily: "'Inter',sans-serif", fontSize: "13px", display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={16} color={C.signalRed} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <WebField label="Email Address" placeholder="sara@example.com" type="email" value={email} onChange={e => { clearError(); setEmail(e.target.value); }}/>
        <WebField label="Password" placeholder="Your password" type="password" value={pw} onChange={e => { clearError(); setPw(e.target.value); }}/>
        <div style={{ textAlign: "right", marginTop: -6 }}><button type="button" style={{ background: "none", border: "none", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.faience, cursor: "pointer" }}>Forgot password?</button></div>
        <button type="submit" disabled={isLoading} style={{ width: "100%", background: C.solar, border: "none", borderRadius: 10, padding: "13px 24px", fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.basalt, cursor: isLoading ? "wait" : "pointer", opacity: isLoading ? 0.7 : 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: `0 4px 18px ${C.solar}40` }}>
          {isLoading ? "Signing in..." : "Sign in to Rihla"} {!isLoading && <ArrowRight size={16} strokeWidth={2.5}/>}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ flex: 1, height: 1, background: "rgba(27,26,23,0.1)" }}/><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#A89880" }}>or</span><div style={{ flex: 1, height: 1, background: "rgba(27,26,23,0.1)" }}/></div>
        <button type="button" style={{ width: "100%", background: "#FAF7F0", border: "1.5px solid rgba(27,26,23,0.12)", borderRadius: 10, padding: 13, fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 600, color: C.basalt, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><GoogleSVG/> Continue with Google</button>
      </form>
      <div style={{ textAlign: "center", marginTop: 24 }}><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#8B7E6A" }}>New to Rihla? </span><button onClick={() => { clearError(); go("signup"); }} style={{ background: "none", border: "none", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.faience, cursor: "pointer" }}>Create an account</button></div>
    </AuthShell>
  );
}

// ─── SCREEN: Arrival ──────────────────────────────────────────────────────────
const WEB_TIPS = [
  { id: "sim", color: C.faience, tag: "SIM Card", icon: <Wifi size={20} strokeWidth={1.8}/>, headline: "Get your SIM from official booths only", body: "At Cairo International Airport, head to the official Vodafone, Orange, Etisalat, or WE kiosks inside the arrivals hall. A tourist SIM with 20GB data costs ≈ EGP 120–180 (~$4).", checks: [{ ok: true, t: "Official Vodafone / Orange / Etisalat / WE booths" }, { ok: true, t: "Inside arrivals hall, past customs" }, { ok: false, t: "Men approaching you before baggage claim" }, { ok: false, t: "Booths outside the terminal building" }] },
  { id: "taxi", color: C.terracotta, tag: "Transport", icon: <Navigation size={20} strokeWidth={1.8}/>, headline: "Use ride apps — never unlicensed taxis", body: "Uber and Careem operate from Cairo Airport. A metered ride to Downtown Cairo is ≈ EGP 180–260 (~$6–9). White airport taxis use meters too.", checks: [{ ok: true, t: "Uber / Careem from the app (most reliable)" }, { ok: true, t: "White official airport taxis with meters" }, { ok: false, t: "Men offering 'fixed price' outside arrivals" }, { ok: false, t: "Any car without a meter or app booking" }] },
  { id: "currency", color: C.copper, tag: "Currency", icon: <CreditCard size={20} strokeWidth={1.8}/>, headline: "ATMs beat airport exchange counters", body: "Use CIB or Banque Misr ATMs inside the terminal. Withdraw EGP directly. A fair rate today is ≈ 30–31 EGP per USD. Avoid exchanging more than you need.", checks: [{ ok: true, t: "CIB or Banque Misr ATMs inside terminal" }, { ok: true, t: "Visa / Mastercard widely accepted in hotels" }, { ok: false, t: "Airport exchange kiosks (worse rate)" }, { ok: false, t: "Street money changers with 'great deals'" }] },
  { id: "rules", color: C.safeGreen, tag: "First 24hrs", icon: <Shield size={20} strokeWidth={1.8}/>, headline: "Your first day: three golden rules", body: "Egypt is safe and welcoming — a little preparation makes it effortless. Most tourist difficulties happen in the first few hours.", checks: [{ ok: true, t: "Keep passport and backup cash separate" }, { ok: true, t: "Screenshot your hotel address in Arabic" }, { ok: true, t: "Save Tourist Police number: 126" }, { ok: false, t: "Don't accept unsolicited 'free' gifts or tours" }] },
];

function WebArrival({ go }: { go: (s: string) => void }) {
  const [idx, setIdx] = useState(0);
  const tip = WEB_TIPS[idx];
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 860 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: `${C.faience}15`, border: `1px solid ${C.faience}30`, borderRadius: 99, padding: "6px 16px 6px 10px", marginBottom: 20 }}>
            <MapPin size={12} color={C.faience} strokeWidth={2.5}/>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: C.faience, letterSpacing: "0.06em" }}>CAIRO INTERNATIONAL AIRPORT · CAI</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 300, color: C.nile, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 10 }}>Welcome to <span style={{ fontStyle: "italic", color: C.terracotta }}>Egypt.</span></h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "16px", color: "#8B7E6A", lineHeight: 1.65 }}>Before you leave the airport, four things every smart traveler knows.</p>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 28, flexWrap: "wrap" }}>
          {WEB_TIPS.map((t, i) => (
            <button key={t.id} onClick={() => setIdx(i)} style={{ background: i === idx ? C.nile : "transparent", border: `1.5px solid ${i === idx ? C.nile : "rgba(27,26,23,0.15)"}`, borderRadius: 99, padding: "8px 18px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: i === idx ? 600 : 400, color: i === idx ? C.limestone : "#6B6354", cursor: "pointer", transition: "all 0.2s" }}>{t.tag}</button>
          ))}
        </div>
        <div style={{ background: C.limestone, borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 40px rgba(15,61,62,0.10)" }}>
          <div style={{ background: `linear-gradient(135deg,${tip.color}20,${tip.color}08)`, borderBottom: `1px solid ${tip.color}20`, padding: "28px 32px", display: "flex", alignItems: "flex-start", gap: 18 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${tip.color}20`, border: `1.5px solid ${tip.color}35`, display: "flex", alignItems: "center", justifyContent: "center", color: tip.color, flexShrink: 0 }}>{tip.icon}</div>
            <div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: tip.color, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>◈ Arrival Tip · {tip.tag}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(18px,2.5vw,24px)", fontWeight: 500, color: C.nile, lineHeight: 1.3 }}>{tip.headline}</div>
            </div>
          </div>
          <div style={{ padding: "28px 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <div>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "#5C5346", lineHeight: 1.8, marginBottom: 20 }}>{tip.body}</p>
              <div style={{ background: `linear-gradient(135deg,${C.nile},${C.nileMid})`, borderRadius: 13, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <Glyph size={20} light/>
                <div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: `${C.limestone}60`, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>Ask Rafiq</div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "13px", color: C.limestone, lineHeight: 1.4 }}>"Which SIM plan is best for 10 days?"</div></div>
                <ChevronRight size={15} color={`${C.limestone}45`} strokeWidth={2} style={{ marginLeft: "auto", flexShrink: 0 }}/>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#A89880", marginBottom: 14 }}>Quick reference</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tip.checks.map(({ ok, t }) => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 13px", background: ok ? `${C.safeGreen}08` : `${C.signalRed}06`, borderRadius: 10, border: `1px solid ${ok ? C.safeGreen : C.signalRed}18` }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: ok ? `${C.safeGreen}20` : `${C.signalRed}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ok ? <CheckCircle size={12} color={C.safeGreen} strokeWidth={2.5}/> : <X size={12} color={C.signalRed} strokeWidth={2.5}/>}</div>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: ok ? "#3E5C3E" : "#6B2A24", fontWeight: ok ? 500 : 400 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(27,26,23,0.07)", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6 }}>{WEB_TIPS.map((_, i) => <div key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 20 : 7, height: 7, borderRadius: 99, background: i === idx ? C.solar : C.limestoneDark, cursor: "pointer", transition: "all 0.3s" }}/>)}</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button onClick={() => go("home")} style={{ background: "none", border: "none", fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#A89880", cursor: "pointer" }}>Skip</button>
              {idx < WEB_TIPS.length - 1 ? (
                <button onClick={() => setIdx(idx + 1)} style={{ background: C.solar, border: "none", borderRadius: 9, padding: "10px 22px", fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.basalt, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, boxShadow: `0 3px 14px ${C.solar}40` }}>Next tip <ChevronRight size={15} strokeWidth={2}/></button>
              ) : (
                <button onClick={() => go("home")} style={{ background: C.solar, border: "none", borderRadius: 9, padding: "10px 22px", fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.basalt, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, boxShadow: `0 3px 14px ${C.solar}40` }}>Unlock Egypt <ArrowRight size={15} strokeWidth={2.5}/></button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App sidebar ──────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "home",    label: "Home",    icon: (a: boolean) => <Home     size={18} strokeWidth={a ? 2.2 : 1.7}/> },
  { id: "explore", label: "Explore", icon: (a: boolean) => <Compass  size={18} strokeWidth={a ? 2.2 : 1.7}/> },
  { id: "rafiq",   label: "Rafiq",   icon: (a: boolean) => <Glyph    size={18}/>,                              special: true },
  { id: "safety",  label: "Safety",  icon: (a: boolean) => <Shield   size={18} strokeWidth={a ? 2.2 : 1.7}/> },
  { id: "history", label: "History", icon: (a: boolean) => <Clock    size={18} strokeWidth={a ? 2.2 : 1.7}/> },
  { id: "wallet",  label: "Wallet",  icon: (a: boolean) => <Wallet   size={18} strokeWidth={a ? 2.2 : 1.7}/> },
  { id: "profile", label: "Profile", icon: (a: boolean) => <User     size={18} strokeWidth={a ? 2.2 : 1.7}/> },
  { id: "settings",label: "Settings",icon: (a: boolean) => <Settings size={18} strokeWidth={a ? 2.2 : 1.7}/> },
];

function AppShell({ activePage, setPage, go, children }: { activePage: string; setPage: (s: string) => void; go: (s: string) => void; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    go("landing");
  };

  const displayName = user?.displayName || "Sara Al-Rashid";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, overflow: "hidden" }}>
      <aside style={{ width: collapsed ? 64 : 220, background: "#111009", display: "flex", flexDirection: "column", flexShrink: 0, transition: "width 0.25s ease", overflow: "hidden" }}>
        <div style={{ padding: collapsed ? "20px 18px" : "24px 20px", borderBottom: `1px solid ${C.limestone}10`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <Glyph size={26} light/>
          {!collapsed && <div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "16px", fontWeight: 500, color: C.limestone, lineHeight: 1 }}>رحلة Rihla</div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "9px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: `${C.sand}80`, marginTop: 2 }}>AI Companion</div></div>}
        </div>
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map(({ id, label, icon }) => {
            const a = activePage === id;
            return (
              <button key={id} onClick={() => setPage(id)} style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, padding: collapsed ? "11px 0" : "10px 13px", borderRadius: 10, border: "none", background: (id as any).special || id === "rafiq" ? (a ? `${C.faience}25` : `${C.faience}10`) : a ? `${C.limestone}12` : "transparent", color: id === "rafiq" ? (a ? C.faience : `${C.faience}70`) : a ? C.limestone : `${C.limestone}45`, cursor: "pointer", transition: "all 0.15s", width: "100%", justifyContent: collapsed ? "center" : "flex-start", whiteSpace: "nowrap" }}>
                <span style={{ flexShrink: 0 }}>{icon(a)}</span>
                {!collapsed && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: a ? 600 : 400 }}>{label}</span>}
                {!collapsed && a && id !== "rafiq" && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: C.solar }}/>}
                {!collapsed && id === "rafiq" && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: C.faience, boxShadow: `0 0 0 3px ${C.faience}30` }}/>}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: collapsed ? "12px 8px" : "12px", borderTop: `1px solid ${C.limestone}10`, display: "flex", flexDirection: "column", gap: 4 }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${C.sand}40,${C.copper}40)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "13px", fontWeight: 500, color: C.limestone }}>{initial}</span></div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.limestone, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: `${C.limestone}45` }}>Explorer · Level 4</div></div>
            </div>
          )}
          <button onClick={() => setCollapsed(c => !c)} style={{ background: "none", border: "none", color: `${C.limestone}40`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 6, padding: "8px 10px", borderRadius: 8 }}>
            <Menu size={16} strokeWidth={2}/>{!collapsed && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px" }}>Collapse</span>}
          </button>
          <button onClick={handleLogout} style={{ background: "none", border: "none", color: `${C.limestone}35`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 6, padding: "8px 10px", borderRadius: 8 }}>
            <LogOut size={15} strokeWidth={2}/>{!collapsed && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px" }}>Sign out</span>}
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>{children}</main>
    </div>
  );
}

// ─── Top bar (shared) ────────────────────────────────────────────────────────
function TopBar({ location = "Giza Plateau, Cairo", onRafiq }: { location?: string; onRafiq?: () => void }) {
  return (
    <div style={{ background: "rgba(240,235,224,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(27,26,23,0.08)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, flexShrink: 0, position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <MapPin size={14} color={C.solar} strokeWidth={2.5}/>
        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.nile }}>{location}</span>
        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#A89880" }}>· Egypt</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ background: "#FAF7F0", border: "1.5px solid rgba(27,26,23,0.1)", borderRadius: 8, padding: "7px 14px", display: "flex", alignItems: "center", gap: 8, width: 220, cursor: "text" }}>
          <Search size={14} color="#A89880" strokeWidth={2}/><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#A89880" }}>Search places, stories…</span>
        </div>
        <button style={{ background: "none", border: "none", position: "relative", cursor: "pointer", color: "#6B6354" }}>
          <Bell size={19} strokeWidth={1.8}/><span style={{ position: "absolute", top: -1, right: -1, width: 7, height: 7, borderRadius: "50%", background: C.alertAmber, border: "1.5px solid #F0EBE0" }}/>
        </button>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${C.sand}50,${C.copper}50)`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "14px", fontWeight: 500, color: C.nile }}>S</span>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: Home ───────────────────────────────────────────────────────────────
const ALL_SITES = [
  {
    id: 1, name: "Great Sphinx of Giza", nameAr: "أبو الهول", cat: "Archaeological", dist: "0.3 km", rating: 4.9, reviews: 2740,
    img: "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=600&h=400&fit=crop",
    imgs: ["https://images.unsplash.com/photo-1539768942893-daf53e448371?w=900&h=600&fit=crop","https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=900&h=600&fit=crop","https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=900&h=600&fit=crop"],
    tag: "Icon", scam: true, gov: "Giza", built: "c. 2500 BCE", dynasty: "Old Kingdom · 4th Dynasty",
    hours: "8:00 AM – 5:00 PM", admission: "EGP 160 (adult) · EGP 80 (student)",
    duration: "1–2 hours", bestTime: "Late afternoon (3:30–5:00 PM)", accessibility: "Partially accessible",
    story: "Carved from a single limestone ridge, not assembled from blocks, the Great Sphinx is the world's largest monumental sculpture. Pharaoh Khafre ordered its construction around 2500 BCE — the face almost certainly depicts him. Standing 20 metres tall and 73 metres long, it has silently watched the Nile flood and recede for 4,500 years.\n\nThe missing nose was documented by Danish explorer Frederic Louis Norden in 1737 — long before Napoleon. Erosion patterns on the body have led some geologists to argue the monument predates 10,500 BCE, though mainstream Egyptology firmly dates it to Khafre's reign.",
    rafiqInsight: "The Sphinx faces due east, aligning with the rising sun on both equinoxes. Visit at dawn or dusk for the best light — and to see a phenomenon no guide mentions: at 4:32 PM in July, the shadow of Khafre's pyramid falls precisely on the Sphinx's back.",
    scamDetail: "Vendors near the east approach path offer 'free' scarab figurines, then aggressively demand EGP 200–500. Refuse before the object reaches your hand. Say 'la shukran' firmly and keep walking.",
    tips: ["Photography is permitted without a tripod — tripod permits cost EGP 30 extra", "The Sound & Light Show runs at 6:30 PM and 7:30 PM — tickets EGP 175", "Combine with the Pyramid plateau in one ticket for best value"],
    nearby: [2, 3, 4],
  },
  {
    id: 2, name: "Khufu Ship Museum", nameAr: "متحف مركب خوفو", cat: "Museum", dist: "0.6 km", rating: 4.7, reviews: 892,
    img: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600&h=400&fit=crop",
    imgs: ["https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=900&h=600&fit=crop","https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=900&h=600&fit=crop","https://images.unsplash.com/photo-1539768942893-daf53e448371?w=900&h=600&fit=crop"],
    tag: "Hidden gem", scam: false, gov: "Giza", built: "c. 2500 BCE · museum 1982", dynasty: "Old Kingdom · 4th Dynasty",
    hours: "9:00 AM – 4:00 PM", admission: "EGP 100 (adult) · EGP 50 (student)",
    duration: "45 min – 1 hour", bestTime: "Mid-morning (most visitors miss it)", accessibility: "Fully accessible",
    story: "In 1954, archaeologist Kamal el-Mallakh discovered a sealed pit south of the Great Pyramid. Inside: 1,224 pieces of Lebanese cedar that, when reassembled over 14 years, formed a 43-metre solar barque — perfectly preserved after 4,600 years.\n\nThe ship was never sailed. Built for Khufu's journey to the afterlife, it required wood so rare and expensive that Lebanese cedar was used as royal currency. Its joinery — tight enough to be watertight — predates iron nails by millennia.",
    rafiqInsight: "This is Giza's most overlooked marvel. The museum receives roughly 2% of the foot traffic of the Pyramids — yet contains a ship older than the Iliad, the Torah, and the earliest known alphabets.",
    scamDetail: null,
    tips: ["Photography inside costs EGP 50 extra — worth it", "English audio guide available at reception", "Visit early — the museum is small and gets warm by midday"],
    nearby: [1, 3, 4],
  },
  {
    id: 3, name: "Khafre Valley Temple", nameAr: "معبد وادي خفرع", cat: "Temple", dist: "1.1 km", rating: 4.8, reviews: 1204,
    img: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=600&h=400&fit=crop",
    imgs: ["https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=900&h=600&fit=crop","https://images.unsplash.com/photo-1539768942893-daf53e448371?w=900&h=600&fit=crop","https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=900&h=600&fit=crop"],
    tag: "Heritage", scam: false, gov: "Giza", built: "c. 2530 BCE", dynasty: "Old Kingdom · 4th Dynasty",
    hours: "8:00 AM – 5:00 PM", admission: "Included in Giza Plateau ticket",
    duration: "30–45 minutes", bestTime: "Early morning (7:30–9:00 AM)", accessibility: "Limited",
    story: "Built from pink Aswan granite and Egyptian alabaster, this mortuary temple once held 23 seated statues of Pharaoh Khafre — only fragments survive. Its geometry is flawless: the walls are perfectly plumb after 45 centuries, and the floor stones fit together so precisely that even a credit card cannot slide between them.\n\nA causeway of 494 metres once connected this temple to the upper pyramid temple — sealed, roofed, and decorated with painted reliefs now lost to time.",
    rafiqInsight: "Stand at the entrance at 7:15 AM in July and look east. The causeway aligns precisely with the sunrise — the ancient Egyptians built a solar calendar into the temple's orientation.",
    scamDetail: null,
    tips: ["Included in the Giza Plateau combo ticket", "Far fewer visitors than the Sphinx — often quiet early morning", "The granite blocks weigh 100–400 tons each"],
    nearby: [1, 2, 4],
  },
  {
    id: 4, name: "Egyptian Museum", nameAr: "المتحف المصري", cat: "Museum", dist: "3.2 km", rating: 4.6, reviews: 4210,
    img: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&h=400&fit=crop",
    imgs: ["https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=900&h=600&fit=crop","https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=900&h=600&fit=crop","https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=900&h=600&fit=crop"],
    tag: "Must-see", scam: false, gov: "Cairo", built: "1902 CE", dynasty: "120,000+ objects · 5,000 years",
    hours: "9:00 AM – 5:00 PM (Fri closes 11:30–1:30)", admission: "EGP 200 · Mummies Room: EGP 180 extra",
    duration: "3–5 hours", bestTime: "Weekday morning", accessibility: "Ground floor accessible",
    story: "Opened in 1902 on Tahrir Square, the Egyptian Museum houses the world's largest collection of Pharaonic antiquities across 136 halls. Among its 120,000 objects: Tutankhamun's golden death mask (3.24 kg of solid gold), the Royal Mummies Room, the Narmer Palette, and Akhenaten's colossal statues.\n\nThe building itself is designed in the Neoclassical style by French architect Marcel Dourgnon, who won an international competition for the commission in 1895.",
    rafiqInsight: "Most visitors spend 45 minutes photographing Tutankhamun's mask and leave. Spend that time instead with Nefertiti's canopic jars in Room 3 — the craftsmanship is incomparably finer, and the room is almost always empty.",
    scamDetail: null,
    tips: ["Book the Royal Mummies Room in advance — it sells out", "The cafeteria on the ground floor is surprisingly good", "Bag check is mandatory — large bags not admitted"],
    nearby: [1, 5, 6],
  },
  {
    id: 5, name: "Karnak Temple", nameAr: "معبد الكرنك", cat: "Temple", dist: "620 km", rating: 4.9, reviews: 5100,
    img: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=600&h=400&fit=crop",
    imgs: ["https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=900&h=600&fit=crop","https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=900&h=600&fit=crop","https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=900&h=600&fit=crop"],
    tag: "Icon", scam: false, gov: "Luxor", built: "c. 2055 BCE – 30 BCE", dynasty: "Middle Kingdom to Ptolemaic",
    hours: "6:00 AM – 5:30 PM", admission: "EGP 220 (adult) · EGP 110 (student)",
    duration: "3–4 hours", bestTime: "Early morning or Sound & Light Show", accessibility: "Mostly accessible",
    story: "Karnak is not one temple — it is a city of temples, built by successive pharaohs over nearly 2,000 years. The Hypostyle Hall alone contains 134 columns up to 24 metres tall, decorated floor-to-ceiling with painted reliefs. Walking between them is to understand why the ancient Egyptians believed their gods were real.\n\nThe sacred lake at Karnak is fed by underground channels from the Nile. It was used for ritual purification and, according to ancient records, for breeding sacred geese dedicated to Amun.",
    rafiqInsight: "The axis of the main temple aligns with the winter solstice sunrise — verified by astronomers in 2001. At dawn on December 21st, sunlight travels the entire 500-metre length of the temple and illuminates the inner sanctuary.",
    scamDetail: null,
    tips: ["Combine with Luxor Temple for a full day", "The Avenue of Sphinxes connecting both temples is now fully restored", "Sound & Light Show (EGP 175) is one of Egypt's best"],
    nearby: [3, 1, 2],
  },
  {
    id: 6, name: "Khan el-Khalili", nameAr: "خان الخليلي", cat: "Market", dist: "4.1 km", rating: 4.5, reviews: 6800,
    img: "https://images.unsplash.com/photo-1553997456-7b44d1bb8d21?w=600&h=400&fit=crop",
    imgs: ["https://images.unsplash.com/photo-1553997456-7b44d1bb8d21?w=900&h=600&fit=crop","https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=900&h=600&fit=crop","https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=900&h=600&fit=crop"],
    tag: "Market", scam: true, gov: "Cairo", built: "1382 CE", dynasty: "Mamluk · Burji period",
    hours: "9:00 AM – 11:00 PM (some stalls open until midnight)", admission: "Free entry",
    duration: "2–4 hours", bestTime: "Late afternoon into evening", accessibility: "Cobbled — challenging",
    story: "Established in 1382 by Emir Djaharks el-Khalili, the bazaar has traded continuously for 644 years, making it one of the oldest functioning markets on Earth. Its labyrinthine lanes were built deliberately to disorient — in medieval Cairo, a confused customer was a spending customer.\n\nCafé Riche, just outside the market, has been serving coffee since 1908. Naguib Mahfouz, Egypt's Nobel Prize-winning novelist, wrote much of his Cairo Trilogy at a corner table. The café still exists, unchanged.",
    rafiqInsight: "The goldsmiths' quarter (الصاغة) in the north-east section sells 18-karat gold by weight at near-market rate. It's where Cairenes buy wedding jewellery — no tourist markup. Find it by asking for 'souk el-dahab'.",
    scamDetail: "Two active scam patterns: (1) Men in 'traditional' dress offer free henna or a 'welcome gift' — payment demanded immediately after. (2) Perfume shop owners offer free tea, then pressure purchase of expensive oils. Accepting hospitality without obligation is part of Egyptian culture — but be clear upfront.",
    tips: ["Haggle — first price is always 3–5× the fair price", "The best spices are in the western lanes, away from the tourist entrance", "Avoid the papyrus shops near the entrance — most sell banana-leaf fakes"],
    nearby: [4, 3, 2],
  },
];

const JOURNEYS = [
  { name: "Islamic Cairo Trail",  progress: 35, total: 12, done: 4, color: C.faience    },
  { name: "Ancient Giza Circuit", progress: 67, total: 6,  done: 4, color: C.sand       },
  { name: "Nile Riverside Walk",  progress: 12, total: 8,  done: 1, color: C.terracotta },
];

function SiteCard({ s, goSite }: { s: typeof ALL_SITES[0]; goSite?: (id: number) => void }) {
  return (
    <div onClick={() => goSite?.(s.id)} style={{ background: C.limestone, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(27,26,23,0.07)", boxShadow: "0 2px 14px rgba(15,61,62,0.06)", cursor: "pointer" }}>
      <div style={{ height: 140, position: "relative" }}>
        <img src={s.img} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 40%,rgba(27,26,23,0.5) 100%)" }}/>
        <div style={{ position: "absolute", top: 8, left: 8 }}><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, background: s.tag === "Hidden gem" ? C.copper : C.nile, color: C.limestone, padding: "3px 8px", borderRadius: 99 }}>{s.tag}</span></div>
        {s.scam && <div style={{ position: "absolute", top: 8, right: 8, background: C.alertAmber, width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><AlertTriangle size={11} color="#fff" strokeWidth={2.5}/></div>}
        <div style={{ position: "absolute", bottom: 7, right: 9, display: "flex", alignItems: "center", gap: 3 }}><Navigation size={10} color={C.limestone} strokeWidth={2.5}/><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: C.limestone }}>{s.dist}</span></div>
      </div>
      <div style={{ padding: "12px 13px 14px" }}>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.nile, marginBottom: 2 }}>{s.name}</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "11px", color: "#A89880", marginBottom: 8 }}>{s.nameAr}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}><Star size={11} color={C.sand} fill={C.sand} strokeWidth={0}/><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, color: C.basalt }}>{s.rating}</span><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "#C4B89A" }}>({s.reviews.toLocaleString()})</span></div>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "#A89880", background: C.limestoneDark, padding: "2px 7px", borderRadius: 99 }}>{s.cat}</span>
        </div>
      </div>
    </div>
  );
}

function RafiqDrawer({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(15,61,62,0.45)", backdropFilter: "blur(4px)" }}/>
      <div style={{ position: "relative", width: 420, background: "linear-gradient(180deg,#FAF7F0,#F5EDD8)", height: "100%", boxShadow: "-16px 0 48px rgba(15,61,62,0.2)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(27,26,23,0.08)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: `linear-gradient(135deg,${C.nile},${C.nileMid})`, display: "flex", alignItems: "center", justifyContent: "center" }}><Glyph size={22} light/></div>
          <div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "17px", fontWeight: 500, color: C.nile }}>Rafiq</div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: C.faience, fontWeight: 500 }}>● Active · Giza context loaded</div></div>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#A89880", display: "flex" }}><X size={18} strokeWidth={2}/></button>
        </div>
        <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "linear-gradient(160deg,#FAF3E4,#F0E8D0)", borderRadius: "4px 16px 16px 16px", padding: "14px 16px", border: `1px solid ${C.sand}22` }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: C.copper, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>◈ Rafiq</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "14px", color: C.nile, lineHeight: 1.65 }}>Welcome to the Giza Plateau! I've loaded verified historical records and current safety data. What would you like to know?</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "#A89880", marginTop: 8 }}>Based on 40 verified sources · Just now</div>
          </div>
          <div style={{ background: `${C.alertAmber}10`, border: `1px solid ${C.alertAmber}28`, borderRadius: 12, padding: "10px 13px", display: "flex", gap: 9, alignItems: "flex-start" }}>
            <AlertTriangle size={13} color={C.alertAmber} strokeWidth={2.5} style={{ marginTop: 2, flexShrink: 0 }}/>
            <div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, color: C.alertAmber, marginBottom: 2 }}>Active Scam · This Area</div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#6B6354", lineHeight: 1.5 }}>"Free gift" vendors near the east path — walk past confidently.</div></div>
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {["Is the Sphinx safe now?","Best time to visit?","Nearest restaurant","Explain the history"].map(q => (
              <button key={q} style={{ background: C.limestone, border: `1.5px solid ${C.nile}15`, borderRadius: 99, padding: "6px 12px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 500, color: C.nile, cursor: "pointer" }}>{q}</button>
            ))}
          </div>
        </div>
        <div style={{ padding: "16px 24px 24px", borderTop: "1px solid rgba(27,26,23,0.07)" }}>
          <div style={{ background: C.limestone, border: `1.5px solid ${C.faience}38`, borderRadius: 12, padding: "11px 14px", display: "flex", alignItems: "center", gap: 9, boxShadow: `0 0 0 3px ${C.faience}10` }}>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask anything about Egypt…" style={{ background: "transparent", border: "none", outline: "none", flex: 1, fontFamily: "'Inter',sans-serif", fontSize: "14px", color: C.basalt }}/>
            <button style={{ background: input ? C.nile : C.limestoneDark, border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke={input ? C.limestone : "#A89880"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageHome({ goSite }: { goSite?: (id: number) => void }) {
  const [rafiq, setRafiq] = useState(false);
  const { user } = useAuth();
  const displayName = user?.displayName || "Sara Al-Rashid";
  const tg = isEve ? `linear-gradient(160deg,#1B1A17 0%,#2A1A0A 40%,${C.nile} 100%)` : isMorn ? `linear-gradient(160deg,${C.nile} 0%,#1A6B5A 40%,#C4834A 100%)` : `linear-gradient(160deg,${C.nile} 0%,#0A3D4A 50%,#1A5253 100%)`;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar onRafiq={() => setRafiq(true)}/>
      <div style={{ background: tg, padding: "36px 32px 32px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ position: "absolute", right: -60, top: -60 }}><Geom size={280} color={C.limestone} op={0.038}/></div>
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "end", gap: 32 }}>
          <div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: `${C.limestone}55`, marginBottom: 4 }}>{greeting},</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,3vw,40px)", fontWeight: 400, color: C.limestone, lineHeight: 1.1, letterSpacing: "-0.025em", marginBottom: 20 }}>{displayName}</h1>
            <button onClick={() => setRafiq(true)} style={{ background: `${C.limestone}14`, backdropFilter: "blur(10px)", border: `1px solid ${C.limestone}20`, borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", maxWidth: 480, textAlign: "left" }}>
              <Glyph size={22} light/>
              <div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: `${C.limestone}55`, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>◈ Ask Rafiq</div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "14px", color: C.limestone }}>Ask about history, safety, food, local tips…</div></div>
              <ChevronRight size={16} color={`${C.limestone}40`} strokeWidth={2} style={{ marginLeft: "auto", flexShrink: 0 }}/>
            </button>
          </div>
          <div style={{ background: "rgba(246,241,231,0.12)", backdropFilter: "blur(14px)", border: `1.5px solid ${C.safeGreen}40`, borderRadius: 16, padding: "18px 22px", textAlign: "center", flexShrink: 0, minWidth: 180 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.safeGreen, boxShadow: `0 0 0 3px ${C.safeGreen}35` }}/><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "16px", fontWeight: 800, color: C.safeGreen, letterSpacing: "0.04em" }}>SECURE</span>
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: `${C.limestone}55`, marginBottom: 14 }}>Updated 4 min ago</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[{ icon: <Sun size={12}/>, l: "UV", v: "7" }, { icon: <Thermometer size={12}/>, l: "°C", v: "38" }, { icon: <Wind size={12}/>, l: "Air", v: "✓" }].map(({ icon, l, v }) => (
                <div key={l} style={{ flex: 1, background: `${C.limestone}10`, borderRadius: 8, padding: "6px 4px", textAlign: "center" }}>
                  <div style={{ color: `${C.limestone}70`, marginBottom: 2, display: "flex", justifyContent: "center" }}>{icon}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: `${C.limestone}50` }}>{l}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, color: C.limestone }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, padding: "28px 32px", maxWidth: 1100, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", fontWeight: 500, color: C.nile }}>Nearby Sites</h2>
              <button style={{ background: "none", border: "none", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.faience, cursor: "pointer" }}>Explore all →</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {["All","Temples","Museums","Hidden gems","Markets"].map((cat, i) => <button key={cat} style={{ background: i === 0 ? C.nile : "transparent", border: `1.5px solid ${i === 0 ? C.nile : "rgba(27,26,23,0.13)"}`, borderRadius: 99, padding: "5px 14px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: i === 0 ? 600 : 400, color: i === 0 ? C.limestone : "#6B6354", cursor: "pointer" }}>{cat}</button>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
              {ALL_SITES.slice(0, 4).map(s => <SiteCard key={s.id} s={s} goSite={goSite}/>)}
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", fontWeight: 500, color: C.nile }}>Your Journeys</h2>
              <button style={{ background: "none", border: "none", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.faience, cursor: "pointer" }}>See all →</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {JOURNEYS.map(j => (
                <div key={j.name} style={{ background: C.limestone, borderRadius: 14, padding: "16px 18px", border: "1px solid rgba(27,26,23,0.07)", display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 600, color: C.nile }}>{j.name}</div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#A89880" }}>{j.done}/{j.total} sites</div></div>
                    <div style={{ height: 5, background: "#EDE6D6", borderRadius: 99, overflow: "hidden" }}><div style={{ height: "100%", width: `${j.progress}%`, background: `linear-gradient(90deg,${j.color},${j.color}99)`, borderRadius: 99 }}/></div>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "22px", fontWeight: 600, color: j.color, minWidth: 48, textAlign: "right" }}>{j.progress}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "linear-gradient(160deg,#FAF3E4,#F0E5C8)", borderRadius: 16, padding: 18, border: `1px solid ${C.sand}28` }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: C.copper, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>◈ Rafiq's Local Tip</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "15px", color: C.nile, lineHeight: 1.65, marginBottom: 10 }}>"Visit the Sphinx after 3pm — afternoon light hits the face directly, and crowds thin by 40%."</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880" }}>Based on 340 recent traveler patterns</div>
          </div>
          <div style={{ background: C.limestone, borderRadius: 16, padding: 18, border: "1px solid rgba(27,26,23,0.07)" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#A89880", marginBottom: 12 }}>Quick actions</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[{ icon: <Map size={18} strokeWidth={1.8}/>, label: "Map", color: C.nile }, { icon: <Camera size={18} strokeWidth={1.8}/>, label: "Identify", color: C.faience }, { icon: <Phone size={18} strokeWidth={1.8}/>, label: "Emergency", color: C.signalRed }, { icon: <BarChart2 size={18} strokeWidth={1.8}/>, label: "Currency", color: C.copper }].map(({ icon, label, color }) => (
                <button key={label} style={{ background: "#FAF7F0", border: "1px solid rgba(27,26,23,0.07)", borderRadius: 10, padding: "12px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <div style={{ color }}>{icon}</div><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: "#6B6354" }}>{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ background: `linear-gradient(135deg,${C.nile},${C.nileMid})`, borderRadius: 16, padding: 18 }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: `${C.limestone}50`, marginBottom: 10 }}>Your progress</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "16px", fontWeight: 500, color: C.limestone }}>Level 4 · Explorer</div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.sand }}>1,250 XP</div></div>
            <div style={{ height: 5, background: `${C.limestone}15`, borderRadius: 99, marginBottom: 10, overflow: "hidden" }}><div style={{ height: "100%", width: "63%", background: `linear-gradient(90deg,${C.sand},${C.faience})`, borderRadius: 99 }}/></div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: `${C.limestone}45` }}>490 XP to Level 5 · Historian</div>
          </div>
          <div style={{ background: `${C.alertAmber}10`, border: `1px solid ${C.alertAmber}30`, borderRadius: 14, padding: "14px 16px", display: "flex", gap: 11, alignItems: "flex-start" }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: `${C.alertAmber}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}><AlertTriangle size={15} color={C.alertAmber} strokeWidth={2.5}/></div>
            <div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, color: C.alertAmber, marginBottom: 4, letterSpacing: "0.06em" }}>ACTIVE SCAM · Giza</div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#5C5346", lineHeight: 1.6 }}>"Free gift" vendors near the east path — walk past confidently.</div></div>
          </div>
        </div>
      </div>
      {rafiq && <RafiqDrawer onClose={() => setRafiq(false)}/>}
    </div>
  );
}

// ─── PAGE: Explore ─────────────────────────────────────────────────────────────
const EXPLORE_CATS = ["All", "Temples", "Museums", "Archaeological", "Markets", "Hidden gems"];
const GOVERNORATES = ["Giza", "Cairo", "Luxor", "Aswan", "Alexandria", "Sinai", "Red Sea"];

function PageExplore({ goSite }: { goSite?: (id: number) => void }) {
  const [cat,     setCat]     = useState("All");
  const [gov,     setGov]     = useState("Giza");
  const [view,    setView]    = useState<"grid"|"list">("grid");
  const [sort,    setSort]    = useState("distance");
  const [rafiq,   setRafiq]   = useState(false);
  const [selected, setSelected] = useState<typeof ALL_SITES[0] | null>(null);

  const filtered = ALL_SITES.filter(s => cat === "All" || s.cat === cat || (cat === "Hidden gems" && s.tag === "Hidden gem") || (cat === "Markets" && s.cat === "Market"));

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar location={`${gov} Governorate`} onRafiq={() => setRafiq(true)}/>

      {/* Explore header */}
      <div style={{ background: `linear-gradient(135deg,${C.nile},${C.nileMid})`, padding: "28px 32px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ position: "absolute", right: -40, top: -40 }}><Geom size={240} color={C.limestone} op={0.032}/></div>
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: `${C.limestone}50`, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>Exploring</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: 400, color: C.limestone, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                Discover <span style={{ fontStyle: "italic", color: C.sand }}>Egypt</span>
              </h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", background: `${C.limestone}12`, border: `1px solid ${C.limestone}20`, borderRadius: 8, overflow: "hidden" }}>
                {(["grid","list"] as const).map(v => (
                  <button key={v} onClick={() => setView(v)} style={{ background: view === v ? `${C.limestone}20` : "transparent", border: "none", padding: "7px 12px", cursor: "pointer", color: view === v ? C.limestone : `${C.limestone}45`, display: "flex", alignItems: "center" }}>
                    {v === "grid" ? <SlidersHorizontal size={15} strokeWidth={2}/> : <BookOpen size={15} strokeWidth={2}/>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Governorate selector */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>
            {GOVERNORATES.map(g => (
              <button key={g} onClick={() => setGov(g)} style={{ background: g === gov ? C.limestone : `${C.limestone}12`, border: `1px solid ${g === gov ? C.limestone : `${C.limestone}20`}`, borderRadius: 99, padding: "6px 16px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: g === gov ? 700 : 400, color: g === gov ? C.nile : `${C.limestone}75`, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.18s" }}>{g}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "24px 32px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>

        {/* Filters row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {EXPLORE_CATS.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{ background: c === cat ? C.nile : "transparent", border: `1.5px solid ${c === cat ? C.nile : "rgba(27,26,23,0.13)"}`, borderRadius: 99, padding: "6px 16px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: c === cat ? 600 : 400, color: c === cat ? C.limestone : "#6B6354", cursor: "pointer", transition: "all 0.15s" }}>{c}</button>
            ))}
            <button style={{ background: "transparent", border: "1.5px solid rgba(27,26,23,0.13)", borderRadius: 99, padding: "6px 14px", fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#6B6354", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Filter size={13} strokeWidth={2}/> More filters
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#A89880" }}>Sort by:</span>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ background: "#FAF7F0", border: "1.5px solid rgba(27,26,23,0.1)", borderRadius: 8, padding: "6px 12px", fontFamily: "'Inter',sans-serif", fontSize: "13px", color: C.nile, cursor: "pointer", outline: "none" }}>
              <option value="distance">Nearest first</option>
              <option value="rating">Highest rated</option>
              <option value="reviews">Most reviewed</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.nile }}>{filtered.length} sites</span>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#A89880" }}>in {gov} Governorate</span>
          {filtered.some(s => s.scam) && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${C.alertAmber}12`, border: `1px solid ${C.alertAmber}25`, borderRadius: 99, padding: "3px 10px" }}>
              <AlertTriangle size={11} color={C.alertAmber} strokeWidth={2.5}/>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: C.alertAmber }}>{filtered.filter(s => s.scam).length} with active scam alerts</span>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>

          {/* Site grid */}
          <div>
            {view === "grid" ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
                {filtered.map(s => <SiteCard key={s.id} s={s} goSite={goSite}/>)}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.map(s => (
                  <div key={s.id} onClick={() => goSite ? goSite(s.id) : setSelected(s)} style={{ background: C.limestone, borderRadius: 14, border: "1px solid rgba(27,26,23,0.07)", display: "grid", gridTemplateColumns: "100px 1fr auto", gap: 16, alignItems: "center", padding: "14px 18px", cursor: "pointer", boxShadow: "0 1px 6px rgba(27,26,23,0.04)" }}>
                    <div style={{ width: 100, height: 70, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                      <img src={s.img} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.nile, marginBottom: 2 }}>{s.name}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "11px", color: "#A89880", marginBottom: 8 }}>{s.nameAr}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}><Star size={11} color={C.sand} fill={C.sand} strokeWidth={0}/><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, color: C.basalt }}>{s.rating}</span></div>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880", background: C.limestoneDark, padding: "2px 8px", borderRadius: 99 }}>{s.cat}</span>
                        {s.scam && <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: `${C.alertAmber}12`, borderRadius: 99, padding: "2px 8px" }}><AlertTriangle size={10} color={C.alertAmber} strokeWidth={2.5}/><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: C.alertAmber }}>Scam alert</span></div>}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#8B7E6A" }}><Navigation size={12} strokeWidth={2}/><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: "#8B7E6A" }}>{s.dist}</span></div>
                      <button style={{ background: C.nile, border: "none", borderRadius: 8, padding: "7px 14px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.limestone, cursor: "pointer" }}>View</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right panel: selected site or map placeholder */}
          <div style={{ position: "sticky", top: 24, alignSelf: "start" }}>
            {selected ? (
              <div style={{ background: C.limestone, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(27,26,23,0.07)", boxShadow: "0 4px 20px rgba(15,61,62,0.08)" }}>
                <div style={{ height: 180, position: "relative" }}>
                  <img src={selected.img} alt={selected.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 30%,rgba(15,61,62,0.7) 100%)" }}/>
                  <button onClick={() => setSelected(null)} style={{ position: "absolute", top: 10, right: 10, background: "rgba(246,241,231,0.2)", backdropFilter: "blur(8px)", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.limestone }}><X size={14} strokeWidth={2}/></button>
                  <div style={{ position: "absolute", bottom: 14, left: 14 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", fontWeight: 500, color: C.limestone }}>{selected.name}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "13px", color: `${C.limestone}70` }}>{selected.nameAr}</div>
                  </div>
                </div>
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Star size={13} color={C.sand} fill={C.sand} strokeWidth={0}/><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.basalt }}>{selected.rating}</span><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#A89880" }}>({selected.reviews.toLocaleString()} reviews)</span></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Navigation size={12} color={C.faience} strokeWidth={2}/><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.faience }}>{selected.dist}</span></div>
                  </div>
                  {selected.scam && (
                    <div style={{ background: `${C.alertAmber}10`, border: `1px solid ${C.alertAmber}28`, borderRadius: 10, padding: "10px 12px", display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 14 }}>
                      <AlertTriangle size={13} color={C.alertAmber} strokeWidth={2.5} style={{ marginTop: 1, flexShrink: 0 }}/>
                      <div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, color: C.alertAmber, marginBottom: 2 }}>Known Scam · "The Free Gift"</div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#6B6354", lineHeight: 1.5 }}>Vendors offer a "free" scarab then demand payment. Walk past firmly.</div></div>
                    </div>
                  )}
                  <div style={{ background: "linear-gradient(145deg,#FAF3E4,#F0E8D0)", borderRadius: 10, padding: "12px 14px", marginBottom: 14, border: `1px solid ${C.sand}20` }}>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: C.copper, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>◈ Rafiq's Insight</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "13px", color: C.nile, lineHeight: 1.6 }}>"The Sphinx faces due east and aligns with the rising sun on the equinoxes — a feature no guide will tell you unprompted."</div>
                  </div>
                  <button style={{ width: "100%", background: C.nile, border: "none", borderRadius: 10, padding: 13, fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.limestone, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: `0 4px 16px ${C.nile}35` }}>
                    <Navigation size={15} strokeWidth={2.5}/> Get Directions
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Map placeholder */}
                <div style={{ background: `linear-gradient(145deg,${C.limestoneDark},#E0D9C6)`, borderRadius: 16, height: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1.5px dashed rgba(27,26,23,0.15)", marginBottom: 14, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, opacity: 0.06 }}><Geom size={280} color={C.nile} op={1}/></div>
                  <Map size={32} color={C.copper} strokeWidth={1.5} style={{ marginBottom: 12 }}/>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "16px", color: C.copper, marginBottom: 6 }}>Interactive Map</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#A89880" }}>Click a site to see details here</div>
                </div>
                {/* Safety summary */}
                <div style={{ background: C.limestone, borderRadius: 14, padding: "16px 18px", border: "1px solid rgba(27,26,23,0.07)" }}>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: "#A89880", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Area Safety · {gov}</div>
                  {[{ label: "Overall Status", val: "Secure", color: C.safeGreen }, { label: "Active Scam Alerts", val: "2 sites", color: C.alertAmber }, { label: "Restricted Zones", val: "None nearby", color: C.safeGreen }, { label: "Last Updated", val: "4 min ago", color: "#8B7E6A" }].map(({ label, val, color }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(27,26,23,0.05)" }}>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#8B7E6A" }}>{label}</span>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, color }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {rafiq && <RafiqDrawer onClose={() => setRafiq(false)}/>}
    </div>
  );
}

// ─── PAGE: placeholder for remaining pages ────────────────────────────────────
function PagePlaceholder({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar/>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 48 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: C.limestoneDark, display: "flex", alignItems: "center", justifyContent: "center", color: C.copper }}>{icon}</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "22px", color: C.nile }}>{title}</div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "#A89880" }}>Coming soon — this screen is in progress.</div>
      </div>
    </div>
  );
}

// ─── PAGE: Visit History ──────────────────────────────────────────────────────
const VISIT_LOG = [
  {
    id: "v1",
    date: "Today",
    dateISO: "30 Jul 2026",
    site: "Great Sphinx of Giza",
    siteAr: "أبو الهول",
    gov: "Giza",
    cat: "Archaeological",
    img: "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=600&h=400&fit=crop",
    duration: "1h 22m",
    xp: 120,
    badge: null,
    story: "You stood before the oldest monumental sculpture on Earth. Carved from a single limestone ridge during the reign of Pharaoh Khafre, the Sphinx has silently watched the Nile flood and recede for 4,500 years.",
    rafiqNote: "You asked about the missing nose. Rafiq found 3 competing theories — none involving Napoleon.",
    tags: ["Solo", "Morning visit", "Rafiq consulted"],
  },
  {
    id: "v2",
    date: "Today",
    dateISO: "30 Jul 2026",
    site: "Khufu Ship Museum",
    siteAr: "متحف مركب خوفو",
    gov: "Giza",
    cat: "Museum",
    img: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600&h=400&fit=crop",
    duration: "48m",
    xp: 80,
    badge: "Museum Maven",
    story: "A cedar ship built 4,600 years ago — perfectly preserved, never sailed. Its purpose remains one of Egyptology's most elegant mysteries: a solar barque for the afterlife journey.",
    rafiqNote: "Rafiq identified the ship's wood as Lebanese cedar — imported wood so rare it was used as royal currency.",
    tags: ["Indoor", "Air-conditioned", "Photo highlights"],
  },
  {
    id: "v3",
    date: "Yesterday",
    dateISO: "29 Jul 2026",
    site: "Egyptian Museum",
    siteAr: "المتحف المصري",
    gov: "Cairo",
    cat: "Museum",
    img: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&h=400&fit=crop",
    duration: "3h 10m",
    xp: 200,
    badge: "Cairo Chronicler",
    story: "Over three hours in 136 halls, you encountered Tutankhamun's golden mask, the Royal Mummies Room, and a collection of 120,000 objects spanning 5,000 years of human achievement.",
    rafiqNote: "You spent 22 minutes with Nefertiti's canopic jars. Rafiq explained what each organ symbolised.",
    tags: ["Long visit", "Guided audio", "XP milestone"],
  },
  {
    id: "v4",
    date: "29 Jul 2026",
    dateISO: "29 Jul 2026",
    site: "Khan el-Khalili",
    siteAr: "خان الخليلي",
    gov: "Cairo",
    cat: "Market",
    img: "https://images.unsplash.com/photo-1553997456-7b44d1bb8d21?w=600&h=400&fit=crop",
    duration: "2h 5m",
    xp: 60,
    badge: null,
    story: "Established in 1382 by Emir Djaharks el-Khalili, the bazaar has traded continuously for 644 years. You navigated its spice lanes and copper workshops with Rafiq's scam radar active.",
    rafiqNote: "Rafiq flagged the 'free gift' vendor twice. You walked past both times — perfectly.",
    tags: ["Evening", "Scam alert active", "Haggling practice"],
  },
  {
    id: "v5",
    date: "28 Jul 2026",
    dateISO: "28 Jul 2026",
    site: "Khafre Valley Temple",
    siteAr: "معبد وادي خفرع",
    gov: "Giza",
    cat: "Temple",
    img: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=600&h=400&fit=crop",
    duration: "55m",
    xp: 90,
    badge: null,
    story: "Built from pink Aswan granite and Egyptian alabaster, this mortuary temple once held 23 statues of Khafre. Only fragments survive, but its geometry is flawless after 45 centuries.",
    rafiqNote: "Rafiq noted the temple's causeway alignment with the Sphinx — an intentional solar axis.",
    tags: ["Afternoon", "Quiet", "Architecture focus"],
  },
];

const BADGE_COLLECTION = [
  { id: "b1", name: "Giza Pioneer",      icon: "🏔", earned: true,  date: "28 Jul",   color: C.sand      },
  { id: "b2", name: "Museum Maven",      icon: "🏺", earned: true,  date: "30 Jul",   color: C.faience   },
  { id: "b3", name: "Cairo Chronicler",  icon: "📜", earned: true,  date: "29 Jul",   color: C.copper    },
  { id: "b4", name: "Bazaar Navigator",  icon: "🧭", earned: false, date: null,        color: "#A89880"   },
  { id: "b5", name: "Temple Scholar",    icon: "🌿", earned: false, date: null,        color: "#A89880"   },
  { id: "b6", name: "Nile Wanderer",     icon: "🌊", earned: false, date: null,        color: "#A89880"   },
];

const GOV_VISITS: Record<string, number> = {
  Giza: 4, Cairo: 3, Luxor: 0, Aswan: 0, Alexandria: 0, "Red Sea": 0, Sinai: 0,
};

function PageHistory() {
  const [expanded, setExpanded] = useState<string | null>("v1");
  const [filter, setFilter]     = useState<"all" | "giza" | "cairo">("all");

  const totalXP    = VISIT_LOG.reduce((s, v) => s + v.xp, 0);
  const totalTime  = "8h 20m";
  const filtered   = VISIT_LOG.filter(v => filter === "all" || v.gov.toLowerCase() === filter);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar location="Your Journey · Egypt"/>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${C.copper} 0%,#5C3A1E 50%,${C.basalt} 100%)`, padding: "28px 32px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -40, top: -40 }}><Geom size={260} color={C.limestone} op={0.028}/></div>
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 32 }}>
          <div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: `${C.limestone}45`, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8 }}>Your Egyptian Story</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(22px,3vw,34px)", fontWeight: 400, color: C.limestone, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 6 }}>
              Visit <span style={{ fontStyle: "italic", color: C.sand }}>History</span>
            </h1>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: `${C.limestone}55`, lineHeight: 1.6 }}>Every place you've been. Every story Rafiq told.</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ label: "Sites visited", val: String(VISIT_LOG.length), col: C.sand }, { label: "Total XP earned", val: `${totalXP}`, col: C.faience }, { label: "Time exploring", val: totalTime, col: C.limestone }].map(({ label, val, col }) => (
              <div key={label} style={{ background: `${C.limestone}08`, border: `1px solid ${C.limestone}18`, borderRadius: 12, padding: "14px 18px", textAlign: "center", minWidth: 110 }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: `${C.limestone}45`, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "22px", fontWeight: 500, color: col }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "24px 32px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box", display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>

        {/* Left: timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {(["all","giza","cairo"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? C.nile : "transparent", border: `1.5px solid ${filter === f ? C.nile : "rgba(27,26,23,0.13)"}`, borderRadius: 99, padding: "6px 16px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: filter === f ? 600 : 400, color: filter === f ? C.limestone : "#6B6354", cursor: "pointer", transition: "all 0.15s", textTransform: "capitalize" }}>{f === "all" ? "All governorates" : f.charAt(0).toUpperCase() + f.slice(1)}</button>
            ))}
          </div>

          {/* Timeline entries */}
          <div style={{ position: "relative" }}>
            {/* Vertical line */}
            <div style={{ position: "absolute", left: 19, top: 20, bottom: 20, width: 1.5, background: `linear-gradient(180deg,${C.copper}40,${C.limestoneDark})`, zIndex: 0 }}/>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {filtered.map((v, i) => {
                const isOpen = expanded === v.id;
                const isFirst = i === 0 || filtered[i-1].date !== v.date;
                return (
                  <div key={v.id}>
                    {isFirst && (
                      <div style={{ paddingLeft: 52, marginBottom: 10, marginTop: i === 0 ? 0 : 16 }}>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, color: C.copper, letterSpacing: "0.1em", textTransform: "uppercase" }}>{v.date}</span>
                      </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 12, marginBottom: 10, position: "relative", zIndex: 1 }}>
                      {/* Timeline dot */}
                      <div style={{ display: "flex", justifyContent: "center", paddingTop: 16 }}>
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: isOpen ? C.copper : C.limestoneDark, border: `2px solid ${isOpen ? C.copper : "#C4B89A"}`, boxShadow: isOpen ? `0 0 0 4px ${C.copper}20` : "none", transition: "all 0.2s", flexShrink: 0 }}/>
                      </div>
                      {/* Card */}
                      <div onClick={() => setExpanded(isOpen ? null : v.id)} style={{ background: C.limestone, borderRadius: 14, border: `1.5px solid ${isOpen ? C.copper : "rgba(27,26,23,0.07)"}`, boxShadow: isOpen ? `0 4px 24px ${C.copper}12` : "0 1px 6px rgba(27,26,23,0.04)", cursor: "pointer", overflow: "hidden", transition: "all 0.22s" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr auto", gap: 0 }}>
                          <div style={{ height: isOpen ? 120 : 80, overflow: "hidden", flexShrink: 0, transition: "height 0.3s" }}>
                            <img src={v.img} alt={v.site} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                          </div>
                          <div style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.nile }}>{v.site}</span>
                              {v.badge && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, background: `${C.faience}15`, color: C.faience, padding: "2px 7px", borderRadius: 99 }}>🏅 {v.badge}</span>}
                            </div>
                            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "11px", color: "#A89880", marginBottom: 7 }}>{v.siteAr} · {v.gov}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} color="#A89880" strokeWidth={2}/><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A" }}>{v.duration}</span></div>
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Zap size={11} color={C.sand} strokeWidth={2}/><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, color: C.copper }}>+{v.xp} XP</span></div>
                              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "#A89880", background: C.limestoneDark, padding: "2px 7px", borderRadius: 99 }}>{v.cat}</span>
                            </div>
                          </div>
                          <div style={{ padding: "14px 14px 0 0", display: "flex", alignItems: "flex-start" }}>
                            <ChevronRight size={15} color="#C4B89A" strokeWidth={2} style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s", marginTop: 2 }}/>
                          </div>
                        </div>
                        {isOpen && (
                          <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.copper}12`, marginTop: 2 }}>
                            <div style={{ background: "linear-gradient(145deg,#FAF3E4,#F0E8D0)", borderRadius: 10, padding: "14px 15px", margin: "12px 0 10px", border: `1px solid ${C.sand}20` }}>
                              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "9px", fontWeight: 700, color: C.copper, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>◈ Rihla Story</div>
                              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "13px", color: C.nile, lineHeight: 1.75, margin: 0 }}>{v.story}</p>
                            </div>
                            <div style={{ background: `${C.faience}08`, border: `1px solid ${C.faience}20`, borderRadius: 9, padding: "10px 12px", marginBottom: 10 }}>
                              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "9px", fontWeight: 700, color: C.faience, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>◈ Rafiq Note</div>
                              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#5C5346", lineHeight: 1.65, margin: 0 }}>{v.rafiqNote}</p>
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {v.tags.map(t => <span key={t} style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 500, background: C.limestoneDark, color: "#8B7E6A", padding: "3px 9px", borderRadius: 99 }}>{t}</span>)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 24, alignSelf: "start" }}>

          {/* XP level card */}
          <div style={{ background: `linear-gradient(135deg,${C.nile},${C.nileMid})`, borderRadius: 16, padding: "20px" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: `${C.limestone}45`, marginBottom: 10 }}>Journey Level</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", fontWeight: 500, color: C.limestone }}>Level 4 · Explorer</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.sand }}>{totalXP} XP</div>
            </div>
            <div style={{ height: 6, background: `${C.limestone}15`, borderRadius: 99, marginBottom: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(totalXP % 500) / 5}%`, background: `linear-gradient(90deg,${C.sand},${C.faience})`, borderRadius: 99 }}/>
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: `${C.limestone}40` }}>
              {500 - (totalXP % 500)} XP to Level 5 · Historian
            </div>
          </div>

          {/* Badges */}
          <div style={{ background: C.limestone, borderRadius: 16, padding: "18px", border: "1px solid rgba(27,26,23,0.07)" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: "#A89880", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Badges Earned</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {BADGE_COLLECTION.map(b => (
                <div key={b.id} style={{ textAlign: "center", padding: "10px 6px", borderRadius: 11, background: b.earned ? `${b.color}10` : "#FAF7F0", border: `1.5px solid ${b.earned ? b.color : "rgba(27,26,23,0.07)"}30`, opacity: b.earned ? 1 : 0.45 }}>
                  <div style={{ fontSize: "22px", marginBottom: 5 }}>{b.icon}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: b.earned ? 700 : 400, color: b.earned ? C.nile : "#A89880", lineHeight: 1.3 }}>{b.name}</div>
                  {b.earned && b.date && <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "9px", color: "#A89880", marginTop: 3 }}>{b.date}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Governorate heatmap */}
          <div style={{ background: C.limestone, borderRadius: 16, padding: "18px", border: "1px solid rgba(27,26,23,0.07)" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: "#A89880", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Egypt Coverage</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {Object.entries(GOV_VISITS).map(([name, count]) => (
                <div key={name} style={{ display: "grid", gridTemplateColumns: "80px 1fr 28px", gap: 10, alignItems: "center" }}>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: count > 0 ? C.nile : "#C4B89A", fontWeight: count > 0 ? 600 : 400 }}>{name}</span>
                  <div style={{ height: 6, background: "#EDE6D6", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: count > 0 ? `${Math.min(count * 20, 100)}%` : "0%", background: count > 0 ? `linear-gradient(90deg,${C.copper},${C.sand})` : "transparent", borderRadius: 99, transition: "width 0.4s ease" }}/>
                  </div>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, color: count > 0 ? C.copper : "#C4B89A", textAlign: "right" }}>{count}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: "10px 12px", background: "#FAF7F0", borderRadius: 10, border: "1px solid rgba(27,26,23,0.06)" }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A", lineHeight: 1.55 }}>
                You've explored <strong style={{ color: C.nile }}>2 of 27</strong> governorates. Luxor and Aswan are Rafiq's top suggestions for your next leg.
              </div>
            </div>
          </div>

          {/* Share */}
          <div style={{ background: `linear-gradient(145deg,#FAF3E4,#F0E8D0)`, borderRadius: 14, padding: "16px 18px", border: `1px solid ${C.sand}22`, textAlign: "center" }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "14px", color: C.nile, lineHeight: 1.6, marginBottom: 12 }}>"Your Egyptian story is worth sharing."</div>
            <button style={{ background: C.copper, border: "none", borderRadius: 9, padding: "10px 20px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.limestone, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <BookOpen size={14} strokeWidth={2}/> Export Journey Journal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: Safety & Alerts ───────────────────────────────────────────────────
const SCAM_ALERTS = [
  {
    id: "a1", severity: "high", title: "Free Gift Scam", location: "Great Sphinx — East Path", gov: "Giza",
    body: "Vendors approach tourists offering scarab figurines as a 'free gift', then aggressively demand payment. Refuse the item before it reaches your hand.",
    reports: 14, updated: "11 min ago", tag: "Scam", color: C.signalRed,
  },
  {
    id: "a2", severity: "medium", title: "Overpriced Camel Rides", location: "Pyramids Plateau — North Gate", gov: "Giza",
    body: "Unlicensed camel operators quote EGP 50 then charge EGP 500+ at the end. Only book via official ticket booths inside the plateau.",
    reports: 8, updated: "34 min ago", tag: "Price Fraud", color: C.alertAmber,
  },
  {
    id: "a3", severity: "medium", title: "Fake Police Officers", location: "Khan el-Khalili, Cairo", gov: "Cairo",
    body: "Individuals in partial uniforms ask to inspect passports and request 'tourist tax'. Real police never approach tourists this way.",
    reports: 5, updated: "1h 20m ago", tag: "Impersonation", color: C.alertAmber,
  },
  {
    id: "a4", severity: "low", title: "SIM Card Overpricing", location: "Cairo Airport — Arrivals Hall", gov: "Cairo",
    body: "Unlicensed vendors charge 3× the official price for tourist SIMs. Use only official Vodafone, Orange, Etisalat or WE kiosks inside the terminal.",
    reports: 3, updated: "2h ago", tag: "Price Fraud", color: C.safeGreen,
  },
];

const SAFETY_FEED = [
  { time: "09:14", type: "clear",  icon: <CheckCircle size={13} strokeWidth={2.5}/>, color: C.safeGreen,  text: "Giza Plateau declared secure. Tourist Police sweep completed." },
  { time: "08:52", type: "scam",   icon: <AlertTriangle size={13} strokeWidth={2.5}/>, color: C.alertAmber, text: "New report: Free Gift vendors near Sphinx east path (14 reports)." },
  { time: "07:30", type: "weather",icon: <Sun size={13} strokeWidth={2}/>,             color: C.sand,       text: "UV index forecast: 9 (Very High). Sunscreen and hat advised." },
  { time: "06:15", type: "clear",  icon: <CheckCircle size={13} strokeWidth={2.5}/>, color: C.safeGreen,  text: "No restricted zones active in Greater Cairo today." },
  { time: "Yesterday", type: "scam", icon: <AlertTriangle size={13} strokeWidth={2.5}/>, color: C.signalRed, text: "Fake police officer incident reported at Khan el-Khalili (5 reports)." },
];

const EMERGENCY_CONTACTS = [
  { label: "Tourist Police",   number: "126",       icon: <Shield size={18} strokeWidth={2}/>,    color: C.nile,       desc: "24/7 · English spoken" },
  { label: "Ambulance",        number: "123",       icon: <Phone size={18} strokeWidth={2}/>,      color: C.signalRed,  desc: "Emergency medical" },
  { label: "Fire Brigade",     number: "180",       icon: <AlertTriangle size={18} strokeWidth={2}/>, color: C.terracotta, desc: "Fire & rescue" },
  { label: "Police",           number: "122",       icon: <Shield size={18} strokeWidth={2}/>,    color: C.copper,     desc: "National emergency" },
  { label: "Rihla Emergency",  number: "In-app",    icon: <Glyph size={18}/>,                     color: C.faience,    desc: "Direct AI + human support" },
];

const GOV_STATUS = [
  { name: "Giza",         status: "Secure",  alerts: 2, color: C.safeGreen  },
  { name: "Cairo",        status: "Caution", alerts: 3, color: C.alertAmber },
  { name: "Luxor",        status: "Secure",  alerts: 0, color: C.safeGreen  },
  { name: "Aswan",        status: "Secure",  alerts: 0, color: C.safeGreen  },
  { name: "Alexandria",   status: "Secure",  alerts: 1, color: C.safeGreen  },
  { name: "Red Sea",      status: "Secure",  alerts: 0, color: C.safeGreen  },
  { name: "Sinai",        status: "Monitor", alerts: 1, color: C.alertAmber },
];

function PageSafety({ goEmergency }: { goEmergency?: () => void }) {
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [rafiq, setRafiq] = useState(false);
  const selected = SCAM_ALERTS.find(a => a.id === activeAlert) || null;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar location="Giza Plateau, Cairo" onRafiq={() => setRafiq(true)}/>

      {/* Safety header */}
      <div style={{ background: `linear-gradient(135deg,#1A1209 0%,${C.basalt} 60%,#2A1A0A 100%)`, padding: "28px 32px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -40, top: -40 }}><Geom size={240} color={C.alertAmber} op={0.025}/></div>
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 32 }}>
          <div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: `${C.limestone}45`, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8 }}>Real-time Safety Intelligence</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(22px,3vw,34px)", fontWeight: 400, color: C.limestone, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 8 }}>
              Safety &amp; <span style={{ fontStyle: "italic", color: C.alertAmber }}>Alerts</span>
            </h1>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: `${C.limestone}50`, lineHeight: 1.6, maxWidth: 480 }}>
              Monitoring 15 live sources · Egyptian Tourist Authority · Community reports · Last updated 4 min ago
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[{ label: "Overall", val: "CAUTION", col: C.alertAmber }, { label: "Giza", val: "SECURE", col: C.safeGreen }, { label: "Active alerts", val: "4", col: C.signalRed }].map(({ label, val, col }) => (
              <div key={label} style={{ background: `${C.limestone}08`, border: `1px solid ${col}30`, borderRadius: 12, padding: "14px 18px", textAlign: "center", minWidth: 100 }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: `${C.limestone}45`, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "16px", fontWeight: 800, color: col, letterSpacing: "0.04em" }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "24px 32px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box", display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Active alerts */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", fontWeight: 500, color: C.nile }}>Active Alerts</h2>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${C.signalRed}10`, border: `1px solid ${C.signalRed}25`, borderRadius: 99, padding: "3px 10px" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.signalRed, animation: "pulse 2s infinite" }}/>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, color: C.signalRed }}>LIVE</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SCAM_ALERTS.map(alert => (
                <div key={alert.id} onClick={() => setActiveAlert(activeAlert === alert.id ? null : alert.id)} style={{ background: C.limestone, borderRadius: 14, border: `1.5px solid ${activeAlert === alert.id ? alert.color : "rgba(27,26,23,0.07)"}`, boxShadow: activeAlert === alert.id ? `0 2px 20px ${alert.color}15` : "0 1px 6px rgba(27,26,23,0.04)", cursor: "pointer", overflow: "hidden", transition: "all 0.2s" }}>
                  <div style={{ padding: "16px 18px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${alert.color}12`, border: `1.5px solid ${alert.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <AlertTriangle size={18} color={alert.color} strokeWidth={2.2}/>
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.nile }}>{alert.title}</span>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, background: `${alert.color}15`, color: alert.color, padding: "2px 8px", borderRadius: 99, letterSpacing: "0.04em" }}>{alert.tag}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} color="#A89880" strokeWidth={2}/><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#8B7E6A" }}>{alert.location}</span></div>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#C4B89A" }}>·</span>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880" }}>{alert.reports} reports · {alert.updated}</span>
                      </div>
                    </div>
                    <ChevronRight size={16} color="#C4B89A" strokeWidth={2} style={{ transform: activeAlert === alert.id ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}/>
                  </div>
                  {activeAlert === alert.id && (
                    <div style={{ padding: "0 18px 16px 72px", borderTop: `1px solid ${alert.color}12` }}>
                      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#5C5346", lineHeight: 1.75, marginBottom: 12, marginTop: 12 }}>{alert.body}</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button style={{ background: C.nile, border: "none", borderRadius: 8, padding: "8px 16px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, color: C.limestone, cursor: "pointer" }}>Report this</button>
                        <button onClick={e => { e.stopPropagation(); setRafiq(true); }} style={{ background: "transparent", border: `1.5px solid ${C.faience}40`, borderRadius: 8, padding: "8px 16px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.faience, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <Glyph size={13}/> Ask Rafiq
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Governorate status grid */}
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", fontWeight: 500, color: C.nile, marginBottom: 14 }}>Governorate Status</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 }}>
              {GOV_STATUS.map(({ name, status, alerts, color }) => (
                <div key={name} style={{ background: C.limestone, borderRadius: 13, padding: "14px 16px", border: `1.5px solid ${color}20`, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.nile }}>{name}</span>
                    {alerts > 0 && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, background: `${C.alertAmber}15`, color: C.alertAmber, padding: "2px 7px", borderRadius: 99 }}>{alerts}</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 0 3px ${color}25` }}/>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color }}>{status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety timeline feed */}
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", fontWeight: 500, color: C.nile, marginBottom: 14 }}>Safety Feed</h2>
            <div style={{ background: C.limestone, borderRadius: 16, padding: "6px 0", border: "1px solid rgba(27,26,23,0.07)" }}>
              {SAFETY_FEED.map((item, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "64px auto 1fr", gap: 12, alignItems: "center", padding: "14px 18px", borderBottom: i < SAFETY_FEED.length - 1 ? "1px solid rgba(27,26,23,0.05)" : "none" }}>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: "#A89880", textAlign: "right" }}>{item.time}</span>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: `${item.color}15`, border: `1px solid ${item.color}25`, display: "flex", alignItems: "center", justifyContent: "center", color: item.color, flexShrink: 0 }}>{item.icon}</div>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#5C5346", lineHeight: 1.55 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* SOS button */}
          <div style={{ background: `linear-gradient(160deg,${C.signalRed},#8B1E18)`, borderRadius: 16, padding: "22px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: `${C.limestone}55`, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>Emergency</div>
            <button onClick={goEmergency} style={{ width: 80, height: 80, borderRadius: "50%", background: C.limestone, border: `4px solid ${C.limestone}30`, boxShadow: `0 0 0 8px ${C.limestone}15, 0 8px 24px rgba(0,0,0,0.35)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, cursor: "pointer", margin: "0 auto 12px" }}>
              <Phone size={24} color={C.signalRed} strokeWidth={2.5}/>
            </button>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", fontWeight: 500, color: C.limestone, marginBottom: 4 }}>Emergency SOS</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.limestone}55` }}>Opens emergency mode with guided response</div>
          </div>

          {/* Emergency contacts */}
          <div style={{ background: C.limestone, borderRadius: 16, padding: "18px", border: "1px solid rgba(27,26,23,0.07)" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: "#A89880", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Emergency Contacts</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {EMERGENCY_CONTACTS.map(({ label, number, icon, color, desc }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(27,26,23,0.05)" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}12`, border: `1px solid ${color}22`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>{icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.nile }}>{label}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880" }}>{desc}</div>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", fontWeight: 600, color, flexShrink: 0 }}>{number}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Rafiq safety tip */}
          <div style={{ background: "linear-gradient(145deg,#FAF3E4,#F0E8D0)", borderRadius: 16, padding: "18px", border: `1px solid ${C.sand}25` }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: C.copper, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>◈ Rafiq Safety Briefing</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "14px", color: C.nile, lineHeight: 1.7, marginBottom: 10 }}>"Giza is generally safe for tourists. Stay in official pyramid zones, ignore unsolicited guides, and keep a photo of your passport saved offline."</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880", marginBottom: 12 }}>Updated based on your current location</div>
            <button onClick={() => setRafiq(true)} style={{ width: "100%", background: C.nile, border: "none", borderRadius: 9, padding: "10px 16px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.limestone, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              <Glyph size={15} light/> Ask Rafiq about safety
            </button>
          </div>

          {/* Environment widget */}
          <div style={{ background: C.limestone, borderRadius: 16, padding: "18px", border: "1px solid rgba(27,26,23,0.07)" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: "#A89880", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Environment · Giza Now</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[{ icon: <Thermometer size={16} strokeWidth={1.8}/>, label: "Temperature", val: "38°C", sub: "Feels like 41°C", col: C.terracotta }, { icon: <Sun size={16} strokeWidth={1.8}/>, label: "UV Index", val: "9", sub: "Very High · use SPF 50+", col: C.alertAmber }, { icon: <Wind size={16} strokeWidth={1.8}/>, label: "Air Quality", val: "Good", sub: "AQI 42", col: C.safeGreen }, { icon: <Globe size={16} strokeWidth={1.8}/>, label: "Visibility", val: "Clear", sub: "18 km", col: C.faience }].map(({ icon, label, val, sub, col }) => (
                <div key={label} style={{ background: "#FAF7F0", borderRadius: 11, padding: "12px 13px", border: "1px solid rgba(27,26,23,0.06)" }}>
                  <div style={{ color: col, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "#A89880", marginBottom: 3 }}>{label}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "15px", fontWeight: 800, color: C.nile }}>{val}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "#A89880", marginTop: 2 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {rafiq && <RafiqDrawer onClose={() => setRafiq(false)}/>}
    </div>
  );
}

// ─── PAGE: Wallet & Tokens ────────────────────────────────────────────────────
const RATES: Record<string, number> = {
  USD: 30.92, EUR: 33.61, GBP: 39.44, JPY: 0.207, AUD: 20.15,
  CAD: 22.87, CHF: 34.10, CNY: 4.27,  INR: 0.371, AED: 8.42,
};

const RATE_FLAGS: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", AUD: "🇦🇺",
  CAD: "🇨🇦", CHF: "🇨🇭", CNY: "🇨🇳", INR: "🇮🇳", AED: "🇦🇪",
};

const SPEND_LOG = [
  { id: "s1", cat: "Entrance Fees",  desc: "Egyptian Museum · 2 tickets",    egp: 480,  date: "Today",      icon: <Star size={14} strokeWidth={2}/>,       color: C.faience    },
  { id: "s2", cat: "Transport",      desc: "Uber · Maadi to Giza",           egp: 220,  date: "Today",      icon: <Navigation size={14} strokeWidth={2}/>, color: C.nile       },
  { id: "s3", cat: "Food & Drink",   desc: "Koshary El Tahrir · lunch",      egp: 85,   date: "Today",      icon: <Globe size={14} strokeWidth={2}/>,      color: C.terracotta },
  { id: "s4", cat: "Shopping",       desc: "Khan el-Khalili · copper lamp",  egp: 650,  date: "Yesterday",  icon: <Wallet size={14} strokeWidth={2}/>,     color: C.copper     },
  { id: "s5", cat: "Entrance Fees",  desc: "Giza Plateau · combo ticket",    egp: 540,  date: "Yesterday",  icon: <Star size={14} strokeWidth={2}/>,       color: C.faience    },
  { id: "s6", cat: "Food & Drink",   desc: "Café Riche · coffee & pastry",   egp: 120,  date: "29 Jul",     icon: <Globe size={14} strokeWidth={2}/>,      color: C.terracotta },
  { id: "s7", cat: "Transport",      desc: "Cairo Metro · day pass",         egp: 25,   date: "29 Jul",     icon: <Navigation size={14} strokeWidth={2}/>, color: C.nile       },
];

const SPEND_CATS = [
  { name: "Entrance Fees", total: 1020, color: C.faience,    pct: 42 },
  { name: "Shopping",      total: 650,  color: C.copper,     pct: 27 },
  { name: "Transport",     total: 245,  color: C.nile,       pct: 10 },
  { name: "Food & Drink",  total: 205,  color: C.terracotta, pct: 8  },
  { name: "Other",         total: 300,  color: "#C4B89A",    pct: 13 },
];

const CASH_TIPS = [
  { tip: "Always carry small EGP notes — EGP 5, 10, 20. Many vendors can't break EGP 200.", icon: <CreditCard size={15} strokeWidth={2}/> },
  { tip: "Tip guides EGP 30–50, drivers EGP 10–20, hotel porters EGP 10 per bag.", icon: <Star size={15} strokeWidth={2}/> },
  { tip: "Baksheesh (small tips) are expected at archaeological sites for photos — EGP 10–20 is generous.", icon: <Camera size={15} strokeWidth={2}/> },
  { tip: "Official ATMs inside malls and banks give the best exchange rate. Avoid airport kiosks.", icon: <Shield size={15} strokeWidth={2}/> },
];

const RIHLA_TOKENS = [
  { label: "Journey XP",    val: "550",  sub: "Current level: Explorer",  color: C.sand    },
  { label: "Sites unlocked",val: "5",    sub: "of 6,600+ total",          color: C.faience },
  { label: "Rafiq queries", val: "23",   sub: "in this journey",          color: C.copper  },
  { label: "Badges",        val: "3",    sub: "of 24 available",          color: C.terracotta },
];

function PageWallet() {
  const [fromCur, setFromCur] = useState("USD");
  const [amount,  setAmount]  = useState("100");
  const [dir,     setDir]     = useState<"to" | "from">("to");

  const numAmt   = parseFloat(amount) || 0;
  const egpRate  = RATES[fromCur] ?? 1;
  const converted = dir === "to"
    ? (numAmt * egpRate).toLocaleString("en-EG", { maximumFractionDigits: 0 })
    : (numAmt / egpRate).toFixed(2);
  const convLabel = dir === "to" ? "EGP" : fromCur;
  const inputLabel = dir === "to" ? fromCur : "EGP";

  const totalSpend = SPEND_LOG.reduce((s, l) => s + l.egp, 0);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar location="Wallet · Currency &amp; Spending"/>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,#1A3A1F 0%,${C.safeGreen} 55%,#0F3D3E 100%)`, padding: "28px 32px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -40, top: -40 }}><Geom size={260} color={C.limestone} op={0.028}/></div>
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 32 }}>
          <div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: `${C.limestone}45`, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8 }}>Egypt Money Intelligence</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(22px,3vw,34px)", fontWeight: 400, color: C.limestone, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 6 }}>
              Wallet &amp; <span style={{ fontStyle: "italic", color: C.sand }}>Currency</span>
            </h1>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: `${C.limestone}55`, lineHeight: 1.6 }}>Live EGP rates · Spending tracker · Cash tips from Rafiq</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ label: "Total spent", val: `${totalSpend.toLocaleString()} EGP`, col: C.sand }, { label: "Rate (USD)", val: `${RATES.USD} EGP`, col: C.limestone }, { label: "Journey days", val: "3", col: `${C.limestone}80` }].map(({ label, val, col }) => (
              <div key={label} style={{ background: `${C.limestone}08`, border: `1px solid ${C.limestone}18`, borderRadius: 12, padding: "14px 18px", textAlign: "center", minWidth: 110 }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: `${C.limestone}45`, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "17px", fontWeight: 500, color: col }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "24px 32px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box", display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Currency converter */}
          <div style={{ background: C.limestone, borderRadius: 18, padding: "24px", border: "1px solid rgba(27,26,23,0.07)", boxShadow: "0 2px 16px rgba(15,61,62,0.06)" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: C.copper, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 18 }}>◈ Currency Converter</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 14, alignItems: "center", marginBottom: 20 }}>
              {/* From */}
              <div>
                <label style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, color: "#A89880", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 7 }}>{dir === "to" ? "You have" : "You want"}</label>
                <div style={{ background: "#FAF7F0", border: "1.5px solid rgba(27,26,23,0.12)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} style={{ background: "transparent", border: "none", outline: "none", fontFamily: "'Cormorant Garamond',serif", fontSize: "26px", fontWeight: 500, color: C.nile, width: 0, flex: 1 }}/>
                  <div style={{ background: C.limestoneDark, borderRadius: 8, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                    <span style={{ fontSize: "16px" }}>{dir === "to" ? RATE_FLAGS[fromCur] : "🇪🇬"}</span>
                    {dir === "to" ? (
                      <select value={fromCur} onChange={e => setFromCur(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.nile, cursor: "pointer" }}>
                        {Object.keys(RATES).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.nile }}>EGP</span>}
                  </div>
                </div>
              </div>
              {/* Swap */}
              <button onClick={() => setDir(d => d === "to" ? "from" : "to")} style={{ background: C.nile, border: "none", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.limestone, flexShrink: 0, boxShadow: `0 3px 12px ${C.nile}35` }}>
                <ArrowRight size={16} strokeWidth={2.5} style={{ transform: "rotate(0deg)" }}/>
              </button>
              {/* To */}
              <div>
                <label style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, color: "#A89880", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 7 }}>{dir === "to" ? "You get (EGP)" : "In " + fromCur}</label>
                <div style={{ background: `${C.safeGreen}08`, border: `1.5px solid ${C.safeGreen}25`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "26px", fontWeight: 500, color: C.safeGreen, flex: 1 }}>{converted}</div>
                  <div style={{ background: `${C.safeGreen}15`, borderRadius: 8, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                    <span style={{ fontSize: "16px" }}>{dir === "to" ? "🇪🇬" : RATE_FLAGS[fromCur]}</span>
                    {dir === "from" ? (
                      <select value={fromCur} onChange={e => setFromCur(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.safeGreen, cursor: "pointer" }}>
                        {Object.keys(RATES).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.safeGreen }}>EGP</span>}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background: "#FAF7F0", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 16 }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A" }}>
                <strong style={{ color: C.nile }}>1 {fromCur}</strong> = <strong style={{ color: C.safeGreen }}>{RATES[fromCur]} EGP</strong>
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880" }}>·</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A" }}>Mid-market rate · Updated 6 min ago</div>
            </div>
          </div>

          {/* All rates grid */}
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", fontWeight: 500, color: C.nile, marginBottom: 14 }}>Live Rates → EGP</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
              {Object.entries(RATES).map(([cur, rate]) => (
                <div key={cur} onClick={() => { setFromCur(cur); setDir("to"); }} style={{ background: cur === fromCur ? `${C.nile}08` : C.limestone, border: `1.5px solid ${cur === fromCur ? C.nile : "rgba(27,26,23,0.07)"}`, borderRadius: 12, padding: "14px 15px", cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                    <span style={{ fontSize: "20px" }}>{RATE_FLAGS[cur]}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.nile }}>{cur}</span>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", fontWeight: 500, color: cur === fromCur ? C.safeGreen : C.basalt }}>{rate}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "#A89880", marginTop: 2 }}>EGP per 1 {cur}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Spend log */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", fontWeight: 500, color: C.nile }}>Spending Log</h2>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#A89880" }}>Total: <strong style={{ color: C.nile }}>{totalSpend.toLocaleString()} EGP</strong></span>
            </div>
            <div style={{ background: C.limestone, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(27,26,23,0.07)" }}>
              {SPEND_LOG.map((item, i) => (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "36px 1fr auto", gap: 14, padding: "14px 18px", alignItems: "center", borderBottom: i < SPEND_LOG.length - 1 ? "1px solid rgba(27,26,23,0.05)" : "none" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}12`, border: `1px solid ${item.color}22`, display: "flex", alignItems: "center", justifyContent: "center", color: item.color, flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.nile, marginBottom: 2 }}>{item.desc}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880", background: C.limestoneDark, padding: "1px 7px", borderRadius: 99 }}>{item.cat}</span>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#C4B89A" }}>{item.date}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "16px", fontWeight: 500, color: C.basalt }}>{item.egp.toLocaleString()}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "#A89880" }}>EGP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 24, alignSelf: "start" }}>

          {/* Spend breakdown */}
          <div style={{ background: C.limestone, borderRadius: 16, padding: "20px", border: "1px solid rgba(27,26,23,0.07)" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: "#A89880", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Spend Breakdown</div>
            {/* Donut-style bar stack */}
            <div style={{ display: "flex", height: 10, borderRadius: 99, overflow: "hidden", marginBottom: 16 }}>
              {SPEND_CATS.map(c => <div key={c.name} style={{ width: `${c.pct}%`, background: c.color }}/>)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SPEND_CATS.map(c => (
                <div key={c.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: c.color, flexShrink: 0 }}/>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#6B6354" }}>{c.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, color: C.nile }}>{c.total.toLocaleString()}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880" }}>{c.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, borderTop: "1px solid rgba(27,26,23,0.06)", paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, color: C.nile }}>Total</span>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", fontWeight: 500, color: C.safeGreen }}>{totalSpend.toLocaleString()} EGP</span>
            </div>
          </div>

          {/* Rihla tokens */}
          <div style={{ background: `linear-gradient(135deg,${C.nile},${C.nileMid})`, borderRadius: 16, padding: "20px" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: `${C.limestone}45`, marginBottom: 14 }}>◈ Rihla Journey Tokens</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {RIHLA_TOKENS.map(t => (
                <div key={t.label} style={{ background: `${C.limestone}08`, border: `1px solid ${C.limestone}15`, borderRadius: 11, padding: "12px 13px" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "22px", fontWeight: 500, color: t.color, marginBottom: 3 }}>{t.val}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: `${C.limestone}80` }}>{t.label}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: `${C.limestone}40`, marginTop: 2 }}>{t.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Cash tips */}
          <div style={{ background: "linear-gradient(145deg,#FAF3E4,#F0E8D0)", borderRadius: 16, padding: "18px", border: `1px solid ${C.sand}25` }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: C.copper, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>◈ Rafiq Cash Tips</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CASH_TIPS.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${C.copper}15`, border: `1px solid ${C.copper}22`, display: "flex", alignItems: "center", justifyContent: "center", color: C.copper, flexShrink: 0, marginTop: 1 }}>{t.icon}</div>
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#5C5346", lineHeight: 1.65, margin: 0 }}>{t.tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ATM finder */}
          <div style={{ background: C.limestone, borderRadius: 14, padding: "16px 18px", border: "1px solid rgba(27,26,23,0.07)", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${C.faience}12`, border: `1px solid ${C.faience}25`, display: "flex", alignItems: "center", justifyContent: "center", color: C.faience, flexShrink: 0 }}><MapPin size={18} strokeWidth={2}/></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.nile, marginBottom: 2 }}>Nearest safe ATM</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#8B7E6A" }}>CIB Bank · Pyramids Rd · 420m</div>
            </div>
            <ArrowRight size={16} color={C.faience} strokeWidth={2}/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: Profile & Gamification ────────────────────────────────────────────
const LEVEL_MAP = [
  { level: 1, title: "Newcomer",   xpNeeded: 0,    color: "#C4B89A" },
  { level: 2, title: "Wanderer",   xpNeeded: 100,  color: C.faience  },
  { level: 3, title: "Discoverer", xpNeeded: 250,  color: C.safeGreen},
  { level: 4, title: "Explorer",   xpNeeded: 500,  color: C.copper   },
  { level: 5, title: "Historian",  xpNeeded: 1000, color: C.sand     },
  { level: 6, title: "Pharaoh",    xpNeeded: 2000, color: C.terracotta},
];

const ALL_BADGES = [
  { id: "b01", name: "Giza Pioneer",       icon: "🏔", cat: "Places",      earned: true,  date: "28 Jul",   xp: 50,  desc: "First visit to the Giza Plateau" },
  { id: "b02", name: "Museum Maven",       icon: "🏺", cat: "Places",      earned: true,  date: "30 Jul",   xp: 60,  desc: "Visited 2 museums in one journey" },
  { id: "b03", name: "Cairo Chronicler",   icon: "📜", cat: "Places",      earned: true,  date: "29 Jul",   xp: 80,  desc: "Explored 3+ Cairo sites in a day" },
  { id: "b04", name: "Bazaar Navigator",   icon: "🧭", cat: "Places",      earned: false, date: null,        xp: 40,  desc: "Complete a market visit with zero scams" },
  { id: "b05", name: "Temple Scholar",     icon: "🌿", cat: "Places",      earned: false, date: null,        xp: 70,  desc: "Visit 5 temples across Egypt" },
  { id: "b06", name: "Nile Wanderer",      icon: "🌊", cat: "Places",      earned: false, date: null,        xp: 90,  desc: "Visit a site on the Nile Corniche" },
  { id: "b07", name: "Scam Survivor",      icon: "🛡", cat: "Safety",      earned: true,  date: "29 Jul",   xp: 30,  desc: "Rafiq flagged a scam and you avoided it" },
  { id: "b08", name: "Safety Ace",         icon: "✅", cat: "Safety",      earned: false, date: null,        xp: 50,  desc: "7-day journey with zero safety incidents" },
  { id: "b09", name: "Rafiq Devotee",      icon: "🤖", cat: "Rafiq",       earned: true,  date: "30 Jul",   xp: 20,  desc: "Asked Rafiq 10+ questions in a single day" },
  { id: "b10", name: "Deep Diver",         icon: "📖", cat: "Rafiq",       earned: false, date: null,        xp: 40,  desc: "Read 5 full cultural stories from Rafiq" },
  { id: "b11", name: "Early Riser",        icon: "🌅", cat: "Habits",      earned: false, date: null,        xp: 25,  desc: "Start a site visit before 8am" },
  { id: "b12", name: "Golden Hour",        icon: "🌇", cat: "Habits",      earned: false, date: null,        xp: 25,  desc: "Visit a site at sunset" },
  { id: "b13", name: "Solo Adventurer",    icon: "🎒", cat: "Habits",      earned: true,  date: "28 Jul",   xp: 35,  desc: "Complete a full day exploring alone" },
  { id: "b14", name: "Week in Egypt",      icon: "🗓", cat: "Milestones",  earned: false, date: null,        xp: 100, desc: "7 consecutive days in Egypt" },
  { id: "b15", name: "Century Club",       icon: "💯", cat: "Milestones",  earned: false, date: null,        xp: 150, desc: "Earn 1000 XP in a single journey" },
  { id: "b16", name: "Governorate Hopper", icon: "🗺", cat: "Milestones",  earned: false, date: null,        xp: 120, desc: "Visit 5 different governorates" },
];

const BADGE_CATS = ["All", "Places", "Safety", "Rafiq", "Habits", "Milestones"];

const TRAVELER_STATS = [
  { label: "Days in Egypt",       val: "3",    icon: <Star     size={16} strokeWidth={2}/>, color: C.sand       },
  { label: "Sites visited",       val: "5",    icon: <MapPin   size={16} strokeWidth={2}/>, color: C.faience    },
  { label: "Hours exploring",     val: "8.3",  icon: <Clock    size={16} strokeWidth={2}/>, color: C.copper     },
  { label: "Rafiq conversations", val: "23",   icon: <Glyph   size={16}/>,                  color: C.nile       },
  { label: "Scams avoided",       val: "2",    icon: <Shield   size={16} strokeWidth={2}/>, color: C.safeGreen  },
  { label: "Governorates",        val: "2",    icon: <Globe    size={16} strokeWidth={2}/>, color: C.terracotta },
];

const PERSONA_STYLES = [
  { id: "cultural",   label: "Cultural",    icon: "🏛",  active: true  },
  { id: "adventure",  label: "Adventure",   icon: "🧗",  active: false },
  { id: "foodie",     label: "Foodie",      icon: "🫕",  active: false },
  { id: "history",    label: "History",     icon: "📜",  active: false },
];

const JOURNEY_IMPACT = [
  { label: "Local guides supported", val: "4",    color: C.safeGreen  },
  { label: "EGP spent locally",      val: "2,420",color: C.copper     },
  { label: "Carbon offset (kg CO₂)", val: "12",   color: C.faience    },
];

function PageProfile() {
  const [badgeCat, setBadgeCat] = useState("All");
  const [tab,      setTab]      = useState<"badges" | "stats" | "impact">("badges");
  const { user } = useAuth();

  const displayName = user?.displayName || "Sara Al-Rashid";
  const initial = displayName.charAt(0).toUpperCase();

  const currentXP   = 550;
  const currentLevel = LEVEL_MAP[3];
  const nextLevel    = LEVEL_MAP[4];
  const xpInLevel    = currentXP - currentLevel.xpNeeded;
  const xpNeeded     = nextLevel.xpNeeded - currentLevel.xpNeeded;
  const pct          = Math.min((xpInLevel / xpNeeded) * 100, 100);

  const filtered = ALL_BADGES.filter(b => badgeCat === "All" || b.cat === badgeCat);
  const earned   = ALL_BADGES.filter(b => b.earned).length;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar location="Your Profile · Rihla"/>

      {/* Profile hero */}
      <div style={{ background: `linear-gradient(160deg,${C.nile} 0%,#122A2B 55%,#1A3A1F 100%)`, padding: "36px 32px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -60, top: -60 }}><Geom size={320} color={C.limestone} op={0.028}/></div>
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 28, alignItems: "center" }}>
            {/* Avatar */}
            <div style={{ position: "relative" }}>
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: `linear-gradient(135deg,${C.sand}50,${C.copper}60)`, border: `3px solid ${C.limestone}25`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 6px ${C.limestone}08` }}>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "38px", fontWeight: 500, color: C.limestone }}>{initial}</span>
              </div>
              <div style={{ position: "absolute", bottom: 2, right: 2, width: 20, height: 20, borderRadius: "50%", background: C.safeGreen, border: `2px solid #0F3D3E`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle size={11} color="#fff" strokeWidth={2.5}/>
              </div>
            </div>
            {/* Name & level */}
            <div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: `${C.limestone}45`, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Verified traveler</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(22px,3vw,36px)", fontWeight: 400, color: C.limestone, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 6 }}>
                {displayName}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${currentLevel.color}20`, border: `1px solid ${currentLevel.color}40`, borderRadius: 99, padding: "4px 12px" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: currentLevel.color }}/>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, color: currentLevel.color }}>Level {currentLevel.level} · {currentLevel.title}</span>
                </div>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.limestone}45` }}>{user?.nationality || "🇩🇪 German"} · {user?.travelStyle || "Cultural explorer"}</span>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.limestone}35` }}>Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Jul 2026"}</span>
              </div>
            </div>
            {/* XP block */}
            <div style={{ background: `${C.limestone}08`, border: `1px solid ${C.limestone}15`, borderRadius: 16, padding: "18px 22px", minWidth: 200 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: `${C.limestone}45`, letterSpacing: "0.1em", textTransform: "uppercase" }}>Journey XP</span>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "22px", fontWeight: 500, color: C.sand }}>{currentXP}</span>
              </div>
              <div style={{ height: 6, background: `${C.limestone}15`, borderRadius: 99, marginBottom: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${C.sand},${C.faience})`, borderRadius: 99, transition: "width 0.6s ease" }}/>
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: `${C.limestone}45` }}>
                {xpNeeded - xpInLevel} XP to <span style={{ color: nextLevel.color, fontWeight: 600 }}>{nextLevel.title}</span>
              </div>
            </div>
          </div>

          {/* Level road */}
          <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 0 }}>
            {LEVEL_MAP.map((lv, i) => {
              const done = lv.level < currentLevel.level;
              const curr = lv.level === currentLevel.level;
              return (
                <div key={lv.level} style={{ display: "flex", alignItems: "center", flex: i < LEVEL_MAP.length - 1 ? 1 : "none" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <div style={{ width: curr ? 36 : 24, height: curr ? 36 : 24, borderRadius: "50%", background: done || curr ? lv.color : `${C.limestone}12`, border: `2px solid ${done || curr ? lv.color : `${C.limestone}20`}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", boxShadow: curr ? `0 0 0 5px ${lv.color}25` : "none" }}>
                      {(done || curr) && <CheckCircle size={curr ? 16 : 11} color={C.limestone} strokeWidth={2.5}/>}
                    </div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: curr ? 700 : 400, color: done || curr ? lv.color : `${C.limestone}30`, whiteSpace: "nowrap" }}>{lv.title}</div>
                  </div>
                  {i < LEVEL_MAP.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: done ? `linear-gradient(90deg,${lv.color},${LEVEL_MAP[i+1].color})` : `${C.limestone}15`, margin: "0 4px", marginBottom: 18 }}/>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "24px 32px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box", display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>

        {/* Left: tabs */}
        <div>
          {/* Tab bar */}
          <div style={{ display: "flex", gap: 4, background: C.limestoneDark, borderRadius: 12, padding: 4, marginBottom: 20, width: "fit-content" }}>
            {(["badges","stats","impact"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? C.limestone : "transparent", border: "none", borderRadius: 9, padding: "8px 20px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: tab === t ? 700 : 400, color: tab === t ? C.nile : "#8B7E6A", cursor: "pointer", transition: "all 0.18s", textTransform: "capitalize", boxShadow: tab === t ? "0 1px 6px rgba(27,26,23,0.08)" : "none" }}>{t === "impact" ? "Journey Impact" : t.charAt(0).toUpperCase() + t.slice(1)}</button>
            ))}
          </div>

          {tab === "badges" && (
            <div>
              {/* Category filter */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {BADGE_CATS.map(c => (
                  <button key={c} onClick={() => setBadgeCat(c)} style={{ background: badgeCat === c ? C.nile : "transparent", border: `1.5px solid ${badgeCat === c ? C.nile : "rgba(27,26,23,0.13)"}`, borderRadius: 99, padding: "5px 14px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: badgeCat === c ? 600 : 400, color: badgeCat === c ? C.limestone : "#6B6354", cursor: "pointer" }}>{c}</button>
                ))}
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#A89880", alignSelf: "center", marginLeft: 4 }}>{earned} of {ALL_BADGES.length} earned</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
                {filtered.map(b => (
                  <div key={b.id} style={{ background: b.earned ? C.limestone : "#FAF7F0", borderRadius: 14, padding: "18px 16px", border: `1.5px solid ${b.earned ? `${ALL_BADGES.find(x=>x.id===b.id) ? C.limestone : "transparent"}` : "rgba(27,26,23,0.06)"}`, opacity: b.earned ? 1 : 0.5, position: "relative", overflow: "hidden", boxShadow: b.earned ? "0 2px 12px rgba(15,61,62,0.06)" : "none" }}>
                    {!b.earned && <div style={{ position: "absolute", inset: 0, background: "rgba(240,235,224,0.3)", backdropFilter: "blur(1px)", zIndex: 1 }}/>}
                    <div style={{ position: "relative", zIndex: 2 }}>
                      <div style={{ fontSize: "30px", marginBottom: 10 }}>{b.icon}</div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.nile, marginBottom: 4 }}>{b.name}</div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A", lineHeight: 1.5, marginBottom: 10 }}>{b.desc}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, background: `${C.sand}20`, color: C.copper, padding: "2px 8px", borderRadius: 99 }}>+{b.xp} XP</span>
                        {b.earned && b.date
                          ? <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "#A89880" }}>{b.date}</span>
                          : <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "#C4B89A" }}>Locked</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "stats" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {TRAVELER_STATS.map(s => (
                  <div key={s.label} style={{ background: C.limestone, borderRadius: 14, padding: "20px 18px", border: "1px solid rgba(27,26,23,0.07)", textAlign: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}12`, border: `1px solid ${s.color}25`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, margin: "0 auto 12px" }}>{s.icon}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "28px", fontWeight: 500, color: C.nile, marginBottom: 4 }}>{s.val}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: C.limestone, borderRadius: 14, padding: "20px", border: "1px solid rgba(27,26,23,0.07)" }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: "#A89880", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Travel Style Preferences</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {PERSONA_STYLES.map(p => (
                    <div key={p.id} style={{ flex: 1, textAlign: "center", padding: "16px 8px", borderRadius: 12, background: p.active ? `${C.nile}08` : "#FAF7F0", border: `1.5px solid ${p.active ? C.nile : "rgba(27,26,23,0.07)"}` }}>
                      <div style={{ fontSize: "22px", marginBottom: 6 }}>{p.icon}</div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: p.active ? 700 : 400, color: p.active ? C.nile : "#A89880" }}>{p.label}</div>
                      {p.active && <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.faience, margin: "6px auto 0" }}/>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "impact" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "linear-gradient(145deg,#FAF3E4,#F0E8D0)", borderRadius: 16, padding: "24px", border: `1px solid ${C.sand}25` }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: C.copper, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>◈ Your Journey Impact</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "16px", color: C.nile, lineHeight: 1.7, marginBottom: 20 }}>"Tourism done thoughtfully is one of Egypt's most important economic pillars. Your journey supports local families, preserves living heritage, and funds site restoration."</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                  {JOURNEY_IMPACT.map(j => (
                    <div key={j.label} style={{ background: C.limestone, borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "26px", fontWeight: 500, color: j.color, marginBottom: 4 }}>{j.val}</div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A", lineHeight: 1.4 }}>{j.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: C.limestone, borderRadius: 14, padding: "20px", border: "1px solid rgba(27,26,23,0.07)" }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: "#A89880", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Sites you helped preserve</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {VISIT_LOG.slice(0,3).map(v => (
                    <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                        <img src={v.img} alt={v.site} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.nile }}>{v.site}</div>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880" }}>Your visit contributed to site preservation funding</div>
                      </div>
                      <CheckCircle size={16} color={C.safeGreen} strokeWidth={2.5}/>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Quick profile card */}
          <div style={{ background: C.limestone, borderRadius: 16, padding: "20px", border: "1px solid rgba(27,26,23,0.07)" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: "#A89880", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Profile Details</div>
            {[
              { label: "Full name",     val: displayName },
              { label: "Email",         val: user?.email || "sara@example.com" },
              { label: "Nationality",   val: user?.nationality || "🇩🇪 German" },
              { label: "Travel style",  val: user?.travelStyle || "Cultural" },
              { label: "Journeys",      val: "1 complete · 1 active" },
              { label: "Member since",  val: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "July 2026" },
            ].map(({ label, val }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(27,26,23,0.05)" }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#A89880" }}>{label}</span>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.nile }}>{val}</span>
              </div>
            ))}
            <button style={{ marginTop: 14, width: "100%", background: "#FAF7F0", border: "1.5px solid rgba(27,26,23,0.1)", borderRadius: 9, padding: "10px 16px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: "#6B6354", cursor: "pointer" }}>Edit Profile</button>
          </div>

          {/* Next badge */}
          <div style={{ background: `linear-gradient(145deg,${C.nile},${C.nileMid})`, borderRadius: 16, padding: "20px" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: `${C.limestone}45`, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>◈ Next Badge</div>
            {(() => {
              const next = ALL_BADGES.find(b => !b.earned);
              return next ? (
                <div>
                  <div style={{ fontSize: "32px", marginBottom: 8 }}>{next.icon}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.limestone, marginBottom: 4 }}>{next.name}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.limestone}60`, lineHeight: 1.55, marginBottom: 12 }}>{next.desc}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, background: `${C.sand}20`, color: C.sand, padding: "3px 9px", borderRadius: 99 }}>+{next.xp} XP on unlock</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: C.faience, fontWeight: 600, cursor: "pointer" }}>How? →</span>
                  </div>
                </div>
              ) : null;
            })()}
          </div>

          {/* Earned summary */}
          <div style={{ background: C.limestone, borderRadius: 14, padding: "16px 18px", border: "1px solid rgba(27,26,23,0.07)" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: "#A89880", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Badge Progress</div>
            {BADGE_CATS.slice(1).map(cat => {
              const total   = ALL_BADGES.filter(b => b.cat === cat).length;
              const earnedN = ALL_BADGES.filter(b => b.cat === cat && b.earned).length;
              return (
                <div key={cat} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#6B6354" }}>{cat}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, color: C.nile }}>{earnedN}/{total}</span>
                  </div>
                  <div style={{ height: 4, background: "#EDE6D6", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(earnedN/total)*100}%`, background: `linear-gradient(90deg,${C.copper},${C.sand})`, borderRadius: 99 }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: Settings ──────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{ width: 44, height: 24, borderRadius: 99, background: on ? C.faience : "#D4CBB8", border: "none", cursor: "pointer", position: "relative", transition: "background 0.22s", flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: on ? 23 : 3, transition: "left 0.22s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}/>
    </button>
  );
}

function SettingsRow({ label, sub, right, border = true }: { label: string; sub?: string; right: React.ReactNode; border?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: border ? "1px solid rgba(27,26,23,0.06)" : "none", gap: 16 }}>
      <div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 600, color: C.nile }}>{label}</div>
        {sub && <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#A89880", marginTop: 2, lineHeight: 1.4 }}>{sub}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{right}</div>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: C.limestone, borderRadius: 16, padding: "6px 22px 6px", border: "1px solid rgba(27,26,23,0.07)", marginBottom: 16 }}>
      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: C.copper, letterSpacing: "0.14em", textTransform: "uppercase", padding: "14px 0 8px" }}>{title}</div>
      {children}
    </div>
  );
}

const RAFIQ_PERSONAS = [
  { id: "guide",     label: "The Guide",     icon: "🧭", desc: "Practical, efficient, safety-first. Answers quickly and clearly." },
  { id: "historian", label: "The Historian",  icon: "📜", desc: "Deep cultural context, stories, etymology. Takes its time." },
  { id: "local",     label: "The Local",      icon: "🫖", desc: "Warm, conversational, opinionated. Feels like a Cairo friend." },
];

const APP_LANGUAGES = ["English", "العربية", "Deutsch", "Français", "日本語", "Español"];

function PageSettings({ go }: { go: (s: string) => void }) {
  const { logout } = useAuth();
  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    go("landing");
  };
  const [notifs, setNotifs] = useState({
    scamAlerts:   true,
    weatherWarn:  true,
    siteUpdates:  false,
    journeyXP:    true,
    rafiqTips:    true,
    marketing:    false,
  });
  const [privacy, setPrivacy] = useState({
    locationLive: true,
    shareHistory: false,
    analytics:    true,
    crashReports: true,
  });
  const [prefs, setPrefs] = useState({
    offlineMode:  false,
    compactView:  false,
    darkMode:     false,
    audioStories: true,
  });
  const [rafiqPersona, setRafiqPersona] = useState("historian");
  const [language,     setLanguage]     = useState("English");
  const [units,        setUnits]        = useState<"metric"|"imperial">("metric");
  const [currency,     setCurrency]     = useState("USD");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const toggle = (obj: Record<string, boolean>, key: string, set: (v: any) => void) =>
    set((prev: any) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar location="Settings · Rihla"/>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${C.basalt} 0%,#2A1E10 60%,${C.nile} 100%)`, padding: "24px 32px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -40, top: -40 }}><Geom size={220} color={C.limestone} op={0.025}/></div>
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: `${C.limestone}40`, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8 }}>Preferences</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(20px,2.5vw,30px)", fontWeight: 400, color: C.limestone, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Settings &amp; <span style={{ fontStyle: "italic", color: C.sand }}>Preferences</span>
          </h1>
        </div>
      </div>

      <div style={{ flex: 1, padding: "24px 32px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, columnGap: 24 }}>

        {/* Left column */}
        <div>
          {/* Rafiq persona */}
          <div style={{ background: C.limestone, borderRadius: 16, padding: "20px 22px", border: "1px solid rgba(27,26,23,0.07)", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: C.copper, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>◈ Rafiq Persona</div>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#8B7E6A", marginBottom: 16, lineHeight: 1.55 }}>Choose how Rafiq communicates with you. You can change this anytime mid-journey.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {RAFIQ_PERSONAS.map(p => (
                <button key={p.id} onClick={() => setRafiqPersona(p.id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, border: `2px solid ${rafiqPersona === p.id ? C.faience : "rgba(27,26,23,0.1)"}`, background: rafiqPersona === p.id ? `${C.faience}08` : "#FAF7F0", cursor: "pointer", textAlign: "left", transition: "all 0.18s" }}>
                  <span style={{ fontSize: "24px", flexShrink: 0 }}>{p.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: rafiqPersona === p.id ? C.faience : C.nile, marginBottom: 2 }}>{p.label}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#8B7E6A", lineHeight: 1.45 }}>{p.desc}</div>
                  </div>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${rafiqPersona === p.id ? C.faience : "#C4B89A"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {rafiqPersona === p.id && <div style={{ width: 9, height: 9, borderRadius: "50%", background: C.faience }}/>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Language & region */}
          <SettingsSection title="Language &amp; Region">
            <SettingsRow
              label="App Language"
              sub="Affects all UI text and Rafiq responses"
              right={
                <select value={language} onChange={e => setLanguage(e.target.value)} style={{ background: C.limestoneDark, border: "1.5px solid rgba(27,26,23,0.1)", borderRadius: 8, padding: "6px 10px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.nile, cursor: "pointer", outline: "none" }}>
                  {APP_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              }
            />
            <SettingsRow
              label="Units"
              sub="Distance and temperature display"
              right={
                <div style={{ display: "flex", background: C.limestoneDark, borderRadius: 8, padding: 3, gap: 2 }}>
                  {(["metric","imperial"] as const).map(u => (
                    <button key={u} onClick={() => setUnits(u)} style={{ background: units === u ? C.limestone : "transparent", border: "none", borderRadius: 6, padding: "5px 12px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: units === u ? 700 : 400, color: units === u ? C.nile : "#8B7E6A", cursor: "pointer", boxShadow: units === u ? "0 1px 4px rgba(27,26,23,0.08)" : "none" }}>{u.charAt(0).toUpperCase() + u.slice(1)}</button>
                  ))}
                </div>
              }
            />
            <SettingsRow
              label="Home Currency"
              sub="Used in the currency converter"
              border={false}
              right={
                <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ background: C.limestoneDark, border: "1.5px solid rgba(27,26,23,0.1)", borderRadius: 8, padding: "6px 10px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.nile, cursor: "pointer", outline: "none" }}>
                  {["USD","EUR","GBP","JPY","AUD","CAD","CHF","AED"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              }
            />
          </SettingsSection>

          {/* App preferences */}
          <SettingsSection title="App Preferences">
            <SettingsRow label="Offline Mode" sub="Download site data for use without internet" right={<Toggle on={prefs.offlineMode} onChange={() => toggle(prefs, "offlineMode", setPrefs)}/>}/>
            <SettingsRow label="Audio Stories" sub="Rafiq reads cultural stories aloud at sites" right={<Toggle on={prefs.audioStories} onChange={() => toggle(prefs, "audioStories", setPrefs)}/>}/>
            <SettingsRow label="Compact View" sub="Denser layout in Home and Explore" right={<Toggle on={prefs.compactView} onChange={() => toggle(prefs, "compactView", setPrefs)}/>}/>
            <SettingsRow label="Dark Mode" sub="Easier on the eyes at night" border={false} right={<Toggle on={prefs.darkMode} onChange={() => toggle(prefs, "darkMode", setPrefs)}/>}/>
          </SettingsSection>
        </div>

        {/* Right column */}
        <div>
          {/* Notifications */}
          <SettingsSection title="Notifications">
            <SettingsRow label="Scam &amp; Safety Alerts" sub="Immediate push for active threats near you" right={<Toggle on={notifs.scamAlerts} onChange={() => toggle(notifs, "scamAlerts", setNotifs)}/>}/>
            <SettingsRow label="Weather Warnings" sub="UV, heat, and severe weather alerts" right={<Toggle on={notifs.weatherWarn} onChange={() => toggle(notifs, "weatherWarn", setNotifs)}/>}/>
            <SettingsRow label="Rafiq Tips" sub="Proactive local tips based on where you are" right={<Toggle on={notifs.rafiqTips} onChange={() => toggle(notifs, "rafiqTips", setNotifs)}/>}/>
            <SettingsRow label="Journey XP &amp; Badges" sub="Celebrate milestones as you explore" right={<Toggle on={notifs.journeyXP} onChange={() => toggle(notifs, "journeyXP", setNotifs)}/>}/>
            <SettingsRow label="Site Updates" sub="Opening hours, closures, and changes" right={<Toggle on={notifs.siteUpdates} onChange={() => toggle(notifs, "siteUpdates", setNotifs)}/>}/>
            <SettingsRow label="Rihla News &amp; Offers" sub="Product updates and promotions" border={false} right={<Toggle on={notifs.marketing} onChange={() => toggle(notifs, "marketing", setNotifs)}/>}/>
          </SettingsSection>

          {/* Privacy */}
          <SettingsSection title="Privacy &amp; Data">
            <SettingsRow label="Live Location" sub="Required for scam alerts and nearby sites" right={<Toggle on={privacy.locationLive} onChange={() => toggle(privacy, "locationLive", setPrivacy)}/>}/>
            <SettingsRow label="Share Visit History" sub="Anonymised data helps improve Rihla" right={<Toggle on={privacy.shareHistory} onChange={() => toggle(privacy, "shareHistory", setPrivacy)}/>}/>
            <SettingsRow label="Usage Analytics" sub="Helps us improve the app experience" right={<Toggle on={privacy.analytics} onChange={() => toggle(privacy, "analytics", setPrivacy)}/>}/>
            <SettingsRow label="Crash Reports" sub="Automatically send diagnostic data" border={false} right={<Toggle on={privacy.crashReports} onChange={() => toggle(privacy, "crashReports", setPrivacy)}/>}/>
          </SettingsSection>

          {/* Account */}
          <SettingsSection title="Account">
            <SettingsRow
              label="Export My Data"
              sub="Download your full journey archive as JSON"
              right={
                <button style={{ background: "#FAF7F0", border: "1.5px solid rgba(27,26,23,0.12)", borderRadius: 8, padding: "7px 14px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: "#6B6354", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <BookOpen size={13} strokeWidth={2}/> Export
                </button>
              }
            />
            <SettingsRow
              label="Sign Out"
              right={
                <button onClick={handleLogout} style={{ background: "transparent", border: `1.5px solid ${C.terracotta}40`, borderRadius: 8, padding: "7px 14px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.terracotta, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <LogOut size={13} strokeWidth={2}/> Sign out
                </button>
              }
            />
            <SettingsRow
              label="Delete Account"
              sub="Permanently remove all your data from Rihla"
              border={false}
              right={
                !deleteConfirm
                  ? <button onClick={() => setDeleteConfirm(true)} style={{ background: "transparent", border: `1.5px solid ${C.signalRed}35`, borderRadius: 8, padding: "7px 14px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.signalRed, cursor: "pointer" }}>Delete</button>
                  : (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setDeleteConfirm(false)} style={{ background: C.limestoneDark, border: "none", borderRadius: 8, padding: "7px 12px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: "#6B6354", cursor: "pointer" }}>Cancel</button>
                      <button style={{ background: C.signalRed, border: "none", borderRadius: 8, padding: "7px 12px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, color: "#fff", cursor: "pointer" }}>Confirm</button>
                    </div>
                  )
              }
            />
          </SettingsSection>

          {/* App info */}
          <div style={{ background: "linear-gradient(145deg,#FAF3E4,#F0E8D0)", borderRadius: 14, padding: "16px 20px", border: `1px solid ${C.sand}22`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Glyph size={22}/>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "14px", fontWeight: 500, color: C.nile }}>رحلة Rihla</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880" }}>Version 1.0.0 · Build 2026.07</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {["Privacy Policy","Terms","Support"].map(l => (
                <button key={l} style={{ background: "none", border: "none", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 500, color: C.faience, cursor: "pointer" }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: Rafiq AI Chat ─────────────────────────────────────────────────────
type RafiqMsg = {
  id: string;
  role: "rafiq" | "user";
  text: string;
  sources?: string[];
  follow?: string[];
  alert?: { level: "info" | "warn" | "danger"; text: string };
  ts: string;
};

const INITIAL_MSGS: RafiqMsg[] = [
  {
    id: "m0",
    role: "rafiq",
    text: "مرحباً! I'm Rafiq — your Egyptian journey companion. I have live safety data, verified historical records, and local knowledge for your current location on the Giza Plateau. What would you like to know?",
    sources: ["Egyptian Tourist Authority", "Ministry of Antiquities", "Live safety network"],
    follow: ["Is it safe to visit the Sphinx today?", "What's the best time to beat the crowds?", "Tell me the story of the Great Pyramid", "Nearest authentic restaurant?"],
    ts: "Now",
  },
];

const CANNED_RESPONSES: Record<string, RafiqMsg> = {
  sphinx: {
    id: "r1", role: "rafiq", ts: "Just now",
    text: "The Sphinx is fully accessible and currently rated **Secure** by Tourist Police. However, I'm flagging an active scam on the east path — vendors offering 'free' scarab figurines who then demand payment. Walk past with eye contact and a firm 'la shukran' (no thank you).\n\nThe Sphinx was carved directly from a single limestone ridge — not assembled from blocks — during the reign of Pharaoh Khafre around 2500 BCE. The face almost certainly depicts Khafre himself. Its missing nose was documented by the Danish explorer Frederic Louis Norden in 1737, long before Napoleon's campaign.",
    sources: ["Tourist Police Live Feed", "Ministry of Antiquities", "12 community reports"],
    alert: { level: "warn", text: "Active scam — east path vendors · 14 reports in 2 hours" },
    follow: ["What scam should I watch for?", "Best angle for photos?", "How long should I spend here?"],
  },
  crowd: {
    id: "r2", role: "rafiq", ts: "Just now",
    text: "Based on 340 recent visitor patterns, the Giza Plateau is quietest between **6:00–8:30am** and again **3:30–5:00pm**. Mid-morning (10am–1pm) is the busiest window — tour groups arrive in convoy.\n\nThis afternoon at 4:30pm, you have a 38-minute window before the light shifts — the sun will hit the Sphinx's face at approximately 15° elevation. It's the most photographed light condition of the day.",
    sources: ["Visitor pattern data · 340 recent sessions", "Google Popular Times", "Weather API"],
    follow: ["What about weekends?", "Is there a back entrance?", "How much does entry cost?"],
  },
  pyramid: {
    id: "r3", role: "rafiq", ts: "Just now",
    text: "The Great Pyramid of Khufu is the only surviving wonder of the ancient world — and it held the record as the tallest human-built structure for **3,800 years**, until Lincoln Cathedral was completed in 1311 CE.\n\nHere's what most guides won't tell you: the pyramid's four sides are not flat. Each face has a slight inward concavity — barely perceptible to the eye but detectable from the air. The purpose remains unknown. Some scholars believe it was intentional to prevent the casing stones from sliding; others think it's a precise solar marker.\n\nThe interior temperature is a constant 20°C regardless of the outside heat.",
    sources: ["Ministry of Antiquities", "AERA (Ancient Egypt Research Associates)", "Egyptology peer review"],
    follow: ["Can I go inside?", "How were the blocks moved?", "Tell me about the other pyramids"],
  },
  food: {
    id: "r4", role: "rafiq", ts: "Just now",
    text: "Within 800m of your current location, I'd recommend:\n\n**Koshary El Tahrir** (3.2km) — Egypt's national dish, layered rice, lentils, macaroni, crispy onion and tomato sauce. Unmissable. EGP 20–35.\n\n**Andrea's** (2.1km, Marioutiya Canal) — Grilled chicken and mezze in a riverside garden. Beloved by locals for 50 years. EGP 120–180 per person.\n\nAvoid any restaurant near the plateau entrance that solicits tourists at the door — pricing is typically 3× the local rate.",
    sources: ["Google Reviews · verified", "TripAdvisor · local-weighted", "Rafiq community reports"],
    alert: { level: "info", text: "Tip: Always agree on prices before sitting down at tourist-area restaurants" },
    follow: ["What's koshary exactly?", "Any vegetarian options?", "Best place for Egyptian coffee?"],
  },
};

function resolveResponse(input: string): RafiqMsg {
  const l = input.toLowerCase();
  if (l.includes("safe") || l.includes("sphinx") || l.includes("scam")) return { ...CANNED_RESPONSES.sphinx, id: `r_${Date.now()}` };
  if (l.includes("crowd") || l.includes("time") || l.includes("beat") || l.includes("quiet") || l.includes("best time")) return { ...CANNED_RESPONSES.crowd, id: `r_${Date.now()}` };
  if (l.includes("pyramid") || l.includes("story") || l.includes("histor") || l.includes("khufu")) return { ...CANNED_RESPONSES.pyramid, id: `r_${Date.now()}` };
  if (l.includes("food") || l.includes("eat") || l.includes("restaurant") || l.includes("lunch") || l.includes("koshary")) return { ...CANNED_RESPONSES.food, id: `r_${Date.now()}` };
  return {
    id: `r_${Date.now()}`, role: "rafiq", ts: "Just now",
    text: "That's a great question about Egypt. Based on my current context — the Giza Plateau, 38°C, light crowds this afternoon — I'd say the best approach is to move purposefully, stay on the official paths, and let the scale of the site land slowly. Most people rush. The ones who linger, discover.\n\nIs there something specific about this site, the local area, or Egyptian culture I can dig into for you?",
    sources: ["Rafiq contextual synthesis"],
    follow: ["Tell me about the Sphinx", "Any safety alerts nearby?", "What should I see next?"],
  };
}

const TOPIC_PILLS = [
  { label: "Safety now",      query: "Is it safe to visit the Sphinx today?"         },
  { label: "Beat the crowds", query: "What's the best time to beat the crowds?"      },
  { label: "Great Pyramid",   query: "Tell me the story of the Great Pyramid"        },
  { label: "Where to eat",    query: "Nearest authentic restaurant?"                 },
  { label: "Scam alerts",     query: "What scams should I watch for here?"           },
  { label: "Hidden gems",     query: "What do most tourists miss at Giza?"           },
];

function RafiqBubble({ msg }: { msg: RafiqMsg }) {
  const isRafiq = msg.role === "rafiq";
  const parts   = msg.text.split(/\*\*(.+?)\*\*/g);
  const rendered = parts.map((p, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ fontWeight: 700, color: C.nile }}>{p}</strong>
      : p.split("\n").map((line, j) => (
          <span key={j}>{line}{j < p.split("\n").length - 1 && <br/>}</span>
        ))
  );

  if (!isRafiq) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <div style={{ maxWidth: "68%", background: C.nile, borderRadius: "16px 16px 4px 16px", padding: "12px 16px" }}>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: C.limestone, lineHeight: 1.65, margin: 0 }}>{msg.text}</p>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: `${C.limestone}45`, marginTop: 6, textAlign: "right" }}>{msg.ts}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "flex-start" }}>
      {/* Avatar */}
      <div style={{ width: 36, height: 36, borderRadius: 11, background: `linear-gradient(135deg,${C.nile},${C.nileMid})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
        <Glyph size={18} light/>
      </div>
      <div style={{ flex: 1, maxWidth: "80%" }}>
        {/* Alert banner */}
        {msg.alert && (
          <div style={{ background: msg.alert.level === "danger" ? `${C.signalRed}10` : msg.alert.level === "warn" ? `${C.alertAmber}10` : `${C.faience}10`, border: `1px solid ${msg.alert.level === "danger" ? C.signalRed : msg.alert.level === "warn" ? C.alertAmber : C.faience}28`, borderRadius: 10, padding: "8px 12px", marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}>
            <AlertTriangle size={12} color={msg.alert.level === "warn" ? C.alertAmber : msg.alert.level === "danger" ? C.signalRed : C.faience} strokeWidth={2.5}/>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: msg.alert.level === "warn" ? C.alertAmber : msg.alert.level === "danger" ? C.signalRed : C.faience }}>{msg.alert.text}</span>
          </div>
        )}
        {/* Bubble */}
        <div style={{ background: "linear-gradient(145deg,#FAF7F0,#F5EDD8)", border: `1px solid ${C.sand}22`, borderRadius: "4px 16px 16px 16px", padding: "14px 16px" }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "9px", fontWeight: 700, color: C.copper, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>◈ Rafiq · {msg.ts}</div>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "14px", color: C.nile, lineHeight: 1.75, margin: 0 }}>{rendered}</p>
          {/* Sources */}
          {msg.sources && (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(27,26,23,0.07)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: "#A89880" }}>Sources:</span>
              {msg.sources.map(s => (
                <span key={s} style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", background: C.limestoneDark, color: "#8B7E6A", padding: "2px 8px", borderRadius: 99 }}>{s}</span>
              ))}
            </div>
          )}
        </div>
        {/* Follow-up suggestions */}
        {msg.follow && (
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {msg.follow.map(q => (
              <span key={q} data-follow={q} style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", background: C.limestone, border: `1.5px solid ${C.nile}18`, borderRadius: 99, padding: "5px 12px", color: C.nile, cursor: "pointer", fontWeight: 500 }}>{q}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PageRafiq() {
  const [msgs,    setMsgs]    = useState<RafiqMsg[]>(INITIAL_MSGS);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const send = (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: RafiqMsg = { id: `u_${Date.now()}`, role: "user", text: text.trim(), ts: "Just now" };
    setMsgs(m => [...m, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      setMsgs(m => [...m, resolveResponse(text)]);
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }, 900 + Math.random() * 600);
  };

  const handleFollow = (e: React.MouseEvent) => {
    const q = (e.target as HTMLElement).getAttribute("data-follow");
    if (q) send(q);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{ background: `linear-gradient(135deg,${C.nile},${C.nileMid})`, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${C.limestone}15`, border: `1px solid ${C.limestone}20`, display: "flex", alignItems: "center", justifyContent: "center" }}><Glyph size={22} light/></div>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", fontWeight: 500, color: C.limestone, lineHeight: 1 }}>Rafiq</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.safeGreen, boxShadow: `0 0 0 2px ${C.safeGreen}35` }}/>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 500, color: `${C.limestone}65` }}>Active · Giza Plateau context · 15 sources</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setMsgs(INITIAL_MSGS)} style={{ background: `${C.limestone}10`, border: `1px solid ${C.limestone}20`, borderRadius: 8, padding: "7px 12px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 500, color: `${C.limestone}70`, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={13} strokeWidth={2}/> New chat
          </button>
          <div style={{ background: `${C.limestone}10`, border: `1px solid ${C.limestone}20`, borderRadius: 8, padding: "7px 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <MapPin size={12} color={`${C.limestone}70`} strokeWidth={2}/>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.limestone}65` }}>Giza Plateau, Cairo</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: topic pills */}
        <div style={{ width: 220, flexShrink: 0, background: "#FAF7F0", borderRight: "1px solid rgba(27,26,23,0.07)", padding: "20px 14px", display: "flex", flexDirection: "column", gap: 6, overflowY: "auto" }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: C.copper, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>Quick Topics</div>
          {TOPIC_PILLS.map(({ label, query }) => (
            <button key={label} onClick={() => send(query)} style={{ background: C.limestone, border: "1.5px solid rgba(27,26,23,0.08)", borderRadius: 10, padding: "10px 13px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 500, color: C.nile, cursor: "pointer", textAlign: "left", transition: "all 0.15s", lineHeight: 1.4 }}>{label}</button>
          ))}
          <div style={{ marginTop: 16, borderTop: "1px solid rgba(27,26,23,0.07)", paddingTop: 16 }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: "#A89880", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, paddingLeft: 4 }}>Context Active</div>
            {[
              { label: "Location", val: "Giza Plateau", ok: true },
              { label: "Safety",   val: "Secure",       ok: true },
              { label: "Weather",  val: "38°C · UV 9",  ok: false },
              { label: "Scams",    val: "2 active",     ok: false },
            ].map(({ label, val, ok }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 4px", borderBottom: "1px solid rgba(27,26,23,0.05)" }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880" }}>{label}</span>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: ok ? C.safeGreen : C.alertAmber }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Messages */}
          <div onClick={handleFollow} style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column" }}>
            {msgs.map(m => <RafiqBubble key={m.id} msg={m}/>)}
            {loading && (
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: `linear-gradient(135deg,${C.nile},${C.nileMid})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Glyph size={18} light/></div>
                <div style={{ background: "linear-gradient(145deg,#FAF7F0,#F5EDD8)", border: `1px solid ${C.sand}22`, borderRadius: "4px 16px 16px 16px", padding: "16px 20px", display: "flex", gap: 6, alignItems: "center" }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.copper, opacity: 0.5, animation: `bounce 1.2s ${i * 0.2}s infinite` }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div style={{ padding: "16px 28px 24px", borderTop: "1px solid rgba(27,26,23,0.08)", background: "rgba(246,241,231,0.95)", backdropFilter: "blur(12px)", flexShrink: 0 }}>
            <div style={{ background: C.limestone, border: `2px solid ${input ? C.faience : "rgba(27,26,23,0.1)"}`, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "flex-end", gap: 10, boxShadow: input ? `0 0 0 4px ${C.faience}12` : "none", transition: "all 0.2s" }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Ask about safety, history, food, transport, culture…"
                rows={1}
                style={{ background: "transparent", border: "none", outline: "none", flex: 1, fontFamily: "'Inter',sans-serif", fontSize: "14px", color: C.basalt, resize: "none", lineHeight: 1.6, maxHeight: 120, overflowY: "auto" }}
              />
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "#C4B89A", display: "flex", padding: 4 }}><Mic size={18} strokeWidth={2}/></button>
                <button onClick={() => send(input)} disabled={!input.trim() || loading} style={{ background: input.trim() && !loading ? C.nile : C.limestoneDark, border: "none", borderRadius: 9, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "default", transition: "background 0.2s", flexShrink: 0 }}>
                  <Send size={15} color={input.trim() && !loading ? C.limestone : "#A89880"} strokeWidth={2.5}/>
                </button>
              </div>
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880", marginTop: 8, textAlign: "center" }}>
              Rafiq synthesises verified sources · Always cross-check critical decisions · <span style={{ color: C.faience, fontWeight: 600 }}>15 live sources active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: Site Detail ────────────────────────────────────────────────────────
function PageSiteDetail({ siteId, onBack, goSite }: { siteId: number; onBack: () => void; goSite: (id: number) => void }) {
  const site = ALL_SITES.find(s => s.id === siteId);
  const [imgIdx,  setImgIdx]  = useState(0);
  const [rafiq,   setRafiq]   = useState(false);
  const [saved,   setSaved]   = useState(false);

  if (!site) return null;

  const nearby = (site.nearby ?? []).map(id => ALL_SITES.find(s => s.id === id)).filter(Boolean) as typeof ALL_SITES;
  const storyParagraphs = site.story.split("\n\n");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Sticky top nav */}
      <div style={{ background: "rgba(246,241,231,0.95)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(27,26,23,0.08)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, flexShrink: 0, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.nile, cursor: "pointer", padding: 0 }}>
          <ChevronLeft size={17} strokeWidth={2.5}/> Back
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setSaved(v => !v)} style={{ background: saved ? `${C.terracotta}12` : "#FAF7F0", border: `1.5px solid ${saved ? C.terracotta : "rgba(27,26,23,0.1)"}`, borderRadius: 8, padding: "7px 14px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: saved ? C.terracotta : "#6B6354", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Star size={13} fill={saved ? C.terracotta : "none"} strokeWidth={2}/> {saved ? "Saved" : "Save site"}
          </button>
          <button onClick={() => setRafiq(true)} style={{ background: C.nile, border: "none", borderRadius: 8, padding: "7px 14px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.limestone, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Glyph size={13} light/> Ask Rafiq
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Hero gallery */}
        <div style={{ position: "relative", height: 440, background: C.basalt, flexShrink: 0 }}>
          <img src={site.imgs[imgIdx]} alt={site.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.3s" }}/>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(27,26,23,0.1) 0%,transparent 40%,rgba(15,61,62,0.65) 100%)" }}/>

          {/* Gallery thumbnails */}
          <div style={{ position: "absolute", bottom: 100, right: 24, display: "flex", gap: 6 }}>
            {site.imgs.map((img, i) => (
              <button key={i} onClick={() => setImgIdx(i)} style={{ width: 48, height: 34, borderRadius: 6, overflow: "hidden", border: `2px solid ${imgIdx === i ? C.limestone : "transparent"}`, cursor: "pointer", padding: 0 }}>
                <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
              </button>
            ))}
          </div>

          {/* Title overlay */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "28px 40px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, background: site.tag === "Hidden gem" ? C.copper : C.nile, color: C.limestone, padding: "3px 10px", borderRadius: 99 }}>{site.tag}</span>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, background: `${C.limestone}15`, color: C.limestone, padding: "3px 10px", borderRadius: 99 }}>{site.cat}</span>
                  {site.scam && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, background: `${C.alertAmber}90`, color: C.limestone, padding: "3px 10px", borderRadius: 99, display: "inline-flex", alignItems: "center", gap: 4 }}><AlertTriangle size={10} strokeWidth={2.5}/> Scam alert</span>}
                </div>
                <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 400, color: C.limestone, lineHeight: 1.1, letterSpacing: "-0.025em", marginBottom: 4 }}>{site.name}</h1>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "18px", color: `${C.limestone}70` }}>{site.nameAr}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", marginBottom: 4 }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} color={C.sand} fill={C.sand} strokeWidth={0}/>)}
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "24px", fontWeight: 500, color: C.sand }}>{site.rating}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.limestone}55` }}>{site.reviews.toLocaleString()} reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 40px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 36 }}>

          {/* Left: story + info */}
          <div>
            {/* Key facts strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 32 }}>
              {[
                { icon: <Clock size={16} strokeWidth={2}/>, label: "Hours", val: site.hours.split(" (")[0] },
                { icon: <CreditCard size={16} strokeWidth={2}/>, label: "Admission", val: site.admission.split(" ·")[0] },
                { icon: <Navigation size={16} strokeWidth={2}/>, label: "Distance", val: site.dist },
                { icon: <Star size={16} strokeWidth={2}/>, label: "Best time", val: site.bestTime.split(" (")[0] },
              ].map(({ icon, label, val }) => (
                <div key={label} style={{ background: C.limestone, borderRadius: 13, padding: "14px 14px", border: "1px solid rgba(27,26,23,0.07)" }}>
                  <div style={{ color: C.copper, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "#A89880", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>{label}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, color: C.nile, lineHeight: 1.3 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Rihla Story */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg,${C.copper}40,transparent)` }}/>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: C.copper, letterSpacing: "0.14em", textTransform: "uppercase" }}>◈ Rihla Story</span>
                <div style={{ height: 1, flex: 1, background: `linear-gradient(270deg,${C.copper}40,transparent)` }}/>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {storyParagraphs.map((p, i) => (
                  <p key={i} style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "16px", color: C.nile, lineHeight: 1.8, margin: 0 }}>{p}</p>
                ))}
              </div>
            </div>

            {/* Rafiq's insight */}
            <div style={{ background: "linear-gradient(145deg,#FAF3E4,#F0E8D0)", borderRadius: 16, padding: "22px 24px", border: `1px solid ${C.sand}28`, marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${C.nile},${C.nileMid})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Glyph size={18} light/></div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, color: C.copper, letterSpacing: "0.1em", textTransform: "uppercase" }}>◈ Rafiq's Insight · What most tourists miss</div>
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "15px", color: C.nile, lineHeight: 1.75, margin: 0 }}>{site.rafiqInsight}</p>
            </div>

            {/* Scam warning */}
            {site.scamDetail && (
              <div style={{ background: `${C.alertAmber}08`, border: `1.5px solid ${C.alertAmber}35`, borderRadius: 14, padding: "18px 20px", marginBottom: 28 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${C.alertAmber}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><AlertTriangle size={17} color={C.alertAmber} strokeWidth={2.5}/></div>
                  <div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, color: C.alertAmber, letterSpacing: "0.06em", textTransform: "uppercase" }}>Active Scam Alert · This Site</div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A", marginTop: 2 }}>14 community reports in the last 2 hours</div></div>
                </div>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#5C5346", lineHeight: 1.7, margin: 0 }}>{site.scamDetail}</p>
              </div>
            )}

            {/* Visitor tips */}
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", fontWeight: 500, color: C.nile, marginBottom: 14 }}>Visitor Tips</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {site.tips.map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "11px 14px", background: C.limestone, borderRadius: 10, border: "1px solid rgba(27,26,23,0.06)" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: `${C.faience}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <CheckCircle size={12} color={C.faience} strokeWidth={2.5}/>
                    </div>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#5C5346", lineHeight: 1.6 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby sites */}
            {nearby.length > 0 && (
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", fontWeight: 500, color: C.nile, marginBottom: 14 }}>Nearby Sites</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                  {nearby.map(n => <SiteCard key={n.id} s={n} goSite={goSite}/>)}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 80, alignSelf: "start" }}>

            {/* Visit info card */}
            <div style={{ background: C.limestone, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(27,26,23,0.07)" }}>
              <div style={{ background: `linear-gradient(135deg,${C.nile},${C.nileMid})`, padding: "16px 18px" }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: `${C.limestone}50`, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Plan your visit</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "16px", fontWeight: 500, color: C.limestone }}>{site.name}</div>
              </div>
              <div style={{ padding: "16px 18px" }}>
                {[
                  { label: "Opening hours",   val: site.hours },
                  { label: "Admission",        val: site.admission },
                  { label: "Suggested stay",   val: site.duration },
                  { label: "Accessibility",    val: site.accessibility },
                  { label: "Built",            val: site.built },
                  { label: "Dynasty / Period", val: site.dynasty },
                  { label: "Governorate",      val: site.gov },
                ].map(({ label, val }) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", padding: "9px 0", borderBottom: "1px solid rgba(27,26,23,0.05)" }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: "#A89880", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>{label}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.nile, lineHeight: 1.4 }}>{val}</span>
                  </div>
                ))}
                <button style={{ marginTop: 14, width: "100%", background: C.nile, border: "none", borderRadius: 10, padding: "12px 16px", fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.limestone, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: `0 4px 16px ${C.nile}35` }}>
                  <Navigation size={15} strokeWidth={2.5}/> Get Directions
                </button>
              </div>
            </div>

            {/* Safety status */}
            <div style={{ background: C.limestone, borderRadius: 14, padding: "16px 18px", border: "1px solid rgba(27,26,23,0.07)" }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: "#A89880", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Safety Status</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: site.scam ? C.alertAmber : C.safeGreen, boxShadow: `0 0 0 4px ${site.scam ? C.alertAmber : C.safeGreen}25` }}/>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: site.scam ? C.alertAmber : C.safeGreen }}>{site.scam ? "Caution" : "Secure"}</span>
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#8B7E6A", lineHeight: 1.55, marginBottom: 12 }}>
                {site.scam ? "Active scam reports in this area. Stay on marked paths and decline unsolicited offers." : "No active safety alerts. Normal vigilance applies."}
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880" }}>Tourist Police: <strong style={{ color: C.nile }}>126</strong></div>
            </div>

            {/* Ask Rafiq */}
            <button onClick={() => setRafiq(true)} style={{ background: `linear-gradient(135deg,${C.nile},${C.nileMid})`, border: "none", borderRadius: 14, padding: "16px 18px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <Glyph size={20} light/>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, color: `${C.limestone}80`, letterSpacing: "0.08em", textTransform: "uppercase" }}>Ask Rafiq</span>
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "13px", color: `${C.limestone}80`, lineHeight: 1.55 }}>"When's the best time to visit? What should I not miss? Is it safe right now?"</div>
            </button>
          </div>
        </div>
      </div>

      {rafiq && <RafiqDrawer onClose={() => setRafiq(false)}/>}
    </div>
  );
}

// ─── PAGE: Emergency Help ────────────────────────────────────────────────────
const EMERGENCY_NUMBERS = [
  { label: "Tourist Police",   num: "126",  sub: "24/7 · English spoken",       color: C.nile,       icon: <Shield size={20} strokeWidth={2}/> },
  { label: "Ambulance",        num: "123",  sub: "Medical emergency",            color: C.signalRed,  icon: <Phone  size={20} strokeWidth={2}/> },
  { label: "Police",           num: "122",  sub: "National emergency line",      color: C.copper,     icon: <Shield size={20} strokeWidth={2}/> },
  { label: "Fire Brigade",     num: "180",  sub: "Fire & rescue",                color: C.terracotta, icon: <AlertTriangle size={20} strokeWidth={2}/> },
  { label: "Rihla Support",    num: "Chat", sub: "AI + human, always on",        color: C.faience,    icon: <Glyph size={20}/> },
];

const FIRST_AID = [
  {
    id: "heat",
    title: "Heat Exhaustion",
    icon: <Thermometer size={18} strokeWidth={2}/>,
    color: C.alertAmber,
    steps: [
      "Move to shade or an air-conditioned space immediately",
      "Remove excess clothing and loosen tight garments",
      "Apply cool (not cold) water to skin — neck, wrists, armpits",
      "Drink water slowly — small sips every few minutes",
      "Do NOT give aspirin or ibuprofen",
      "If symptoms worsen or consciousness changes: call 123",
    ],
  },
  {
    id: "scam",
    title: "Confrontational Scam",
    icon: <AlertTriangle size={18} strokeWidth={2}/>,
    color: C.alertAmber,
    steps: [
      "Stay calm — do not raise your voice or make sudden gestures",
      "Say 'la shukran' (no thank you) clearly and walk away",
      "Move toward other tourists or an official booth",
      "Do NOT hand over any money or documents",
      "If followed or threatened: call Tourist Police (126)",
      "Take a photo if safe — useful for reporting",
    ],
  },
  {
    id: "lost",
    title: "Lost or Disoriented",
    icon: <MapPin size={18} strokeWidth={2}/>,
    color: C.faience,
    steps: [
      "Stop moving — find a fixed landmark or building entrance",
      "Show your phone to a shopkeeper and ask for the nearest landmark",
      "Open Google Maps — your location works offline if downloaded",
      "Find a tourist police officer (white uniform, blue beret)",
      "Your hotel name in Arabic: show it to any taxi driver",
      "Call Rihla Support — we can locate you via GPS and guide you",
    ],
  },
  {
    id: "medical",
    title: "Medical Emergency",
    icon: <Phone size={18} strokeWidth={2}/>,
    color: C.signalRed,
    steps: [
      "Call 123 (ambulance) — state your location clearly",
      "Do not move the person if spinal injury is suspected",
      "For bleeding: apply firm, direct pressure with clean cloth",
      "For unconscious but breathing: recovery position (on side)",
      "Keep bystanders back — maintain a clear 2-metre space",
      "Send someone to meet the ambulance at the nearest road",
    ],
  },
];

const ARABIC_PHRASES = [
  { arabic: "مساعدة", romanised: "mosa'ada",    meaning: "Help!" },
  { arabic: "الشرطة", romanised: "el-shurta",   meaning: "Police" },
  { arabic: "مستشفى", romanised: "mustashfa",   meaning: "Hospital" },
  { arabic: "لا شكرا", romanised: "la shukran", meaning: "No thank you" },
  { arabic: "أين أنا؟", romanised: "ayna ana?",  meaning: "Where am I?" },
];

function PageEmergency({ onBack }: { onBack: () => void }) {
  const [called,   setCalled]   = useState<string | null>(null);
  const [scenario, setScenario] = useState<string | null>(null);
  const [locShared, setLocShared] = useState(false);
  const [step,     setStep]     = useState(0);

  const activeScenario = FIRST_AID.find(f => f.id === scenario);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0D0B09", minHeight: "100%" }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,#1A0808,${C.signalRed}25,#0D0B09)`, borderBottom: `1px solid ${C.signalRed}25`, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: `${C.limestone}55`, cursor: "pointer" }}>
            <ChevronLeft size={16} strokeWidth={2}/> Back to Safety
          </button>
          <div style={{ width: 1, height: 20, background: `${C.limestone}15` }}/>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.signalRed, boxShadow: `0 0 0 4px ${C.signalRed}30` }}/>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, color: C.signalRed, letterSpacing: "0.1em" }}>EMERGENCY MODE</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: locShared ? `${C.safeGreen}15` : `${C.limestone}08`, border: `1px solid ${locShared ? C.safeGreen : C.limestone}25`, borderRadius: 8, padding: "7px 14px", display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }} onClick={() => setLocShared(true)}>
            <MapPin size={13} color={locShared ? C.safeGreen : `${C.limestone}55`} strokeWidth={2}/>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: locShared ? C.safeGreen : `${C.limestone}55` }}>{locShared ? "Location shared" : "Share location"}</span>
          </div>
          <div style={{ background: `${C.limestone}08`, border: `1px solid ${C.limestone}15`, borderRadius: 8, padding: "7px 14px" }}>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.limestone}55` }}>Giza Plateau, Cairo · 30°N 31°E</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "28px 32px", display: "grid", gridTemplateColumns: "1fr 1fr 340px", gap: 20, maxWidth: 1200, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>

        {/* Column 1: SOS + contacts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* SOS */}
          <div style={{ background: `linear-gradient(160deg,#1A0808,#2A0C0C)`, border: `1.5px solid ${C.signalRed}35`, borderRadius: 20, padding: "28px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: `${C.signalRed}70`, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 20 }}>Emergency SOS</div>
            <button
              onClick={() => setCalled("Tourist Police · 126")}
              style={{ width: 120, height: 120, borderRadius: "50%", background: called ? `${C.safeGreen}20` : `linear-gradient(135deg,${C.signalRed},#8B1E18)`, border: `4px solid ${called ? C.safeGreen : C.signalRed}60`, boxShadow: called ? `0 0 0 12px ${C.safeGreen}15` : `0 0 0 12px ${C.signalRed}20, 0 0 40px ${C.signalRed}30`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", margin: "0 auto 20px", transition: "all 0.3s" }}
            >
              <Phone size={32} color={called ? C.safeGreen : "#fff"} strokeWidth={2}/>
            </button>
            {called ? (
              <div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.safeGreen, marginBottom: 4 }}>Calling {called}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.limestone}40` }}>Your location has been shared automatically</div>
              </div>
            ) : (
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "16px", fontWeight: 500, color: C.limestone, marginBottom: 4 }}>Press to call Tourist Police</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.limestone}40` }}>Shares your GPS location automatically</div>
              </div>
            )}
          </div>

          {/* Emergency contacts */}
          <div style={{ background: "#141210", border: `1px solid ${C.limestone}10`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px 10px", borderBottom: `1px solid ${C.limestone}08` }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: `${C.limestone}40`, letterSpacing: "0.14em", textTransform: "uppercase" }}>Emergency Contacts · Egypt</div>
            </div>
            {EMERGENCY_NUMBERS.map((e, i) => (
              <button key={e.label} onClick={() => setCalled(`${e.label} · ${e.num}`)} style={{ display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 12, padding: "13px 18px", alignItems: "center", background: called === `${e.label} · ${e.num}` ? `${e.color}15` : "transparent", border: "none", borderBottom: i < EMERGENCY_NUMBERS.length - 1 ? `1px solid ${C.limestone}06` : "none", cursor: "pointer", width: "100%", textAlign: "left", transition: "background 0.15s" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${e.color}15`, border: `1px solid ${e.color}25`, display: "flex", alignItems: "center", justifyContent: "center", color: e.color, flexShrink: 0 }}>{e.icon}</div>
                <div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.limestone, marginBottom: 2 }}>{e.label}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: `${C.limestone}40` }}>{e.sub}</div>
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", fontWeight: 600, color: e.color }}>{e.num}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Column 2: Scenario guide */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: `${C.limestone}40`, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 2 }}>What's happening?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {FIRST_AID.map(f => (
              <button key={f.id} onClick={() => { setScenario(f.id); setStep(0); }} style={{ background: scenario === f.id ? `${f.color}18` : "#141210", border: `1.5px solid ${scenario === f.id ? f.color : `${C.limestone}10`}`, borderRadius: 13, padding: "16px 14px", cursor: "pointer", textAlign: "left", transition: "all 0.18s" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${f.color}15`, border: `1px solid ${f.color}22`, display: "flex", alignItems: "center", justifyContent: "center", color: f.color, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: scenario === f.id ? f.color : C.limestone }}>{f.title}</div>
              </button>
            ))}
          </div>

          {activeScenario ? (
            <div style={{ background: "#141210", border: `1.5px solid ${activeScenario.color}30`, borderRadius: 16, padding: "20px", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, color: activeScenario.color, letterSpacing: "0.08em", textTransform: "uppercase" }}>{activeScenario.title} · Step-by-step</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: `${C.limestone}35` }}>Step {step + 1} of {activeScenario.steps.length}</div>
              </div>

              {/* Progress bar */}
              <div style={{ height: 3, background: `${C.limestone}10`, borderRadius: 99, marginBottom: 16, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${((step + 1) / activeScenario.steps.length) * 100}%`, background: activeScenario.color, borderRadius: 99, transition: "width 0.3s ease" }}/>
              </div>

              {/* Current step */}
              <div style={{ background: `${activeScenario.color}10`, border: `1px solid ${activeScenario.color}20`, borderRadius: 12, padding: "18px 16px", marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: activeScenario.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 800, color: "#fff" }}>{step + 1}</span>
                  </div>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "15px", color: C.limestone, lineHeight: 1.7, margin: 0, flex: 1 }}>{activeScenario.steps[step]}</p>
                </div>
              </div>

              {/* All steps preview */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                {activeScenario.steps.map((s, i) => (
                  <div key={i} onClick={() => setStep(i)} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 10px", borderRadius: 9, background: i === step ? `${activeScenario.color}08` : "transparent", cursor: "pointer", opacity: i < step ? 0.45 : 1, transition: "all 0.15s" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: i < step ? `${activeScenario.color}30` : i === step ? activeScenario.color : `${C.limestone}10`, border: `1.5px solid ${i <= step ? activeScenario.color : `${C.limestone}15`}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      {i < step ? <CheckCircle size={10} color={activeScenario.color} strokeWidth={2.5}/> : <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "9px", fontWeight: 700, color: i === step ? "#fff" : `${C.limestone}30` }}>{i + 1}</span>}
                    </div>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: i === step ? C.limestone : `${C.limestone}40`, lineHeight: 1.5 }}>{s}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ flex: 1, background: `${C.limestone}08`, border: `1px solid ${C.limestone}15`, borderRadius: 9, padding: "10px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: step === 0 ? `${C.limestone}25` : `${C.limestone}70`, cursor: step === 0 ? "default" : "pointer" }}>← Previous</button>
                {step < activeScenario.steps.length - 1
                  ? <button onClick={() => setStep(s => s + 1)} style={{ flex: 2, background: activeScenario.color, border: "none", borderRadius: 9, padding: "10px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: "#fff", cursor: "pointer" }}>Next step →</button>
                  : <button onClick={() => { setStep(0); setScenario(null); }} style={{ flex: 2, background: C.safeGreen, border: "none", borderRadius: 9, padding: "10px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}><CheckCircle size={14} strokeWidth={2.5}/> Done</button>
                }
              </div>
            </div>
          ) : (
            <div style={{ background: "#141210", border: `1px solid ${C.limestone}10`, borderRadius: 16, padding: "24px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 10 }}>
              <div style={{ fontSize: "32px" }}>👆</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "16px", color: `${C.limestone}60` }}>Select a scenario above for step-by-step guidance</div>
            </div>
          )}
        </div>

        {/* Column 3: Arabic phrases + Rafiq */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Calm reminder */}
          <div style={{ background: `linear-gradient(145deg,#0F2A1A,#0A1E12)`, border: `1px solid ${C.safeGreen}25`, borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "14px", color: `${C.limestone}80`, lineHeight: 1.7, marginBottom: 10 }}>"Stay calm. Egypt has well-trained Tourist Police available at every major site. You are not alone."</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.safeGreen }}/>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: `${C.safeGreen}80` }}>Rafiq is monitoring your location</span>
            </div>
          </div>

          {/* Essential Arabic */}
          <div style={{ background: "#141210", border: `1px solid ${C.limestone}10`, borderRadius: 16, padding: "18px", flex: 0 }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: `${C.limestone}40`, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>Essential Arabic · Say it now</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {ARABIC_PHRASES.map((p, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "10px 0", borderBottom: i < ARABIC_PHRASES.length - 1 ? `1px solid ${C.limestone}07` : "none", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", color: C.sand, direction: "rtl", marginBottom: 2 }}>{p.arabic}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: `${C.limestone}35`, fontStyle: "italic" }}>{p.romanised}</div>
                  </div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: `${C.limestone}70` }}>{p.meaning}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Location card */}
          <div style={{ background: "#141210", border: `1px solid ${C.limestone}10`, borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: `${C.limestone}40`, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>Your Location</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.limestone, marginBottom: 4 }}>Giza Plateau, Cairo</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.limestone}40`, marginBottom: 12 }}>30.0280° N, 31.1325° E · Accuracy: ±8m</div>
            <div style={{ background: `${C.limestone}06`, borderRadius: 10, height: 80, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, opacity: 0.08 }}><Geom size={200} color={C.limestone} op={1}/></div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <MapPin size={20} color={C.signalRed} strokeWidth={2.5}/>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: `${C.limestone}40` }}>Map unavailable offline</span>
              </div>
            </div>
            <button
              onClick={() => setLocShared(true)}
              style={{ width: "100%", background: locShared ? `${C.safeGreen}15` : C.signalRed, border: `1.5px solid ${locShared ? C.safeGreen : C.signalRed}`, borderRadius: 9, padding: "10px 16px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: locShared ? C.safeGreen : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "all 0.2s" }}
            >
              <MapPin size={14} strokeWidth={2.5}/>{locShared ? "Location shared ✓" : "Share my location"}
            </button>
          </div>

          {/* Ask Rafiq */}
          <div style={{ background: `linear-gradient(135deg,${C.nile},${C.nileMid})`, borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <Glyph size={20} light/>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, color: `${C.limestone}70`, letterSpacing: "0.08em", textTransform: "uppercase" }}>Rafiq Emergency</span>
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "13px", color: `${C.limestone}70`, lineHeight: 1.6, marginBottom: 12 }}>Describe what's happening. Rafiq will guide you and can alert the nearest Tourist Police station.</div>
            <div style={{ background: `${C.limestone}10`, border: `1px solid ${C.limestone}18`, borderRadius: 9, padding: "10px 14px", display: "flex", gap: 10 }}>
              <input placeholder="Describe the emergency…" style={{ background: "transparent", border: "none", outline: "none", flex: 1, fontFamily: "'Inter',sans-serif", fontSize: "13px", color: C.limestone }}/>
              <button style={{ background: C.faience, border: "none", borderRadius: 7, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                <Send size={13} color="#fff" strokeWidth={2.5}/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<string>("landing");
  const [page,   setPage]   = useState<string>("home");
  const [siteId, setSiteId] = useState<number | null>(null);
  const go     = (s: string) => { setSiteId(null); setScreen(s); };
  const goSite = (id: number) => setSiteId(id);

  if (screen === "landing") return <WebLanding  go={go}/>;
  if (screen === "signup")  return <WebSignUp   go={go}/>;
  if (screen === "login")   return <WebLogin    go={go}/>;
  if (screen === "arrival") return <WebArrival  go={go}/>;

  const renderPage = () => {
    if (siteId !== null) return <PageSiteDetail siteId={siteId} onBack={() => setSiteId(null)} goSite={goSite}/>;
    if (page === "emergency") return <PageEmergency onBack={() => setPage("safety")}/>;
    switch (page) {
      case "home":    return <PageHome    goSite={goSite}/>;
      case "explore": return <PageExplore goSite={goSite}/>;
      case "rafiq":   return <PageRafiq/>;
      case "safety":  return <PageSafety goEmergency={() => setPage("emergency")}/>;
      case "history": return <PageHistory/>;
      case "wallet":  return <PageWallet/>;
      case "profile": return <PageProfile/>;
      case "settings":return <PageSettings go={go}/>;
      default:        return <PageHome goSite={goSite}/>;
    }
  };

  return (
    <AppShell activePage={page} setPage={p => { setSiteId(null); setPage(p); }} go={go}>
      {renderPage()}
    </AppShell>
  );
}
