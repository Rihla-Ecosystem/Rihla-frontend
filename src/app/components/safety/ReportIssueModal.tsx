'use client';

import React, { useState } from 'react';
import { C } from '@/lib/constants/theme';
import { useToast } from '@/components/ToastProvider';
import { useLocation, formatCoords } from '@/providers/LocationProvider';
import {
  incidentReportService,
  type IncidentType,
  type IncidentSeverity,
} from '@/services/incidentReportService';
import { MapPin, Send, X, Camera, CircleAlert } from 'lucide-react';

const TYPE_OPTIONS: { value: IncidentType; label: string; hint: string }[] = [
  { value: 'SAFETY', label: 'Safety concern', hint: 'Unsafe area, harassment, or a real incident' },
  { value: 'SCAM', label: 'Scam / tourist trap', hint: 'Overcharging, fake guides, aggressive vendors' },
  { value: 'SERVICE', label: 'Poor service', hint: 'A business, taxi, or operator treated you badly' },
  { value: 'DAMAGE', label: 'Damage / maintenance', hint: 'Broken infrastructure, hazards, unsafe conditions' },
  { value: 'ACCESSIBILITY', label: 'Accessibility issue', hint: 'Steps, missing ramps, or poor access' },
  { value: 'OTHER', label: 'Other', hint: 'Anything else worth flagging' },
];

