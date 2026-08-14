"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, ShieldAlert, Info, X, Scale } from "lucide-react";
import { C } from "@/lib/constants/theme";
import { useLocation } from "@/providers/LocationProvider";
import {
  subscribeZoneStream,
  reportLocation,
  currentAreaNotice,
  type ZoneEvent,
} from "@/services/zoneNoticeService";
import { geoApi } from "@/lib/api/geo";
import type { AreaNotice, ZoneClass, ZoneSeverity, LegalGuide } from "@/lib/api/geo-types";

// Last dismissed transition key, reset when the user moves a significant distance.
let dismissedKey = "";

const CLASS_LABEL: Record<ZoneClass, string> = {
  restricted: "Restricted area ahead",
  caution: "Exercise caution",
  protected: "Protected area",
};

const CLASS_COPY: Record<ZoneClass, string> = {
  restricted: "Do not approach or enter. Avoid taking photographs here.",
  caution: "Stay aware of your surroundings and local rules.",
  protected: "Respect local rules and help preserve this area.",
};

const SEVERITY_COLOR: Record<ZoneSeverity, string> = {
  critical: C.signalRed,
  warning: C.alertAmber,
  info: C.faience,
};

const SEVERITY_BG: Record<ZoneSeverity, string> = {
  critical: "#2A0E0B",
  warning: "#2B1D08",
  info: "#08241F",
};

function fmtDistance(m?: number): string | null {
  if (m === undefined || m === null) return null;
  if (m < 1000) return `${Math.round(m)} m away`;
  return `${(m / 1000).toFixed(1)} km away`;
}

