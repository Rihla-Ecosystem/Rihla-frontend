'use client';

import React from 'react';
import { C } from '@/lib/constants/theme';

export default function PreferencesSection({
  language,
  setLanguage,
  units,
  setUnits,
  theme,
  setTheme,
}: any) {
  return (
    <div>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: '20px',
          fontWeight: 500,
          color: C.nile,
          marginBottom: 16,
        }}
      >
        Preferences
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: 12,
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
                marginBottom: 4,
              }}
            >
              Language
            </h3>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: '#666',
                margin: 0,
              }}
            >
              Interface language
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                background: '#fff',
                border: '1px solid rgba(27,26,23,0.1)',
                borderRadius: 8,
                padding: '8px 12px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: '#333',
              }}
            >
              <option value="en">English</option>
              <option value="ar">العربية (Arabic)</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: 12,
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
                marginBottom: 4,
              }}
            >
              Units
            </h3>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: '#666',
                margin: 0,
              }}
            >
              Distance and temperature units
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              style={{
                background: '#fff',
                border: '1px solid rgba(27,26,23,0.1)',
                borderRadius: 8,
                padding: '8px 12px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: '#333',
              }}
            >
              <option value="metric">Metric (km, °C)</option>
              <option value="imperial">Imperial (mi, °F)</option>
            </select>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: 12,
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
                marginBottom: 4,
              }}
            >
              Theme
            </h3>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: '#666',
                margin: 0,
              }}
            >
              Appearance settings
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              style={{
                background: '#fff',
                border: '1px solid rgba(27,26,23,0.1)',
                borderRadius: 8,
                padding: '8px 12px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: '#333',
              }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
