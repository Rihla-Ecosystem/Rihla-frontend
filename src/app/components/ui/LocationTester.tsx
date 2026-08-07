"use client";

import React, { useState } from 'react';
import { useLocation } from '@/providers/LocationProvider';
import { C } from '@/lib/constants/theme';
import { MapPin, Settings2 } from 'lucide-react';

const TEST_LOCATIONS = [
  { name: 'Luxor Temple', gov: 'Luxor', lat: 25.6995, lon: 32.6396 },
  { name: 'Giza Pyramids', gov: 'Giza', lat: 29.9792, lon: 31.1342 },
  { name: 'Aswan High Dam', gov: 'Aswan', lat: 23.9716, lon: 32.8804 },
  { name: 'Fayoum (Wadi Rayan)', gov: 'Fayoum', lat: 29.1306, lon: 30.3853 },
  { name: 'Alexandria Library', gov: 'Alexandria', lat: 31.2089, lon: 29.9092 },
  { name: 'St. Catherine, Sinai', gov: 'South Sinai', lat: 28.5562, lon: 33.9757 },
  { name: 'Current Location', gov: '', lat: 0, lon: 0, reset: true }
];

export function LocationTester() {
  const { setLocationOverride, requestLocation } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSelect = (loc: typeof TEST_LOCATIONS[0]) => {
    if (loc.reset) {
      requestLocation();
    } else {
      setLocationOverride(loc.lat, loc.lon, loc.name, loc.gov);
    }
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
      {isOpen && (
        <div
          style={{
            marginBottom: 16,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid #E5E0D8',
            borderRadius: 16,
            padding: 16,
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            minWidth: 200,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
              paddingBottom: 8,
              borderBottom: '1px solid #E5E0D8',
            }}
          >
            <MapPin size={16} color={C.limestone} />
            <span style={{ fontWeight: 600, fontSize: 14, color: '#2C3E50', fontFamily: "'Inter', sans-serif" }}>
              Test Locations
            </span>
          </div>
          {TEST_LOCATIONS.map((loc) => (
            <button
              key={loc.name}
              onClick={() => handleSelect(loc)}
              style={{
                textAlign: 'left',
                fontSize: 14,
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                color: '#2C3E50',
                fontFamily: "'Inter', sans-serif",
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F8F9FA')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {loc.name}
              {loc.gov && (
                <span style={{ display: 'block', fontSize: 12, color: '#7F8C8D', marginTop: 2 }}>
                  {loc.gov}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          background: '#FFFFFF',
          borderRadius: 24,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E5E0D8',
          cursor: 'pointer',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.2s',
        }}
        title="Test Location Override"
      >
        <Settings2 size={24} color={C.limestone} />
      </button>
    </div>
  );
}