export function SensitiveAreaNotice() {
  const { lat, lon } = useLocation();
  const [notice, setNotice] = useState<AreaNotice | null>(null);
  const [visible, setVisible] = useState(false);
  const [lawModal, setLawModal] = useState<LegalGuide | null>(null);
  const [loadingLaw, setLoadingLaw] = useState(false);
  const permitRef = useRef(false);

  const applyNotice = useCallback((n: AreaNotice | null) => {
    if (!n || !n.active) {
      setNotice(null);
      setVisible(false);
      return;
    }
    const key = `${n.class}:${n.guide_key}`;
    if (dismissedKey === key) return;
    setNotice(n);
    setVisible(true);
  }, []);

  const openLaw = useCallback((zoneClass: ZoneClass) => {
    setLoadingLaw(true);
    setLawModal(null);
    geoApi
      .getZoneLaw(zoneClass, true)
      .then((g) => setLawModal(g))
      .finally(() => setLoadingLaw(false));
  }, []);

  const dismiss = useCallback(() => {
    if (notice?.class) dismissedKey = `${notice.class}:${notice.guide_key}`;
    setVisible(false);
    // ignore future re-sets until location moves significantly
    if (lat && lon) {
      const reset = () => {
        dismissedKey = "";
        permitRef.current = false;
        window.removeEventListener("geolocation_fix", reset);
      };
      window.addEventListener("geolocation_fix", reset);
      const t = setTimeout(() => {
        dismissedKey = "";
      }, 90_000);
      // clear the short term latch even if unopposed
      return () => clearTimeout(t);
    }
  }, [notice, lat, lon]);

  // Bootstrap + location ping
  useEffect(() => {
    if (lat === null || lon === null) return;
    currentAreaNotice(lat, lon).then(applyNotice).catch(() => undefined);
    void reportLocation(lat, lon);
  }, [lat, lon, applyNotice]);

  // SSE stream for live enter/exit transitions
  useEffect(() => {
    if (lat === null || lon === null) return;
    if (permitRef.current) return;
    permitRef.current = true;

    const abort = subscribeZoneStream({
      onZone: (zone: ZoneEvent) => {
        if (zone.event === "enter") {
          applyNotice({
            active: true,
            class: zone.class,
            severity: zone.severity,
            distance_meters: zone.distance_meters ?? 0,
            guide_key: zone.class,
          });
        } else {
          setNotice(null);
          setVisible(false);
        }
      },
    });

    return () => {
      permitRef.current = false;
      abort();
    };
  }, [lat, lon, applyNotice]);

  if (!visible || !notice || !notice.class) return null;

  const zoneClass = notice.class;
  const color = SEVERITY_COLOR[notice.severity ?? "warning"];
  const bg = SEVERITY_BG[notice.severity ?? "warning"];
  const Icon = zoneClass === "restricted" ? ShieldAlert : zoneClass === "caution" ? AlertTriangle : Info;
  const distance = fmtDistance(notice.distance_meters);

  return (
    <>
      <div
        role="alert"
        style={{
          position: "fixed",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 980,
          maxWidth: 520,
          width: "calc(100% - 32px)",
          background: bg,
          border: `1px solid ${color}`,
          borderLeft: `4px solid ${color}`,
          borderRadius: 12,
          padding: "12px 14px",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          boxShadow: "0 12px 34px rgba(0,0,0,0.45)",
          fontFamily: "'Inter',sans-serif",
        }}
      >
        <div style={{ flexShrink: 0, marginTop: 1, color }}>
          <Icon size={22} strokeWidth={2.2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: C.limestone }}>
              {CLASS_LABEL[zoneClass]}
            </span>
            {distance && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: C.limestone,
                  background: `${color}2e`,
                  padding: "2px 8px",
                  borderRadius: 999,
                }}
              >
                {distance}
              </span>
            )}
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "12.5px", lineHeight: 1.45, color: `${C.limestone}cc` }}>
            {CLASS_COPY[zoneClass]}
          </p>
          <button
            onClick={() => openLaw(zoneClass)}
            style={{
              marginTop: 8,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: `${color}22`,
              border: `1px solid ${color}55`,
              color: C.limestone,
              fontSize: "12px",
              fontWeight: 600,
              padding: "5px 10px",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: "'Inter',sans-serif",
            }}
          >
            <Scale size={14} /> View laws & guidelines
          </button>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          style={{
            background: "none",
            border: "none",
            color: `${C.limestone}70`,
            cursor: "pointer",
            padding: 2,
            flexShrink: 0,
          }}
        >
          <X size={16} strokeWidth={2.2} />
        </button>
      </div>

      {lawModal &&
        createPortal(
          <LawPopup guide={lawModal} loading={loadingLaw} onClose={() => setLawModal(null)} />,
          document.body
        )}
    </>
  );
}

function LawPopup({ guide, loading, onClose }: { guide: LegalGuide | null; loading: boolean; onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(2px)",
        fontFamily: "'Inter',sans-serif",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: C.surface.card,
          borderRadius: 16,
          maxWidth: 520,
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: 22,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          color: C.text.body,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Scale size={18} color={C.copper} />
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: C.text.body }}>
              {loading ? "Loading guidance…" : guide?.title || "Law & Safety Guidance"}
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", color: C.text.muted, cursor: "pointer" }}>
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {guide?.advice && (
          <div
            style={{
              background: `${C.faience}12`,
              borderLeft: `3px solid ${C.faience}`,
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: "13px",
              marginBottom: 14,
              color: C.text.body,
            }}
          >
            {guide.advice}
          </div>
        )}

        {guide?.rules?.map((rule, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.copper, marginBottom: 4 }}>
              {rule.heading}
            </div>
            {rule.points.map((p, j) => (
              <p key={j} style={{ margin: "0 0 6px", fontSize: "12.5px", lineHeight: 1.5 }}>
                • {p}
              </p>
            ))}
          </div>
        ))}

        {guide?.citations?.length ? (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.borderStrong}`, fontSize: "11px", color: C.text.muted }}>
            Sources: {guide.citations.join(", ")}
          </div>
        ) : null}

        <p style={{ marginTop: 12, fontSize: "11px", color: C.text.muted, fontStyle: "italic" }}>
          Zone identity is never revealed for safety. Rules may vary; follow the onsite authority.
        </p>
      </div>
    </div>
  );
}