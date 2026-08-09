"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { C } from "@/lib/constants/theme";
import { WebField } from "@/app/components/atoms";
import { AuthShell } from "@/app/components/layout/AuthShell";
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronLeft, Loader2, Mail } from "lucide-react";

type State = "verifying" | "success" | "error" | "resending";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { verifyEmail, resendVerification } = useAuth();

  const [state, setState] = useState<State>(token ? "verifying" : "error");
  const [error, setError] = useState<string | null>(token ? null : "This verification link is missing a token.");
  const [email, setEmail] = useState("");
  const [resended, setResended] = useState(false);
  const ranRef = useRef(false);

  React.useEffect(() => {
    if (!token || ranRef.current) return;
    ranRef.current = true;
    (async () => {
      try {
        await verifyEmail(token);
        setState("success");
      } catch (err) {
        setError(err instanceof Error ? err.message : "This verification link is invalid or has expired.");
        setState("error");
      }
    })();
  }, [token, verifyEmail]);

  const onResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setState("error");
      setError("Please enter the email address you registered with.");
      return;
    }
    setState("resending");
    try {
      await resendVerification(email.trim());
      setResended(true);
      setState("error");
      setError("");
    } catch {
      setState("error");
      setError("Could not resend the link. Please try again shortly.");
    }
  };

  return (
    <AuthShell>
      <button onClick={() => router.push("/")} style={{ background: "none", border: "none", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#8B7E6A", cursor: "pointer", marginBottom: 36, padding: 0 }}>
        <ChevronLeft size={15} strokeWidth={2} /> Back to Rihla
      </button>

      {state === "verifying" && (
        <div style={{ textAlign: "left" }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: `${C.faience}14`, border: `1px solid ${C.faience}30`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Loader2 size={24} color={C.faience} className="animate-spin" />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,3vw,36px)", fontWeight: 400, color: C.nile, letterSpacing: "-0.025em", marginBottom: 6 }}>Verifying your email…</h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "#8B7E6A", marginBottom: 8 }}>We are activating your account with the server.</p>
        </div>
      )}

      {state === "success" && (
        <>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: `${C.safeGreen}16`, border: `1px solid ${C.safeGreen}35`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <CheckCircle2 size={26} color={C.safeGreen} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,3vw,36px)", fontWeight: 400, color: C.nile, letterSpacing: "-0.025em", marginBottom: 6 }}>Email verified. Welcome aboard.</h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "#8B7E6A", marginBottom: 28 }}>Your account is active — sign in and continue your Egyptian journey.</p>
          <button onClick={() => router.push("/login")} style={{ width: "100%", background: C.solar, border: "none", borderRadius: 10, padding: "13px 24px", fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.basalt, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: `0 4px 18px ${C.solar}40` }}>
            Sign in to Rihla <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </>
      )}

      {(state === "error" || state === "resending") && (
        <>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: `${C.signalRed}12`, border: `1px solid ${C.signalRed}30`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <AlertTriangle size={24} color={C.signalRed} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,3vw,36px)", fontWeight: 400, color: C.nile, letterSpacing: "-0.025em", marginBottom: 6 }}>{error ? "Verification failed" : "Link sent"}</h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "#8B7E6A", marginBottom: 24 }}>
            {resended
              ? "If that address matches an account, a fresh verification email is on its way. Please check your inbox (and spam) and click the new link."
              : error || "This link is invalid or has expired — request a new one below."}
          </p>

          <form onSubmit={onResend} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <WebField label="Registered Email" placeholder="sara@example.com" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} />
            <button type="submit" disabled={state === "resending"} style={{ width: "100%", background: C.nile, border: "none", borderRadius: 10, padding: "13px 24px", fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.limestone, cursor: state === "resending" ? "wait" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, opacity: state === "resending" ? 0.7 : 1 }}>
              {state === "resending" ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
              {state === "resending" ? "Sending…" : "Resend verification email"}
            </button>
          </form>

          <button onClick={() => router.push("/login")} style={{ marginTop: 16, width: "100%", background: "none", border: "1.5px solid rgba(27,26,23,0.16)", borderRadius: 10, padding: "11px 24px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.nile, cursor: "pointer" }}>
            Go to sign in
          </button>
        </>
      )}
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthShell><div>Loading…</div></AuthShell>}>
      <VerifyEmailContent />
    </Suspense>
  );
}