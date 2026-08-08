'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { C } from '@/lib/constants/theme';
import { MapPin, Volume2, Mic, Send } from 'lucide-react';
import { Glyph } from '@/app/components/atoms';
import { useLocation, useLocationLabel, formatCoords } from '@/providers/LocationProvider';
import SwitchSimple from '@/app/components/settings/SwitchSimple';
import { speak, stopSpeaking } from '@/lib/speech';
import { chatService } from '@/services/chatService';

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
  const [micState, setMicState] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [emergencyText, setEmergencyText] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    stopSpeaking();
  }, []);

  useEffect(() => () => stopAudio(), [stopAudio]);

  const speakPhrase = useCallback(
    (text: string, index: number, lang: 'auto' | 'ar' | 'en' = 'auto') => {
      if (typeof window === 'undefined') return;
      stopAudio();
      setSpeakingIndex(index);
      speak(text, {
        lang,
        rate: 0.9,
        onStart: () => setSpeakingIndex(index),
        onEnd: () => setSpeakingIndex(null),
        onError: () => setSpeakingIndex(null),
      });
    },
    [stopAudio]
  );

  const toggleMic = async () => {
    if (micState !== 'idle') {
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
        setMicState('processing');
        const audio = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (audio.size > 0) {
          try {
            const result = await chatService.voice(audio, recorder.mimeType || 'audio/webm', {
              lat: lat ?? undefined,
              lon: lon ?? undefined,
            });
            setEmergencyText((t) => (t ? `${t} ${result.text_response || ''}` : result.text_response || '').trim());
          } catch (err: any) {
            console.warn('Emergency voice transcription failed:', err);
          }
        }
        setMicState('idle');
      };
      recorder.start();
      setMicState('recording');
    } catch (err) {
      console.warn('Microphone access denied:', err);
      setMicState('idle');
    }
  };
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
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontStyle: 'italic',
              fontSize: '14px',
              color: `${C.limestone}80`,
              lineHeight: 1.7,
              flex: 1,
            }}
          >
            'Stay calm. Egypt has well-trained Tourist Police available at every major site. You are
            not alone.'
          </div>
          <button
            onClick={() => speakPhrase("Stay calm. Egypt has well-trained Tourist Police available at every major site. You are not alone.", 99)}
            title={speakingIndex === 99 ? 'Stop' : 'Hear this aloud'}
            aria-label="Hear reassurance message"
            style={{
              background: speakingIndex === 99 ? 'rgba(76,175,80,0.25)' : 'rgba(76,175,80,0.12)',
              border: `1px solid ${speakingIndex === 99 ? '#4caf50' : 'rgba(76,175,80,0.35)'}`,
              borderRadius: 8,
              width: 30,
              height: 30,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: speakingIndex === 99 ? '#4caf50' : 'rgba(76,175,80,0.85)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Volume2 size={15} strokeWidth={2.2} />
          </button>
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
                    speakPhrase(p.arabic, i, 'ar');
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
            padding: '10px 12px',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <input
            value={emergencyText}
            onChange={(e) => setEmergencyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && emergencyText.trim()) setRafiq(true);
            }}
            placeholder="Describe the emergency — or tap the mic…"
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              flex: 1,
              fontFamily: "'Inter',sans-serif",
              fontSize: '13px',
              color: C.limestone,
              minWidth: 0,
            }}
          />
          <button
            onClick={toggleMic}
            title={micState === 'recording' ? 'Stop recording' : micState === 'processing' ? 'Transcribing…' : 'Speak your emergency'}
            aria-label={micState === 'recording' ? 'Stop recording' : 'Speak your emergency'}
            style={{
              background: micState === 'recording' ? '#8e24aa' : `${C.limestone}15`,
              border: `1px solid ${micState === 'recording' ? '#8e24aa' : C.limestone}30`,
              borderRadius: 7,
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: micState === 'processing' ? 'default' : 'pointer',
              flexShrink: 0,
              color: micState === 'recording' ? '#fff' : `${C.limestone}80`,
              animation: micState === 'recording' ? 'pulse 1.2s infinite' : 'none',
              opacity: micState === 'processing' ? 0.5 : 1,
            }}
          >
            <Mic size={15} strokeWidth={2.2} />
          </button>
          <button
            onClick={() => emergencyText.trim() && setRafiq(true)}
            title="Ask Rafiq"
            aria-label="Ask Rafiq"
            disabled={!emergencyText.trim()}
            style={{
              background: emergencyText.trim() ? '#8e24aa' : `${C.limestone}20`,
              border: 'none',
              borderRadius: 7,
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: emergencyText.trim() ? 'pointer' : 'default',
              flexShrink: 0,
              color: emergencyText.trim() ? '#fff' : `${C.limestone}40`,
            }}
          >
            <Send size={14} strokeWidth={2.2} />
          </button>
        </div>
        {micState === 'processing' && (
          <div
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '11px',
              color: `${C.limestone}50`,
              marginTop: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8e24aa', animation: 'pulse 1.2s infinite' }} />
            Transcribing your voice…
          </div>
        )}
      </div>
    </div>
  );
}
