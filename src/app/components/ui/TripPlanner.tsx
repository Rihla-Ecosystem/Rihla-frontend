"use client";

import { useMemo, useState, useCallback } from "react";
import { Compass, Route, Trash2, Loader2, MapPin } from "lucide-react";
import { C } from "@/lib/constants/theme";
import { geoApi } from "@/lib/api/geo";
import type { Site } from "@/lib/api/geo-types";

export const MAX_TRIP_STOPS = 12;

export const RADIUS_OPTIONS = [1000, 2000, 5000, 10000, 25000];

interface TripPlannerProps {
  sites: Site[];
  location: { latitude: number; longitude: number } | null;
  onPlan?: (plan: {
    coordinates: [number, number][];
    distanceMeters: number;
    durationSeconds: number;
    orderedStops: Site[];
  } | null) => void;
}

interface TripStop extends Site {
  addedAt: number;
}

export function TripPlanner({
  sites,
  location,
  onPlan,
}: TripPlannerProps) {
  const [stops, setStops] = useState<TripStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<{
    distanceMeters: number;
    durationSeconds: number;
    orderedStops: Site[];
  } | null>(null);

  const available = useMemo(() => {
    const ids = new Set(stops.map((s) => s.id));
    return sites.filter((s) => !ids.has(s.id));
  }, [sites, stops]);

  const addStop = (site: Site) => {
    if (stops.length >= MAX_TRIP_STOPS) return;
    setStops((prev) => [
      ...prev,
      { ...site, addedAt: Date.now() },
    ]);
    setPlan(null);
    onPlan?.(null);
  };

  const removeStop = (id: string) => {
    setStops((prev) => prev.filter((s) => s.id !== id));
    setPlan(null);
    onPlan?.(null);
  };

  const planTrip = useCallback(async () => {
    if (!location || stops.length === 0) return;
    setLoading(true);
    try {
      const result = await geoApi.getTrip(
        location,
        stops.map(({ addedAt: _a, ...rest }) => rest)
      );
      if (result) {
        setPlan(result);
        onPlan?.(result);
      }
    } finally {
      setLoading(false);
    }
  }, [location, stops, onPlan]);

  const clear = () => {
    setStops([]);
    setPlan(null);
    onPlan?.(null);
  };

  return (
    <div
      style={{
        background: C.limestone,
        borderRadius: 16,
        border: "1px solid rgba(27,26,23,0.1)",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(27,26,23,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1px solid rgba(27,26,23,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Route size={16} color={C.copper} />
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: "14px",
              fontWeight: 700,
              color: C.nile,
            }}
          >
            Trip Planner
          </span>
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: "11px",
              color: "#A89880",
            }}
          >
            {stops.length}/{MAX_TRIP_STOPS}
          </span>
        </div>
        {stops.length > 0 && (
          <button
            onClick={clear}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#A89880",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: "11px",
              fontFamily: "'Inter',sans-serif",
            }}
          >
            <Trash2 size={13} /> Clear
          </button>
        )}
      </div>

      <div style={{ padding: "10px 16px" }}>
        {available.length === 0 ? (
          <p
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: "12px",
              color: "#8B7E6A",
            }}
          >
            Select monuments on the map to plan a route.
          </p>
        ) : (
          <select
            value=""
            onChange={(e) => {
              const id = e.target.value;
              const site = available.find((s) => s.id === id);
              if (site) addStop(site);
            }}
            style={{
              width: "100%",
              background: "#FAF7F0",
              border: "1.5px solid rgba(27,26,23,0.12)",
              borderRadius: 8,
              padding: "8px 10px",
              fontFamily: "'Inter',sans-serif",
              fontSize: "13px",
              color: C.nile,
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="">Add a stop…</option>
            {available.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}

        {stops.length > 0 && (
          <div
            style={{
              marginTop: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              maxHeight: 180,
              overflowY: "auto",
            }}
          >
            {stops.map((s, idx) => (
              <div
                key={s.id + s.addedAt}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#FAF7F0",
                  borderRadius: 8,
                  padding: "6px 10px",
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: C.nile,
                    color: C.limestone,
                    fontFamily: "'Inter',sans-serif",
                    fontSize: "11px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontFamily: "'Inter',sans-serif",
                    fontSize: "12px",
                    color: C.nile,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.name}
                </span>
                <button
                  onClick={() => removeStop(s.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#A89880",
                    display: "flex",
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(27,26,23,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <button
            onClick={planTrip}
            disabled={loading || stops.length === 0 || !location}
            style={{
              background: C.nile,
              color: C.limestone,
              border: "none",
              borderRadius: 8,
              padding: "9px 16px",
              fontFamily: "'Inter',sans-serif",
              fontSize: "12px",
              fontWeight: 600,
              cursor: loading || stops.length === 0 || !location
                ? "not-allowed"
                : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: loading || stops.length === 0 || !location ? 0.5 : 1,
            }}
          >
            {loading ? (
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <Route size={14} />
            )}
            Plan route
          </button>
          {plan && (
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: C.safeGreen,
                }}
              >
                {(plan.distanceMeters / 1000).toFixed(1)} km
              </div>
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: "11px",
                  color: "#8B7E6A",
                }}
              >
                ~{Math.round(plan.durationSeconds / 60)} min
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}