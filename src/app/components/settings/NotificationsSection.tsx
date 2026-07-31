'use client';

import React from 'react';
import SwitchSimple from './SwitchSimple';

export default function NotificationsSection({
  notifications,
  setNotifications,
}: {
  notifications: any;
  setNotifications: (n: any) => void;
}) {
  return (
    <div>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: '20px',
          fontWeight: 500,
          marginBottom: 16,
        }}
      >
        Notifications
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
              Push Notifications
            </h3>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: '#666',
                margin: 0,
              }}
            >
              Receive important updates and alerts
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SwitchSimple
              checked={notifications.push}
              onChange={(e) => setNotifications({ ...notifications, push: e })}
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
              Email Notifications
            </h3>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: '#666',
                margin: 0,
              }}
            >
              Weekly summaries and promotional offers
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SwitchSimple
              checked={notifications.email}
              onChange={(e) => setNotifications({ ...notifications, email: e })}
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
              SMS Alerts
            </h3>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: '#666',
                margin: 0,
              }}
            >
              Critical safety alerts only
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SwitchSimple
              checked={notifications.sms}
              onChange={(e) => setNotifications({ ...notifications, sms: e })}
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
              Rafiq Tips
            </h3>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: '#666',
                margin: 0,
              }}
            >
              Personalized recommendations and insights
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SwitchSimple
              checked={notifications.rafiqTips}
              onChange={(e) => setNotifications({ ...notifications, rafiqTips: e })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
