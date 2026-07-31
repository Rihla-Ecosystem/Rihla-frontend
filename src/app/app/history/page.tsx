'use client';

import React, { useState } from 'react';
import { C } from '@/lib/constants/theme';
import { Geom } from '@/app/components/atoms';
import { Clock, Zap, ChevronRight, BookOpen } from 'lucide-react';
import { TopBar } from '@/app/components/layout/TopBar';

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

export default function HistoryPage() {
  const [expanded, setExpanded] = useState<string | null>("v1");
  const [filter, setFilter]     = useState<"all" | "giza" | "cairo">("all");

  const totalXP    = VISIT_LOG.reduce((s, v) => s + v.xp, 0);
  const totalTime  = "8h 20m";
  const filtered   = VISIT_LOG.filter(v => filter === "all" || v.gov.toLowerCase() === filter);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar location="Your Journey · Egypt" />

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
