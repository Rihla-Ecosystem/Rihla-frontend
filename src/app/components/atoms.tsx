"use client";

import React, { useState } from "react";
import { C } from "@/lib/constants/theme";

import Image from "next/image";

// Primary Rihla icon logo
export function Glyph({ size = 28, light = false }: { size?: number; light?: boolean }) {
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

// Full Rihla logo mark
export function GlyphFull({ size = 80, light = false }: { size?: number; light?: boolean }) {
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
export function Geom({ size = 280, color = C.limestone, op = 0.06 }: { size?: number; color?: string; op?: number }) {
  const cx = size / 2;
  const ay = size * 0.06;
  const bw = size * 0.90;
  const by = size * 0.96;
  const steps = 9;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" style={{ display: "block", pointerEvents: "none" }}>
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

export function WebField({ label, placeholder, type = "text", value, onChange }: { label: string; placeholder: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
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

export const GoogleSVG = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);
