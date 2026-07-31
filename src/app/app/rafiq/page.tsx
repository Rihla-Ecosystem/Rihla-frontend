'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { C } from '@/lib/constants/theme';
import { Glyph } from '@/app/components/atoms';
import { MapPin, RefreshCw, Send, Mic, X, AlertTriangle } from 'lucide-react';

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
          <span key={`${i}-${j}`}>{line}{j < p.split("\n").length - 1 && <br/>}</span>
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

export default function RafiqPage() {
  const [msgs,    setMsgs]    = useState<RafiqMsg[]>(INITIAL_MSGS);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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
