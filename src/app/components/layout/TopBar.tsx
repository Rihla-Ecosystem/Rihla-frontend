"use client";

import { MapPin, Bell, Search, RefreshCw } from "lucide-react";
import { C } from "@/lib/constants/theme";
import { useRouter } from 'next/navigation';
import { useLocation } from "@/providers/LocationProvider";
import { useAuth } from "@/lib/auth";

export function TopBar({ location: locationProp, onRafiq }: { location?: string; onRafiq?: () => void }) {
  const router = useRouter();
  const { locationName, governorate, status, requestLocation } = useLocation();
  const { user } = useAuth();
  const initial = (user?.displayName || "Traveler").charAt(0).toUpperCase();

  const liveLocation = (() => {
    if (status === 'requesting') return "Requesting location...";
    if (status === 'loading') return "Locating user...";
    const govName = governorate || "Giza";
    const govFormatted = govName.includes("Governorate") || govName.includes("محافظة")
      ? govName
      : `${govName} Governorate`;

    if (locationName) {
      if (locationName.toLowerCase().includes(govName.toLowerCase())) return locationName;
      return `${govFormatted} · ${locationName}`;
    }
    return `${govFormatted}, Egypt`;
  })();

  return (
    <div style={{ background: "rgba(240,235,224,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(27,26,23,0.08)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, flexShrink: 0, position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        {locationProp && (
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.nile, whiteSpace: "nowrap" }}>{locationProp}</span>
        )}
        <span
          title={liveLocation}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#FAF7F0",
            border: "1px solid rgba(27,26,23,0.1)",
            borderRadius: 99,
            padding: "4px 12px",
            minWidth: 0,
          }}
        >
          <MapPin size={13} color={status === 'success' ? C.safeGreen : C.copper} strokeWidth={2.5} style={{ flexShrink: 0 }} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", fontWeight: 600, color: C.nile, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{liveLocation}</span>
          {status === 'success' && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: C.safeGreen, fontWeight: 600 }}>Live</span>}
        </span>
        {(status === 'permission_denied' || status === 'location_unavailable') && (
          <button
            onClick={requestLocation}
            title="Enable Location Permission"
            style={{
              background: 'none',
              border: `1px solid ${C.signalRed}40`,
              borderRadius: 6,
              padding: '2px 8px',
              fontSize: '11px',
              color: C.signalRed,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <RefreshCw size={10} /> Enable
          </button>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ background: "#FAF7F0", border: "1.5px solid rgba(27,26,23,0.1)", borderRadius: 8, padding: "7px 14px", display: "flex", alignItems: "center", gap: 8, width: 220, cursor: "text" }}>
          <Search size={14} color="#A89880" strokeWidth={2}/><span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#A89880" }}>Search places, stories…</span>
        </div>
        <button style={{ background: "none", border: "none", position: "relative", cursor: "pointer", color: "#6B6354" }}>
          <Bell size={19} strokeWidth={1.8}/><span style={{ position: "absolute", top: -1, right: -1, width: 7, height: 7, borderRadius: "50%", background: C.alertAmber, border: "1.5px solid #F0EBE0" }}/>
        </button>
        <div 
          onClick={() => router.push('/app/profile')}
          style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${C.sand}50,${C.copper}50)`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "14px", fontWeight: 500, color: C.nile }}>{initial}</span>
        </div>
      </div>
    </div>
  );
}