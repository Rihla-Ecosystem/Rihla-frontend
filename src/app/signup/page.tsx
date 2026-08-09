"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { C } from "@/lib/constants/theme";
import { WebField } from "@/app/components/atoms";
import { AuthShell } from "@/app/components/layout/AuthShell";
import { AlertTriangle, ArrowRight, ChevronLeft, Loader2, Mail } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError, resendVerification } = useAuth();
  const [step, setStep] = useState(1);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resended, setResended] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", nationality: "", gender: "", style: "" });
  const [localErr, setLocalErr] = useState<string | null>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setLocalErr(null);
    clearError();
    setForm(f => ({ ...f, [k]: e.target.value }));
  };

  const handleNextStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setLocalErr("Please fill in your name, email, and password.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setLocalErr("Please enter a valid email address.");
      return;
    }
    if (form.password.length < 8) {
      setLocalErr("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setLocalErr("Password must contain at least 1 uppercase letter.");
      return;
    }
    if (!/[0-9]/.test(form.password)) {
      setLocalErr("Password must contain at least 1 number.");
      return;
    }
    setLocalErr(null);
    clearError();
    setStep(2);
  };

  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLocalErr(null);
    clearError();
    try {
      const genderVal = form.gender.toUpperCase() === "FEMALE" ? "FEMALE" : "MALE";
      await register({
        email: form.email.trim(),
        password: form.password,
        display_name: form.name.trim(),
        gender: genderVal,
        nationality: form.nationality || "Egyptian",
        language: ["English"],
        travel_style: form.style || "Explorer",
      });
      // Registration requires email verification before login — send them to the check-inbox state
      setRegisteredEmail(form.email.trim());
      setStep(3);
    } catch (err: unknown) {
      // If the backend returns a validation error related to credentials, switch back to step 1
      const errMsg = err instanceof Error ? err.message : String(err);
      if (
        errMsg.toLowerCase().includes("email") ||
        errMsg.toLowerCase().includes("password") ||
        errMsg.toLowerCase().includes("account") ||
        errMsg.toLowerCase().includes("uppercase") ||
        errMsg.toLowerCase().includes("number") ||
        errMsg.toLowerCase().includes("character")
      ) {
        setStep(1);
      }
    }
  };

  const onResend = async () => {
    if (!registeredEmail) return;
    setResending(true);
    try {
      await resendVerification(registeredEmail);
      setResended(true);
    } finally {
      setResending(false);
    }
  };

  const activeError = localErr || error;

  return (
    <AuthShell>
      <button onClick={() => { clearError(); step === 1 ? router.push("/") : setStep(1); }} style={{ background: "none", border: "none", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#8B7E6A", cursor: "pointer", marginBottom: 32, padding: 0 }}>
        <ChevronLeft size={15} strokeWidth={2}/> Back
      </button>
      <div style={{ display: "flex", gap: 6, marginBottom: 28, alignItems: "center" }}>
        {step <= 2 && (
        <>
        {[1,2].map(s => <div key={s} style={{ height: 3, width: s === step ? 32 : 16, borderRadius: 99, background: s <= step ? C.nile : C.limestoneDark, transition: "all 0.3s ease" }}/>)}
        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880", marginLeft: 8 }}>Step {step} of 2</span>
        </>
        )}
      </div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,3vw,36px)", fontWeight: 400, color: C.nile, letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: 6 }}>{step === 1 ? "Create your account" : step === 2 ? "Your travel profile" : "Check your inbox"}</h1>
      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "#8B7E6A", marginBottom: 28 }}>{step === 1 ? "Start your Egyptian journey — free forever." : step === 2 ? "Helps Rafiq personalise every recommendation." : `We sent a verification link to ${registeredEmail}.`}</p>
      
      {activeError && (
        <div style={{ background: `${C.signalRed}12`, border: `1px solid ${C.signalRed}30`, borderRadius: 10, padding: "10px 14px", marginBottom: 18, color: C.signalRed, fontFamily: "'Inter',sans-serif", fontSize: "13px", display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={16} color={C.signalRed} style={{ flexShrink: 0 }} />
          <span>{activeError}</span>
        </div>
      )}

{step === 1 && (
        <form onSubmit={handleNextStep} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <WebField label="Full Name" placeholder="Sara Al-Rashid" value={form.name} onChange={set("name")}/>
          <WebField label="Email Address" placeholder="sara@example.com" type="email" value={form.email} onChange={set("email")}/>
          <WebField label="Password" placeholder="Min. 8 chars, 1 uppercase, 1 number" type="password" value={form.password} onChange={set("password")}/>
          <button type="submit" style={{ width: "100%", background: C.solar, border: "none", borderRadius: 10, padding: "13px 24px", fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.basalt, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: `0 4px 18px ${C.solar}40` }}>Continue <ArrowRight size={16} strokeWidth={2.5}/></button>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#A89880", textAlign: "center" }}>By continuing you agree to Rihla's <span style={{ color: C.faience, fontWeight: 600 }}>Terms</span> and <span style={{ color: C.faience, fontWeight: 600 }}>Privacy Policy</span></p>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSignUp} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.nile, display: "block", marginBottom: 7 }}>Nationality</label><div style={{ background: "#FAF7F0", border: "1.5px solid rgba(27,26,23,0.12)", borderRadius: 10, padding: "12px 14px" }}><select value={form.nationality} onChange={set("nationality")} style={{ background: "transparent", border: "none", outline: "none", fontFamily: "'Inter',sans-serif", fontSize: "15px", color: form.nationality ? C.basalt : "#A89880", width: "100%", cursor: "pointer" }}><option value="" disabled>Select your nationality</option>{["German","British","American","French","Italian","Japanese","Australian","Canadian","Egyptian","Other"].map(o => <option key={o} value={o}>{o}</option>)}</select></div></div>
          <div><label style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.nile, display: "block", marginBottom: 7 }}>Gender</label><div style={{ display: "flex", gap: 8 }}>{["Male","Female"].map(g => <button type="button" key={g} onClick={() => setForm(f => ({ ...f, gender: g }))} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1.5px solid ${form.gender === g ? C.nile : "rgba(27,26,23,0.12)"}`, background: form.gender === g ? `${C.nile}08` : "#FAF7F0", fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: form.gender === g ? 700 : 400, color: form.gender === g ? C.nile : "#8B7E6A", cursor: "pointer" }}>{g}</button>)}</div></div>
          <div><label style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.nile, display: "block", marginBottom: 7 }}>Travel Style</label><div style={{ background: "#FAF7F0", border: "1.5px solid rgba(27,26,23,0.12)", borderRadius: 10, padding: "12px 14px" }}><select value={form.style} onChange={set("style")} style={{ background: "transparent", border: "none", outline: "none", fontFamily: "'Inter',sans-serif", fontSize: "15px", color: form.style ? C.basalt : "#A89880", width: "100%", cursor: "pointer" }}><option value="" disabled>Select your travel style</option>{["Explorer","Culture Lover","Foodie","Adventure Seeker","Relaxation Seeker","History Buff"].map(o => <option key={o} value={o}>{o}</option>)}</select></div></div>
          <button type="submit" disabled={isLoading} style={{ width: "100%", background: C.solar, border: "none", borderRadius: 10, padding: "13px 24px", fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.basalt, cursor: isLoading ? "default" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: isLoading ? "none" : `0 4px 18px ${C.solar}40` }}>
            {isLoading ? "Creating account..." : <>Create Account <ArrowRight size={16} strokeWidth={2.5}/></>}
          </button>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#A89880", textAlign: "center" }}>Already have an account? <button onClick={() => router.push("/login")} style={{ background: "none", border: "none", color: C.faience, fontWeight: 600, cursor: "pointer" }}>Sign in</button></p>
        </form>
      )}

      {step >= 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: `${C.faience}14`, border: `1px solid ${C.faience}30`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Mail size={26} color={C.faience} />
          </div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "#8B7E6A", lineHeight: 1.6 }}>
            {resended
              ? "We just resent the link — check your inbox (and spam folder) and click <strong>Verify your email</strong>."
              : <>Click the link in the email to activate your account, then sign in. The link expires quickly, but you can resend it anytime below.</>}
          </p>
          <button onClick={onResend} disabled={resending || resended} style={{ width: "100%", background: C.nile, border: "none", borderRadius: 10, padding: "13px 24px", fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.limestone, cursor: resending || resended ? "default" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, opacity: resending || resended ? 0.6 : 1 }}>
            {resending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
            {resending ? "Sending…" : resended ? "Link sent again" : "Resend verification email"}
          </button>
          <button onClick={() => router.push("/login")} style={{ width: "100%", background: "none", border: "1.5px solid rgba(27,26,23,0.16)", borderRadius: 10, padding: "11px 24px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.nile, cursor: "pointer" }}>
            Go to sign in
          </button>
        </div>
      )}
    </AuthShell>
  );
}