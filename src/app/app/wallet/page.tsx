'use client';

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { C } from "@/lib/constants/theme";
import { TopBar } from "@/app/components/layout/TopBar";
import { Geom } from "@/app/components/atoms";
import { useAuth } from "@/lib/auth";
import { useLocation } from "@/providers/LocationProvider";
import { userService } from "@/services/userService";
import { historyService, UserBadgeItem, InteractionSummaryItem } from "@/services/historyService";
import { walletService, ExchangeRates, SpendItem, NearbyATM } from "@/services/walletService";
import {
  Star,
  Navigation,
  Globe,
  Wallet,
  CreditCard,
  Camera,
  Shield,
  ArrowRight,
  MapPin,
  Plus,
  RefreshCw,
  AlertCircle,
  Building2,
  CheckCircle2,
} from "lucide-react";

const RATE_FLAGS: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", AUD: "🇦🇺",
  CAD: "🇨🇦", CHF: "🇨🇭", CNY: "🇨🇳", INR: "🇮🇳", AED: "🇦🇪",
};

const CASH_TIPS = [
  { tip: "Always carry small EGP notes — EGP 5, 10, 20. Many vendors cannot break EGP 200.", icon: <CreditCard size={15} strokeWidth={2}/> },
  { tip: "Tip guides EGP 30–50, drivers EGP 10–20, hotel porters EGP 10 per bag.", icon: <Star size={15} strokeWidth={2}/> },
  { tip: "Baksheesh (small tips) are expected at archaeological sites — EGP 10–20 is generous.", icon: <Camera size={15} strokeWidth={2}/> },
  { tip: "Official ATMs inside banks & major malls give best exchange rate. Avoid airport kiosks.", icon: <Shield size={15} strokeWidth={2}/> },
];

