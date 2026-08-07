"use client";

import React from "react";
import { Shield, Globe } from "lucide-react";
import { C } from "@/lib/constants/theme";
import { Glyph, GlyphFull, PyramidSkyline } from "@/app/components/atoms";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 64px", background: C.limestone, overflow: "auto" }}>{children}</div>
      <div style={{ background: `linear-gradient(-60deg, ${C.basalt}, ${C.nile}, #0B2D2E, ${C.basalt})`, backgroundSize: "300% 300%", animation: "rihlaGrad 14s ease infinite", display: "flex", flexDirection: "column", justifyContent: "center", padding: "64px", position: "relative", overflow: "hidden" }}>
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
        `}</style>

        {/* Rotating solar disc */}
        <div style={{ position: "absolute", right: "-8%", top: -130, width: 460, height: 460, borderRadius: "50%", background: "repeating-conic-gradient(from 0deg, rgba(232,168,32,0) 0deg 9deg, rgba(232,168,32,0.09) 9deg 18deg)", animation: "rihlaSpin 60s linear infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "0%", top: -50, width: 230, height: 230, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,168,32,0.30) 0%, rgba(232,168,32,0.08) 55%, transparent 75%)", pointerEvents: "none" }} />

        {/* Pyramid skyline */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: -8, animation: "rihlaFloat 7s ease-in-out 0.4s infinite", pointerEvents: "none" }}>
          <PyramidSkyline size={760} op={0.5} color={C.sand} />
        </div>

        {/* Sand particles */}
        {[
          { left: '8%',  top: '34%', delay: '0s',   dur: '11s', size: 3 },
          { left: '22%', top: '22%', delay: '2.4s', dur: '13s', size: 2 },
          { left: '40%', top: '50%', delay: '4.2s', dur: '10s', size: 2.5 },
          { left: '56%', top: '30%', delay: '1.3s', dur: '12s', size: 2 },
          { left: '72%', top: '54%', delay: '5.6s', dur: '9s',  size: 3 },
          { left: '88%', top: '26%', delay: '3.1s', dur: '12s', size: 2 },
        ].map((p, i) => (
          <div key={i} style={{ position: "absolute", left: p.left, top: p.top, width: p.size, height: p.size, borderRadius: "50%", background: C.solarBright, opacity: 0, animation: `rihlaParticle ${p.dur}s linear ${p.delay} infinite`, pointerEvents: "none" }} />
        ))}

        {/* Horizon glow */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2, background: "linear-gradient(90deg, transparent, rgba(232,168,32,0.7), rgba(245,192,64,0.9), rgba(232,168,32,0.7), transparent)", backgroundSize: "200% 100%", animation: "rihlaGrad 6s ease infinite", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 2, animation: "rihlaFadeUp 0.6s ease-out both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 48 }}><GlyphFull size={72} light/><div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "26px", fontWeight: 500, color: C.limestone, lineHeight: 1 }}>رحلة Rihla</div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: `${C.sand}90`, marginTop: 6 }}>AI Travel Companion</div></div></div>
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
