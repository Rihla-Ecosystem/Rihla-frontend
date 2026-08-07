'use client';

import React from 'react';
import { C } from '@/lib/constants/theme';
import SwitchSimple from '@/app/components/settings/SwitchSimple';

type Privacy = {
  locationSharing: boolean;
  activityHistory: boolean;
  dataPersonalization: boolean;
  adPersonalization: boolean;
  profileVisibility: string;
};

export default function PrivacySection({
  privacy,
  setPrivacy,
}: {
  privacy: Privacy;
  setPrivacy: (p: Privacy) => void;
}) {
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
        Privacy & Safety
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
              Location Sharing
            </h3>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: '#666',
                margin: 0,
              }}
            >
              Share location with Rafiq for personalized recommendations
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SwitchSimple
              checked={privacy.locationSharing}
              onChange={(e) => setPrivacy({ ...privacy, locationSharing: e })}
            />
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
              Activity History
            </h3>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: '#666',
                margin: 0,
              }}
            >
              Save your travel history for better insights
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SwitchSimple
              checked={privacy.activityHistory}
              onChange={(e) => setPrivacy({ ...privacy, activityHistory: e })}
            />
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
              Data Personalization
            </h3>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: '#666',
                margin: 0,
              }}
            >
              Use your data to improve recommendations
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SwitchSimple
              checked={privacy.dataPersonalization}
              onChange={(e) => setPrivacy({ ...privacy, dataPersonalization: e })}
            />
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
              Profile Visibility
            </h3>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: '#666',
                margin: 0,
              }}
            >
              Who can see your profile and activity
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={privacy.profileVisibility}
              onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
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
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
