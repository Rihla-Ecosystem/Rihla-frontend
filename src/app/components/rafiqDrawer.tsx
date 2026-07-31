'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { C } from '@/lib/constants/theme';
import { Glyph } from '@/app/components/atoms';

export function RafiqDrawer({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState('');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15,61,62,0.45)',
          backdropFilter: 'blur(4px)',
        }}
      />
      <div
        style={{
          position: 'relative',
          width: 420,
          background: 'linear-gradient(180deg,#FAF7F0,#F5EDD8)',
          height: '100%',
          boxShadow: '-16px 0 48px rgba(15,61,62,0.2)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid rgba(27,26,23,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 13,
              background: `linear-gradient(135deg,${C.nile},${C.nileMid})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Glyph size={22} light />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: '17px',
                fontWeight: 500,
                color: C.nile,
              }}
            >
              Rafiq
            </div>
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '11px',
                color: C.faience,
                fontWeight: 500,
              }}
            >
              ● Active · Giza context loaded
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#A89880',
              display: 'flex',
            }}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <div
          style={{
            flex: 1,
            padding: '20px 24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div
            style={{
              background: 'linear-gradient(160deg,#FAF3E4,#F0E8D0)',
              borderRadius: '4px 16px 16px 16px',
              padding: '14px 16px',
              border: `1px solid ${C.sand}22`,
            }}
          >
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '10px',
                fontWeight: 600,
                color: C.copper,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              ◈ Rafiq
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontStyle: 'italic',
                fontSize: '14px',
                color: C.basalt,
                lineHeight: 1.65,
              }}
            >
              Welcome to the Giza Plateau! I've loaded verified historical records and current
              safety data. What would you like to know?
            </div>
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '10px',
                color: '#A89880',
                marginTop: 8,
              }}
            >
              Based on 40 verified sources · Just now
            </div>
          </div>
          <div
            style={{
              background: `${C.alertAmber}10`,
              border: `1px solid ${C.alertAmber}28`,
              borderRadius: 12,
              padding: '10px 13px',
              display: 'flex',
              gap: 9,
              alignItems: 'flex-start',
            }}
          >
            <AlertTriangle
              size={13}
              color={C.alertAmber}
              strokeWidth={2.5}
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            <div>
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  color: C.alertAmber,
                  marginBottom: 2,
                }}
              >
                Active Scam · This Area
              </div>
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '12px',
                  color: '#6B6354',
                  lineHeight: 1.5,
                }}
              >
                "Free gift" vendors near the east path — walk past confidently.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {[
              'Is the Sphinx safe now?',
              'Best time to visit?',
              'Nearest restaurant',
              'Explain the history',
            ].map((q) => (
              <button
                key={q}
                style={{
                  background: C.limestone,
                  border: `1.5px solid ${C.nile}15`,
                  borderRadius: 99,
                  padding: '6px 12px',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '12px',
                  fontWeight: 500,
                  color: C.nile,
                  cursor: 'pointer',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: '16px 24px 24px', borderTop: '1px solid rgba(27,26,23,0.07)' }}>
          <div
            style={{
              background: C.limestone,
              border: `1.5px solid ${C.faience}38`,
              borderRadius: 12,
              padding: '11px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              boxShadow: `0 0 0 3px ${C.faience}10`,
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about Egypt…"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                flex: 1,
                fontFamily: "'Inter',sans-serif",
                fontSize: '14px',
                color: C.basalt,
              }}
            />
            <button
              style={{
                background: input ? C.nile : C.limestoneDark,
                border: 'none',
                borderRadius: 8,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13M22 2L15 22L11 13"
                  stroke={input ? C.limestone : '#A89880'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RafiqDrawer;
