'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { C } from '@/lib/constants/theme';
import { MapPin, Volume2 } from 'lucide-react';
import { Glyph } from '@/app/components/atoms';
import { useLocation, useLocationLabel, formatCoords } from '@/providers/LocationProvider';
import SwitchSimple from '@/app/components/settings/SwitchSimple';

export default function EmergencyRightColumn({
  locShared,
  setLocShared,
  setRafiq,
}: {
  locShared: boolean;
  setLocShared: (v: boolean) => void;
  setRafiq: (v: boolean) => void;
}) {
  const { lat, lon, accuracy } = useLocation();
  const locationLabel = useLocationLabel();
  const coordsLine = lat != null && lon != null ? formatCoords(lat, lon, accuracy) : 'Location unavailable';
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  useEffect(() => () => stopAudio(), [stopAudio]);

  const speak = useCallback(
    (text: string, index: number) => {
      if (typeof window === 'undefined') return;
      stopAudio();
      setSpeakingIndex(index);

      let fallbackDone = false;
      const fallback = () => {
        if (fallbackDone) return;
        fallbackDone = true;
        if (!('speechSynthesis' in window)) {
          setSpeakingIndex(null);
          return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-EG';
        utterance.rate = 0.9;
        const pickVoice = () => {
          const voices = window.speechSynthesis.getVoices();
          const arabic = voices.filter((v) => v.lang?.toLowerCase().startsWith('ar'));
          utterance.voice = arabic.find((v) => v.lang?.toLowerCase().startsWith('ar-eg')) ?? arabic[0] ?? null;
        };
        pickVoice();
        if (window.speechSynthesis.getVoices().length === 0) {
          window.speechSynthesis.addEventListener('voiceschanged', pickVoice, { once: true });
        }
        utterance.onstart = () => setSpeakingIndex(index);
        utterance.onend = () => setSpeakingIndex(null);
        utterance.onerror = () => setSpeakingIndex(null);
        window.speechSynthesis.speak(utterance);
      };

      const audio = new Audio(
        `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ar&q=${encodeURIComponent(text)}`
      );
      audioRef.current = audio;
      audio.onended = () => setSpeakingIndex(null);
      audio.onerror = () => {
        if (audioRef.current === audio) audioRef.current = null;
        setSpeakingIndex(null);
        fallback();
      };
      audio.play().catch(() => {
        if (audioRef.current === audio) audioRef.current = null;
        setSpeakingIndex(null);
        fallback();
      });
    },
    [stopAudio]
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        style={{
          background: `linear-gradient(145deg,#0F2A1A,#0A1E12)`,
          border: `1px solid ${C.safeGreen}25`,
          borderRadius: 16,
          padding: '18px 20px',
        }}
      >
        <div
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontStyle: 'italic',
            fontSize: '14px',
            color: `${C.limestone}80`,
            lineHeight: 1.7,
            marginBottom: 10,
          }}
        >
          'Stay calm. Egypt has well-trained Tourist Police available at every major site. You are
          not alone.'
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4caf50' }} />
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              color: '#4caf50',
            }}
          >
            Rafiq is monitoring your location
          </span>
        </div>
      </div>

      <div
        style={{
          background: '#141210',
          border: `1px solid ${C.limestone}10`,
          borderRadius: 16,
          padding: '18px',
          flex: 0,
        }}
      >
        <div
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: '10px',
            fontWeight: 700,
            color: `${C.limestone}40`,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          Essential Arabic · Say it now
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { arabic: 'مساعدة', romanised: "mosa'ada", meaning: 'Help!' },
            { arabic: 'الشرطة', romanised: 'el-shurta', meaning: 'Police' },
            { arabic: 'مستشفى', romanised: 'mustashfa', meaning: 'Hospital' },
            { arabic: 'لا شكرا', romanised: 'la shukran', meaning: 'No thank you' },
            { arabic: 'أين أنا؟', romanised: 'ayna ana?', meaning: 'Where am I?' },
          ].map((p, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                padding: '10px 0',
                borderBottom: i < 4 ? `1px solid ${C.limestone}07` : 'none',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontSize: '20px',
                      color: '#ffb300',
                      direction: 'rtl',
                      marginBottom: 2,
                    }}
                  >
                    {p.arabic}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter',sans-serif",
                      fontSize: '11px',
                      color: `${C.limestone}35`,
                      fontStyle: 'italic',
                    }}
                  >
                    {p.romanised}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(p.arabic, i);
                  }}
                  title="Tap to hear how to say it"
                  aria-label={`Hear ${p.meaning}`}
                  style={{
                    background: speakingIndex === i ? 'rgba(255,179,0,0.22)' : 'transparent',
                    border: `1px solid ${speakingIndex === i ? '#ffb300' : 'rgba(255,179,0,0.35)'}`,
                    color: speakingIndex === i ? '#ffb300' : 'rgba(255,179,0,0.85)',
                    borderRadius: 8,
                    width: 30,
                    height: 30,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.18s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,179,0,0.15)';
                    e.currentTarget.style.color = '#ffb300';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = speakingIndex === i ? 'rgba(255,179,0,0.22)' : 'transparent';
                    e.currentTarget.style.color = speakingIndex === i ? '#ffb300' : 'rgba(255,179,0,0.85)';
                  }}
                >
                  <Volume2 size={15} strokeWidth={2.2} />
                </button>
              </div>
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '13px',
                  fontWeight: 600,
                  color: `${C.limestone}70`,
                }}
              >
                {p.meaning}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: '#141210',
          border: `1px solid ${C.limestone}10`,
          borderRadius: 14,
          padding: '16px 18px',
        }}
      >
        <div
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: '10px',
            fontWeight: 700,
            color: `${C.limestone}40`,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Your Location
        </div>
        <div
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            color: C.limestone,
            marginBottom: 4,
          }}
        >
          {locationLabel}
        </div>
        <div
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: '12px',
            color: `${C.limestone}40`,
            marginBottom: 12,
          }}
        >
          {coordsLine}
        </div>
        <div
          style={{
            background: `${C.limestone}06`,
            borderRadius: 10,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, opacity: 0.08 }}>
            <img src="/placeholder.svg" width="200" alt="" style={{ opacity: 1 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <MapPin size={20} color={C.signalRed} strokeWidth={2.5} />
            <span
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '10px',
                color: `${C.limestone}40`,
              }}
            >
              Map unavailable offline
            </span>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            background: locShared ? `${C.safeGreen}15` : `${C.limestone}06`,
            border: `1.5px solid ${locShared ? C.safeGreen : C.limestone}${locShared ? '' : '18'}`,
            borderRadius: 9,
            padding: '10px 14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <MapPin size={14} color={locShared ? '#4caf50' : `${C.limestone}60`} strokeWidth={2.5} style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 700, color: locShared ? '#4caf50' : C.limestone }}>
                {locShared ? 'Location shared' : 'Share my location'}
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', color: `${C.limestone}45` }}>
                {locShared ? 'Live coordinates sent to emergency services' : 'Emergency services will see your exact position'}
              </div>
            </div>
          </div>
          <SwitchSimple checked={locShared} onChange={setLocShared} />
        </div>
      </div>

      <div
        style={{
          background: `linear-gradient(135deg,${C.nile},${C.nileMid})`,
          borderRadius: 14,
          padding: '16px 18px',
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
          <Glyph size={20} light />
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              color: `${C.limestone}70`,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Rafiq Emergency
          </span>
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontStyle: 'italic',
            fontSize: '13px',
            color: `${C.limestone}70`,
            lineHeight: 1.6,
            marginBottom: 12,
          }}
        >
          Describe what's happening. Rafiq will guide you and can alert the nearest Tourist Police
          station.
        </div>
        <div
          style={{
            background: `${C.limestone}10`,
            border: `1px solid ${C.limestone}18`,
            borderRadius: 9,
            padding: '10px 14px',
            display: 'flex',
            gap: 10,
          }}
        >
          <input
            placeholder="Describe the emergency…"
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              flex: 1,
              fontFamily: "'Inter',sans-serif",
              fontSize: '13px',
              color: C.limestone,
            }}
          />
          <button
            style={{
              background: '#8e24aa',
              border: 'none',
              borderRadius: 7,
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <div style={{ width: 12, height: 12, background: '#fff', borderRadius: 2 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
