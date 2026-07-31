'use client';

import React from 'react';
import { C } from '@/lib/constants/theme';

export default function AccountSection({ user }: { user: any }) {
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
        Account
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
              Account Information
            </h3>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: '#666',
                margin: 0,
              }}
            >
              {user?.email || 'sara@example.com'}
            </p>
          </div>
          <button
            onClick={() => {}}
            style={{
              background: 'transparent',
              border: `1px solid rgba(27,26,23,0.1)`,
              borderRadius: 8,
              padding: '8px 16px',
              fontFamily: "'Inter',sans-serif",
              fontSize: '13px',
              color: '#1976d2',
              cursor: 'pointer',
            }}
          >
            Edit Profile
          </button>
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
              Security
            </h3>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: '#666',
                margin: 0,
              }}
            >
              Last password change: Jul 15, 2026
            </p>
          </div>
          <button
            onClick={() => {}}
            style={{
              background: 'transparent',
              border: `1px solid rgba(27,26,23,0.1)`,
              borderRadius: 8,
              padding: '8px 16px',
              fontFamily: "'Inter',sans-serif",
              fontSize: '13px',
              color: '#1976d2',
              cursor: 'pointer',
            }}
          >
            Change Password
          </button>
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
              Two-Factor Authentication
            </h3>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: '#666',
                margin: 0,
              }}
            >
              Disabled
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              style={{
                background: 'transparent',
                border: `1px solid rgba(27,26,23,0.1)`,
                borderRadius: 8,
                padding: '8px 12px',
                cursor: 'pointer',
              }}
            >
              Enable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
