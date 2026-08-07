'use client';

import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { AlertTriangle, Navigation, Star } from 'lucide-react';
import { C } from '@/lib/constants/theme';
import type { RihlaSite } from '@/app/data/rihla-data';

export type SiteCardProps = {
  s: RihlaSite;
  goSite?: (id: number) => void;
};

export function SiteCard({ s, goSite }: SiteCardProps) {
  const router = useRouter();
  const handleClick = () => {
    if (goSite) {
      goSite(s.id);
    } else {
      router.push(`/app/sites/${s.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        background: C.limestone,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(27,26,23,0.07)',
        boxShadow: '0 2px 14px rgba(15,61,62,0.06)',
        cursor: 'pointer',
      }}
    >
      <div style={{ height: 140, position: 'relative' }}>
        <img
          src={s.img}
          alt={s.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg,transparent 40%,rgba(27,26,23,0.5) 100%)',
          }}
        />
        <div style={{ position: 'absolute', top: 8, left: 8 }}>
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '10px',
              fontWeight: 600,
              background: s.tag === 'Hidden gem' ? C.copper : C.nile,
              color: C.limestone,
              padding: '3px 8px',
              borderRadius: 99,
            }}
          >
            {s.tag}
          </span>
        </div>
        {s.scam && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: C.alertAmber,
              width: 22,
              height: 22,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={11} color="#fff" strokeWidth={2.5} />
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 7,
            right: 9,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Navigation size={10} color={C.limestone} strokeWidth={2.5} />
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '10px',
              fontWeight: 600,
              color: C.limestone,
            }}
          >
            {s.dist}
          </span>
        </div>
      </div>
      <div style={{ padding: '12px 13px 14px' }}>
        <div
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: '13px',
            fontWeight: 700,
            color: C.nile,
            marginBottom: 2,
          }}
        >
          {s.name}
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontStyle: 'italic',
            fontSize: '11px',
            color: '#A89880',
            marginBottom: 8,
          }}
        >
          {s.nameAr}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Star size={11} color={C.sand} fill={C.sand} strokeWidth={0} />
            <span
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                color: C.basalt,
              }}
            >
              {s.rating}
            </span>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', color: '#C4B89A' }}>
              ({s.reviews.toLocaleString()})
            </span>
          </div>
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '10px',
              color: '#A89880',
              background: C.limestoneDark,
              padding: '2px 7px',
              borderRadius: 99,
            }}
          >
            {s.cat}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SiteCard;
