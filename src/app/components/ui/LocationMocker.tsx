'use client';

import React, { useState } from 'react';
import { useLocation } from '@/providers/LocationProvider';
import { MapPin, Navigation2 } from 'lucide-react';
import { C } from '@/lib/constants/theme';

const MOCK_LOCATIONS = [
  { name: 'Luxor Temple', gov: 'Luxor', lat: 25.7000, lon: 32.6396 },
  { name: 'Philae Temple', gov: 'Aswan', lat: 24.0150, lon: 32.8842 },
  { name: 'Giza Pyramids', gov: 'Giza', lat: 29.9792, lon: 31.1342 },
  { name: 'Valley of Kings', gov: 'Luxor', lat: 25.7402, lon: 32.6014 },
  { name: 'Karnak Temple', gov: 'Luxor', lat: 25.7188, lon: 32.6573 },
  { name: 'Qaitbay Citadel', gov: 'Alexandria', lat: 31.2138, lon: 29.8856 },
  { name: 'Bibliotheca Alexandrina', gov: 'Alexandria', lat: 31.2089, lon: 29.9092 },
  { name: 'Egyptian Museum', gov: 'Cairo', lat: 30.0478, lon: 31.2336 },
  { name: 'Abu Simbel', gov: 'Aswan', lat: 22.3372, lon: 31.6258 },
  { name: 'Siwa Oasis', gov: 'Matrouh', lat: 29.2032, lon: 25.5195 },
  { name: 'Default Local', gov: 'Giza', lat: 29.9792, lon: 31.1342 }, // Can serve as reset
];

export function LocationMocker() {
  const { setLocationOverride, requestLocation } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            marginBottom: 12,
            background: '#FAF7F0',
            border: '1px solid rgba(27,26,23,0.1)',
            borderRadius: 16,
            boxShadow: '0 12px 32px rgba(27,26,23,0.15)',
            width: 220,
            maxHeight: 400,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: 8,
          }}
        >
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: 600,
              color: '#A89880',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '8px 12px',
              borderBottom: '1px solid rgba(27,26,23,0.05)',
              marginBottom: 8,
            }}
          >
            Teleport to...
          </div>
          
          <button
            onClick={() => {
              requestLocation();
              setIsOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 12px',
              background: 'transparent',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              color: C.nile,
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#F0EBE1')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Navigation2 size={16} />
            Reset to My GPS
          </button>

          {MOCK_LOCATIONS.map((loc, i) => (
            <button
              key={i}
              onClick={() => {
                setLocationOverride(loc.lat, loc.lon, loc.name, loc.gov);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                background: 'transparent',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                color: '#2C1E08',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#F0EBE1')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <MapPin size={16} color={C.terracotta} />
              <div>
                <div>{loc.name}</div>
                <div style={{ fontSize: '11px', color: '#8B7E6A' }}>{loc.gov}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: C.nile,
          color: C.limestone,
          border: 'none',
          boxShadow: '0 8px 24px rgba(11,46,47,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          transform: isOpen ? 'scale(0.95)' : 'scale(1)',
        }}
      >
        <MapPin size={24} />
      </button>
    </div>
  );
}
