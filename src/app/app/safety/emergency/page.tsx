'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { C } from '@/lib/constants/theme';
import { Glyph } from '@/app/components/atoms';
import { MapPin, X, Send, Flag } from 'lucide-react';
import { TopBar } from '@/app/components/layout/TopBar';
import EmergencyHeader from '@/app/components/safety/EmergencyHeader';
import EmergencyContacts from '@/app/components/safety/EmergencyContacts';
import ScenarioGuide from '@/app/components/safety/ScenarioGuide';
import EmergencyRightColumn from '@/app/components/safety/EmergencyRightColumn';
import ReportIssueModal from '@/app/components/safety/ReportIssueModal';
import { useRafiq } from '@/app/components/rafiq/RafiqProvider';

export default function EmergencyPage() {
  const router = useRouter();
  const { openRafiq } = useRafiq();
  const [called, setCalled] = useState<string | null>(null);
  const [scenario, setScenario] = useState<string | null>(null);
  const [locShared, setLocShared] = useState(false);
  const [step, setStep] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);

  const goBack = () => {
    router.push('/app/safety');
  };

  return (
    <div
      style={{
        flex: '0 0 auto',
        display: 'flex',
        flexDirection: 'column',
        background: '#0D0B09',
        minHeight: '100%',
        width: '100%',
      }}
    >
      <EmergencyHeader goBack={goBack} locShared={locShared} setLocShared={setLocShared} />

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_340px]"
        style={{
          flex: 1,
          padding: '28px 32px',
          gap: 20,
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div>
          <EmergencyContacts called={called} setCalled={setCalled} />
          <button
            onClick={() => setReportOpen(true)}
            style={{
              marginTop: 16,
              width: '100%',
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${C.limestone}18`,
              color: C.limestone,
              borderRadius: 12,
              padding: '12px 16px',
              fontFamily: "'Inter',sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Flag size={15} /> Report a non-emergency issue
          </button>
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
            setRafiq={() => openRafiq()}
          />
        </div>
      </div>

      <ReportIssueModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
