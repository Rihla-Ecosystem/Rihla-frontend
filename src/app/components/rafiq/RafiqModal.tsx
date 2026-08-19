'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { C } from '@/lib/constants/theme';
import { Glyph } from '@/app/components/atoms';
import { Send, Mic, Image as ImageIcon, Square, Volume2, VolumeX, X, Sparkles, AlertTriangle, MapPin } from 'lucide-react';
import { useLocation } from '@/providers/LocationProvider';
import { chatService, type Persona } from '@/services/chatService';
import { rafiqOfflineAnswer } from '@/app/data/rafiq-offline';
import {
  buildRafiqContextEnvelope,
  contextualLabel,
  getConversationTitle,
} from '@/lib/rafiq';
import type { RafiqContext } from '@/lib/rafiq';
import { walletApi, InsufficientBalanceError } from '@/lib/api/wallet';
import {
  itineraryApi,
  stripStructuredComment,
  type ItineraryStructured,
} from '@/lib/api/itinerary';
import { ItineraryMapCard } from '@/app/components/rafiq/ItineraryMapCard';

type RafiqMsg = {
  id: string;
  role: 'rafiq' | 'user';
  text: string;
  sources?: string[];
  follow?: string[];
  alert?: { level: 'info' | 'warn' | 'danger'; text: string };
  audioUrl?: string;
  structured?: ItineraryStructured | null;
  ts: string;
};

const WELCOME_MSG: RafiqMsg = {
  id: 'm0',
  role: 'rafiq',
  text: "مرحباً! I'm Rafiq — your Egyptian journey companion. I have live safety data, verified historical records, and local knowledge. What would you like to know?",
  ts: 'Now',
};

const TOPIC_PILLS = [
  { label: 'Safety now', query: 'Is it safe to visit the Sphinx today?' },
  { label: 'Great Pyramid', query: 'Tell me the story of the Great Pyramid' },
  { label: 'Where to eat', query: 'Nearest authentic restaurant?' },
  { label: 'Scam alerts', query: 'What scams should I watch for here?' },
  { label: 'Hidden gems', query: 'What do most tourists miss at Giza?' },
];

export interface RafiqModalHandle {
  open: (opts?: { context?: RafiqContext; initialQuery?: string }) => void;
  close: () => void;
}

