"use client";

import { useState, useCallback, useEffect } from "react";
import { BookOpen, LogOut, Check, Loader2, Wallet, Coins, CreditCard } from "lucide-react";
import { C } from "@/lib/constants/theme";
import { Geom, Glyph } from "@/app/components/atoms";
import { TopBar } from "@/app/components/layout/TopBar";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { userService } from "@/services/userService";
import { historyService } from "@/services/historyService";
import { walletApi, type TokenPackage } from "@/lib/api/wallet";
import { useAppSettings, setAppSettings, syncAppSettingsFromServer, type AppUnits } from "@/lib/settingsStore";

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{ width: 44, height: 24, borderRadius: 99, background: on ? C.faience : "#D4CBB8", border: "none", cursor: "pointer", position: "relative", transition: "background 0.22s", flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: on ? 23 : 3, transition: "left 0.22s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

function SettingsRow({ label, sub, right, border = true }: { label: string; sub?: string; right: React.ReactNode; border?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: border ? "1px solid rgba(27,26,23,0.06)" : "none", gap: 16 }}>
      <div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 600, color: C.nile }}>{label}</div>
        {sub && <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#A89880", marginTop: 2, lineHeight: 1.4 }}>{sub}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{right}</div>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: C.limestone, borderRadius: 16, padding: "6px 22px 6px", border: "1px solid rgba(27,26,23,0.07)", marginBottom: 16 }}>
      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: C.copper, letterSpacing: "0.14em", textTransform: "uppercase", padding: "14px 0 8px" }}>{title}</div>
      {children}
    </div>
  );
}

const RAFIQ_PERSONAS = [
  { id: "guide", label: "The Guide", icon: "🧭", desc: "Practical, efficient, safety-first. Answers quickly and clearly." },
  { id: "historian", label: "The Historian", icon: "📜", desc: "Deep cultural context, stories, etymology. Takes its time." },
  { id: "local", label: "The Local", icon: "🫖", desc: "Warm, conversational, opinionated. Feels like a Cairo friend." },
];

const APP_LANGUAGES = ["English", "العربية", "Deutsch", "Français", "日本語", "Español"];

