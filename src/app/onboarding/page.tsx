'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { C } from '@/lib/constants/theme';
import { Glyph } from '@/app/components/atoms';
import { ArrowRight, ChevronRight, Loader2, CheckCircle } from 'lucide-react';

const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
];

const NATIONALITIES = [
  'United States',
  'United Kingdom',
  'Germany',
  'France',
  'Italy',
  'Spain',
  'China',
  'Japan',
  'Saudi Arabia',
  'United Arab Emirates',
  'Russia',
  'Brazil',
  'Other',
];

const LANGUAGES = ['English', 'Arabic', 'French', 'German', 'Spanish', 'Chinese', 'Russian'];

const BUDGETS = ['budget', 'mid_range', 'luxury'];

const TRAVEL_STYLES = ['solo', 'couple', 'family', 'friends', 'business'];

const ACCOMMODATIONS = ['hotel', 'hostel', 'apartment', 'resort', 'cruise'];

const INTERESTS = [
  'History & Monuments',
  'Museums',
  'Food & Local Cuisine',
  'Shopping & Bazaars',
  'Nature & Desert',
  'Nile Cruises',
  'Beaches & Diving',
  'Photography',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { updateProfile, isInitialized } = useAuth();

  const [gender, setGender] = useState('MALE');
  const [nationality, setNationality] = useState('');
  const [language, setLanguage] = useState<string[]>(['English']);
  const [budgetLevel, setBudgetLevel] = useState('mid_range');
  const [travelStyle, setTravelStyle] = useState('solo');
  const [accommodationType, setAccommodationType] = useState('hotel');
  const [interests, setInterests] = useState<string[]>([]);
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleLanguage = (lang: string) => {
    setLanguage((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const canContinue =
    nationality.trim().length > 0 && language.length > 0;

  const handleFinish = async () => {
    if (!canContinue || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateProfile({
        gender: gender as 'MALE' | 'FEMALE',
        nationality,
        language,
        budget_level: budgetLevel,
        travel_style: travelStyle,
        accommodation_type: accommodationType,
        interests,
        arrival_date: arrivalDate || undefined,
        departure_date: departureDate || undefined,
      });
      router.push('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save your profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const skip = () => router.push('/app');

  const sectionLabel = (text: string) => (
    <div
      style={{
        fontFamily: "'Inter',sans-serif",
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: C.copper,
        marginBottom: 12,
      }}
    >
      {text}
    </div>
  );

  const pillBtn = (
    active: boolean,
    onClick: () => void,
    label: string,
    activeColor: string = C.nile
  ) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        background: active ? activeColor : 'transparent',
        border: `1.5px solid ${active ? activeColor : 'rgba(27,26,23,0.14)'}`,
        borderRadius: 99,
        padding: '8px 16px',
        fontFamily: "'Inter',sans-serif",
        fontSize: '13px',
        fontWeight: active ? 600 : 400,
        color: active ? C.limestone : '#6B6354',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 640 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: `${C.faience}15`,
              border: `1px solid ${C.faience}30`,
              borderRadius: 99,
              padding: '6px 16px 6px 10px',
              marginBottom: 20,
            }}
          >
            <Glyph size={16} />
            <span
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '11px',
                fontWeight: 600,
                color: C.faience,
                letterSpacing: '0.06em',
              }}
            >
              TELL US ABOUT YOUR JOURNEY
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 'clamp(30px,5vw,48px)',
              fontWeight: 300,
              color: C.nile,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: 10,
            }}
          >
            Shape your <span style={{ fontStyle: 'italic', color: C.terracotta }}>Egypt</span>
          </h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '15px', color: '#8B7E6A' }}>
            A few details help Rafiq tailor recommendations just for you.
          </p>
        </div>

        <div
          style={{
            background: C.limestone,
            borderRadius: 20,
            padding: '32px',
            boxShadow: '0 8px 40px rgba(15,61,62,0.10)',
            display: 'flex',
            flexDirection: 'column',
            gap: 26,
          }}
        >
          {/* Gender */}
          <div>
            {sectionLabel('Gender')}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {GENDERS.map((g) => pillBtn(gender === g.value, () => setGender(g.value), g.label))}
            </div>
          </div>

          {/* Nationality */}
          <div>
            {sectionLabel('Nationality')}
            <select
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              style={{
                width: '100%',
                background: '#FAF7F0',
                border: '1.5px solid rgba(27,26,23,0.12)',
                borderRadius: 10,
                padding: '11px 14px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '14px',
                color: C.nile,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="">Select your country…</option>
              {NATIONALITIES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            {sectionLabel('Languages you speak')}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {LANGUAGES.map((lang) => pillBtn(language.includes(lang), () => toggleLanguage(lang), lang, C.faience))}
            </div>
          </div>

          {/* Budget */}
          <div>
            {sectionLabel('Budget level')}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {BUDGETS.map((b) => pillBtn(budgetLevel === b, () => setBudgetLevel(b), b.replace('_', ' ')))}
            </div>
          </div>

          {/* Travel style */}
          <div>
            {sectionLabel('Travel style')}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TRAVEL_STYLES.map((ts) => pillBtn(travelStyle === ts, () => setTravelStyle(ts), ts))}
            </div>
          </div>

          {/* Accommodation */}
          <div>
            {sectionLabel('Accommodation')}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ACCOMMODATIONS.map((a) => pillBtn(accommodationType === a, () => setAccommodationType(a), a))}
            </div>
          </div>

          {/* Interests */}
          <div>
            {sectionLabel('Interests')}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {INTERESTS.map((i) => pillBtn(interests.includes(i), () => toggleInterest(i), i, C.copper))}
            </div>
          </div>

          {/* Dates */}
          <div>
            {sectionLabel('Trip dates (optional)')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#A89880', marginBottom: 6 }}>
                  Arrival
                </div>
                <input
                  type="date"
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#FAF7F0',
                    border: '1.5px solid rgba(27,26,23,0.12)',
                    borderRadius: 10,
                    padding: '11px 14px',
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '14px',
                    color: C.nile,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#A89880', marginBottom: 6 }}>
                  Departure
                </div>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#FAF7F0',
                    border: '1.5px solid rgba(27,26,23,0.12)',
                    borderRadius: 10,
                    padding: '11px 14px',
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '14px',
                    color: C.nile,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>

          {error && (
            <div
              style={{
                background: '#FFF5F5',
                border: '1px solid #FECACA',
                borderRadius: 10,
                padding: '12px 14px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: '#991B1B',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
            <button
              onClick={skip}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: "'Inter',sans-serif",
                fontSize: '13px',
                color: '#A89880',
                cursor: 'pointer',
              }}
            >
              Skip for now
            </button>
            <button
              onClick={handleFinish}
              disabled={!canContinue || submitting}
              style={{
                background: C.solar,
                border: 'none',
                borderRadius: 10,
                padding: '13px 26px',
                fontFamily: "'Inter',sans-serif",
                fontSize: '15px',
                fontWeight: 700,
                color: C.basalt,
                cursor: !canContinue || submitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                opacity: !canContinue || submitting ? 0.5 : 1,
                boxShadow: `0 3px 14px ${C.solar}40`,
              }}
            >
              {submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : canContinue ? <CheckCircle size={16} /> : <ChevronRight size={16} />}
              {submitting ? 'Saving…' : 'Finish setup'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
