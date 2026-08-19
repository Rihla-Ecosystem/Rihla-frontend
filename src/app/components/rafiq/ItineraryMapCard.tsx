"use client";

import React, { useEffect, useMemo, useState } from "react";
import { InteractiveMap, type MapTripStop } from "@/app/components/ui/InteractiveMap";
import { geoApi } from "@/lib/api/geo";
import type { Site } from "@/lib/api/geo-types";
import type { ItineraryPlace } from "@/lib/api/itinerary";
import { C } from "@/lib/constants/theme";
import { MapPin, Route } from "lucide-react";

interface ItineraryMapCardProps {
  places: ItineraryPlace[];
}

const DAY_COLORS = ["#C8831A", "#2563EB", "#059669", "#B23A2E", "#7C3AED", "#0F766E"];

export function ItineraryMapCard({ places }: ItineraryMapCardProps) {
  const valid = useMemo(
    () =>
      (places || []).filter(
        (p) => typeof p.lat === "number" && typeof p.lon === "number"
      ),
    [places]
  );

  const [polyline, setPolyline] = useState<[number, number][] | null>(null);
  const [routeInfo, setRouteInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (valid.length === 0) {
      setPolyline(null);
      setRouteInfo(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const start = valid[0];
      const sites: Site[] = valid.slice(1).map((p, i) => ({
        id: `it-${i}-${p.name}`,
        name: p.name,
        nameAr: "",
        latitude: p.lat as number,
        longitude: p.lon as number,
        category: p.type || "attraction",
        governorate: p.city || "",
        description: "",
        images: [],
        rating: 4.5,
        visitDuration: 120,
        bestTime: "year-round",
        tips: [],
      }));
      const plan = await geoApi.getTrip(
        { latitude: start.lat as number, longitude: start.lon as number },
        sites
      );
      if (cancelled) return;
      setPolyline(plan?.coordinates ?? null);
      if (plan && plan.coordinates.length > 1) {
        setRouteInfo(
          `${(plan.distanceMeters / 1000).toFixed(1)} km · ${Math.round(plan.durationSeconds / 60)} min`
        );
      } else {
        setRouteInfo(null);
      }
    })().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [valid]);

  const tripStops: MapTripStop[] = useMemo(
    () =>
      valid.map((p, i) => ({
        index: i + 1,
        name: p.name,
        latitude: p.lat as number,
        longitude: p.lon as number,
      })),
    [valid]
  );

  if (valid.length === 0) {
    return (
      <div
        style={{
          marginTop: 10,
          background: "rgba(232,168,32,0.08)",
          border: "1px solid rgba(232,168,32,0.25)",
          borderRadius: 10,
          padding: "10px 12px",
          fontSize: "11.5px",
          color: "#8B7E6A",
        }}
      >
        Map unavailable — no mappable places were returned for this itinerary.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 10, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(27,26,23,0.08)" }}>
      <div style={{ height: 260 }}>
        <InteractiveMap
          sites={[]}
          tripPolyline={polyline}
          tripStops={tripStops}
          overlay
          loadingNote={loading ? "Mapping your itinerary…" : null}
        />
      </div>
      <div style={{ background: "#FBF8F1", padding: "8px 12px", borderTop: "1px solid rgba(27,26,23,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <Route size={12} color={C.solar} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: C.nile }}>
            {routeInfo ? `Suggested route · ${routeInfo}` : "Suggested route"}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {valid.map((p, i) => (
            <div key={`${p.day}-${i}-${p.name}`} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span
                style={{
                  width: 17,
                  height: 17,
                  borderRadius: "50%",
                  background: DAY_COLORS[(p.day && p.day > 0 ? p.day - 1 : i) % DAY_COLORS.length],
                  color: "#FFF",
                  fontFamily: "'Inter',sans-serif",
                  fontSize: "9px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <MapPin size={10} color="#A89880" style={{ flexShrink: 0 }} />
              <span
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: "11px",
                  color: C.basalt,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {p.name}
                {typeof p.day === "number" && ` · Day ${p.day}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}