export default function WalletPage() {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const { lat, lon, locationName, status: locStatus } = useLocation();

  // Exchange Rates State
  const [rates, setRates] = useState<ExchangeRates>({});
  const [lastRateUpdate, setLastRateUpdate] = useState<string>("Loading...");
  const [isLiveRates, setIsLiveRates] = useState<boolean>(false);
  const [ratesLoading, setRatesLoading] = useState<boolean>(true);

  // Converter State
  const [fromCur, setFromCur] = useState("USD");
  const [amount, setAmount] = useState("100");
  const [dir, setDir] = useState<"to" | "from">("to");

  // User & Stats State
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userBadges, setUserBadges] = useState<UserBadgeItem[]>([]);
  const [summaryData, setSummaryData] = useState<InteractionSummaryItem | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  // Nearby ATMs State
  const [atms, setAtms] = useState<NearbyATM[]>([]);
  const [selectedAtm, setSelectedAtm] = useState<NearbyATM | null>(null);
  const [atmsLoading, setAtmsLoading] = useState<boolean>(true);

  // Spend Tracker State
  const [spendLog, setSpendLog] = useState<SpendItem[]>([]);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newDesc, setNewDesc] = useState("");
  const [newEgp, setNewEgp] = useState("");
  const [newCat, setNewCat] = useState<SpendItem["cat"]>("Food & Drink");

  // General Error State
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Exchange Rates
  const fetchRates = useCallback(async () => {
    setRatesLoading(true);
    try {
      const res = await walletService.getExchangeRates();
      setRates(res.rates);
      setLastRateUpdate(res.lastUpdated);
      setIsLiveRates(res.isLive);
    } catch (e) {
      console.error("Error loading exchange rates:", e);
    } finally {
      setRatesLoading(false);
    }
  }, []);

  // 2. Fetch User Profile, Badges, & Summary Stats from Core Server
  const fetchUserStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [profileRes, summaryRes] = await Promise.allSettled([
        userService.getProfile(),
        historyService.getSummary(),
      ]);

      let userId = authUser?.id;
      if (profileRes.status === "fulfilled" && profileRes.value) {
        setUserProfile(profileRes.value);
        userId = profileRes.value.id || userId;
      }

      if (summaryRes.status === "fulfilled") {
        setSummaryData(summaryRes.value);
      }

      if (userId) {
        try {
          const badges = await historyService.getBadges(userId);
          setUserBadges(badges);
        } catch (e) {
          console.warn("Failed to fetch user badges:", e);
        }
      }
    } catch (err: any) {
      console.error("Error fetching user stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [authUser]);

  // 3. Fetch Nearby ATMs when Location is Available
  const fetchAtms = useCallback(async () => {
    const currentLat = lat ?? 29.9792;
    const currentLon = lon ?? 31.1342;
    setAtmsLoading(true);
    try {
      const nearbyList = await walletService.getNearbyATMs(currentLat, currentLon);
      setAtms(nearbyList);
      if (nearbyList.length > 0) {
        setSelectedAtm(nearbyList[0]);
      }
    } catch (e) {
      console.warn("Failed to fetch ATMs:", e);
    } finally {
      setAtmsLoading(false);
    }
  }, [lat, lon]);

  // Load initial data
  useEffect(() => {
    fetchRates();
    setSpendLog(walletService.getSpendLog());
  }, [fetchRates]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserStats();
    } else {
      setStatsLoading(false);
    }
  }, [isAuthenticated, fetchUserStats]);

  useEffect(() => {
    fetchAtms();
  }, [fetchAtms]);

  // Converter calculations
  const numAmt = parseFloat(amount) || 0;
  const egpRate = rates[fromCur] ?? 48.5;
  const converted = useMemo(() => {
    if (dir === "to") {
      return (numAmt * egpRate).toLocaleString("en-EG", { maximumFractionDigits: 0 });
    } else {
      return (numAmt / egpRate).toFixed(2);
    }
  }, [dir, numAmt, egpRate]);

  // Spend calculations
  const totalSpend = useMemo(() => {
    return spendLog.reduce((s, l) => s + l.egp, 0);
  }, [spendLog]);

  const spendCategories = useMemo(() => {
    const cats: Record<string, { total: number; color: string }> = {
      "Entrance Fees": { total: 0, color: C.faience },
      "Transport": { total: 0, color: C.nile },
      "Food & Drink": { total: 0, color: C.terracotta },
      "Shopping": { total: 0, color: C.copper },
      "Accommodation": { total: 0, color: C.sand },
      "Other": { total: 0, color: "#C4B89A" },
    };

    spendLog.forEach((item) => {
      if (!cats[item.cat]) {
        cats[item.cat] = { total: 0, color: "#C4B89A" };
      }
      cats[item.cat].total += item.egp;
    });

    const sum = totalSpend || 1;
    return Object.entries(cats)
      .map(([name, { total, color }]) => ({
        name,
        total,
        color,
        pct: Math.round((total / sum) * 100),
      }))
      .filter((c) => c.total > 0);
  }, [spendLog, totalSpend]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim() || !newEgp || parseFloat(newEgp) <= 0) return;

    const updated = walletService.addSpendItem({
      cat: newCat,
      desc: newDesc.trim(),
      egp: Math.round(parseFloat(newEgp)),
    });

    setSpendLog(updated);
    setNewDesc("");
    setNewEgp("");
    setShowAddForm(false);
  };

  const getCategoryIcon = (cat: string, color: string) => {
    switch (cat) {
      case "Entrance Fees":
        return <Star size={14} strokeWidth={2} />;
      case "Transport":
        return <Navigation size={14} strokeWidth={2} />;
      case "Food & Drink":
        return <Globe size={14} strokeWidth={2} />;
      case "Shopping":
        return <Wallet size={14} strokeWidth={2} />;
      case "Accommodation":
        return <Building2 size={14} strokeWidth={2} />;
      default:
        return <CreditCard size={14} strokeWidth={2} />;
    }
  };

  if (authLoading || (ratesLoading && Object.keys(rates).length === 0)) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TopBar location="Wallet · Loading Intelligence..." />
        <div style={{ padding: "40px 32px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          <div style={{ height: 160, background: `${C.limestoneDark}50`, borderRadius: 16, marginBottom: 24, animation: "pulse 1.5s infinite ease-in-out" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
            <div style={{ height: 300, background: `${C.limestoneDark}30`, borderRadius: 16, animation: "pulse 1.5s infinite ease-in-out" }} />
            <div style={{ height: 300, background: `${C.limestoneDark}30`, borderRadius: 16, animation: "pulse 1.5s infinite ease-in-out" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar location={locationName ? `Wallet · Near ${locationName}` : "Wallet · Currency & Spending"} />

      {/* Header Banner */}
      <div style={{ background: `linear-gradient(135deg,#1A3A1F 0%,${C.safeGreen} 55%,#0F3D3E 100%)`, padding: "28px 32px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -40, top: -40 }}><Geom size={260} color={C.limestone} op={0.028}/></div>
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 32 }}>
          <div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: `${C.limestone}45`, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8 }}>
              Egypt Money Intelligence · {userProfile?.budget_level || "Tourist Tier"}
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(22px,3vw,34px)", fontWeight: 400, color: C.limestone, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 6 }}>
              Wallet &amp; <span style={{ fontStyle: "italic", color: C.sand }}>Currency</span>
            </h1>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: `${C.limestone}55`, lineHeight: 1.6 }}>
              {isLiveRates ? `Live EGP Rates (Updated ${lastRateUpdate})` : "Standard Baseline Rates"} · Spending Tracker · Cash Tips from Rafiq
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ background: `${C.limestone}08`, border: `1px solid ${C.limestone}18`, borderRadius: 12, padding: "14px 18px", textAlign: "center", minWidth: 110 }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: `${C.limestone}45`, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>Total Spent</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "17px", fontWeight: 500, color: C.sand }}>{totalSpend.toLocaleString()} EGP</div>
            </div>

            <div style={{ background: `${C.limestone}08`, border: `1px solid ${C.limestone}18`, borderRadius: 12, padding: "14px 18px", textAlign: "center", minWidth: 110 }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: `${C.limestone}45`, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>USD Rate</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "17px", fontWeight: 500, color: C.limestone }}>{rates.USD || 48.5} EGP</div>
            </div>

            <div style={{ background: `${C.limestone}08`, border: `1px solid ${C.limestone}18`, borderRadius: 12, padding: "14px 18px", textAlign: "center", minWidth: 110 }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: `${C.limestone}45`, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>Badges</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "17px", fontWeight: 500, color: `${C.limestone}80` }}>{userBadges.length} Unlocked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ flex: 1, padding: "24px 32px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box", display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>

        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Live Currency Converter */}
          <div style={{ background: C.limestone, borderRadius: 18, padding: "24px", border: "1px solid rgba(27,26,23,0.07)", boxShadow: "0 2px 16px rgba(15,61,62,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: C.copper, letterSpacing: "0.14em", textTransform: "uppercase" }}>◈ Live Currency Converter</div>
              <button onClick={fetchRates} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: "#8B7E6A", fontSize: "11px" }}>
                <RefreshCw size={12} className={ratesLoading ? "animate-spin" : ""} /> Sync Rates
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 14, alignItems: "center", marginBottom: 20 }}>
              {/* Input side */}
              <div>
                <label style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, color: "#A89880", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 7 }}>
                  {dir === "to" ? "You have" : "You want"}
                </label>
                <div style={{ background: "#FAF7F0", border: "1.5px solid rgba(27,26,23,0.12)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                    style={{ background: "transparent", border: "none", outline: "none", fontFamily: "'Cormorant Garamond',serif", fontSize: "26px", fontWeight: 500, color: C.nile, width: 0, flex: 1 }}
                  />
                  <div style={{ background: C.limestoneDark, borderRadius: 8, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                    <span style={{ fontSize: "16px" }}>{dir === "to" ? RATE_FLAGS[fromCur] : "🇪🇬"}</span>
                    {dir === "to" ? (
                      <select
                        value={fromCur}
                        onChange={(e) => setFromCur(e.target.value)}
                        style={{ background: "transparent", border: "none", outline: "none", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.nile, cursor: "pointer" }}
                      >
                        {Object.keys(rates).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.nile }}>EGP</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Swap Button */}
              <button
                onClick={() => setDir((d) => (d === "to" ? "from" : "to"))}
                style={{ background: C.nile, border: "none", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.limestone, flexShrink: 0, boxShadow: `0 3px 12px ${C.nile}35` }}
              >
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>

              {/* Output side */}
              <div>
                <label style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, color: "#A89880", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 7 }}>
                  {dir === "to" ? "You get (EGP)" : "In " + fromCur}
                </label>
                <div style={{ background: `${C.safeGreen}08`, border: `1.5px solid ${C.safeGreen}25`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "26px", fontWeight: 500, color: C.safeGreen, flex: 1 }}>{converted}</div>
                  <div style={{ background: `${C.safeGreen}15`, borderRadius: 8, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                    <span style={{ fontSize: "16px" }}>{dir === "to" ? "🇪🇬" : RATE_FLAGS[fromCur]}</span>
                    {dir === "from" ? (
                      <select
                        value={fromCur}
                        onChange={(e) => setFromCur(e.target.value)}
                        style={{ background: "transparent", border: "none", outline: "none", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.safeGreen, cursor: "pointer" }}
                      >
                        {Object.keys(rates).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.safeGreen }}>EGP</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: "#FAF7F0", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A" }}>
                <strong style={{ color: C.nile }}>1 {fromCur}</strong> = <strong style={{ color: C.safeGreen }}>{rates[fromCur] ?? 48.5} EGP</strong>
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880" }}>·</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A" }}>
                {isLiveRates ? `Live financial market rate · Updated ${lastRateUpdate}` : "Baseline EGP rate"}
              </div>
            </div>
          </div>

          {/* Live Rates Grid */}
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", fontWeight: 500, color: C.nile, marginBottom: 14 }}>
              Live Rates vs EGP
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
              {Object.entries(rates).map(([cur, rate]) => (
                <div
                  key={cur}
                  onClick={() => { setFromCur(cur); setDir("to"); }}
                  style={{ background: cur === fromCur ? `${C.nile}08` : C.limestone, border: `1.5px solid ${cur === fromCur ? C.nile : "rgba(27,26,23,0.07)"}`, borderRadius: 12, padding: "14px 15px", cursor: "pointer", transition: "all 0.15s" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                    <span style={{ fontSize: "20px" }}>{RATE_FLAGS[cur] || "🏳️"}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.nile }}>{cur}</span>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", fontWeight: 500, color: cur === fromCur ? C.safeGreen : C.basalt }}>
                    {rate}
                  </div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "#A89880", marginTop: 2 }}>
                    EGP per 1 {cur}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spend Log & Add Expense Form */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", fontWeight: 500, color: C.nile }}>
                Journey Spending Log
              </h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                style={{ background: C.nile, border: "none", borderRadius: 8, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6, color: C.limestone, fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
              >
                <Plus size={14} /> Add Expense
              </button>
            </div>

            {/* Form */}
            {showAddForm && (
              <form onSubmit={handleAddExpense} style={{ background: C.limestone, borderRadius: 16, padding: "18px", border: `1px solid ${C.nile}30`, marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 120px 140px auto", gap: 12, alignItems: "end" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#8B7E6A", display: "block", marginBottom: 4 }}>Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Taxi to Citadel"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(27,26,23,0.15)", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#8B7E6A", display: "block", marginBottom: 4 }}>Amount (EGP)</label>
                  <input
                    type="number"
                    placeholder="150"
                    value={newEgp}
                    onChange={(e) => setNewEgp(e.target.value)}
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(27,26,23,0.15)", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#8B7E6A", display: "block", marginBottom: 4 }}>Category</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value as any)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(27,26,23,0.15)", fontSize: "13px", background: "#fff" }}
                  >
                    <option value="Entrance Fees">Entrance Fees</option>
                    <option value="Transport">Transport</option>
                    <option value="Food & Drink">Food & Drink</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button
                  type="submit"
                  style={{ background: C.safeGreen, color: C.limestone, border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
                >
                  Save
                </button>
              </form>
            )}

            {/* List */}
            <div style={{ background: C.limestone, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(27,26,23,0.07)" }}>
              {spendLog.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", color: "#8B7E6A", fontSize: "13px" }}>
                  No expenses recorded yet. Use the "Add Expense" button to track your Egypt journey!
                </div>
              ) : (
                spendLog.map((item, i) => (
                  <div
                    key={item.id}
                    style={{ display: "grid", gridTemplateColumns: "36px 1fr auto", gap: 14, padding: "14px 18px", alignItems: "center", borderBottom: i < spendLog.length - 1 ? "1px solid rgba(27,26,23,0.05)" : "none" }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.nile}12`, border: `1px solid ${C.nile}22`, display: "flex", alignItems: "center", justifyContent: "center", color: C.nile, flexShrink: 0 }}>
                      {getCategoryIcon(item.cat, C.nile)}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.nile, marginBottom: 2 }}>{item.desc}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880", background: C.limestoneDark, padding: "1px 7px", borderRadius: 99 }}>{item.cat}</span>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#C4B89A" }}>{item.date}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "16px", fontWeight: 500, color: C.basalt }}>{item.egp.toLocaleString()}</div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "#A89880" }}>EGP</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Sticky Sidebar) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 24, alignSelf: "start" }}>

          {/* Spend Breakdown */}
          <div style={{ background: C.limestone, borderRadius: 16, padding: "20px", border: "1px solid rgba(27,26,23,0.07)" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: "#A89880", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Spend Breakdown</div>
            
            {/* Stack bar */}
            <div style={{ display: "flex", height: 10, borderRadius: 99, overflow: "hidden", marginBottom: 16, background: C.limestoneDark }}>
              {spendCategories.map((c) => (
                <div key={c.name} style={{ width: `${c.pct}%`, background: c.color }} />
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {spendCategories.map((c) => (
                <div key={c.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#6B6354" }}>{c.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, color: C.nile }}>{c.total.toLocaleString()}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880" }}>{c.pct}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, borderTop: "1px solid rgba(27,26,23,0.06)", paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, color: C.nile }}>Total Spent</span>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", fontWeight: 500, color: C.safeGreen }}>{totalSpend.toLocaleString()} EGP</span>
            </div>
          </div>

          {/* Rihla Tokens & Level */}
          <div style={{ background: `linear-gradient(135deg,${C.nile},${C.nileMid})`, borderRadius: 16, padding: "20px" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: `${C.limestone}45`, marginBottom: 14 }}>◈ Rihla Journey Tokens</div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ background: `${C.limestone}08`, border: `1px solid ${C.limestone}15`, borderRadius: 11, padding: "12px 13px" }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "22px", fontWeight: 500, color: C.sand, marginBottom: 3 }}>
                  {userBadges.length * 150 + 100}
                </div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: `${C.limestone}80` }}>Journey XP</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: `${C.limestone}40`, marginTop: 2 }}>
                  {userProfile?.travel_style || "Explorer"}
                </div>
              </div>

              <div style={{ background: `${C.limestone}08`, border: `1px solid ${C.limestone}15`, borderRadius: 11, padding: "12px 13px" }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "22px", fontWeight: 500, color: C.faience, marginBottom: 3 }}>
                  {userBadges.length}
                </div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: `${C.limestone}80` }}>Badges Unlocked</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: `${C.limestone}40`, marginTop: 2 }}>Core Achievements</div>
              </div>
            </div>
          </div>

          {/* Cash & Tipping Tips */}
          <div style={{ background: "linear-gradient(145deg,#FAF3E4,#F0E8D0)", borderRadius: 16, padding: "18px", border: `1px solid ${C.sand}25` }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: C.copper, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>◈ Rafiq Cash &amp; Tipping Guide</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CASH_TIPS.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${C.copper}15`, border: `1px solid ${C.copper}22`, display: "flex", alignItems: "center", justifyContent: "center", color: C.copper, flexShrink: 0, marginTop: 1 }}>{t.icon}</div>
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#5C5346", lineHeight: 1.65, margin: 0 }}>{t.tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Nearest ATM Finder */}
          <div style={{ background: C.limestone, borderRadius: 16, padding: "16px 18px", border: "1px solid rgba(27,26,23,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.faience}12`, border: `1px solid ${C.faience}25`, display: "flex", alignItems: "center", justifyContent: "center", color: C.faience, flexShrink: 0 }}>
                <MapPin size={18} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.nile }}>Nearest Safe ATM / Bank</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A" }}>
                  {locStatus === "success" ? "Based on real GPS position" : "Default Cairo location"}
                </div>
              </div>
            </div>

            {atmsLoading ? (
              <div style={{ fontSize: "12px", color: "#8B7E6A" }}>Finding nearest safe ATM...</div>
            ) : selectedAtm ? (
              <div style={{ background: "#FAF7F0", borderRadius: 12, padding: "12px", border: "1px solid rgba(27,26,23,0.08)" }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.nile, marginBottom: 2 }}>
                  {selectedAtm.name}
                </div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#8B7E6A" }}>
                  {selectedAtm.address} {selectedAtm.distanceMeter ? `· ${selectedAtm.distanceMeter}m away` : ""}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "12px", color: "#8B7E6A" }}>No bank branch found in immediate range.</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
