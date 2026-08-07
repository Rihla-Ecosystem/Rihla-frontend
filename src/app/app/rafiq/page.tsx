'use client';

import React, { useState, useRef } from 'react';
import { useLocation, useLocationLabel } from '@/providers/LocationProvider';
import { C } from '@/lib/constants/theme';
import { Glyph, PyramidSkyline } from '@/app/components/atoms';
import { MapPin, RefreshCw, Send, Mic, Image as ImageIcon, Square, AlertTriangle } from 'lucide-react';
import { chatService, PERSONAS, type Persona } from '@/services/chatService';
import { useAppSettings } from '@/lib/settingsStore';
import { rafiqOfflineAnswer } from '@/app/data/rafiq-offline';

type RafiqMsg = {
  id: string;
  role: "rafiq" | "user";
  text: string;
  sources?: string[];
  follow?: string[];
  alert?: { level: "info" | "warn" | "danger"; text: string };
  ts: string;
};

const WELCOME_MSG: RafiqMsg = {
  id: "m0",
  role: "rafiq",
  text: "مرحباً! I'm Rafiq — your Egyptian journey companion. I have live safety data, verified historical records, and local knowledge. What would you like to know?",
  ts: "Now",
};

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
  const appSettings = useAppSettings();
  const { lat, lon } = useLocation();
  const locationLabel = useLocationLabel();
  const [msgs,    setMsgs]    = useState<RafiqMsg[]>([WELCOME_MSG]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [persona, setPersona] = useState<Persona>(() => {
    const p = appSettings.rafiqPersona;
    if (p === "guide") return "tour_guide";
    if (p === "local") return "local_expert";
    return "auto";
  });
  const [listening, setListening] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: RafiqMsg = { id: `u_${Date.now()}`, role: "user", text: text.trim(), ts: "Just now" };
    setMsgs(m => [...m, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);
    const rafiqMsgId = `r_${Date.now()}`;
    setMsgs(m => [...m, { id: rafiqMsgId, role: "rafiq", text: "", ts: "Just now" }]);
    try {
      const response = await chatService.streamMessage(
        text.trim(),
        persona,
        (token) => {
          setMsgs(m => m.map(msg => msg.id === rafiqMsgId ? { ...msg, text: msg.text + token } : msg));
        },
        { lat: lat ?? undefined, lon: lon ?? undefined, conversationId }
      );
      if (response.conversationId) {
        setConversationId(response.conversationId);
      }
      setMsgs(m => m.map(msg => msg.id === rafiqMsgId ? { ...msg, text: response.text } : msg));
    } catch (err: any) {
      const offline = rafiqOfflineAnswer(text.trim());
      const errMsg: RafiqMsg = {
        id: `r_${Date.now()}`,
        role: "rafiq",
        text: offline.text,
        sources: offline.sources.length ? offline.sources : undefined,
        follow: offline.follow.length ? offline.follow : undefined,
        alert: { level: "warn", text: "Offline mode — serving from the Rihla guidebook" },
        ts: "Just now",
      };
      setMsgs(m => [...m.filter(msg => msg.id !== rafiqMsgId), errMsg]);
      setError(err?.message || "Failed to send message");
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  const handleVoice = async () => {
    if (listening) {
      mediaRecorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setListening(false);
        const audio = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (audio.size === 0) return;
        setLoading(true);
        setError(null);
        try {
          const result = await chatService.voice(audio, recorder.mimeType || "audio/webm", {
            lat: lat ?? undefined,
            lon: lon ?? undefined,
            conversationId,
          });
          setInput(result.text_response || "");
        } catch (err: any) {
          setError(err?.message || "Voice transcription failed. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      recorder.start();
      setListening(true);
    } catch (err: any) {
      setError("Microphone access denied.");
    }
  };

  const handleImage = async (file: File) => {
    if (!file) return;
    setIdentifying(true);
    setError(null);
    try {
      const result = await chatService.identify(file, { lat: lat ?? undefined, lon: lon ?? undefined });
      setInput(result.name);
    } catch (err: any) {
      setError(err?.message || "Image identification failed. Please try again.");
    } finally {
      setIdentifying(false);
    }
  };

  const handleFollow = (e: React.MouseEvent) => {
    const q = (e.target as HTMLElement).getAttribute("data-follow");
    if (q) send(q);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
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
          50%      { transform: translateY(-7px); }
        }
        @keyframes rihlaParticle {
          0%   { transform: translateY(0) scale(1); opacity: 0; }
          12%  { opacity: 0.9; }
          70%  { opacity: 0.5; }
          100% { transform: translateY(-110px) scale(0.3); opacity: 0; }
        }
        @keyframes rihlaFadeUp {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes rihlaPulseDot {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.3; }
        }
      `}</style>
      {/* Top bar */}
      <div style={{ background: `linear-gradient(-60deg, ${C.basalt}, ${C.nile}, #0B2D2E, ${C.basalt})`, backgroundSize: "300% 300%", animation: "rihlaGrad 14s ease infinite", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, flexShrink: 0, position: "relative", overflow: "hidden" }}>
        {/* Rotating solar disc */}
        <div style={{ position: "absolute", right: "-6%", top: -110, width: 300, height: 300, borderRadius: "50%", background: "repeating-conic-gradient(from 0deg, rgba(232,168,32,0) 0deg 9deg, rgba(232,168,32,0.10) 9deg 18deg)", animation: "rihlaSpin 60s linear infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "0%", top: -46, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,168,32,0.32) 0%, rgba(232,168,32,0.09) 55%, transparent 75%)", pointerEvents: "none" }} />

        {/* Pyramid skyline */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: -6, animation: "rihlaFloat 7s ease-in-out 0.4s infinite", pointerEvents: "none" }}>
          <PyramidSkyline size={460} op={0.55} color={C.sand} />
        </div>

        {/* Particles */}
        {[
          { left: '12%', top: '38%', delay: '0s', dur: '11s', size: 3 },
          { left: '30%', top: '30%', delay: '2.2s', dur: '13s', size: 2 },
          { left: '55%', top: '52%', delay: '4.1s', dur: '10s', size: 2.5 },
          { left: '70%', top: '26%', delay: '1.4s', dur: '12s', size: 2 },
          { left: '88%', top: '44%', delay: '3.3s', dur: '10s', size: 2.5 },
        ].map((p, i) => (
          <div key={i} style={{ position: "absolute", left: p.left, top: p.top, width: p.size, height: p.size, borderRadius: "50%", background: C.solarBright, opacity: 0, animation: `rihlaParticle ${p.dur}s linear ${p.delay} infinite`, pointerEvents: "none" }} />
        ))}

        {/* Horizon glow */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2, background: "linear-gradient(90deg, transparent, rgba(232,168,32,0.7), rgba(245,192,64,0.9), rgba(232,168,32,0.7), transparent)", backgroundSize: "200% 100%", animation: "rihlaGrad 6s ease infinite", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 2, animation: "rihlaFadeUp 0.5s ease-out both" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: `${C.limestone}15`, border: `1px solid ${C.limestone}20`, display: "flex", alignItems: "center", justifyContent: "center" }}><Glyph size={32} light/></div>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", fontWeight: 500, color: C.limestone, lineHeight: 1 }}>Rafiq</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.safeGreen, boxShadow: `0 0 0 2px ${C.safeGreen}35`, animation: "rihlaPulseDot 1.8s ease-in-out infinite" }}/>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 500, color: `${C.limestone}65` }}>Active · {locationLabel} · Core AI</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, position: "relative", zIndex: 2, animation: "rihlaFadeUp 0.5s ease-out 0.1s both" }}>
          <button onClick={() => { setMsgs([WELCOME_MSG]); setConversationId(undefined); setError(null); }} style={{ background: `${C.limestone}10`, border: `1px solid ${C.limestone}20`, borderRadius: 8, padding: "7px 12px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 500, color: `${C.limestone}70`, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, transition: "border-color 0.2s, color 0.2s", }}>
            <RefreshCw size={13} strokeWidth={2}/> New chat
          </button>
          <div style={{ background: `${C.limestone}10`, border: `1px solid ${C.limestone}20`, borderRadius: 8, padding: "7px 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <MapPin size={12} color={`${C.limestone}70`} strokeWidth={2}/>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.limestone}65` }}>{locationLabel}</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: topic pills */}
        <div style={{ width: 220, flexShrink: 0, background: "#FAF7F0", borderRight: "1px solid rgba(27,26,23,0.07)", padding: "20px 14px", display: "flex", flexDirection: "column", gap: 6, overflowY: "auto" }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: C.copper, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>Rafiq Persona</div>
          {PERSONAS.map(p => (
            <button key={p.value} onClick={() => setPersona(p.value)} title={p.blurb} style={{ background: persona === p.value ? C.nile : C.limestone, border: `1.5px solid ${persona === p.value ? C.nile : "rgba(27,26,23,0.08)"}`, borderRadius: 10, padding: "9px 13px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: persona === p.value ? C.limestone : C.nile, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>{p.label}</button>
          ))}
          <div style={{ marginTop: 6, borderTop: "1px solid rgba(27,26,23,0.07)", paddingTop: 12 }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: C.copper, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>Quick Topics</div>
            {TOPIC_PILLS.map(({ label, query }) => (
            <button key={label} onClick={() => send(query)} style={{ background: C.limestone, border: "1.5px solid rgba(27,26,23,0.08)", borderRadius: 10, padding: "10px 13px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 500, color: C.nile, cursor: "pointer", textAlign: "left", transition: "all 0.15s", lineHeight: 1.4 }}>{label}</button>
          ))}
          </div>
          <div style={{ marginTop: 16, borderTop: "1px solid rgba(27,26,23,0.07)", paddingTop: 16 }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: "#A89880", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, paddingLeft: 4 }}>Context Active</div>
            {[
              { label: "Location", val: locationLabel, ok: true },
              { label: "Safety",   val: "Live feed", ok: true },
              { label: "Weather",  val: "Live env layer", ok: true },
              { label: "Scams",    val: "Monitored", ok: true },
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
            {error && !loading && (
              <div style={{ padding: "8px 28px", fontFamily: "'Inter',sans-serif", fontSize: "12px", color: C.alertAmber, textAlign: "center", background: `${C.alertAmber}08`, borderRadius: 8, margin: "0 16px 8px" }}>
                {error}
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
                <button onClick={() => fileInputRef.current?.click()} disabled={loading || listening || identifying} style={{ background: "none", border: "none", cursor: loading ? "default" : "pointer", color: C.faience, display: "flex", padding: 4 }}><ImageIcon size={18} strokeWidth={2}/></button>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); e.target.value = ""; }} />
                <button onClick={handleVoice} disabled={loading || identifying} style={{ background: "none", border: "none", cursor: loading ? "default" : "pointer", color: listening ? C.alertAmber : C.faience, display: "flex", padding: 4 }}>
                  {listening ? <Square size={18} strokeWidth={2.5} fill={C.alertAmber}/> : <Mic size={18} strokeWidth={2}/>}
                </button>
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
