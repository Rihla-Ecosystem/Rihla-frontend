"use client";

import { useState } from "react";
import { CheckCircle, Star, MapPin, Clock, Shield, Globe } from "lucide-react";
import { C } from "@/lib/constants/theme";
import { Geom, Glyph } from "@/app/components/atoms";
import { TopBar } from "@/app/components/layout/TopBar";

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

export default function PageProfile() {
  const [badgeCat, setBadgeCat] = useState("All");
  const [tab,      setTab]      = useState<"badges" | "stats" | "impact">("badges");

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
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "38px", fontWeight: 500, color: C.limestone }}>S</span>
              </div>
              <div style={{ position: "absolute", bottom: 2, right: 2, width: 20, height: 20, borderRadius: "50%", background: C.safeGreen, border: `2px solid #0F3D3E`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle size={11} color="#fff" strokeWidth={2.5}/>
              </div>
            </div>
            {/* Name & level */}
            <div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: `${C.limestone}45`, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Verified traveler</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(22px,3vw,36px)", fontWeight: 400, color: C.limestone, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 6 }}>
                Sara <span style={{ fontStyle: "italic", fontWeight: 300 }}>Al-Rashid</span>
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${currentLevel.color}20`, border: `1px solid ${currentLevel.color}40`, borderRadius: 99, padding: "4px 12px" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: currentLevel.color }}/>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, color: currentLevel.color }}>Level {currentLevel.level} · {currentLevel.title}</span>
                </div>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.limestone}45` }}>🇩🇪 German · Cultural explorer</span>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.limestone}35` }}>Member since Jul 2026</span>
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
              { label: "Full name",     val: "Sara Al-Rashid" },
              { label: "Nationality",   val: "🇩🇪 German" },
              { label: "Travel style",  val: "Cultural" },
              { label: "Home city",     val: "Berlin" },
              { label: "Journeys",      val: "1 complete · 1 active" },
              { label: "Member since",  val: "July 2026" },
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
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, background: `${C.sand}20`, color: C.sand, padding: "3px 9px", borderRadius: 99 }}>+\{next.xp} XP on unlock</span>
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
