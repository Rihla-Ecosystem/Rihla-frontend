'use client';

import React from 'react';
import { C } from '@/lib/constants/theme';
import { CheckCircle, AlertTriangle, Clock, CreditCard, Navigation, Star, Ticket, CalendarClock } from 'lucide-react';
import { Glyph } from '@/app/components/atoms';
import { useRouter } from 'next/navigation';
import SiteCard from '@/app/components/siteCard';
import type { Monument } from '@/services/monumentsService';

export default function SiteBodyLeft({
  site,
  nearby,
  monument,
}: {
  site: any;
  nearby: any[];
  monument: Monument | null;
}) {
  const router = useRouter();
  const storyParagraphs = site.story.split('\n\n');

  const ticketRows = [
    { label: 'Egyptian · Adult', price: monument?.prices?.egyptian?.adult },
    { label: 'Egyptian · Student', price: monument?.prices?.egyptian?.student },
    { label: 'Foreign · Adult', price: monument?.prices?.foreigner?.adult },
    { label: 'Foreign · Student', price: monument?.prices?.foreigner?.student },
  ];
  const hasPrices = ticketRows.some((r) => r.price != null);
  const hours = monument?.opening_hours;
  const hasHours = Boolean(hours?.summer || hours?.winter || hours?.ramadan);

  return (
    <div>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 32 }}
      >
        {[
          {
            icon: <Clock size={16} strokeWidth={2} />,
            label: 'Hours',
            val: site.hours.split(' (')[0],
          },
          {
            icon: <CreditCard size={16} strokeWidth={2} />,
            label: 'Admission',
            val: site.admission.split(' ·')[0],
          },
          { icon: <Navigation size={16} strokeWidth={2} />, label: 'Distance', val: site.dist },
          {
            icon: <Star size={16} strokeWidth={2} />,
            label: 'Best time',
            val: site.bestTime.split(' (')[0],
          },
        ].map(({ icon, label, val }: any) => (
          <div
            key={label}
            style={{
              background: C.limestone,
              borderRadius: 13,
              padding: '14px 14px',
              border: '1px solid rgba(27,26,23,0.07)',
            }}
          >
            <div style={{ color: C.copper, marginBottom: 6 }}>{icon}</div>
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '10px',
                color: '#A89880',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 3,
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '12px',
                fontWeight: 700,
                color: C.nile,
                lineHeight: 1.3,
              }}
            >
              {val}
            </div>
          </div>
        ))}
      </div>

      {(hasPrices || hasHours) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2,1fr)',
            gap: 12,
            marginBottom: 28,
          }}
        >
          {hasPrices && (
            <div
              style={{
                background: C.limestone,
                borderRadius: 14,
                padding: '18px 20px',
                border: '1px solid rgba(27,26,23,0.07)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <Ticket size={15} color={C.copper} strokeWidth={2.2} />
                <span
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    color: C.copper,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Tickets & Admission
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ticketRows.map((row) =>
                  row.price != null ? (
                    <div
                      key={row.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 0',
                        borderBottom: '1px dashed rgba(27,26,23,0.08)',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Inter',sans-serif",
                          fontSize: '12px',
                          color: '#5C5346',
                        }}
                      >
                        {row.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Inter',sans-serif",
                          fontSize: '13px',
                          fontWeight: 700,
                          color: C.nile,
                        }}
                      >
                        LE {row.price}
                      </span>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {hasHours && (
            <div
              style={{
                background: C.limestone,
                borderRadius: 14,
                padding: '18px 20px',
                border: '1px solid rgba(27,26,23,0.07)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <CalendarClock size={15} color={C.copper} strokeWidth={2.2} />
                <span
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    color: C.copper,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Opening Hours
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(
                  [
                    ['Summer', hours?.summer],
                    ['Winter', hours?.winter],
                    ['Ramadan', hours?.ramadan],
                  ] as [string, string | null | undefined][]
                )
                  .filter(([, v]) => v)
                  .map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 0',
                        borderBottom: '1px dashed rgba(27,26,23,0.08)',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Inter',sans-serif",
                          fontSize: '12px',
                          color: '#5C5346',
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Inter',sans-serif",
                          fontSize: '12px',
                          fontWeight: 700,
                          color: C.nile,
                          textAlign: 'right',
                        }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div
            style={{
              height: 1,
              flex: 1,
              background: `linear-gradient(90deg,${C.copper}40,transparent)`,
            }}
          />
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '10px',
              fontWeight: 700,
              color: C.copper,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            ◈ Rihla Story
          </span>
          <div
            style={{
              height: 1,
              flex: 1,
              background: `linear-gradient(270deg,${C.copper}40,transparent)`,
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {storyParagraphs.map((p: string, i: number) => (
            <p
              key={i}
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontStyle: 'italic',
                fontSize: '16px',
                color: C.nile,
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              {p}
            </p>
          ))}
        </div>
      </div>

      <div
        style={{
          background: 'linear-gradient(145deg,#FAF3E4,#F0E8D0)',
          borderRadius: 16,
          padding: '22px 24px',
          border: `1px solid ${C.sand}28`,
          marginBottom: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: `linear-gradient(135deg,${C.nile},${C.nileMid})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Glyph size={18} light />
          </div>
          <div
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '11px',
              fontWeight: 700,
              color: C.copper,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            ◈ Rafiq's Insight · What most tourists miss
          </div>
        </div>
        <p
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontStyle: 'italic',
            fontSize: '15px',
            color: C.nile,
            lineHeight: 1.75,
            margin: 0,
          }}
        >
          {site.rafiqInsight}
        </p>
      </div>

      {site.scamDetail && (
        <div
          style={{
            background: `${C.alertAmber}08`,
            border: `1.5px solid ${C.alertAmber}35`,
            borderRadius: 14,
            padding: '18px 20px',
            marginBottom: 28,
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: `${C.alertAmber}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={17} color={C.alertAmber} strokeWidth={2.5} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '12px',
                  fontWeight: 700,
                  color: C.alertAmber,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Active Scam Alert · This Site
              </div>
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '11px',
                  color: '#8B7E6A',
                  marginTop: 2,
                }}
              >
                14 community reports in the last 2 hours
              </div>
            </div>
          </div>
          <p
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '13px',
              color: '#5C5346',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {site.scamDetail}
          </p>
        </div>
      )}

      <div style={{ marginBottom: 28 }}>
        <h3
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: '18px',
            fontWeight: 500,
            color: C.nile,
            marginBottom: 14,
          }}
        >
          Visitor Tips
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {site.tips.map((tip: string, i: number) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                padding: '11px 14px',
                background: C.limestone,
                borderRadius: 10,
                border: '1px solid rgba(27,26,23,0.06)',
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: `${C.faience}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <CheckCircle size={12} color={C.faience} strokeWidth={2.5} />
              </div>
              <span
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '13px',
                  color: '#5C5346',
                  lineHeight: 1.6,
                }}
              >
                {tip}
              </span>
            </div>
          ))}
        </div>
      </div>

      {nearby.length > 0 && (
        <div>
          <h3
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: '18px',
              fontWeight: 500,
              color: C.nile,
              marginBottom: 14,
            }}
          >
            Nearby Sites
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {nearby.map((n) => (
              <SiteCard key={n.id} s={n} goSite={(id: number) => router.push(`/app/sites/${id}`)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
