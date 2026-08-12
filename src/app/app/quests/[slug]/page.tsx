"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { C } from "@/lib/constants/theme";
import { TopBar } from "@/app/components/layout/TopBar";
import {
  journeysApi,
  type Journey,
  type CompleteStepResult,
} from "@/lib/api/journeys";
import {
  CheckCircle2,
  Lock,
  Trophy,
  Medal,
  RefreshCw,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { buildJourneyContext } from '@/lib/rafiq';
import { AskRafiqButton } from '@/app/components/rafiq';

const SCAM_SLUGS = [
  "scam-smart-traveler",
  "taxi-tricks",
  "street-money-exchange",
  "fake-guide-papyrus",
  "atm-card-scam",
];

export default function QuestDetailPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  const [quest, setQuest] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState<CompleteStepResult | null>(null);
  const [completing, setCompleting] = useState<number | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    journeysApi
      .get(slug)
      .then((data) => {
        if (active) setQuest(data);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, retryKey]);

  const handleComplete = async (stepNumber: number) => {
    if (!quest || completing !== null) return;
    setCompleting(stepNumber);
    try {
      const res = await journeysApi.completeStep(quest.slug, stepNumber);
      setToast(res);
      setQuest((q) => (q ? applyResult(q, res) : q));
    } catch {
      // ignore completion error
    } finally {
      setCompleting(null);
    }
  };

  const isScam = SCAM_SLUGS.includes(slug);

  if (loading) {
    return (
      <Shell onBack={() => router.push("/app/quests")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "20px 32px" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ height: 92, background: "rgba(27,26,23,0.06)", borderRadius: 14, animation: "pulse 1.4s ease-in-out infinite" }} />
          ))}
        </div>
      </Shell>
    );
  }

  if (error || !quest) {
    return (
      <Shell onBack={() => router.back()}>
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "22px", color: C.basalt }}>Could not load this quest</div>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            style={{ marginTop: 16, background: C.nile, color: C.limestone, border: "none", borderRadius: 10, padding: "9px 18px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell onBack={() => router.back()}>
      <div style={{ maxWidth: 760, width: "100%", margin: "0 auto", padding: "24px 32px", boxSizing: "border-box" }}>
        {quest.isCompleted && (
          <div style={{ background: `linear-gradient(135deg,${C.safeGreen},#256B48)`, color: "#fff", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <Medal size={22} />
            <div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700 }}>Quest completed</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", opacity: 0.85 }}>
                {isScam ? "You're now scam-smart on the streets of Egypt." : "You walked the path of pharaohs and builders."}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: `${C.nile}70`, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            {isScam ? "Scam Shield" : "Antiquity Explorer"}
          </span>
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(26px,3.4vw,38px)", fontWeight: 400, color: C.basalt, margin: "0 0 6px", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          {quest.title}
        </h1>
        {quest.description && (
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: `${C.basalt}70`, lineHeight: 1.6, margin: "0 0 8px" }}>
            {quest.description}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, color: C.copper }}>+{quest.xpReward} XP</span>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#8B7E6A" }}>
            {quest.completedSteps}/{quest.totalSteps} steps
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {quest.steps.map((step, idx) => {
            const isDone = idx < quest.completedSteps;
            const isCurrent = idx === quest.completedSteps && !quest.isCompleted;
            const isLocked = idx > quest.completedSteps;
            const isFinal = step.stepNumber === quest.totalSteps;
            const stepCtx = buildJourneyContext(quest, idx);
            return (
              <div
                key={step.id}
                style={{
                  background: isCurrent
                    ? "#FFF9EC"
                    : isDone
                      ? "#F1F8F3"
                      : "#FAF7F0",
                  border: isCurrent
                    ? `2px solid ${C.solar}`
                    : isDone
                      ? `1.5px solid ${C.safeGreen}40`
                      : `1px solid rgba(27,26,23,0.1)`,
                  borderRadius: 14,
                  padding: "16px 18px",
                  opacity: isLocked ? 0.5 : 1,
                  display: "flex",
                  gap: 14,
                }}
              >
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  {isDone ? (
                    <CheckCircle2 size={22} color={C.safeGreen} />
                  ) : isCurrent ? (
                    <Sparkles size={22} color={C.solar} />
                  ) : (
                    <Lock size={20} color={C.copper} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "17px", color: C.basalt }}>
                      {step.stepNumber}. {step.title}
                    </span>
                    {!isFinal && (
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: C.copper, background: `${C.copper}12`, borderRadius: 99, padding: "2px 8px" }}>
                        +{step.xpReward} XP
                      </span>
                    )}
                  </div>
                  {step.content && (
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.basalt}70`, lineHeight: 1.55, margin: "6px 0 0" }}>
                      {step.content}
                    </p>
                  )}
                  {isCurrent && (
                    <button
                      onClick={() => handleComplete(step.stepNumber)}
                      disabled={completing !== null}
                      style={{
                        marginTop: 12,
                        background: `linear-gradient(135deg,${C.nile},${C.nileMid})`,
                        color: C.limestone,
                        border: "none",
                        borderRadius: 10,
                        padding: "9px 18px",
                        fontFamily: "'Inter',sans-serif",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: completing !== null ? "default" : "pointer",
                        opacity: completing !== null ? 0.6 : 1,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {completing === step.stepNumber ? "Working…" : isFinal ? "Finish Quest" : "Mark Complete"}
                    </button>
                  )}
                  {isLocked && (
                    <div style={{ marginTop: 6, fontFamily: "'Inter',sans-serif", fontSize: "11px", fontStyle: "italic", color: "#8B7E6A" }}>
                      Complete the previous step to reveal this one.
                    </div>
                  )}
                  {!isLocked && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(27,26,23,0.08)" }}>
                      <AskRafiqButton
                        context={stepCtx}
                        label="Ask Rafiq about this step"
                        variant="ghost"
                        size="sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {toast && <ResultToast result={toast} onClose={() => setToast(null)} />}
    </Shell>
  );
}

function applyResult(q: Journey, r: CompleteStepResult): Journey {
  return {
    ...q,
    completedSteps: r.completed,
    isCompleted: r.journeyCompleted,
    nextStep: r.journeyCompleted ? null : r.completed + 1,
    startedAt: q.startedAt ?? new Date().toISOString(),
    completedAt: r.journeyCompleted ? new Date().toISOString() : q.completedAt,
  };
}

function Shell({ onBack, children }: { onBack: () => void; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg }}>
      <TopBar location="Quest" />
      <div style={{ padding: "16px 32px 0", maxWidth: 760, width: "100%", boxSizing: "border-box", margin: "0 auto" }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", color: C.nile, cursor: "pointer", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          <ChevronLeft size={16} /> Back to quests
        </button>
      </div>
      {children}
    </div>
  );
}

function ResultToast({ result, onClose }: { result: CompleteStepResult; onClose: () => void }) {
  const gotXp = result.xpAwarded > 0;
  const gotBadges = result.badgesAwarded?.length > 0;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1200,
        background: C.basalt,
        border: `1px solid ${C.limestone}15`,
        color: C.limestone,
        borderRadius: 14,
        padding: "16px 22px",
        minWidth: 280,
        boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
        animation: "fadeInUp 0.25s ease-out",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: result.journeyCompleted ? `linear-gradient(135deg,${C.sand},${C.copper})` : `${C.safeGreen}25`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {result.journeyCompleted ? <Trophy size={20} color={C.limestone} /> : <CheckCircle2 size={20} color={C.safeGreen} />}
        </div>
        <div>
          {gotXp && (
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.sand }}>
              +{result.xpAwarded} XP
            </div>
          )}
          {gotBadges &&
            result.badgesAwarded.map((b) => (
              <div key={b} style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: C.solar }}>
                Badge earned: {b}
              </div>
            ))}
          {!gotXp && !gotBadges && (
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px" }}>Quest progress saved</div>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        style={{ position: "absolute", top: 10, right: 12, background: "none", border: "none", color: `${C.limestone}60`, cursor: "pointer", fontSize: "16px" }}
      >
        ×
      </button>
    </div>
  );
}