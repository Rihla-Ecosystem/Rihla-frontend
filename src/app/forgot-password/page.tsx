'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { C } from '@/lib/constants/theme';
import { Glyph } from '@/app/components/atoms';
import { authService } from '@/lib/auth/auth-service';
import { ArrowLeft, Loader2, CheckCircle, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 18 }}>
            <Glyph size={26} />
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 'clamp(28px,4vw,40px)',
              fontWeight: 300,
              color: C.nile,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: 8,
            }}
          >
            Reset your <span style={{ fontStyle: 'italic', color: C.terracotta }}>password</span>
          </h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '14px', color: '#8B7E6A' }}>
            We&apos;ll email you a link to create a new one.
          </p>
        </div>

        <div
          style={{
            background: C.limestone,
            borderRadius: 18,
            padding: '28px',
            boxShadow: '0 8px 40px rgba(15,61,62,0.10)',
          }}
        >
          {sent ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: `${C.safeGreen}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: C.safeGreen,
                }}
              >
                <CheckCircle size={26} strokeWidth={2} />
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '15px', fontWeight: 600, color: C.nile, marginBottom: 8 }}>
                Check your inbox
              </div>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: '#8B7E6A', lineHeight: 1.6, marginBottom: 20 }}>
                If an account exists for <strong>{email}</strong>, we&apos;ve sent password reset
                instructions.
              </p>
              <button
                onClick={() => router.push('/login')}
                style={{
                  background: C.solar,
                  border: 'none',
                  borderRadius: 9,
                  padding: '11px 22px',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '14px',
                  fontWeight: 700,
                  color: C.basalt,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Mail size={15} /> Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label
                style={{
                  display: 'block',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '12px',
                  fontWeight: 600,
                  color: C.nile,
                  marginBottom: 8,
                }}
              >
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: '#FAF7F0',
                  border: '1.5px solid rgba(27,26,23,0.12)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '14px',
                  color: C.nile,
                  outline: 'none',
                  marginBottom: 16,
                }}
              />

              {error && (
                <div
                  style={{
                    background: '#FFF5F5',
                    border: '1px solid #FECACA',
                    borderRadius: 10,
                    padding: '11px 14px',
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '13px',
                    color: '#991B1B',
                    marginBottom: 14,
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: C.solar,
                  border: 'none',
                  borderRadius: 10,
                  padding: '13px',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '15px',
                  fontWeight: 700,
                  color: C.basalt,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  boxShadow: `0 3px 14px ${C.solar}40`,
                }}
              >
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Send reset link'}
              </button>
            </form>
          )}

          <button
            onClick={() => router.push('/login')}
            style={{
              marginTop: 18,
              background: 'none',
              border: 'none',
              fontFamily: "'Inter',sans-serif",
              fontSize: '13px',
              color: '#A89880',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginLeft: 'auto',
            }}
          >
            <ArrowLeft size={14} /> Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
}
