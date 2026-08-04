"use client";

import React, { useState } from "react";
import { C } from "@/lib/constants/theme";

import Image from "next/image";

// Primary Rihla icon logo
export function Glyph({ size = 28, light = false }: { size?: number; light?: boolean }) {
  // Scale width by 1.25 so the height matches the old vertical SVG height (23px)
  const w = Math.round(size * 1.25);
  const h = Math.round(w * (1024 / 1536));
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Image src="/logo.png" alt="Rihla Logo" width={w} height={h} style={{ objectFit: 'contain', display: 'block', maxWidth: 'none' }} priority />
    </div>
  );
}

// Full Rihla logo mark
export function GlyphFull({ size = 80, light = false }: { size?: number; light?: boolean }) {
  // Scale width by 2.4 so the horizontal logo has a similar height/weight to the old vertical SVG (which was 1.6x height)
  const w = Math.round(size * 2.4);
  const h = Math.round(w * (1024 / 1536));
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Image src="/logo.png" alt="Rihla Full Logo" width={w} height={h} style={{ objectFit: 'contain', display: 'block', maxWidth: 'none' }} priority />
    </div>
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