function Bubble({ msg, speaking, onToggleAudio }: { msg: RafiqMsg; speaking: boolean; onToggleAudio: (m: RafiqMsg) => void }) {
  const isRafiq = msg.role === 'rafiq';
  const parts = msg.text.split(/\*\*(.+?)\*\*/g);
  const rendered = parts.map((p, i) =>
    i % 2 === 1 ? (
      <strong key={i} style={{ fontWeight: 700, color: C.nile }}>{p}</strong>
    ) : (
      p.split('\n').map((line, j) => (
        <span key={`${i}-${j}`}>
          {line}
          {j < p.split('\n').length - 1 && <br />}
        </span>
      ))
    )
  );

  if (!isRafiq) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <div style={{ maxWidth: '75%', background: C.nile, borderRadius: '14px 14px 4px 14px', padding: '10px 14px' }}>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '13.5px', color: C.limestone, lineHeight: 1.6, margin: 0 }}>{msg.text}</p>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', color: `${C.limestone}50`, marginTop: 4, textAlign: 'right' }}>{msg.ts}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-start' }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg,${C.nile},${C.nileMid})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
        <Glyph size={16} light />
      </div>
      <div style={{ flex: 1, maxWidth: '82%', minWidth: 0 }}>
        {msg.alert && (
          <div style={{ background: msg.alert.level === 'danger' ? `${C.signalRed}10` : `${C.alertAmber}10`, border: `1px solid ${msg.alert.level === 'danger' ? C.signalRed : C.alertAmber}28`, borderRadius: 9, padding: '7px 11px', marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
            <AlertTriangle size={12} color={msg.alert.level === 'danger' ? C.signalRed : C.alertAmber} strokeWidth={2.5} />
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11.5px', fontWeight: 600, color: msg.alert.level === 'danger' ? C.signalRed : C.alertAmber }}>{msg.alert.text}</span>
          </div>
        )}
        <div style={{ background: 'linear-gradient(145deg,#FAF7F0,#F5EDD8)', border: `1px solid ${C.sand}22`, borderRadius: '4px 14px 14px 14px', padding: '12px 14px' }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '9px', fontWeight: 700, color: C.copper, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>◈ Rafiq · {msg.ts}</div>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '14px', color: C.nile, lineHeight: 1.7, margin: 0, wordBreak: 'break-word' }}>{rendered}</p>
          {msg.structured?.places?.length ? (
            <ItineraryMapCard places={msg.structured.places} />
          ) : null}
          {msg.audioUrl && (
            <div style={{ marginTop: 9, paddingTop: 9, borderTop: '1px solid rgba(27,26,23,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => onToggleAudio(msg)} title={speaking ? 'Stop' : 'Play reply'} style={{ background: speaking ? `${C.alertAmber}18` : C.nile, border: 'none', borderRadius: 99, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                {speaking ? <VolumeX size={13} color={C.alertAmber} /> : <Volume2 size={13} color={C.limestone} />}
              </button>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 600, color: speaking ? C.alertAmber : C.nile }}>{speaking ? 'Playing…' : 'Play spoken reply'}</span>
            </div>
          )}
          {msg.sources && (
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(27,26,23,0.07)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 600, color: '#A89880' }}>Sources:</span>
              {msg.sources.map((s) => (
                <span key={s} style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', background: C.limestoneDark, color: '#8B7E6A', padding: '2px 8px', borderRadius: 99 }}>{s}</span>
              ))}
            </div>
          )}
        </div>
        {msg.follow && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {msg.follow.map((q) => (
              <span key={q} data-follow={q} style={{ fontFamily: "'Inter',sans-serif", fontSize: '11.5px', background: C.limestone, border: `1.5px solid ${C.nile}18`, borderRadius: 99, padding: '4px 11px', color: C.nile, cursor: 'pointer', fontWeight: 500 }}>{q}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface RafiqModalProps {
  open: boolean;
  onClose: () => void;
  context?: RafiqContext | null;
  initialQuery?: string;
  onOpenChange?: (open: boolean) => void;
}

export default function RafiqModal({ open, onClose, context: contextProp, initialQuery, onOpenChange }: RafiqModalProps) {
  const { lat, lon } = useLocation();
  const [msgs, setMsgs] = useState<RafiqMsg[]>([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [persona, setPersona] = useState<Persona>('auto');
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showTripForm, setShowTripForm] = useState(false);
  const [tripInterests, setTripInterests] = useState('');
  const [tripDays, setTripDays] = useState(3);
  const [tripBudget, setTripBudget] = useState<'budget' | 'mid' | 'luxury'>('mid');
  const [tripCities, setTripCities] = useState('');
  const [tripLoading, setTripLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contextRef = useRef<RafiqContext | null>(null);
  const firstPing = useRef(true);

  useEffect(() => {
    if (open) {
      contextRef.current = contextProp ?? null;
      const initial = initialQuery?.trim();
      setError(null);
      setShowUpgrade(false);
      setInput(initial ?? '');
      setConversationId(undefined);
      if (contextProp) {
        const envelope = buildRafiqContextEnvelope(contextProp);
        setMsgs([
          { id: 'm0', role: 'rafiq', text: envelope.welcome || WELCOME_MSG.text, follow: envelope.suggestions?.length ? envelope.suggestions : undefined, ts: 'Now' },
        ]);
        if (initial) send(initial);
      } else {
        setMsgs([WELCOME_MSG]);
      }
      void loadBalance();
    }
  }, [open, contextProp]);

  useEffect(() => {
    if (!open) return;
    firstPing.current = true;
    return () => {
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open) {
      onOpenChange?.(open);
      if (firstPing.current && open) {
        firstPing.current = false;
      }
    }
  }, [open, onOpenChange]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeakingId(null);
  };

  const playAudio = (url: string, msgId: string) => {
    stopAudio();
    const audio = new Audio(url);
    audioRef.current = audio;
    setSpeakingId(msgId);
    audio.play().catch(() => setSpeakingId(null));
    audio.onended = () => setSpeakingId(null);
    audio.onerror = () => setSpeakingId(null);
  };

  const toggleAudio = (msg: RafiqMsg) => {
    if (speakingId === msg.id && audioRef.current) stopAudio();
    else if (msg.audioUrl) playAudio(msg.audioUrl, msg.id);
  };

  const loadBalance = async () => {
    try {
      const { balance: b } = await walletApi.getBalance();
      setBalance(b);
      setShowUpgrade(false);
    } catch {
      setBalance(null);
    }
  };

  const send = useCallback(
    async (text: string) => {
      const trimmed = (text ?? '').trim();
      if (!trimmed || loading) return;
      stopAudio();
      const userMsg: RafiqMsg = { id: `u_${Date.now()}`, role: 'user', text: trimmed, ts: 'Just now' };
      setMsgs((m) => [...m, userMsg]);
      setInput('');
      setLoading(true);
      setError(null);
      setShowUpgrade(false);
      const rafiqMsgId = `r_${Date.now()}`;
      setMsgs((m) => [...m, { id: rafiqMsgId, role: 'rafiq', text: '', ts: 'Just now' }]);
      try {
        const response = await chatService.streamMessage(trimmed, persona, undefined, {
          lat: lat ?? undefined,
          lon: lon ?? undefined,
          conversationId,
          context: contextRef.current ?? undefined,
          title: !conversationId && contextRef.current ? getConversationTitle(contextRef.current) : undefined,
        });
        if (response.conversationId) setConversationId(response.conversationId);
        setMsgs((m) => m.map((msg) => (msg.id === rafiqMsgId ? { ...msg, text: response.text } : msg)));
        void loadBalance();
      } catch (err: any) {
        if (err instanceof InsufficientBalanceError) {
          setMsgs((m) => m.filter((msg) => msg.id !== rafiqMsgId));
          setShowUpgrade(true);
          setError('Not enough tokens. Top up your wallet to keep chatting with Rafiq.');
          return;
        }
        const offline = rafiqOfflineAnswer(trimmed);
        const errMsg: RafiqMsg = {
          id: `r_${Date.now()}`,
          role: 'rafiq',
          text: offline.text,
          sources: offline.sources.length ? offline.sources : undefined,
          follow: offline.follow.length ? offline.follow : undefined,
          alert: { level: 'warn', text: 'Offline mode — serving from the Rihla guidebook' },
          ts: 'Just now',
        };
        setMsgs((m) => [...m.filter((msg) => msg.id !== rafiqMsgId), errMsg]);
        setError(err?.message || 'Failed to send message');
      } finally {
        setLoading(false);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    },
    [loading, persona, lat, lon, conversationId]
  );

  const sendVoiceReply = async (audio: Blob, mimeType: string, transcript: string) => {
    setLoading(true);
    setError(null);
    setShowUpgrade(false);
    const rafiqMsgId = `r_${Date.now()}`;
    setMsgs((m) => [...m, { id: rafiqMsgId, role: 'rafiq', text: '', ts: 'Just now' }]);
    try {
      const result = await chatService.voice(audio, mimeType, {
        lat: lat ?? undefined,
        lon: lon ?? undefined,
        conversationId,
        persona,
        transcript: transcript || undefined,
        rafiqContext: contextRef.current ?? undefined,
      });
      if (result.conversation_id) setConversationId(result.conversation_id);
      const audioUrl = result.audio_url || (result.audio_response ? result.audio_response : undefined);
      setMsgs((m) => m.map((msg) => (msg.id === rafiqMsgId ? { ...msg, text: result.text_response || '…', audioUrl } : msg)));
      if (audioUrl) setTimeout(() => playAudio(audioUrl, rafiqMsgId), 150);
      void loadBalance();
    } catch (err: any) {
      setMsgs((m) => m.filter((msg) => msg.id !== rafiqMsgId));
      if (err instanceof InsufficientBalanceError) {
        setShowUpgrade(true);
        setError('Not enough tokens. Top up your wallet to keep chatting with Rafiq.');
        return;
      }
      setError(err?.message || 'Voice chat failed. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
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
        const audio = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (audio.size === 0) return;
        setMsgs((m) => [...m, { id: `uv_${Date.now()}`, role: 'user', text: '🎤 Voice message', ts: 'Just now' }]);
        await sendVoiceReply(audio, recorder.mimeType || 'audio/webm', '');
      };
      recorder.start();
      setListening(true);
    } catch {
      setError('Microphone access denied.');
    }
  };

  const handleImage = async (file: File) => {
    if (!file) return;
    setIdentifying(true);
    setError(null);
    try {
      const result = await chatService.identify(file, {
        lat: lat ?? undefined,
        lon: lon ?? undefined,
        conversationId: conversationId || undefined,
      });
      setInput(result.name);
    } catch (err: any) {
      setError(err?.message || 'Image identification failed. Please try again.');
    } finally {
      setIdentifying(false);
    }
  };

  const handleFollow = (e: React.MouseEvent) => {
    const q = (e.target as HTMLElement).getAttribute('data-follow');
    if (q) send(q);
  };

  const handlePlanTrip = async () => {
    const interests = tripInterests
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const cities = tripCities
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (interests.length === 0 || loading || tripLoading) return;
    const ctxInterests = contextRef.current?.source === 'profile' ? contextRef.current.interests ?? [] : [];
    const ctxStyle = contextRef.current?.source === 'profile' ? contextRef.current.travelStyle ?? 'cultural' : 'cultural';
    const requestInterests = [...new Set([...interests, ...ctxInterests])].slice(0, 8);
    const userMsg: RafiqMsg = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: `✈️ Plan my trip — interests: ${requestInterests.join(', ')}, ${tripDays} day${tripDays > 1 ? 's' : ''}, ${tripBudget}${cities.length ? `, cities: ${cities.join(', ')}` : ''}`,
      ts: 'Just now',
    };
    setMsgs((m) => [...m, userMsg]);
    setShowTripForm(false);
    setLoading(true);
    setTripLoading(true);
    setError(null);
    setShowUpgrade(false);
    const rafiqMsgId = `r_${Date.now()}`;
    setMsgs((m) => [...m, { id: rafiqMsgId, role: 'rafiq', text: '', ts: 'Just now' }]);
    try {
      const result = await itineraryApi.generate({
        interests: requestInterests,
        days: tripDays,
        budget: tripBudget,
        style: ctxStyle,
        cities: cities.length ? cities : undefined,
        base_currency: 'EGP',
      });
      setMsgs((m) =>
        m.map((msg) =>
          msg.id === rafiqMsgId
            ? {
                ...msg,
                text: stripStructuredComment(result.itinerary),
                structured: result.structured ?? null,
              }
            : msg
        )
      );
      void loadBalance();
    } catch (err: any) {
      setMsgs((m) => m.filter((msg) => msg.id !== rafiqMsgId));
      if (err instanceof InsufficientBalanceError) {
        setShowUpgrade(true);
        setError('Not enough tokens. Top up your wallet to plan your trip.');
        return;
      }
      const errMsg: RafiqMsg = {
        id: `r_${Date.now()}`,
        role: 'rafiq',
        text: `I couldn't plan that itinerary just now — ${err?.message || 'try again in a moment.'}`,
        alert: { level: 'warn', text: 'Itinerary planning failed' },
        ts: 'Just now',
      };
      setMsgs((m) => [...m, errMsg]);
      setError(err?.message || 'Failed to plan trip');
    } finally {
      setLoading(false);
      setTripLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  if (!open) return null;

  const label = contextProp ? contextualLabel(contextProp) : 'Ask Rafiq';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(13,11,9,0.62)',
        backdropFilter: 'blur(3px)',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 640,
          height: 'min(600px, 88vh)',
          background: '#F6F1E7',
          borderRadius: 20,
          border: `1px solid ${C.sand}40`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ background: `linear-gradient(-60deg,${C.basalt},${C.nile},#0B2D2E)`, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: `${C.limestone}15`, border: `1px solid ${C.limestone}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Glyph size={22} light />
            </div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '16px', fontWeight: 500, color: C.limestone, lineHeight: 1.1 }}>Rafiq</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.safeGreen, boxShadow: `0 0 0 2px ${C.safeGreen}35` }} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '10.5px', fontWeight: 500, color: `${C.limestone}65` }}>Active · {label}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: `${C.limestone}10`, border: `1px solid ${C.limestone}20`, borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.limestone, cursor: 'pointer' }} title="Close">
            <X size={17} strokeWidth={2} />
          </button>
        </div>

        {showUpgrade && (
          <div style={{ background: 'linear-gradient(90deg, rgba(232,168,32,0.16), rgba(232,168,32,0.05))', borderBottom: `1px solid ${C.solarBright}30`, padding: '9px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexShrink: 0 }}>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12.5px', color: C.basalt, fontWeight: 500 }}>Your token balance is too low for another message.</span>
            <a href="/app/wallet" style={{ background: C.solarBright, border: 'none', borderRadius: 8, padding: '7px 14px', fontFamily: "'Inter',sans-serif", fontSize: '11.5px', fontWeight: 700, color: C.basalt, cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap' }}>Buy tokens →</a>
          </div>
        )}

        {/* Messages */}
        <div onClick={handleFollow} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 8px', display: 'flex', flexDirection: 'column' }}>
          {msgs.map((m) => (
            <Bubble key={m.id} msg={m} speaking={speakingId === m.id} onToggleAudio={toggleAudio} />
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg,${C.nile},${C.nileMid})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Glyph size={16} light />
              </div>
              <div style={{ background: 'linear-gradient(145deg,#FAF7F0,#F5EDD8)', border: `1px solid ${C.sand}22`, borderRadius: '4px 14px 14px 14px', padding: '14px 18px', display: 'flex', gap: 6, alignItems: 'center' }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: C.copper, opacity: 0.5, animation: `rafiqModalBounce 1.2s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          {error && !loading && (
            <div style={{ padding: '7px 16px', fontFamily: "'Inter',sans-serif", fontSize: '12px', color: C.alertAmber, textAlign: 'center', background: `${C.alertAmber}08`, borderRadius: 8, marginBottom: 6 }}>{error}</div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Topic pills */}
        <div style={{ display: 'flex', gap: 6, padding: '0 20px 8px', flexWrap: 'wrap', flexShrink: 0 }}>
          {TOPIC_PILLS.map(({ label: t, query }) => (
            <span
              key={t}
              onClick={() => send(query)}
              style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', background: C.limestone, border: `1.5px solid ${C.nile}16`, borderRadius: 99, padding: '4px 11px', color: C.nile, cursor: 'pointer', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <Sparkles size={10} strokeWidth={2} color={C.copper} />
              {t}
            </span>
          ))}
          <span
            onClick={() => { setShowTripForm((v) => !v); }}
            style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', background: showTripForm ? C.faience : C.limestone, border: `1.5px solid ${showTripForm ? `${C.faience}44` : `${C.solarBright}55`}`, borderRadius: 99, padding: '4px 11px', color: showTripForm ? C.limestone : C.faience, cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            {showTripForm ? <X size={10} strokeWidth={2.5} /> : <MapPin size={10} strokeWidth={2} />}
            {showTripForm ? 'Cancel plan' : 'Plan my trip'}
          </span>
        </div>

        {/* Inline trip-plan form */}
        {showTripForm && (
          <div style={{ padding: '0 20px 10px', flexShrink: 0 }}>
            <div style={{ background: C.limestone, border: `1px solid ${C.nile}20`, borderRadius: 12, padding: '12px', boxShadow: '0 4px 14px rgba(27,26,23,0.06)' }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '14px', fontWeight: 600, color: C.nile, marginBottom: 8 }}>
                ✈️ Plan your trip in Egypt
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontFamily: "'Inter',sans-serif", fontSize: '10.5px', fontWeight: 600, color: '#A89880' }}>Interests (comma-separated)</label>
                  <input
                    value={tripInterests}
                    onChange={(e) => setTripInterests(e.target.value)}
                    placeholder="history, food, photography…"
                    style={{ border: `1px solid ${C.nile}22`, borderRadius: 8, padding: '7px 10px', fontSize: '12.5px', fontFamily: "'Inter',sans-serif", outline: 'none', background: '#FFFFFF', color: C.basalt }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <label style={{ fontFamily: "'Inter',sans-serif", fontSize: '10.5px', fontWeight: 600, color: '#A89880' }}>Days</label>
                    <input
                      type="number"
                      min={1}
                      max={14}
                      value={tripDays}
                      onChange={(e) => setTripDays(Math.max(1, Math.min(14, Number(e.target.value) || 1)))}
                      style={{ border: `1px solid ${C.nile}22`, borderRadius: 8, padding: '7px 10px', fontSize: '12.5px', fontFamily: "'Inter',sans-serif", outline: 'none', background: '#FFFFFF', color: C.basalt }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1.4 }}>
                    <label style={{ fontFamily: "'Inter',sans-serif", fontSize: '10.5px', fontWeight: 600, color: '#A89880' }}>Budget</label>
                    <select
                      value={tripBudget}
                      onChange={(e) => setTripBudget(e.target.value as 'budget' | 'mid' | 'luxury')}
                      style={{ border: `1px solid ${C.nile}22`, borderRadius: 8, padding: '7px 10px', fontSize: '12.5px', fontFamily: "'Inter',sans-serif", outline: 'none', background: '#FFFFFF', color: C.basalt }}
                    >
                      <option value="budget">Budget</option>
                      <option value="mid">Mid-range</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontFamily: "'Inter',sans-serif", fontSize: '10.5px', fontWeight: 600, color: '#A89880' }}>Cities (optional, comma-separated)</label>
                  <input
                    value={tripCities}
                    onChange={(e) => setTripCities(e.target.value)}
                    placeholder="Cairo, Luxor, Aswan…"
                    style={{ border: `1px solid ${C.nile}22`, borderRadius: 8, padding: '7px 10px', fontSize: '12.5px', fontFamily: "'Inter',sans-serif", outline: 'none', background: '#FFFFFF', color: C.basalt }}
                  />
                </div>
                <button
                  onClick={handlePlanTrip}
                  disabled={!tripInterests.trim() || loading || tripLoading}
                  style={{ background: tripInterests.trim() && !loading ? C.nile : C.limestoneDark, color: tripInterests.trim() && !loading ? C.limestone : '#A89880', border: 'none', borderRadius: 9, padding: '9px 12px', fontSize: '12px', fontWeight: 700, fontFamily: "'Inter',sans-serif", cursor: tripInterests.trim() && !loading ? 'pointer' : 'default' }}
                >
                  {tripLoading ? 'Planning your trip…' : 'Generate itinerary'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '0 20px 18px', flexShrink: 0 }}>
          <div style={{ background: C.limestone, border: `2px solid ${input ? C.faience : 'rgba(27,26,23,0.1)'}`, borderRadius: 13, padding: '10px 12px', display: 'flex', alignItems: 'flex-end', gap: 9 }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask about safety, history, food, transport…"
              rows={1}
              style={{ background: 'transparent', border: 'none', outline: 'none', flex: 1, fontFamily: "'Inter',sans-serif", fontSize: '13.5px', color: C.basalt, resize: 'none', lineHeight: 1.6, maxHeight: 100, overflowY: 'auto', boxSizing: 'border-box', minHeight: 24 }}
            />
            <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
              <button onClick={() => fileInputRef.current?.click()} disabled={loading || listening || identifying} title="Identify a landmark" style={{ background: 'none', border: 'none', cursor: loading ? 'default' : 'pointer', color: C.faience, display: 'flex', padding: 4 }}>
                <ImageIcon size={17} strokeWidth={2} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); e.target.value = ''; }} />
              <button onClick={handleVoice} disabled={loading || identifying} title={listening ? 'Stop recording' : 'Speak to Rafiq'} style={{ background: 'none', border: 'none', cursor: loading ? 'default' : 'pointer', color: listening ? C.alertAmber : C.faience, display: 'flex', padding: 4 }}>
                {listening ? <Square size={17} strokeWidth={2.5} fill={C.alertAmber} /> : <Mic size={17} strokeWidth={2} />}
              </button>
              <button onClick={() => send(input)} disabled={!input.trim() || loading} style={{ background: input.trim() && !loading ? C.nile : C.limestoneDark, border: 'none', borderRadius: 9, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default' }}>
                <Send size={14} color={input.trim() && !loading ? C.limestone : '#A89880'} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10.5px', color: '#A89880', marginTop: 7, textAlign: 'center' }}>
            Rafiq synthesises verified sources · Always cross-check critical decisions
            {' · '}
            <span style={{ color: C.faience, fontWeight: 600 }}>Balance: {balance === null ? '—' : balance.toLocaleString()} tokens</span>
          </div>
        </div>
      </div>
      <style>{`@keyframes rafiqModalBounce { 0%,100% { opacity:.5; transform:translateY(0) } 50% { opacity:1; transform:translateY(-3px) } }`}</style>
    </div>
  );
}