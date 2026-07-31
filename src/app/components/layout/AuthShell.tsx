"use client";

import React from "react";
import { Shield, Globe } from "lucide-react";
import { C } from "@/lib/constants/theme";
import { Glyph, GlyphFull, Geom } from "@/app/components/atoms";

export function AuthShell({ children }: { children: React.ReactNode }) {
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
