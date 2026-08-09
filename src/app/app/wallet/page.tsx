'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { C } from "@/lib/constants/theme";
import { TopBar } from "@/app/components/layout/TopBar";
import { useAuth } from "@/lib/auth";
import { walletApi, type TokenPackage } from "@/lib/api/wallet";
import {
  Wallet,
  Coins,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function WalletPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuth();

  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [packagesFailed, setPackagesFailed] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    setPackagesFailed(false);
    try {
      const [bal, availablePackages] = await Promise.all([
        walletApi.getBalance(),
        walletApi.getPackages(),
      ]);
      setBalance(bal.balance);
      const dollarPackages = availablePackages.filter((pkg) => pkg.currency === "USD");
      setPackages((dollarPackages.length > 0 ? dollarPackages : availablePackages).slice(0, 4));
    } catch {
      setError("We could not reach the wallet service. Reconnect and hit Sync.");
      setPackagesFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      load();
    }
  }, [isInitialized]);

  const handlePurchase = async (pkg: TokenPackage) => {
    setPurchasingId(pkg.id);
    setError(null);
    try {
      const result = await walletApi.purchasePackage(pkg.id, user);
      if (!result.success || !result.checkoutUrl) {
        setError(result.message || "Paymob checkout could not be started.");
        return;
      }
      window.location.assign(result.checkoutUrl);
    } catch {
      setError("Paymob checkout could not be started. Please try again.");
    } finally {
      setPurchasingId(null);
    }
  };

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
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, marginBottom: 24 }}>
          <div style={{ background: "linear-gradient(135deg,#0F3D3E,#1A5253)", borderRadius: 18, padding: "22px 24px", color: C.limestone }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${C.limestone}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Wallet size={20} color={C.sand} />
              </div>
              <div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: `${C.limestone}60`, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>
                  Available Balance
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "34px", lineHeight: 1.05 }}>
                  {loading ? "—" : balance.toLocaleString()} <span style={{ fontSize: "18px", color: C.sand }}>tokens</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: "#FAF7F0", border: `1px solid rgba(27,26,23,0.1)`, borderRadius: 18, padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${C.sand}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Coins size={20} color={C.copper} />
              </div>
              <div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: "#8B7E6A", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>
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

        <section>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Sparkles size={16} color={C.sand} />
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "22px", color: C.basalt }}>
              Get more tokens
            </div>
          </div>
          {packages.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
              {packages.map((pkg) => (
                <div key={pkg.id} style={{ background: pkg.popular ? "#FFF9EC" : "#FAF7F0", border: pkg.popular ? `1.5px solid ${C.sand}` : "1px solid rgba(27,26,23,0.1)", borderRadius: 16, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", color: C.basalt }}>{pkg.name}</span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "17px", fontWeight: 800, color: C.copper }}>${pkg.price.toFixed(2)}</span>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "30px", color: C.nile }}>{pkg.tokens} <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A" }}>tokens</span></div>
                  <button onClick={() => handlePurchase(pkg)} disabled={purchasingId === pkg.id} style={{ background: pkg.popular ? `linear-gradient(135deg,${C.sand},${C.copper})` : `linear-gradient(135deg,${C.nile},${C.nileMid})`, color: C.limestone, border: "none", borderRadius: 10, padding: "10px 16px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, cursor: purchasingId === pkg.id ? "default" : "pointer", opacity: purchasingId === pkg.id ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {purchasingId === pkg.id ? "Opening Paymob…" : "Buy with Paymob"} <ChevronRight size={15} />
                  </button>
                </div>
              ))}
            </div>
          ) : !loading && (
            <div style={{ background: "rgba(27,26,23,0.04)", borderRadius: 14, padding: 24, textAlign: "center", fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#8B7E6A" }}>
              {packagesFailed ? "Token packages are unavailable. Reconnect and hit Sync." : "No token packages are available right now."}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
