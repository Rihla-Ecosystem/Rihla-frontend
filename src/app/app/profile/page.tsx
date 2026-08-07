"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Star, MapPin, Clock, Shield, Globe, Edit3, X, Loader2, AlertCircle, Award } from "lucide-react";
import { C } from "@/lib/constants/theme";
import { Geom, Glyph } from "@/app/components/atoms";
import { TopBar } from "@/app/components/layout/TopBar";
import { useAuth } from "@/lib/auth";
import { userService } from "@/services/userService";
import { historyService, TripHistoryItem, UserBadgeItem } from "@/services/historyService";
import { journeysApi, type Journey } from "@/lib/api/journeys";
import { useRouter } from "next/navigation";
import { useDemoStore, demoProfile, demoTrips, demoBadges, demoJourneys } from "@/lib/demoStore";

const LEVEL_MAP = [
  { level: 1, title: "Newcomer",   xpNeeded: 0,    color: "#C4B89A" },
  { level: 2, title: "Wanderer",   xpNeeded: 100,  color: C.faience  },
  { level: 3, title: "Discoverer", xpNeeded: 250,  color: C.safeGreen},
  { level: 4, title: "Explorer",   xpNeeded: 500,  color: C.copper   },
  { level: 5, title: "Historian",  xpNeeded: 1000, color: C.sand     },
  { level: 6, title: "Pharaoh",    xpNeeded: 2000, color: C.terracotta},
];

const CATALOG_BADGES: { id: string; icon: string; color: string }[] = [];

const BADGE_CATS = ["All"];

const BADGE_ICONS = ['🏔', '🏺', '📜', '🧭', '🌿', '🌊', '✅', '🤖', '🎒', '🏛', '📖', '🗺'];
const BADGE_COLORS = [C.sand, C.faience, C.copper, '#A89880', '#A89880', '#A89880', C.safeGreen, C.faience, C.terracotta, C.nile, C.copper, C.signalRed];

const PERSONA_STYLES = [
  { id: "cultural",   label: "Cultural",    icon: "🏛" },
  { id: "adventure",  label: "Adventure",   icon: "🧗" },
  { id: "foodie",     label: "Foodie",      icon: "🫕" },
  { id: "history",    label: "History",     icon: "📜" },
];