export default function PageSettings() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const settings = useAppSettings();

  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Wallet state
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletLifetime, setWalletLifetime] = useState<number>(0);
  const [walletLoading, setWalletLoading] = useState(false);

  useEffect(() => {
    if (user) {
      syncAppSettingsFromServer();
      loadWallet();
    }
  }, [user]);

  const loadWallet = async () => {
    try {
      setWalletLoading(true);
      const [bal] = await Promise.allSettled([
        walletApi.getBalance(),
      ]);
      if (bal.status === "fulfilled") {
        setWalletBalance(bal.value.balance);
        setWalletLifetime(bal.value.lifetimeTokens);
      }
    } catch (err) {
      console.warn("Failed to load wallet:", err);
    } finally {
      setWalletLoading(false);
    }
  };

  const flash = useCallback((msg: string) => {
    setSavedStatus(msg);
    window.setTimeout(() => setSavedStatus(null), 2500);
  }, []);

  const toggleNotif = (key: keyof typeof settings.notifs) => {
    setAppSettings({ notifs: { ...settings.notifs, [key]: !settings.notifs[key] } });
    flash("Preferences saved");
  };

  const togglePrivacy = (key: keyof typeof settings.privacy) => {
    setAppSettings({ privacy: { ...settings.privacy, [key]: !settings.privacy[key] } });
    flash("Preferences saved");
  };

  const handlePersonaChange = (id: string) => {
    setAppSettings({ rafiqPersona: id });
    flash("Rafiq persona updated");
  };

  const handleLanguageChange = async (lang: string) => {
    setAppSettings({ language: lang });
    flash("Language updated");
    try {
      await userService.updateProfile({ language: [lang] });
    } catch (e) {
      console.error("Failed to update profile language on backend", e);
    }
  };

  const handleUnitsChange = (units: AppUnits) => {
    setAppSettings({ units });
    flash("Units updated");
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      router.push("/login");
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const profile = await userService.getProfile().catch(() => user);
      let trips: any[] = [];
      let badges: any[] = [];
      if (user?.id) {
        trips = await historyService.getTrips().catch(() => []);
        badges = await historyService.getBadges(user.id).catch(() => []);
      }
      const localSettings = JSON.parse(localStorage.getItem("rihla_user_settings") || "{}");

      const exportObj = {
        exportedAt: new Date().toISOString(),
        userProfile: profile,
        userSettings: localSettings,
        tripHistory: trips,
        badges,
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
      const a = document.createElement("a");
      a.href = dataStr;
      a.download = `rihla_data_export_${user?.displayName || "user"}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      flash("Data exported successfully!");
    } catch (e) {
      console.error("Failed to export user data", e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar location="Settings · Rihla" />

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${C.basalt} 0%,#2A1E10 60%,${C.nile} 100%)`, padding: "24px 32px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -40, top: -40 }}><Geom size={220} color={C.limestone} op={0.025} /></div>
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: `${C.limestone}45`, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8 }}>Preferences</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(20px,2.5vw,30px)", fontWeight: 400, color: C.limestone, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              Settings &amp; <span style={{ fontStyle: "italic", color: C.sand }}>Preferences</span>
            </h1>
          </div>
          {savedStatus && (
            <div style={{ background: `${C.faience}25`, border: `1px solid ${C.faience}`, borderRadius: 20, padding: "6px 14px", color: C.limestone, fontFamily: "'Inter',sans-serif", fontSize: "12px", display: "flex", alignItems: "center", gap: 6 }}>
              <Check size={14} color={C.faience} /> {savedStatus}
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, padding: "24px 32px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, columnGap: 24 }}>

        {/* Left column */}
        <div>
          {/* Rafiq persona */}
          <div style={{ background: C.limestone, borderRadius: 16, padding: "20px 22px", border: "1px solid rgba(27,26,23,0.07)", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: C.copper, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>◈ Rafiq Persona</div>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#8B7E6A", marginBottom: 16, lineHeight: 1.55 }}>Choose how Rafiq communicates with you. You can change this anytime mid-journey.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {RAFIQ_PERSONAS.map((p) => {
                const active = settings.rafiqPersona === p.id;
                return (
                  <button key={p.id} onClick={() => handlePersonaChange(p.id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, border: `2px solid ${active ? C.faience : "rgba(27,26,23,0.1)"}`, background: active ? `${C.faience}08` : "#FAF7F0", cursor: "pointer", textAlign: "left", transition: "all 0.18s" }}>
                    <span style={{ fontSize: "24px", flexShrink: 0 }}>{p.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: active ? C.faience : C.nile, marginBottom: 2 }}>{p.label}</div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#8B7E6A", lineHeight: 1.45 }}>{p.desc}</div>
                    </div>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${active ? C.faience : "#C4B89A"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {active && <div style={{ width: 9, height: 9, borderRadius: "50%", background: C.faience }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language & region */}
          <SettingsSection title="Language &amp; Region">
            <SettingsRow
              label="App Language"
              sub="Affects all UI text and Rafiq responses"
              right={
                <select value={settings.language} onChange={(e) => handleLanguageChange(e.target.value)} style={{ background: C.limestoneDark, border: "1.5px solid rgba(27,26,23,0.1)", borderRadius: 8, padding: "6px 10px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.nile, cursor: "pointer", outline: "none" }}>
                  {APP_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              }
            />
            <SettingsRow
              label="Units"
              sub="Distance and temperature display across the app"
              border={false}
              right={
                <div style={{ display: "flex", background: C.limestoneDark, borderRadius: 8, padding: 3, gap: 2 }}>
                  {(["metric", "imperial"] as const).map((u) => (
                    <button key={u} onClick={() => handleUnitsChange(u)} style={{ background: settings.units === u ? C.limestone : "transparent", border: "none", borderRadius: 6, padding: "5px 12px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: settings.units === u ? 700 : 400, color: settings.units === u ? C.nile : "#8B7E6A", cursor: "pointer", boxShadow: settings.units === u ? "0 1px 4px rgba(27,26,23,0.08)" : "none" }}>{u.charAt(0).toUpperCase() + u.slice(1)}</button>
                  ))}
                </div>
              }
            />
          </SettingsSection>
        </div>

        {/* Right column */}
        <div>
          {/* Notifications */}
          <SettingsSection title="Notifications">
            <SettingsRow label="Scam &amp; Safety Alerts" sub="Immediate alerts for active threats near you" right={<Toggle on={settings.notifs.scamAlerts} onChange={() => toggleNotif("scamAlerts")} />} />
            <SettingsRow label="Weather Warnings" sub="UV, heat, and severe weather alerts" right={<Toggle on={settings.notifs.weather} onChange={() => toggleNotif("weather")} />} />
            <SettingsRow label="Rafiq Tips" sub="Proactive local tips based on where you are" right={<Toggle on={settings.notifs.rafiqTips} onChange={() => toggleNotif("rafiqTips")} />} />
            <SettingsRow label="Journey XP &amp; Badges" sub="Celebrate milestones as you explore" border={false} right={<Toggle on={settings.notifs.journeyXP} onChange={() => toggleNotif("journeyXP")} />} />
          </SettingsSection>

          {/* Privacy */}
          <SettingsSection title="Privacy &amp; Data">
            <SettingsRow label="Live Location" sub="Required for scam alerts and nearby sites" right={<Toggle on={settings.privacy.locationLive} onChange={() => togglePrivacy("locationLive")} />} />
            <SettingsRow label="Usage Analytics" sub="Helps us improve the app experience" border={false} right={<Toggle on={settings.privacy.analytics} onChange={() => togglePrivacy("analytics")} />} />
          </SettingsSection>

          {/* Tokens & Wallet */}
          <SettingsSection title="Tokens & Wallet">
            <SettingsRow
              label="Available Balance"
              sub={walletLoading ? "Loading..." : `${walletBalance.toLocaleString()} tokens`}
              right={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#8B7E60" }}>
                    Lifetime: {walletLifetime.toLocaleString()}
                  </div>
                  <button
                    onClick={loadWallet}
                    disabled={walletLoading}
                    style={{ background: "transparent", border: "none", color: C.faience, fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    <Wallet size={12} /> Sync
                  </button>
                </div>
              }
            />
            <SettingsRow
              label="View Wallet"
              sub="Purchase tokens, view transactions, manage spending"
              right={
                <button
                  onClick={() => router.push("/app/wallet")}
                  style={{ background: C.nile, color: C.limestone, border: "none", borderRadius: 8, padding: "7px 14px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <Wallet size={13} /> Open Wallet
                </button>
              }
            />
            <SettingsRow
              label="Token Packages"
              sub="Browse available token packages for Rafiq"
              border={false}
              right={
                <button
                  onClick={() => router.push("/app/wallet")}
                  style={{ background: "transparent", border: `1.5px solid ${C.faience}40`, borderRadius: 8, padding: "7px 14px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.faience, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <Coins size={13} strokeWidth={2} /> Browse Packages
                </button>
              }
            />
          </SettingsSection>

          {/* Account */}
          <SettingsSection title="Account">
            <SettingsRow
              label="Export My Data"
              sub="Download your full journey archive as JSON"
              right={
                <button onClick={handleExportData} disabled={isExporting} style={{ background: "#FAF7F0", border: "1.5px solid rgba(27,26,23,0.12)", borderRadius: 8, padding: "7px 14px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: "#6B6354", cursor: isExporting ? "wait" : "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {isExporting ? <Loader2 size={13} className="animate-spin" /> : <BookOpen size={13} strokeWidth={2} />} {isExporting ? "Exporting..." : "Export"}
                </button>
              }
            />
            <SettingsRow
              label="Sign Out"
              border={false}
              right={
                <button onClick={handleSignOut} style={{ background: "transparent", border: `1.5px solid ${C.terracotta}40`, borderRadius: 8, padding: "7px 14px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.terracotta, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <LogOut size={13} strokeWidth={2} /> Sign out
                </button>
              }
            />
          </SettingsSection>

          {/* App info */}
          <div style={{ background: "linear-gradient(145deg,#FAF3E4,#F0E8D0)", borderRadius: 14, padding: "16px 20px", border: `1px solid ${C.sand}22`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Glyph size={22} />
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "14px", fontWeight: 500, color: C.nile }}>رحلة Rihla</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880" }}>Version 1.0.0 · Build 2026.07</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {["Privacy Policy", "Terms", "Support"].map((l) => (
                <button key={l} style={{ background: "none", border: "none", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 500, color: C.faience, cursor: "pointer" }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}