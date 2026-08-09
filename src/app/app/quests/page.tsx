"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { C } from "@/lib/constants/theme";
import { TopBar } from "@/app/components/layout/TopBar";
import { journeysApi, type Journey } from "@/lib/api/journeys";
import { useDemoStore } from "@/lib/demoStore";
import { ShieldCheck, Landmark, CheckCircle2, Lock, RefreshCw, WifiOff, FlaskConical } from "lucide-react";
import { buildJourneyContext, buildRafiqUrl } from '@/lib/rafiq';
import { AskRafiqButton } from '@/app/components/rafiq';

const SCAM_SLUGS = [
  "scam-smart-traveler",
  "taxi-tricks",
  "street-money-exchange",
  "fake-guide-papyrus",
  "atm-card-scam",
];

const ARCHAEOLOGY_SLUGS = [
  "giza-plateau",
  "karnak-luxor",
  "abu-simbel-nubia",
  "coptic-islamic-cairo",
];

export default function QuestsPage() {
  const router = useRouter();
  const demo = useDemoStore();
  const [quests, setQuests] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    if (demo.mode === 'on') {
      setError(false);
      setLoading(false);
      return;
    }
    journeysApi
      .list()
      .then((data) => {
        if (active) setQuests(data || []);
      })
      .catch(() => {
        if (active) {
          setError(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [retryKey, demo.mode]);

  const scamQuests = SCAM_SLUGS.map((slug) => quests.find((q) => q.slug === slug)).filter(
    (q): q is Journey => !!q
  );
  const archaeologyQuests = ARCHAEOLOGY_SLUGS.map((slug) =>
    quests.find((q) => q.slug === slug)
  ).filter((q): q is Journey => !!q);

  const toggleDemoMode = () => {
    if (demo.mode === 'on') {
      localStorage.removeItem('rihla_demo_data');
    } else {
      localStorage.setItem('rihla_demo_data', JSON.stringify({
        mode: 'on',
        visits: [],
        xp: 250,
        badges: ['First Steps', 'Giza Explorer'],
        quests: { 'scam-smart-traveler': { completedSteps: 2, totalSteps: 5, isCompleted: false } },
        walletBalance: 1200,
        lifetimeTokens: 250
      }));
    }
    window.location.reload();
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg }}>
      <TopBar location="Quests & Journeys" onRafiq={() => router.push("/app/rafiq")} />

      <div
        style={{
          background: `linear-gradient(135deg,${C.nile},${C.nileMid})`,
          padding: "26px 32px",
          flexShrink: 0,
        }}
      >
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: `${C.limestone}55`, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>
            Guided Journeys
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: 400, color: C.limestone, lineHeight: 1.1, margin: 0 }}>
            Quests for the <span style={{ fontStyle: "italic", color: C.sand }}>curious traveler</span>
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 1040, width: "100%", margin: "0 auto", padding: "24px 32px", boxSizing: "border-box", flex: 1 }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: 150, background: "rgba(27,26,23,0.06)", borderRadius: 14, animation: "pulse 1.4s ease-in-out infinite" }} />
            ))}
          </div>
        ) : (
          <>
            {error && (
              <div style={{ background: "#FFF8EC", border: `1px solid ${C.sand}40`, borderRadius: 12, padding: "14px 18px", marginBottom: 22, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <WifiOff size={16} color={C.copper} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: "#7A5A1E" }}>
                  Offline preview — showing quests from the Rihla guidebook. Your live progress will appear when you reconnect.
                </span>
                <button
                  onClick={() => setRetryKey((k) => k + 1)}
                  style={{
                    background: C.nile,
                    color: C.limestone,
                    border: "none",
                    borderRadius: 8,
                    padding: "7px 14px",
                    fontFamily: "'Inter',sans-serif",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <RefreshCw size={13} /> Retry
                </button>
              </div>
            )}
            <QuestSection
              title="Scam Shield"
              subtitle="Learn to spot the tricks of the bazaar — and travel smart."
              icon={<ShieldCheck size={17} color={C.safeGreen} />}
              quests={scamQuests}
              router={router}
            />
            <QuestSection
              title="Antiquity Explorer"
              subtitle="Follow the trail of pharaohs across Egypt's great monuments."
              icon={<Landmark size={17} color={C.copper} />}
              quests={archaeologyQuests}
              router={router}
            />
            {/* Test toggle for demo mode */}
            <div style={{ marginTop: 24, padding: "16px", background: "rgba(27,26,23,0.04)", borderRadius: 12, border: "1px dashed rgba(27,26,23,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FlaskConical size={16} color={C.copper} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.basalt }}>Demo Mode</span>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A" }}>Use mock data for testing</span>
              </div>
              <button
              onClick={toggleDemoMode}
                style={{
                  background: demo.mode === 'on' ? C.signalRed : C.nile,
                  color: C.limestone,
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontFamily: "'Inter',sans-serif",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {demo.mode === 'on' ? 'Disable Demo' : 'Enable Demo'} <RefreshCw size={13} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function QuestSection({
  title,
  subtitle,
  icon,
  quests,
  router,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  quests: Journey[];
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        {icon}
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "22px", color: C.basalt, margin: 0 }}>
          {title}
        </h2>
      </div>
      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#8B7E6A", margin: "0 0 14px 27px" }}>
        {subtitle}
      </p>
      {quests.length === 0 ? (
        <div style={{ background: "rgba(27,26,23,0.04)", borderRadius: 14, padding: 26, textAlign: "center", fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", color: "#8B7E6A" }}>
          No quests available yet.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {quests.map((q) => (
            <QuestCard key={q.id} quest={q} onClick={() => router.push(`/app/quests/${q.slug}`)} />
          ))}
        </div>
      )}
    </section>
  );
}

function QuestCard({ quest, onClick }: { quest: Journey; onClick: () => void }) {
  const pct = quest.totalSteps > 0 ? (quest.completedSteps / quest.totalSteps) * 100 : 0;
  const status = quest.isCompleted
    ? { label: "Completed", color: C.safeGreen, bg: `${C.safeGreen}12` }
    : quest.completedSteps > 0
      ? { label: "In progress", color: C.solar, bg: `${C.solar}14` }
      : { label: "Not started", color: "#8B7E6A", bg: "rgba(27,26,23,0.06)" };

  const ctx = buildJourneyContext(quest, quest.completedSteps);

  return (
    <button
      onClick={onClick}
      style={{
        background: quest.isCompleted ? "#F1F8F3" : "#FAF7F0",
        border: quest.isCompleted ? `1.5px solid ${C.safeGreen}40` : `1px solid rgba(27,26,23,0.1)`,
        borderRadius: 14,
        padding: "16px 18px",
        textAlign: "left",
        cursor: "pointer",
        transition: "all 0.15s",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", color: C.basalt, lineHeight: 1.2 }}>
          {quest.title}
        </span>
        {quest.isCompleted ? (
          <CheckCircle2 size={20} color={C.safeGreen} />
        ) : quest.completedSteps > 0 ? (
          <Lock size={18} color={C.solar} />
        ) : null}
      </div>
      {quest.description && (
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.basalt}65`, margin: 0, lineHeight: 1.5 }}>
          {quest.description}
        </p>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ background: status.bg, color: status.color, borderRadius: 99, padding: "3px 10px", fontSize: "11px", fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>
          {status.label}
        </span>
        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, color: C.copper }}>
          +{quest.xpReward} XP
        </span>
        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A" }}>
          {quest.completedSteps}/{quest.totalSteps} steps
        </span>
      </div>
      <div style={{ background: "rgba(27,26,23,0.08)", borderRadius: 99, height: 6, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: quest.isCompleted ? C.safeGreen : C.solar, borderRadius: 99 }} />
      </div>
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(27,26,23,0.08)" }}>
        <AskRafiqButton
          context={ctx}
          label="Ask Rafiq about this quest"
          variant="ghost"
          size="sm"
        />
      </div>
    </button>
  );
}
