'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/app/components/layout/TopBar';
import { RafiqDrawer } from '@/app/components/rafiqDrawer';
import { Geom, Glyph } from '@/app/components/atoms';
import { C } from '@/lib/constants/theme';
import { 
  AlertTriangle, 
  MapPin, 
  ChevronRight, 
  Thermometer, 
  Sun, 
  Wind, 
  Globe, 
  Phone, 
  CheckCircle, 
  Shield 
} from 'lucide-react';

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

export default function PageSafety() {
  const router = useRouter();
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [rafiq, setRafiq] = useState(false);
  const selected = SCAM_ALERTS.find(a => a.id === activeAlert) || null;

  const goEmergency = () => {
    router.push('/app/safety/emergency');
  };

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
