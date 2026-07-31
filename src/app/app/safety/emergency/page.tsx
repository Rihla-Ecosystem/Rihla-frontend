'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { C } from '@/lib/constants/theme';
import { Glyph } from '@/app/components/atoms';
import { MapPin, X, Send } from 'lucide-react';
import { TopBar } from '@/app/components/layout/TopBar';
import EmergencyHeader from '@/app/components/safety/EmergencyHeader';
import EmergencyContacts from '@/app/components/safety/EmergencyContacts';
import ScenarioGuide from '@/app/components/safety/ScenarioGuide';
import EmergencyRightColumn from '@/app/components/safety/EmergencyRightColumn';

export default function EmergencyPage() {
  const router = useRouter();
  const [called, setCalled] = useState<string | null>(null);
  const [scenario, setScenario] = useState<string | null>(null);
  const [locShared, setLocShared] = useState(false);
  const [step, setStep] = useState(0);
  const [rafiq, setRafiq] = useState(false);

  const goBack = () => {
    router.push('/app/safety');
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#0D0B09',
        minHeight: '100%',
      }}
    >
      <EmergencyHeader goBack={goBack} locShared={locShared} setLocShared={setLocShared} />

      <div
        style={{
          flex: 1,
          padding: '28px 32px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 340px',
          gap: 20,
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div>
          <EmergencyContacts called={called} setCalled={setCalled} />
        </div>

        <div>
          <ScenarioGuide
            scenario={scenario}
            setScenario={setScenario}
            step={step}
            setStep={setStep}
            setCalled={setCalled}
          />
        </div>

        <div>
          <EmergencyRightColumn
            locShared={locShared}
            setLocShared={setLocShared}
            setRafiq={setRafiq}
          />
        </div>
      </div>
    </div>
  );
}
