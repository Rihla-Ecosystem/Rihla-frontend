'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { RefreshCw, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { C } from '@/lib/constants/theme';
import { UI, IconTile } from '@/app/components/ui/primitives';
import { chatService } from '@/services/chatService';

interface SafetyGuideProps {
  gov: string;
  riskLevel: string | null;
  score: number | null;
  alerts: { title: string; severity: string }[];
  coords?: { lat: number; lon: number } | null;
  nationality?: string | null;
  staticFallback: string[];
}

function buildPrompt(opts: {
  gov: string;
  riskLevel: string | null;
  score: number | null;
  alerts: { title: string; severity: string }[];
  nationality?: string | null;
}): string {
  const { gov, riskLevel, alerts, nationality } = opts;
  const eventLines = alerts
    .slice(0, 5)
    .map((a) => `- [${a.severity}] ${a.title}`)
    .join('\n');
  return [
    'You are a travel safety expert for visitors to Egypt.',
    `A traveler from ${nationality || 'a foreign country'} is visiting ${gov}, Egypt.`,
    `Current local risk level for ${gov}: ${riskLevel || 'Low'}.`,
    'Recent local alerts:',
    eventLines || '- No active alerts.',
    'Give a concise safety briefing (under 220 words) using exactly these section headers:',
    '## Key Risks',
    '## Local Safety Tips',
    `## Advice for ${nationality || 'International'} Travelers`,
    'Use short bullet points only. Be practical, calm, and specific to the alerts above.',
  ].join('\n');
}

function renderText(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const trimmed = line;
    if (/^#{1,3}\s/.test(trimmed)) {
      return (
        <div
          key={i}
          style={{
            fontFamily: UI.font.serif,
            fontSize: 15,
            fontWeight: 700,
            color: C.nile,
            margin: '8px 0 2px',
          }}
        >
          {trimmed.replace(/^#{1,3}\s*/, '')}
        </div>
      );
    }
    if (/^[-*]\s/.test(trimmed)) {
      return (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 6,
            fontFamily: UI.font.sans,
            fontSize: 12,
            color: UI.text.body,
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: C.solar, flexShrink: 0 }}>•</span>
          <span>{trimmed.replace(/^[-*]\s/, '')}</span>
        </div>
      );
    }
    if (!trimmed) return null;
    return (
      <div key={i} style={{ fontFamily: UI.font.sans, fontSize: 12, color: UI.text.body, lineHeight: 1.55 }}>
        {trimmed}
      </div>
    );
  });
}

export function SafetyGuide({ gov, riskLevel, score, alerts, nationality, staticFallback }: SafetyGuideProps) {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [genKey, setGenKey] = useState(0);
  const [usedLive, setUsedLive] = useState(false);
  const genLock = useRef(false);

  const generate = useCallback(
    async (auto = false) => {
      if (genLock.current) return;
      genLock.current = true;
      setLoading(true);
      setError(null);
      if (!auto) setText('');
      try {
        const prompt = buildPrompt({ gov, riskLevel, score: null, alerts: [], nationality });
        const full = await chatService.streamMessage(prompt, 'safety_guru', (token) => {
          setText((t) => t + token);
        });
        setText(full.text || '');
        setUsedLive(true);
      } catch (e) {
        console.warn('AI safety guide unavailable:', e);
        setError('AI guide is offline — showing built-in safety tips instead.');
        setUsedLive(false);
      } finally {
        setLoading(false);
        genLock.current = false;
      }
    },
    [gov, nationality, riskLevel, score]
  );

  useEffect(() => {
    generate(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gov, genKey]);

  const content = usedLive ? text : staticFallback.map(s => `- ${s}`).join('\n');

  return (
    <div style={{ background: 'linear-gradient(145deg,#FAF3E4,#F0E8D0)', borderRadius: 16, border: `1px solid ${C.sand}25`, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '14px 16px', borderBottom: '1px solid rgba(27,26,23,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <IconTile color={C.solar} size={32} radius={9}>
            <Sparkles size={16} />
          </IconTile>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ fontFamily: UI.font.sans, fontSize: 13, fontWeight: 700, color: C.nile }}>◈ AI Safety Guide</div>
              {loading && <RefreshCw size={12} className="spin" color={C.solar} />}
            </div>
            <div style={{ fontFamily: UI.font.sans, fontSize: 11, color: UI.text.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {usedLive ? `Generated for ${gov}` : error ? 'Offline · built-in tips' : `Briefing for ${gov}`}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <button
            onClick={() => { setGenKey((k) => k + 1); }}
            disabled={loading}
            title="Regenerate"
            style={{ background: 'none', border: 'none', color: UI.text.soft, cursor: 'pointer', padding: 7, borderRadius: 8 }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            title={open ? 'Collapse' : 'Expand'}
            style={{ background: 'none', border: 'none', color: UI.text.soft, cursor: 'pointer', padding: 7, borderRadius: 8 }}>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>
      {open && (
        <div style={{ padding: '14px 16px' }}>
          {loading && !text ? (
            <div style={{ fontFamily: UI.font.sans, fontSize: 12, color: UI.text.muted, display: 'flex', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={13} className="spin" color={C.solar} /> Preparing your safety briefing…
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 260, overflowY: 'auto', paddingRight: 4 }}>
              {renderText(content)}
            </div>
          )}
          {usedLive && !error && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(27,26,23,0.08)', fontFamily: UI.font.sans, fontSize: 10, color: UI.text.muted }}>
              AI-generated · verify with local officials for time-sensitive matters
            </div>
          )}
        </div>
      )}
    </div>
  );
}