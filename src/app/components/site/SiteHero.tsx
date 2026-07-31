'use client';

import React, { useState, useEffect } from 'react';
import { C } from '@/lib/constants/theme';
import { AlertTriangle, Star } from 'lucide-react';
import { Glyph } from '@/app/components/atoms';

export default function SiteHero({ site }: { site: any }) {
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setImgIdx((p) => (p + 1) % (site.imgs.length || 1)), 5000);
    return () => clearInterval(interval);
  }, [site.imgs.length]);

  return (
    <div style={{ position: 'relative', height: 440, background: C.basalt, flexShrink: 0 }}>
      <img
        src={site.imgs[imgIdx]}
        alt={site.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s' }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg,rgba(27,26,23,0.1) 0%,transparent 40%,rgba(15,61,62,0.65) 100%)',
        }}
      />

      <div style={{ position: 'absolute', bottom: 100, right: 24, display: 'flex', gap: 6 }}>
        {site.imgs.map((img: string, i: number) => (
          <button
            key={i}
            onClick={() => setImgIdx(i)}
            style={{
              width: 48,
              height: 34,
              borderRadius: 6,
              overflow: 'hidden',
              border: `2px solid ${imgIdx === i ? C.limestone : 'transparent'}`,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <span
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '11px',
                  fontWeight: 600,
                  background: site.tag === 'Hidden gem' ? C.copper : C.nile,
                  color: C.limestone,
                  padding: '3px 8px',
                  borderRadius: 99,
                }}
              >
                {site.tag}
              </span>
              <span
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '11px',
                  fontWeight: 600,
                  background: `${C.limestone}15`,
                  color: C.limestone,
                  padding: '3px 8px',
                  borderRadius: 99,
                }}
              >
                {site.cat}
              </span>
              {site.scam && (
                <span
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    background: `${C.alertAmber}90`,
                    color: C.limestone,
                    padding: '3px 10px',
                    borderRadius: 99,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <AlertTriangle size={10} color="#fff" strokeWidth={2.5} /> Scam alert
                </span>
              )}
            </div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 'clamp(28px,4vw,44px)',
                fontWeight: 400,
                color: C.limestone,
                lineHeight: 1.1,
                letterSpacing: '-0.025em',
                marginBottom: 4,
              }}
            >
              {site.name}
            </h1>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontStyle: 'italic',
                fontSize: '18px',
                color: `${C.limestone}70`,
              }}
            >
              {site.nameAr}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                justifyContent: 'flex-end',
                marginBottom: 4,
              }}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={14} color={C.sand} fill={C.sand} strokeWidth={0} />
              ))}
            </div>
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '24px',
                fontWeight: 500,
                color: C.sand,
              }}
            >
              {site.rating}
            </div>
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '12px',
                color: `${C.limestone}55`,
              }}
            >
              {site.reviews.toLocaleString()} reviews
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
