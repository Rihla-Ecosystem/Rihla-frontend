"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { C } from "@/lib/constants/theme";
import { WebField } from "@/app/components/atoms";
import { AuthShell } from "@/app/components/layout/AuthShell";
import { AlertTriangle, ArrowRight, ChevronLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw]       = useState("");

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearError();
    try {
      await login({ email, password: pw });
      router.push("/app");
    } catch {
      // Error is stored in AuthContext and displayed
    }
  };

  return (
    <AuthShell>
      <button onClick={() => { clearError(); router.push("/"); }} style={{ background: "none", border: "none", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#8B7E6A", cursor: "pointer", marginBottom: 36, padding: 0 }}><ChevronLeft size={15} strokeWidth={2}/> Back to Rihla</button>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,3vw,36px)", fontWeight: 400, color: C.nile, letterSpacing: "-0.025em", marginBottom: 6 }}>Welcome back.</h1>
      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "#8B7E6A", marginBottom: 28 }}>Continue your Egyptian journey.</p>
      
      {error && (
        <div style={{ background: `${C.signalRed}12`, border: `1px solid ${C.signalRed}30`, borderRadius: 10, padding: "10px 14px", marginBottom: 18, color: C.signalRed, fontFamily: "'Inter',sans-serif", fontSize: "13px", display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={16} color={C.signalRed} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <WebField label="Email Address" placeholder="sara@example.com" type="email" value={email} onChange={e => { clearError(); setEmail(e.target.value); }}/>
        <WebField label="Password" placeholder="Your password" type="password" value={pw} onChange={e => { clearError(); setPw(e.target.value); }}/>
        <div style={{ textAlign: "right", marginTop: -6 }}><button type="button" onClick={() => router.push("/forgot-password")} style={{ background: "none", border: "none", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.faience, cursor: "pointer" }}>Forgot password?</button></div>
        <button type="submit" disabled={isLoading} style={{ width: "100%", background: C.solar, border: "none", borderRadius: 10, padding: "13px 24px", fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.basalt, cursor: isLoading ? "wait" : "pointer", opacity: isLoading ? 0.7 : 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: `0 4px 18px ${C.solar}40` }}>
          {isLoading ? "Signing in..." : "Sign in to Rihla"} {!isLoading && <ArrowRight size={16} strokeWidth={2.5}/>}
        </button>
      </form>
      <div style={{ textAlign: "center", marginTop: 24 }}><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#8B7E6A" }}>New to Rihla? </span><button onClick={() => { clearError(); router.push("/signup"); }} style={{ background: "none", border: "none", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.faience, cursor: "pointer" }}>Create an account</button></div>
    </AuthShell>
  );
}