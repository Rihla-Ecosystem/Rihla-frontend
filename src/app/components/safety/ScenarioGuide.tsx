'use client';

import React from 'react';
import { C } from '@/lib/constants/theme';
import { FIRST_AID } from '@/app/data/safety-data';
import { CheckCircle } from 'lucide-react';

export default function ScenarioGuide({
  scenario,
  setScenario,
  step,
  setStep,
  setCalled,
}: {
  scenario: string | null;
  setScenario: (s: string | null) => void;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setCalled: (s: string | null) => void;
}) {
  const activeScenario = FIRST_AID.find((f) => f.id === (scenario as string));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        style={{
          fontFamily: "'Inter',sans-serif",
          fontSize: '10px',
          fontWeight: 700,
          color: `${C.limestone}40`,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          marginBottom: 2,
        }}
      >
        What's happening?
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {FIRST_AID.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setScenario(f.id);
              setStep(0);
            }}
            style={{
              background: scenario === f.id ? `${f.color}18` : '#141210',
              border: `1.5px solid ${scenario === f.id ? f.color : `${C.limestone}10`}`,
              borderRadius: 13,
              padding: '16px 14px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.18s',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `${f.color}15`,
                border: `1px solid ${f.color}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: f.color,
                marginBottom: 10,
              }}
            >
              {f.icon}
            </div>
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                fontWeight: 700,
                color: scenario === f.id ? f.color : C.limestone,
              }}
            >
              {f.title}
            </div>
          </button>
        ))}
      </div>

      {activeScenario ? (
        <div
          style={{
            background: '#141210',
            border: `1.5px solid ${activeScenario.color}30`,
            borderRadius: 16,
            padding: '20px',
            flex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '12px',
                fontWeight: 700,
                color: activeScenario.color,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {activeScenario.title} · Step-by-step
            </div>
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '11px',
                color: `${C.limestone}35`,
              }}
            >
              Step {step + 1} of {activeScenario.steps.length}
            </div>
          </div>

          <div
            style={{
              height: 3,
              background: `${C.limestone}10`,
              borderRadius: 99,
              marginBottom: 16,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${((step + 1) / activeScenario.steps.length) * 100}%`,
                background: activeScenario.color,
                borderRadius: 99,
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          <div
            style={{
              background: `${activeScenario.color}10`,
              border: `1px solid ${activeScenario.color}20`,
              borderRadius: 12,
              padding: '18px 16px',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: activeScenario.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#fff',
                  }}
                >
                  {step + 1}
                </span>
              </div>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontStyle: 'italic',
                  fontSize: '15px',
                  color: C.limestone,
                  lineHeight: 1.7,
                  margin: 0,
                  flex: 1,
                }}
              >
                {activeScenario.steps[step]}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {activeScenario.steps.map((s, i) => (
              <div
                key={i}
                onClick={() => setStep(i)}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  padding: '8px 10px',
                  borderRadius: 9,
                  background: i === step ? `${activeScenario.color}08` : 'transparent',
                  cursor: 'pointer',
                  opacity: i < step ? 0.45 : 1,
                  transition: 'all 0.15s',
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background:
                      i < step
                        ? `${activeScenario.color}30`
                        : i === step
                          ? activeScenario.color
                          : `${C.limestone}10`,
                    border: `1.5px solid ${i <= step ? activeScenario.color : `${C.limestone}15`}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {i < step ? (
                    <CheckCircle size={10} color={activeScenario.color} strokeWidth={2.5} />
                  ) : (
                    <span
                      style={{
                        fontFamily: "'Inter',sans-serif",
                        fontSize: '9px',
                        fontWeight: 700,
                        color: i === step ? '#fff' : `${C.limestone}30`,
                      }}
                    >
                      {i + 1}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '12px',
                    color: i === step ? C.limestone : `${C.limestone}40`,
                    lineHeight: 1.5,
                  }}
                >
                  {s}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              style={{
                flex: 1,
                background: `${C.limestone}08`,
                border: `1px solid ${C.limestone}15`,
                borderRadius: 9,
                padding: '10px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                color: step === 0 ? `${C.limestone}25` : `${C.limestone}70`,
                cursor: step === 0 ? 'default' : 'pointer',
              }}
            >
              ← Previous
            </button>
            {step < activeScenario.steps.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                style={{
                  flex: 2,
                  background: activeScenario.color,
                  border: 'none',
                  borderRadius: 9,
                  padding: '10px',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Next step →
              </button>
            ) : (
              <button
                onClick={() => {
                  setStep(0);
                  setScenario(null);
                }}
                style={{
                  flex: 2,
                  background: '#4caf50',
                  border: 'none',
                  borderRadius: 9,
                  padding: '10px',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <CheckCircle size={14} strokeWidth={2.5} /> Done
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            background: '#141210',
            border: `1px solid ${C.limestone}10`,
            borderRadius: 16,
            padding: '24px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 10,
          }}
        >
          <div style={{ fontSize: '32px' }}>👆</div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontStyle: 'italic',
              fontSize: '16px',
              color: `${C.limestone}60`,
            }}
          >
            Select a scenario above for step-by-step guidance
          </div>
        </div>
      )}
    </div>
  );
}
