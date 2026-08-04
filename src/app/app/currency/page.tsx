"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { C } from "@/lib/constants/theme";
import { Glyph, Geom } from "@/app/components/atoms";
import { TopBar } from "@/app/components/layout/TopBar";
import { currencyApi, fallbackRatesNow, type EgyptianCurrency, type ExchangeRates, type CurrencyInfo } from "@/lib/api/currency";
import { Coins, Banknote, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

const TARGET_CURRENCIES = ["USD", "EUR", "GBP", "SAR", "AED"] as const;

function formatRate(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}

function formatMoney(value: number | null, currency: string): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateTime(value: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(d);
  } catch {
    return value;
  }
}

function Skeleton() {
  return (
    <div
      style={{
        background: "rgba(27,26,23,0.06)",
        borderRadius: 12,
        height: 76,
        animation: "pulse 1.4s ease-in-out infinite",
      }}
    />
  );
}

export default function CurrencyPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<EgyptianCurrency | null>(null);
  const [info, setInfo] = useState<CurrencyInfo | null>(null);
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [amount, setAmount] = useState("100");
  const [ratesRetry, setRatesRetry] = useState(0);

  useEffect(() => {
    currencyApi.getCatalog().then(setCatalog);
    currencyApi.getInfo().then(setInfo).catch(() => setInfo(null));
  }, []);

  useEffect(() => {
    let active = true;
    setRatesLoading(true);
    currencyApi
      .getRates("EGP")
      .then((r) => {
        if (!active) return;
        const usable =
          r?.rates &&
          Object.values(r.rates).some((v) => typeof v === "number" && v > 0);
        setRates(usable ? r : fallbackRatesNow("EGP"));
      })
      .catch(() => {
        if (active) setRates(fallbackRatesNow("EGP"));
      })
      .finally(() => {
        if (active) setRatesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [ratesRetry]);

  const ratesTable = useMemo(() => {
    if (!rates?.rates) return [];
    return TARGET_CURRENCIES.map((code) => ({
      code,
      perOneEgp: rates.rates?.[code],
    })).filter((r) => typeof r.perOneEgp === "number");
  }, [rates]);

  const parsedAmount = useMemo(() => {
    const v = parseFloat(amount);
    return Number.isNaN(v) ? 0 : v;
  }, [amount]);

  const showStale = rates && !rates.available && !!rates.stale;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg }}>
      <TopBar location="Currency & Money" onRafiq={() => router.push("/app/rafiq")} />

      <div style={{ maxWidth: 1040, width: "100%", margin: "0 auto", padding: "28px 32px", boxSizing: "border-box" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 6,
          }}
        >
          <Glyph size={34} />
          <div>
            <div
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "10px",
                fontWeight: 700,
                color: `${C.nile}70`,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              Currency & Money
            </div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(26px,3.4vw,40px)",
                fontWeight: 400,
                color: C.basalt,
                lineHeight: 1.05,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              The <span style={{ fontStyle: "italic", color: C.copper }}>Egyptian Pound</span>
            </h1>
          </div>
        </div>

        {!catalog ? (
          <div style={{ marginTop: 28 }}><Skeleton /></div>
        ) : (
          <>
            <section
              style={{
                background: "#FAF7F0",
                border: `1px solid rgba(27,26,23,0.1)`,
                borderRadius: 16,
                padding: "20px 22px",
                marginTop: 22,
                display: "flex",
                alignItems: "center",
                gap: 18,
                flexWrap: "wrap",
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg,${C.sand},${C.copper})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Glyph size={24} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", color: C.basalt }}>
                  {catalog.currency.name}
                </div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: `${C.basalt}60` }}>
                  {catalog.currency.iso_code} · <span style={{ fontFamily: "'Noto Naskh Arabic',serif", direction: "rtl" }}>{catalog.currency.symbol}</span> · {catalog.currency.issuing_authority}
                </div>
              </div>
            </section>
          </>
        )}

        <section style={{ marginTop: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: C.nile, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Live Rates
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", color: C.basalt, marginTop: 2 }}>
                Foreign unit per 1 EGP
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {showStale && (
                <span style={{ background: "#FEF3C7", color: "#92400E", fontSize: "11px", borderRadius: 99, padding: "3px 10px", fontWeight: 700 }}>
                  Cached · stale
                </span>
              )}
              {rates?.source === "offline-approx" && (
                <span style={{ background: "#FFF4EC", color: C.copper, fontSize: "11px", borderRadius: 99, padding: "3px 10px", fontWeight: 700 }}>
                  Approximate
                </span>
              )}
              <button
                onClick={() => setRatesRetry((k) => k + 1)}
                disabled={ratesLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#FAF7F0",
                  border: `1.5px solid rgba(27,26,23,0.13)`,
                  borderRadius: 99,
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: C.nile,
                  cursor: ratesLoading ? "default" : "pointer",
                  opacity: ratesLoading ? 0.6 : 1,
                }}
              >
                <RefreshCw size={13} style={ratesLoading ? { animation: "spin 1s linear infinite" } : {}} />
                {ratesLoading ? "Refreshing…" : "Refresh rates"}
              </button>
            </div>
          </div>

          {ratesLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
              {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} />)}
            </div>
          ) : ratesTable.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
              {ratesTable.map((r) => (
                <div
                  key={r.code}
                  style={{
                    background: "linear-gradient(135deg,#0F3D3E,#1A5253)",
                    borderRadius: 14,
                    padding: "14px 16px",
                    border: `1px solid ${C.nile}20`,
                  }}
                >
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, color: `${C.limestone}60`, letterSpacing: "0.12em" }}>
                    {r.code}
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "24px", color: C.limestone, marginTop: 2 }}>
                    {formatRate(r.perOneEgp as number)}
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "12px", color: `${C.limestone}50` }}>
                    = 1 EGP
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: "#FFF9EC", border: `1px solid ${C.solar}35`, borderRadius: 14, padding: "20px 22px", marginTop: 2 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <AlertTriangle size={17} color={C.solar} style={{ marginTop: 1 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.basalt }}>
                    Live rate feed is temporarily unavailable
                  </div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.basalt}70`, marginTop: 3, lineHeight: 1.5 }}>
                    The exchange-rate provider is not responding right now. Please try again in a moment — the coins and banknotes below are unaffected.
                  </div>
                  <button
                    onClick={() => setRatesRetry((k) => k + 1)}
                    style={{ marginTop: 10, background: C.nile, color: C.limestone, border: "none", borderRadius: 9, padding: "8px 16px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <RefreshCw size={13} /> Try again
                  </button>
                </div>
              </div>
              {info?.supportedCurrencies && info.supportedCurrencies.length > 0 && (
                <div style={{ marginTop: 14, borderTop: `1px dashed ${C.solar}30`, paddingTop: 14 }}>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: `${C.basalt}55`, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                    Supported currencies
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {info.supportedCurrencies.map((c) => (
                      <span key={c} style={{ background: "#F0EBE0", color: C.nile, borderRadius: 99, padding: "3px 10px", fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700 }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {rates && (
            <div style={{ display: "flex", gap: 18, marginTop: 10, fontFamily: "'Inter',sans-serif", fontSize: "11px", color: `${C.basalt}55` }}>
              <span>Updated: <strong style={{ color: C.basalt }}>{formatDateTime(rates.retrievedAt)}</strong></span>
              <span>Next: <strong style={{ color: C.basalt }}>{formatDateTime(rates.nextUpdateAt)}</strong></span>
            </div>
          )}

          {rates?.source === "offline-approx" && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.basalt}70` }}>
              <AlertTriangle size={13} color={C.solar} />
              Showing approximate rates — the live feed is offline. Press Refresh to retry.
            </div>
          )}

          <div style={{ borderTop: `1px solid rgba(27,26,23,0.1)`, marginTop: 18, paddingTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <label htmlFor="amt" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "16px", color: C.basalt }}>
                Egyptian Pounds (LE)
              </label>
              <input
                id="amt"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                style={{
                  width: 140,
                  background: "#F0EBE0",
                  border: `1.5px solid rgba(27,26,23,0.15)`,
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontFamily: "'Inter',sans-serif",
                  fontSize: "15px",
                  color: C.basalt,
                  outline: "none",
                }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 }}>
              {ratesTable.map((r) => (
                <div
                  key={"cv" + r.code}
                  style={{
                    background: "#FAF7F0",
                    border: `1px solid rgba(27,26,23,0.1)`,
                    borderRadius: 12,
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 700, color: C.nile }}>{r.code}</span>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "16px", color: C.basalt }}>
                    {formatMoney(parsedAmount * (r.perOneEgp as number), r.code)}
                  </span>
                </div>
              ))}
            </div>
            {ratesTable.length === 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(27,26,23,0.04)", borderRadius: 12, padding: "14px 16px", fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#8B7E6A" }}>
                <AlertTriangle size={14} color={C.solar} />
                Conversion is available once the live rate feed is back online.
              </div>
            )}
          </div>
        </section>

        <section style={{ marginTop: 26 }}>
          <SectionHeader icon={<Coins size={15} color={C.copper} />} title="Coins" count={catalog?.coins?.length ?? 0} />
          {catalog?.coins?.length ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 14 }}>
              {catalog.coins.map((c) => (
                <DenomCard key={c.id} image={c.image_url_front} title={c.denomination} subtitle={c.material} value={c.value_in_egp} note={c.obverse_design} />
              ))}
            </div>
          ) : (
            <EmptyState label="No coins available" />
          )}
        </section>

        <section style={{ marginTop: 26 }}>
          <SectionHeader icon={<Banknote size={18} color={C.copper} />} title="Banknotes" count={catalog?.banknotes?.length ?? 0} />
          {catalog?.banknotes?.length ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 14 }}>
              {catalog.banknotes.map((b) => (
                <DenomCard key={b.id} image={b.image_url_front} title={b.denomination} subtitle={`${b.dimensions_mm} mm`} value={b.value_in_egp} note={b.obverse_design} />
              ))}
            </div>
          ) : (
            <EmptyState label="No banknotes available" />
          )}
        </section>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, count }: { icon: React.ReactNode; title: string; count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      {icon}
      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, color: C.nile, letterSpacing: "0.14em", textTransform: "uppercase" }}>
        {title}
      </div>
      <span style={{ background: C.limestoneDark, color: "#8B7E6A", borderRadius: 99, padding: "1px 8px", fontSize: "11px", fontWeight: 600 }}>
        {count}
      </span>
    </div>
  );
}

function DenomCard({ image, title, subtitle, value, note }: { image: string; title: string; subtitle: string; value: number; note: string }) {
  return (
    <div style={{ background: "#FAF7F0", border: `1px solid rgba(27,26,23,0.1)`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ height: 120, background: "linear-gradient(135deg,#E8E0CC,#EDE4CC)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {image ? <img src={image} alt={title} style={{ maxHeight: 96, objectFit: "contain" }} /> : <Banknote size={30} color="#C0B194" />}
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "16px", color: C.basalt }}>{title}</div>
          <span style={{ background: C.limestone, border: `1px solid ${C.sand}60`, color: C.copper, borderRadius: 6, padding: "2px 7px", fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700 }}>
            LE {value}
          </span>
        </div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: `${C.basalt}55`, marginTop: 3 }}>{subtitle}</div>
        {note && <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: `${C.basalt}70`, marginTop: 6, fontStyle: "italic" }}>{note}</div>}
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div style={{ background: "rgba(27,26,23,0.04)", borderRadius: 14, padding: "28px", textAlign: "center", fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", color: `${C.basalt}55` }}>
      {label}
    </div>
  );
}