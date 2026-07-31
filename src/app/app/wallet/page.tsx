'use client';

import React, { useState } from "react";
import { C } from "@/lib/constants/theme";
import { TopBar } from "@/app/components/layout/TopBar";
import { Geom } from "@/app/components/atoms";
import {
  Star,
  Navigation,
  Globe,
  Wallet,
  CreditCard,
  Camera,
  Shield,
  ArrowRight,
  MapPin,
} from "lucide-react";

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

export default function WalletPage() {
  const [fromCur, setFromCur] = useState("USD");
  const [amount,  setAmount]  = useState("100");
  const [dir,     setDir]     = useState<"to" | "from">("to");

  const numAmt   = parseFloat(amount) || 0;
  const egpRate  = RATES[fromCur] ?? 1;
  const converted = dir === "to"
    ? (numAmt * egpRate).toLocaleString("en-EG", { maximumFractionDigits: 0 })
    : (numAmt / egpRate).toFixed(2);

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