export default function PageProfile() {
  const { user, fetchCurrentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const demo = useDemoStore();

  const [profileData, setProfileData] = useState<any>(null);
  const [userBadges, setUserBadges]   = useState<UserBadgeItem[]>([]);
  const [trips, setTrips]             = useState<TripHistoryItem[]>([]);
  const [journeys, setJourneys]       = useState<Journey[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  const [badgeCat, setBadgeCat] = useState("All");
  const [tab, setTab]           = useState<"badges" | "stats" | "impact" | "journeys">("badges");

  // Edit Profile Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName]     = useState("");
  const [editNat, setEditNat]       = useState("");
  const [editStyle, setEditStyle]   = useState("");
  const [editBio, setEditBio]       = useState("");
  const [saving, setSaving]         = useState(false);
  const [saveMsg, setSaveMsg]       = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (demo.mode === 'on') {
        setProfileData(demoProfile());
        setUserBadges(demoBadges());
        setTrips(demoTrips());
        setJourneys(demoJourneys());
        setLoading(false);
        return;
      }

      const profile = await userService.getProfile();
      setProfileData(profile);

      if (profile?.id || user?.id) {
        const userId = profile?.id || user?.id;
        const [fetchedBadges, fetchedTrips, fetchedJourneys] = await Promise.allSettled([
          userId ? historyService.getBadges(userId) : Promise.resolve([]),
          historyService.getTrips(),
          journeysApi.list(),
        ]);

        if (fetchedBadges.status === "fulfilled") {
          setUserBadges(fetchedBadges.value || []);
        }
        if (fetchedTrips.status === "fulfilled") {
          setTrips(fetchedTrips.value || []);
        }
        if (fetchedJourneys.status === "fulfilled") {
          setJourneys(fetchedJourneys.value || []);
        }
      }
    } catch (err: any) {
      console.error("Error loading profile:", err);
      setError(err?.message || "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo.mode]);

  const handleOpenEdit = () => {
    const activeUser = profileData || user;
    setEditName(activeUser?.displayName || "");
    setEditNat(activeUser?.nationality || "German");
    setEditStyle(activeUser?.travelStyle || "Cultural");
    setEditBio(activeUser?.bio || "");
    setSaveMsg(null);
    setIsEditOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveMsg(null);
      await userService.updateProfile({
        display_name: editName,
        nationality: editNat,
        travel_style: editStyle,
        bio: editBio,
      });
      await fetchCurrentUser();
      await loadProfile();
      setSaveMsg("Profile updated successfully!");
      setTimeout(() => {
        setIsEditOpen(false);
      }, 800);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setSaveMsg(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Derive current user info
  const activeUser = profileData || user;
  const displayName = activeUser?.displayName || "Traveler";
  const userInitials = displayName.slice(0, 1).toUpperCase();
  const nationality = activeUser?.nationality || "—";
  const travelStyle = activeUser?.travelStyle || "Explorer";
  const memberSince = activeUser?.createdAt
    ? new Date(activeUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";

  const currentXP = activeUser?.xp ?? 0;
  
  // Calculate level
  let currentLevelIdx = 0;
  for (let i = LEVEL_MAP.length - 1; i >= 0; i--) {
    if (currentXP >= LEVEL_MAP[i].xpNeeded) {
      currentLevelIdx = i;
      break;
    }
  }
  const currentLevel = LEVEL_MAP[currentLevelIdx];
  const nextLevel = LEVEL_MAP[Math.min(currentLevelIdx + 1, LEVEL_MAP.length - 1)];

  const xpInLevel = Math.max(0, currentXP - currentLevel.xpNeeded);
  const xpNeeded = Math.max(1, nextLevel.xpNeeded - currentLevel.xpNeeded);
  const pct = nextLevel === currentLevel ? 100 : Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

  // Merge badges with backend earned list — show only real backend badges
  const earnedCount = userBadges.length;

  // Stats calculation based on real data
  const uniqueGovs = new Set(trips.map((t) => t.destination).filter(Boolean));
  const travelerStats = [
    { label: "Sites visited", val: trips.length > 0 ? `${trips.length}` : "--", icon: <MapPin size={16} strokeWidth={2}/>, color: C.faience },
    { label: "Journey XP", val: `${currentXP}`, icon: <Star size={16} strokeWidth={2}/>, color: C.sand },
    { label: "Level", val: `Lvl ${currentLevel.level} · ${currentLevel.title}`, icon: <Award size={16} strokeWidth={2}/>, color: C.copper },
    { label: "Badges earned", val: `${earnedCount}`, icon: <Glyph size={16}/>, color: C.nile },
    { label: "Governorates", val: `${uniqueGovs.size}`, icon: <Globe size={16} strokeWidth={2}/>, color: C.terracotta },
    { label: "Member since", val: memberSince, icon: <Clock size={16} strokeWidth={2}/>, color: C.safeGreen },
  ];

  if (loading || authLoading) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TopBar location="Your Profile · Rihla" />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
          <div style={{ textAlign: "center" }}>
            <Loader2 size={36} color={C.nile} className="animate-spin" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "#8B7E6A" }}>Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const isOfflineGuest = !user && !profileData && demo.mode !== 'on';

  if (isOfflineGuest) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TopBar location="Your Profile · Rihla" />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 460, background: C.limestone, borderRadius: 18, border: "1px solid rgba(27,26,23,0.07)", padding: "48px 36px" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: `${C.nile}10`, border: `1.5px solid ${C.nile}25`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Glyph size={34} />
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "26px", fontWeight: 500, color: C.nile, marginBottom: 10 }}>
              Your journey is waiting
            </h2>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "#6B6354", lineHeight: 1.6, marginBottom: 24 }}>
              {error && !String(error).toLowerCase().includes("authentication")
                ? "We couldn't reach the Rihla server right now. Your profile, badges, and quest progress live in the cloud — sign in again once you're back online."
                : "Sign in to view your profile, badges, quest progress, and journey stats."}
            </p>
            <button
              onClick={() => router.push("/login")}
              style={{ background: C.nile, color: C.limestone, border: "none", borderRadius: 9, padding: "12px 28px", fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar location="Your Profile · Rihla" />

      {/* Profile hero */}
      <div style={{ background: `linear-gradient(160deg,${C.nile} 0%,#122A2B 55%,#1A3A1F 100%)`, padding: "36px 32px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -60, top: -60 }}><Geom size={320} color={C.limestone} op={0.028} /></div>
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 28, alignItems: "center" }}>
            {/* Avatar */}
            <div style={{ position: "relative" }}>
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: `linear-gradient(135deg,${C.sand}50,${C.copper}60)`, border: `3px solid ${C.limestone}25`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 6px ${C.limestone}08` }}>
                {activeUser?.avatarUrl ? (
                  <img src={activeUser.avatarUrl} alt={displayName} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "38px", fontWeight: 500, color: C.limestone }}>{userInitials}</span>
                )}
              </div>
              <div style={{ position: "absolute", bottom: 2, right: 2, width: 20, height: 20, borderRadius: "50%", background: C.safeGreen, border: `2px solid #0F3D3E`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle size={11} color="#fff" strokeWidth={2.5} />
              </div>
            </div>
            {/* Name & level */}
            <div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: `${C.limestone}45`, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Verified traveler</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(22px,3vw,36px)", fontWeight: 400, color: C.limestone, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 6 }}>
                {displayName}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${currentLevel.color}20`, border: `1px solid ${currentLevel.color}40`, borderRadius: 99, padding: "4px 12px" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: currentLevel.color }} />
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, color: currentLevel.color }}>Level {currentLevel.level} · {currentLevel.title}</span>
                </div>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.limestone}45` }}>{nationality} · {travelStyle} explorer</span>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.limestone}35` }}>Member since {memberSince}</span>
              </div>
            </div>
            {/* XP block */}
            <div style={{ background: `${C.limestone}08`, border: `1px solid ${C.limestone}15`, borderRadius: 16, padding: "18px 22px", minWidth: 200 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: `${C.limestone}45`, letterSpacing: "0.1em", textTransform: "uppercase" }}>Journey XP</span>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "22px", fontWeight: 500, color: C.sand }}>{currentXP}</span>
              </div>
              <div style={{ height: 6, background: `${C.limestone}15`, borderRadius: 99, marginBottom: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${C.sand},${C.faience})`, borderRadius: 99, transition: "width 0.6s ease" }} />
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: `${C.limestone}45` }}>
                {nextLevel === currentLevel ? "Max level achieved!" : `${nextLevel.xpNeeded - currentXP} XP to `}
                {nextLevel !== currentLevel && <span style={{ color: nextLevel.color, fontWeight: 600 }}>{nextLevel.title}</span>}
              </div>
            </div>
          </div>

          {/* Level road */}
          <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 0 }}>
            {LEVEL_MAP.map((lv, i) => {
              const done = lv.level < currentLevel.level;
              const curr = lv.level === currentLevel.level;
              return (
                <div key={lv.level} style={{ display: "flex", alignItems: "center", flex: i < LEVEL_MAP.length - 1 ? 1 : "none" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <div style={{ width: curr ? 36 : 24, height: curr ? 36 : 24, borderRadius: "50%", background: done || curr ? lv.color : `${C.limestone}12`, border: `2px solid ${done || curr ? lv.color : `${C.limestone}20`}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", boxShadow: curr ? `0 0 0 5px ${lv.color}25` : "none" }}>
                      {(done || curr) && <CheckCircle size={curr ? 16 : 11} color={C.limestone} strokeWidth={2.5} />}
                    </div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: curr ? 700 : 400, color: done || curr ? lv.color : `${C.limestone}30`, whiteSpace: "nowrap" }}>{lv.title}</div>
                  </div>
                  {i < LEVEL_MAP.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: done ? `linear-gradient(90deg,${lv.color},${LEVEL_MAP[i + 1].color})` : `${C.limestone}15`, margin: "0 4px", marginBottom: 18 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "24px 32px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box", display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>

        {/* Left: tabs */}
        <div>
          {/* Tab bar */}
          <div style={{ display: "flex", gap: 4, background: C.limestoneDark, borderRadius: 12, padding: 4, marginBottom: 20, width: "fit-content" }}>
            {(["badges", "stats", "journeys", "impact"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? C.limestone : "transparent", border: "none", borderRadius: 9, padding: "8px 20px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: tab === t ? 700 : 400, color: tab === t ? C.nile : "#8B7E6A", cursor: "pointer", transition: "all 0.18s", textTransform: "capitalize", boxShadow: tab === t ? "0 1px 6px rgba(27,26,23,0.08)" : "none" }}>{t === "impact" ? "Journey Impact" : t.charAt(0).toUpperCase() + t.slice(1)}</button>
            ))}
          </div>

          {tab === "badges" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#A89880", alignSelf: "center", marginLeft: 4 }}>{earnedCount} badges earned</span>
              </div>

              {userBadges.length === 0 ? (
                <div style={{ padding: "40px 24px", textAlign: "center", background: C.limestone, borderRadius: 16, border: "1px solid rgba(27,26,23,0.07)" }}>
                  <Award size={40} color={C.copper} style={{ marginBottom: 12 }} />
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", color: C.nile, marginBottom: 6 }}>
                    No Badges Yet
                  </h3>
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#8B7E6A", maxWidth: 380, margin: "0 auto" }}>
                    Explore sites and interact with Rafiq to earn your first badges.
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
                  {userBadges.map((b, idx) => (
                    <div key={b.id} style={{ background: C.limestone, borderRadius: 14, padding: "18px 16px", border: "1.5px solid rgba(27,26,23,0.07)", position: "relative", overflow: "hidden", boxShadow: "0 2px 12px rgba(15,61,62,0.06)" }}>
                      <div style={{ position: "relative", zIndex: 2 }}>
                        <div style={{ fontSize: "30px", marginBottom: 10 }}>{BADGE_ICONS[idx % BADGE_ICONS.length]}</div>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.nile, marginBottom: 4 }}>{b.name}</div>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A", lineHeight: 1.5, marginBottom: 10 }}>
                          {b.description || "Awarded for your journey achievements."}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, background: `${C.sand}20`, color: C.copper, padding: "2px 8px", borderRadius: 99 }}>Earned</span>
                          {b.awardedAt ? (
                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "#A89880" }}>
                              {new Date(b.awardedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "stats" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {travelerStats.map(s => (
                  <div key={s.label} style={{ background: C.limestone, borderRadius: 14, padding: "20px 18px", border: "1px solid rgba(27,26,23,0.07)", textAlign: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}12`, border: `1px solid ${s.color}25`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, margin: "0 auto 12px" }}>{s.icon}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "28px", fontWeight: 500, color: C.nile, marginBottom: 4 }}>{s.val}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: C.limestone, borderRadius: 14, padding: "20px", border: "1px solid rgba(27,26,23,0.07)" }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: "#A89880", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Travel Style Preferences</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {PERSONA_STYLES.map(p => {
                    const isSelected = travelStyle.toLowerCase().includes(p.id.toLowerCase());
                    return (
                      <div key={p.id} style={{ flex: 1, textAlign: "center", padding: "16px 8px", borderRadius: 12, background: isSelected ? `${C.nile}08` : "#FAF7F0", border: `1.5px solid ${isSelected ? C.nile : "rgba(27,26,23,0.07)"}` }}>
                        <div style={{ fontSize: "22px", marginBottom: 6 }}>{p.icon}</div>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: isSelected ? 700 : 400, color: isSelected ? C.nile : "#A89880" }}>{p.label}</div>
                        {isSelected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.faience, margin: "6px auto 0" }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === "journeys" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: "#A89880", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Your Quests
                </div>
                <button
                  onClick={() => router.push("/app/quests")}
                  style={{ background: "none", border: "none", color: C.nile, fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                >
                  Browse all quests →
                </button>
              </div>
              {journeys.length === 0 ? (
                <div style={{ padding: "40px 24px", textAlign: "center", background: C.limestone, borderRadius: 16, border: "1px solid rgba(27,26,23,0.07)" }}>
                  <div style={{ fontSize: "40px", marginBottom: 12 }}>🗺</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", color: C.nile, marginBottom: 6 }}>No Quests Started</h3>
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#8B7E6A", maxWidth: 380, margin: "0 auto", lineHeight: 1.55 }}>
                    Begin a guided journey — like the Scam Shield or Antiquity Explorer — to earn XP and badges.
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
                  {journeys.map((q) => {
                    const pct = q.totalSteps > 0 ? (q.completedSteps / q.totalSteps) * 100 : 0;
                    return (
                      <button
                        key={q.id}
                        onClick={() => router.push(`/app/quests/${q.slug}`)}
                        style={{
                          background: q.isCompleted ? "#F1F8F3" : C.limestone,
                          border: q.isCompleted ? `1.5px solid ${C.safeGreen}40` : "1.5px solid rgba(27,26,23,0.07)",
                          borderRadius: 14,
                          padding: "16px",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "16px", color: C.nile, lineHeight: 1.2 }}>{q.title}</span>
                          {q.isCompleted && <CheckCircle size={17} color={C.safeGreen} strokeWidth={2.2} />}
                        </div>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A", marginTop: 4 }}>
                          {q.completedSteps}/{q.totalSteps} steps · +{q.xpReward} XP
                        </div>
                        <div style={{ height: 5, background: "#EDE6D6", borderRadius: 99, overflow: "hidden", marginTop: 10 }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: q.isCompleted ? C.safeGreen : C.solar, borderRadius: 99 }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "impact" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "linear-gradient(145deg,#FAF3E4,#F0E8D0)", borderRadius: 16, padding: "24px", border: `1px solid ${C.sand}25` }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: C.copper, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>◈ Your Journey Impact</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "16px", color: C.nile, lineHeight: 1.7, marginBottom: 20 }}>"Tourism done thoughtfully is one of Egypt's most important economic pillars. Your journey supports local families, preserves living heritage, and funds site restoration."</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                  {[
                    { label: "Journeys planned", val: trips.length > 0 ? `${trips.length}` : "0", color: C.safeGreen },
                    { label: "Journey XP", val: `${currentXP}`, color: C.copper },
                    { label: "Badges earned", val: `${earnedCount}`, color: C.faience },
                  ].map(j => (
                    <div key={j.label} style={{ background: C.limestone, borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "26px", fontWeight: 500, color: j.color, marginBottom: 4 }}>{j.val}</div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A", lineHeight: 1.4 }}>{j.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: C.limestone, borderRadius: 16, padding: "20px", border: "1px solid rgba(27,26,23,0.07)" }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: "#A89880", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Travel History</div>
                {trips.length === 0 ? (
                  <div style={{ padding: "20px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: "30px", marginBottom: 10 }}>🧭</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", color: C.nile, marginBottom: 6 }}>No journeys yet</div>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#8B7E6A", maxWidth: 340, margin: "0 auto", lineHeight: 1.55 }}>
                      Your planned trips and itineraries will appear here once the memory service records them.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {trips.map((t) => (
                      <div key={t.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 14px", background: "#FAF7F0", borderRadius: 12, border: "1px solid rgba(27,26,23,0.06)" }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${C.nile}10`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <MapPin size={17} color={C.nile} strokeWidth={2} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.nile, marginBottom: 3 }}>{t.title || t.destination}</div>
                          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#6B6354", marginBottom: 5 }}>
                            {t.destination}
                            {t.startDate ? ` · ${new Date(t.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}
                            {t.endDate ? ` – ${new Date(t.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}
                          </div>
                          {t.notes ? (
                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#A89880", fontStyle: "italic", lineHeight: 1.5 }}>{t.notes}</div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Quick profile card */}
          <div style={{ background: C.limestone, borderRadius: 16, padding: "20px", border: "1px solid rgba(27,26,23,0.07)" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: "#A89880", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Profile Details</div>
            {[
              { label: "Full name",     val: displayName },
              { label: "Email",         val: activeUser?.email || "—" },
              { label: "Nationality",   val: nationality },
              { label: "Travel style",  val: travelStyle },
              { label: "Member since",  val: memberSince },
            ].map(({ label, val }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(27,26,23,0.05)" }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#A89880" }}>{label}</span>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.nile, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</span>
              </div>
            ))}
            <button
              onClick={handleOpenEdit}
              style={{ marginTop: 14, width: "100%", background: "#FAF7F0", border: "1.5px solid rgba(27,26,23,0.1)", borderRadius: 9, padding: "10px 16px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: "#6B6354", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <Edit3 size={14} />
              Edit Profile
            </button>
          </div>

          {/* Progress Overview */}
          <div style={{ background: `linear-gradient(145deg,${C.nile},${C.nileMid})`, borderRadius: 16, padding: "20px" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: `${C.limestone}45`, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>◈ Journey Overview</div>
            {userBadges.length === 0 ? (
              <div>
                <div style={{ fontSize: "32px", marginBottom: 8 }}>🛡</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: C.limestone, marginBottom: 4 }}>Start exploring</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: C.limestone + "60", lineHeight: 1.55, marginBottom: 12 }}>
                  Visit sites and chat with Rafiq to earn your first badges and XP.
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, background: C.sand + "20", color: C.sand, padding: "3px 9px", borderRadius: 99 }}>+{currentXP} XP earned</span>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", fontWeight: 500, color: C.limestone, marginBottom: 8 }}>
                  {earnedCount} badge{earnedCount !== 1 ? 's' : ''} earned
                </div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: C.limestone + "60", lineHeight: 1.55, marginBottom: 12 }}>
                  Keep exploring Egypt to unlock more achievements.
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, background: C.sand + "20", color: C.sand, padding: "3px 9px", borderRadius: 99 }}>{currentLevel.title} · Level {currentLevel.level}</span>
                </div>
              </div>
            )}
          </div>

          {/* Level Progress */}
          <div style={{ background: C.limestone, borderRadius: 14, padding: "16px 18px", border: "1px solid rgba(27,26,23,0.07)" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: "#A89880", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>XP Progress</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#6B6354" }}>Level {currentLevel.level} ({currentLevel.title})</span>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, color: C.nile }}>
                {nextLevel === currentLevel ? "Max" : `${nextLevel.xpNeeded - currentXP} XP to Lvl ${currentLevel.level + 1}`}
              </span>
            </div>
            <div style={{ height: 6, background: "#EDE6D6", borderRadius: 99, overflow: "hidden", marginBottom: 6 }}>
              <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${C.copper},${C.sand})`, borderRadius: 99, transition: "width 0.6s ease" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,35,36,0.6)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.limestone, borderRadius: 18, border: `1px solid ${C.sand}40`, width: "100%", maxWidth: 460, padding: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "22px", fontWeight: 600, color: C.nile, margin: 0 }}>Edit Profile</h2>
              <button onClick={() => setIsEditOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#8B7E6A" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: "#6B6354", marginBottom: 4 }}>Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(27,26,23,0.15)", fontFamily: "'Inter',sans-serif", fontSize: "14px", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: "#6B6354", marginBottom: 4 }}>Nationality</label>
                <input
                  type="text"
                  value={editNat}
                  onChange={(e) => setEditNat(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(27,26,23,0.15)", fontFamily: "'Inter',sans-serif", fontSize: "14px", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: "#6B6354", marginBottom: 4 }}>Travel Style</label>
                <select
                  value={editStyle}
                  onChange={(e) => setEditStyle(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(27,26,23,0.15)", fontFamily: "'Inter',sans-serif", fontSize: "14px", background: "#fff", boxSizing: "border-box" }}
                >
                  <option value="Cultural">Cultural</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Foodie">Foodie</option>
                  <option value="History">History</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: "#6B6354", marginBottom: 4 }}>Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(27,26,23,0.15)", fontFamily: "'Inter',sans-serif", fontSize: "14px", boxSizing: "border-box" }}
                />
              </div>

              {saveMsg && (
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: saveMsg.includes("success") ? C.safeGreen : C.terracotta, textAlign: "center" }}>
                  {saveMsg}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid rgba(27,26,23,0.15)", background: "transparent", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: "#6B6354", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: C.nile, fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.limestone, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
