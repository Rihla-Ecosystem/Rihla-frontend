'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { C } from "@/lib/constants/theme";
import { TopBar } from "@/app/components/layout/TopBar";
import { useAuth } from "@/lib/auth";
import {
  walletApi,
  type WalletTransaction,
  type TokenPackage,
} from "@/lib/api/wallet";
import { useDemoStore, demoWallet } from "@/lib/demoStore";
import {
  Wallet,
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  RefreshCw,
  Sparkles,
  CreditCard,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

export default function WalletPage() {
  const router = useRouter();
  const { user } = useAuth();
  const demo = useDemoStore();

  const [balance, setBalance] = useState<number>(0);
  const [lifetimeTokens, setLifetimeTokens] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [packagesFailed, setPackagesFailed] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    setPackagesFailed(false);
    if (demo.mode === 'on') {
      const w = demoWallet();
      setBalance(w.balance);
      setLifetimeTokens(w.lifetimeTokens);
      setTransactions(w.transactions);
      setPackages(w.packages);
      setLoading(false);
      return;
    }
    try {
      const [bal, txs, pkgs] = await Promise.allSettled([
        walletApi.getBalance(),
        walletApi.getTransactions(),
        walletApi.getPackages(),
      ]);
      if (bal.status === "fulfilled") {
        setBalance(bal.value.balance);
        setLifetimeTokens(bal.value.lifetimeTokens);
      }
      if (txs.status === "fulfilled") setTransactions(txs.value);
      if (pkgs.status === "fulfilled") setPackages(pkgs.value);
      if (pkgs.status === "rejected") setPackagesFailed(true);
      if (bal.status === "rejected" && txs.status === "rejected") {
        setError(
          user
            ? "We could not reach the wallet service. Your balance and transactions are stored in the cloud — reconnect and hit Sync."
            : "Sign in to view your token balance and transactions."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo.mode]);

  const handlePurchase = async (pkg: TokenPackage) => {
    setPurchasingId(pkg.id);
    try {
      const res = await walletApi.purchasePackage(pkg.id, user);
      if (res.success && res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
      if (!res.success) {
        setError(res.message || "Purchase could not be started.");
      }
    } catch {
      setError("Purchase could not be started. Please try again.");
    } finally {
      setPurchasingId(null);
    }
  };

  const iconFor = (t: WalletTransaction) =>
    t.type === "reward" ? (
      <Gift size={15} color={C.safeGreen} />
    ) : t.type === "purchase" ? (
      <CreditCard size={15} color={C.copper} />
    ) : (
      <ArrowUpRight size={15} color={C.signalRed} />
    );

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg }}>
      <TopBar location="Wallet & Tokens" onRafiq={() => router.push("/app/rafiq")} />

      <div
        style={{
          background: `linear-gradient(135deg,${C.nile},${C.nileMid})`,
          padding: "26px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: `${C.limestone}55`, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>
            Token Wallet
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: 400, color: C.limestone, lineHeight: 1.1, margin: 0 }}>
            Your <span style={{ fontStyle: "italic", color: C.sand }}>Rihla Wallet</span>
          </h1>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{
            background: `${C.limestone}12`,
            border: `1px solid ${C.limestone}22`,
            color: C.limestone,
            borderRadius: 99,
            padding: "8px 14px",
            fontFamily: "'Inter',sans-serif",
            fontSize: "12px",
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <RefreshCw size={13} style={loading ? { animation: "spin 1s linear infinite" } : {}} /> Sync
        </button>
      </div>

      <div style={{ maxWidth: 1040, width: "100%", margin: "0 auto", padding: "24px 32px", boxSizing: "border-box", flex: 1 }}>
        {error && (
          <div style={{ background: "#FFF5F5", border: "1px solid #FECACA", borderRadius: 12, padding: "12px 16px", color: "#991B1B", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{error}</span>
            {!user && (
              <button
                onClick={() => router.push("/login")}
                style={{ background: C.nile, color: C.limestone, border: "none", borderRadius: 8, padding: "7px 16px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
              >
                Sign in
              </button>
            )}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, marginBottom: 24 }}>
          <div style={{ background: "linear-gradient(135deg,#0F3D3E,#1A5253)", borderRadius: 18, padding: "22px 24px", color: C.limestone }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${C.limestone}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Wallet size={20} color={C.sand} />
              </div>
              <div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: `${C.limestone}60`, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Available Balance
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "34px", lineHeight: 1.05 }}>
                  {loading ? "—" : balance.toLocaleString()} <span style={{ fontSize: "18px", color: C.sand }}>tokens</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 18, fontFamily: "'Inter',sans-serif", fontSize: "11px", color: `${C.limestone}60` }}>
              <span>Lifetime: <strong style={{ color: C.limestone }}>{lifetimeTokens.toLocaleString()}</strong></span>
            </div>
          </div>

          <div style={{ background: "#FAF7F0", border: `1px solid rgba(27,26,23,0.1)`, borderRadius: 18, padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${C.sand}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Coins size={20} color={C.copper} />
              </div>
              <div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: "#8B7E6A", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  How it works
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "17px", color: C.basalt }}>
                  Tokens power Rafiq
                </div>
              </div>
            </div>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.basalt}70`, lineHeight: 1.55, margin: 0 }}>
              Earn tokens through quests and rewards, then use them for premium Rafiq conversations, voice, and photo identification.
            </p>
          </div>
        </div>

        <section style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "22px", color: C.basalt }}>
              Transactions
            </div>
          </div>
          {loading ? (
            <div style={{ background: "rgba(27,26,23,0.05)", borderRadius: 14, padding: 20 }}>Loading…</div>
          ) : transactions.length === 0 ? (
            <div style={{ background: "rgba(27,26,23,0.04)", borderRadius: 14, padding: 30, textAlign: "center", fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", color: "#8B7E6A" }}>
              No transactions yet.
            </div>
          ) : (
            <div style={{ background: "#FAF7F0", border: `1px solid rgba(27,26,23,0.1)`, borderRadius: 16, overflow: "hidden" }}>
              {transactions.map((t, i) => (
                <div
                  key={t.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "13px 18px",
                    borderBottom: i < transactions.length - 1 ? `1px solid rgba(27,26,23,0.07)` : "none",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: t.type === "reward" ? `${C.safeGreen}15` : `${C.copper}12`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {iconFor(t)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.basalt }}>
                      {t.description}
                    </div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A" }}>{t.timestamp}</div>
                  </div>
                  <span
                    style={{
                      fontFamily: "'Inter',sans-serif",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: t.type === "reward" ? C.safeGreen : t.type === "spend" ? C.signalRed : C.copper,
                    }}
                  >
                    {t.type === "spend" ? "−" : "+"}{t.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Sparkles size={16} color={C.sand} />
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "22px", color: C.basalt }}>
              Token Packages
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
            {packages.map((p) => (
              <div
                key={p.id}
                style={{
                  background: p.popular ? "#FFF9EC" : "#FAF7F0",
                  border: p.popular ? `1.5px solid ${C.sand}` : `1px solid rgba(27,26,23,0.1)`,
                  borderRadius: 16,
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  position: "relative",
                }}
              >
                {p.popular && (
                  <span style={{ position: "absolute", top: -10, right: 14, background: C.solar, color: "#fff", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 99, padding: "3px 10px" }}>
                    Popular
                  </span>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", color: C.basalt }}>{p.name}</span>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "18px", fontWeight: 700, color: C.copper }}>
                    ${p.price.toFixed(2)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "30px", color: C.nile, lineHeight: 1 }}>
                    {p.tokens}
                  </span>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A" }}>tokens</span>
                </div>
                <button
                  onClick={() => handlePurchase(p)}
                  disabled={purchasingId === p.id}
                  style={{
                    marginTop: 4,
                    background: p.popular ? `linear-gradient(135deg,${C.sand},${C.copper})` : `linear-gradient(135deg,${C.nile},${C.nileMid})`,
                    color: C.limestone,
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 16px",
                    fontFamily: "'Inter',sans-serif",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: purchasingId === p.id ? "default" : "pointer",
                    opacity: purchasingId === p.id ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  {purchasingId === p.id ? "Preparing checkout…" : "Buy now"} <ChevronRight size={15} />
                </button>
              </div>
            ))}
          </div>
          {!loading && packages.length === 0 && packagesFailed && (
            <div style={{ background: "rgba(27,26,23,0.04)", borderRadius: 14, padding: 30, textAlign: "center", fontFamily: "'Inter',sans-serif", fontStyle: "italic", color: "#8B7E6A" }}>
              Token packages could not be loaded while offline. Reconnect and hit Sync.
            </div>
          )}
          {!loading && packages.length === 0 && !packagesFailed && (
            <div style={{ background: "rgba(27,26,23,0.04)", borderRadius: 14, padding: 30, textAlign: "center", fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", color: "#8B7E6A" }}>
              No packages available right now.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