const SEVERITY_OPTIONS: { value: IncidentSeverity; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

export default function ReportIssueModal({
  open,
  onClose,
  initialType,
  relatedSiteName,
}: {
  open: boolean;
  onClose: () => void;
  initialType?: IncidentType;
  relatedSiteName?: string | null;
}) {
  const { lat, lon, locationName } = useLocation();
  const { showToast } = useToast();

  const [type, setType] = useState<IncidentType>(initialType ?? 'SAFETY');
  const [severity, setSeverity] = useState<IncidentSeverity>('MEDIUM');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setType(initialType ?? 'SAFETY');
      setSeverity('MEDIUM');
      setDescription('');
      setDone(false);
      setError(null);
    }
  }, [open, initialType]);

  if (!open) return null;

  const canSubmit = description.trim().length >= 10 && description.trim().length <= 2000;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await incidentReportService.create({
        type,
        severity,
        description: description.trim(),
        lat: lat ?? undefined,
        lng: lon ?? undefined,
        relatedSiteName: relatedSiteName ?? undefined,
      });
      setDone(true);
      showToast({ type: 'success', title: 'Report submitted', message: 'Thank you — it helps other travellers.' });
    } catch (err: any) {
      console.warn('ReportIssueModal submit failed:', err);
      const msg =
        err?.rateLimited ||
        err?.message?.toLowerCase().includes('rate') ||
        String(err?.message ?? err).toLowerCase().includes('too many')
          ? 'Too many reports. Please wait a minute and try again.'
          : 'Could not submit your report. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Report a travel issue"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1400,
        background: 'rgba(13,11,9,0.62)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#F6F1E7',
          borderRadius: 20,
          width: 'min(560px, 100%)',
          maxHeight: '88vh',
          overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        }}
      >
        {done ? (
          <div style={{ padding: '48px 36px', textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: `${C.safeGreen}18`,
                border: `2px solid ${C.safeGreen}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                color: C.safeGreen,
              }}
            >
              <MapPin size={28} strokeWidth={2} />
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: '26px',
                fontWeight: 700,
                color: '#1B2720',
                marginBottom: 8,
              }}
            >
              Report received
            </div>
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: '#5C5347',
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              Thank you. Your {type.toLowerCase()} report was logged and other travellers in this area
              have been notified.
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#1B2720',
                color: '#F6F1E7',
                border: 'none',
                borderRadius: 10,
                padding: '12px 28px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: '1px solid rgba(27,26,23,0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CircleAlert size={20} color={C.signalRed} />
                <div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#1B2720',
                    }}
                  >
                    Report a travel issue
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter',sans-serif",
                      fontSize: '11px',
                      color: '#6B6257',
                    }}
                  >
                    Your reports power live safety insight for others
                  </div>
                </div>
              </div>
              <button
                aria-label="Close report modal"
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B6257',
                  padding: 6,
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <div
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#6B6257',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: 8,
                  }}
                >
                  What kind of issue?
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {TYPE_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value)}
                      style={{
                        background: type === t.value ? '#1B2720' : '#fff',
                        color: type === t.value ? '#F6F1E7' : '#1B2720',
                        border: `1.5px solid ${type === t.value ? '#1B2720' : 'rgba(27,26,23,0.18)'}`,
                        borderRadius: 10,
                        padding: '10px 12px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontFamily: "'Inter',sans-serif",
                        fontSize: '12px',
                        fontWeight: 700,
                        transition: 'all 0.15s',
                      }}
                    >
                      {t.label}
                      <div
                        style={{
                          fontFamily: "'Inter',sans-serif",
                          fontSize: '10px',
                          fontWeight: 400,
                          color: type === t.value ? `${C.limestone}70` : '#8A8175',
                          marginTop: 2,
                          lineHeight: 1.4,
                        }}
                      >
                        {t.hint}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#6B6257',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: 8,
                  }}
                >
                  How serious is it?
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {SEVERITY_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSeverity(s.value)}
                      style={{
                        flex: 1,
                        background: severity === s.value ? '#8B4513' : '#fff',
                        color: severity === s.value ? '#fff' : '#1B2720',
                        border: `1.5px solid ${severity === s.value ? '#8B4513' : 'rgba(27,26,23,0.18)'}`,
                        borderRadius: 8,
                        padding: '8px 0',
                        cursor: 'pointer',
                        fontFamily: "'Inter',sans-serif",
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#6B6257',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: 8,
                  }}
                >
                  Describe what happened <span style={{ color: C.signalRed }}>*</span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. A vendor near the east entrance grabbed my arm and demanded EGP 400 for a 'free' scarab…"
                  rows={4}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#fff',
                    border: `1.5px solid rgba(27,26,23,0.18)`,
                    borderRadius: 10,
                    padding: '12px 14px',
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '13px',
                    color: '#1B2720',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
                <div
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '10px',
                    color: '#8A8175',
                    marginTop: 4,
                    textAlign: 'right',
                  }}
                >
                  {description.trim().length}/2000 · min 10
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#EAE3D6',
                  borderRadius: 10,
                  padding: '10px 14px',
                }}
              >
                <MapPin size={16} color="#1B2720" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  {lat != null && lon != null ? (
                    <div
                      style={{
                        fontFamily: "'Inter',sans-serif",
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#1B2720',
                      }}
                    >
                      {relatedSiteName ?? locationName ?? 'Current location'}
                    </div>
                  ) : (
                    <div
                      style={{
                        fontFamily: "'Inter',sans-serif",
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#1B2720',
                      }}
                    >
                      Location attached automatically
                    </div>
                  )}
                  <div
                    style={{
                      fontFamily: "'Inter',sans-serif",
                      fontSize: '10px',
                      color: '#8A8175',
                      fontStyle: 'italic',
                    }}
                  >
                    {lat != null && lon != null
                      ? formatCoords(lat, lon)
                      : 'Coordinates will be sent when available'}
                  </div>
                </div>
              </div>

              {error && (
                <div
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '12px',
                    color: C.signalRed,
                    background: `${C.signalRed}10`,
                    border: `1px solid ${C.signalRed}30`,
                    borderRadius: 8,
                    padding: '10px 12px',
                  }}
                >
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: canSubmit && !submitting ? '#8B4513' : 'rgba(27,26,23,0.14)',
                  color: canSubmit && !submitting ? '#fff' : 'rgba(27,26,23,0.4)',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px 0',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: canSubmit && !submitting ? 'pointer' : 'default',
                }}
              >
                {submitting ? 'Submitting…' : 'Submit report'}
                {!submitting && <Send size={15} />}
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '10px',
                  color: '#8A8175',
                }}
              >
                <Camera size={13} />
                Reports are anonymous and capped at 5 per minute. Critical safety reports are flagged
                for priority review.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}