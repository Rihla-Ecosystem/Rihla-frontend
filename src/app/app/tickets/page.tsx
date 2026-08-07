"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { C } from "@/lib/constants/theme";
import { TopBar } from "@/app/components/layout/TopBar";
import { monumentsService, type Monument } from "@/services/monumentsService";
import { geoApi } from "@/lib/api/geo";
import { useLocation } from "@/providers/LocationProvider";
import {
  Ticket,
  MapPin,
  Clock,
  Navigation,
  Search,
  Loader2,
  ExternalLink,
  Compass,
  X,
} from "lucide-react";

const DEFAULT_LOCATION = { latitude: 30.0444, longitude: 31.2357 };
const CATEGORY_FILTERS = ["archaeological", "islamic", "christian"] as const;

type LatLng = { latitude: number; longitude: number };

interface RouteInfo {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
}

export default function TicketsPage() {
  const router = useRouter();
  const { lat, lon } = useLocation();

  const [monuments, setMonuments] = useState<Monument[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [start, setStart] = useState<LatLng>(DEFAULT_LOCATION);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [category, setCategory] = useState<string>("all");
  const [governorate, setGovernorate] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    monumentsService
      .getMonuments()
      .then(setMonuments)
      .catch(() => setMonuments([]));
  }, []);

  useEffect(() => {
    if (lat != null && lon != null) {
      setStart({ latitude: lat, longitude: lon });
    }
  }, [lat, lon]);

  const selected = useMemo(
    () => monuments?.find((m) => m.id === selectedId) ?? null,
    [monuments, selectedId]
  );

  useEffect(() => {
    if (!selected) {
      setRoute(null);
      return;
    }
    let active = true;
    setRouteLoading(true);
    geoApi
      .getRoute(start, { latitude: selected.latitude, longitude: selected.longitude })
      .then((r) => {
        if (active) setRoute(r as RouteInfo | null);
      })
      .catch(() => {
        if (active) setRoute(null);
      })
      .finally(() => {
        if (active) setRouteLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selected, start]);

  const governorates = useMemo(() => {
    const set = new Set<string>();
    monuments?.forEach((m) => m.governorate && set.add(m.governorate));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [monuments]);

  const filtered = useMemo(() => {
    if (!monuments) return [];
    return monuments.filter((m) => {
      if (category !== "all" && m.category !== category) return false;
      if (governorate !== "all" && m.governorate !== governorate) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!m.title.toLowerCase().includes(q) && !(m.city ?? "").toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [monuments, category, governorate, search]);

  const handleMapClick = (lng: number, latClick: number) => {
    setStart({ longitude: lng, latitude: latClick });
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg }}>
      <TopBar location="Monument Tickets" onRafiq={() => router.push("/app/rafiq")} />

      <div
        style={{
          background: `linear-gradient(135deg,${C.nile},${C.nileMid})`,
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: `${C.limestone}55`, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>
            Tickets & Entrance
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(22px,3vw,34px)", fontWeight: 400, color: C.limestone, lineHeight: 1.1, margin: 0 }}>
            Monument <span style={{ fontStyle: "italic", color: C.sand }}>Ticket Guide</span>
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: `${C.limestone}12`, border: `1px solid ${C.limestone}22`, borderRadius: 99, padding: "7px 14px" }}>
          <Compass size={14} color={C.sand} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.limestone }}>
            {monuments?.length ?? 0} monuments
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto", padding: "20px 32px", boxSizing: "border-box", flex: 1 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220, display: "flex", alignItems: "center" }}>
            <Search size={15} color="#8B7E6A" style={{ position: "absolute", left: 12 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search monuments…"
              style={{
                width: "100%",
                background: "#FAF7F0",
                border: `1.5px solid rgba(27,26,23,0.13)`,
                borderRadius: 10,
                padding: "9px 12px 9px 36px",
                fontFamily: "'Inter',sans-serif",
                fontSize: "13px",
                color: C.basalt,
                outline: "none",
              }}
            />
          </div>
          <select
            value={governorate}
            onChange={(e) => setGovernorate(e.target.value)}
            style={{
              background: "#FAF7F0",
              border: `1.5px solid rgba(27,26,23,0.13)`,
              borderRadius: 10,
              padding: "9px 12px",
              fontFamily: "'Inter',sans-serif",
              fontSize: "13px",
              color: C.basalt,
              outline: "none",
            }}
          >
            <option value="all">All governorates</option>
            {governorates.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {["all", ...CATEGORY_FILTERS].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={{
                background: category === c ? C.nile : "#FAF7F0",
                color: category === c ? C.limestone : C.nile,
                border: category === c ? "none" : `1.5px solid rgba(27,26,23,0.13)`,
                borderRadius: 99,
                padding: "7px 16px",
                fontFamily: "'Inter',sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 20, alignItems: "start" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
            {monuments === null ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: 180, background: "rgba(27,26,23,0.06)", borderRadius: 14, animation: "pulse 1.4s ease-in-out infinite" }} />
              ))
            ) : filtered.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40, fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", color: "#8B7E6A" }}>
                No monuments match your filters.
              </div>
            ) : (
              filtered.map((m) => (
                <MonumentCard
                  key={m.id}
                  monument={m}
                  active={selectedId === m.id}
                  onClick={() => setSelectedId(m.id)}
                />
              ))
            )}
          </div>

          <div style={{ position: "sticky", top: 76 }}>
            {selected ? (
              <DetailPanel
                monument={selected}
                route={route}
                routeLoading={routeLoading}
                onMapClick={handleMapClick}
                onClose={() => setSelectedId(null)}
              />
            ) : (
              <div
                style={{
                  background: "#FAF7F0",
                  border: `1.5px dashed rgba(27,26,23,0.2)`,
                  borderRadius: 16,
                  padding: 40,
                  textAlign: "center",
                }}
              >
                <Ticket size={28} color={C.copper} style={{ marginBottom: 8 }} />
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", color: C.basalt }}>
                  Select a monument
                </div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#8B7E6A", marginTop: 4 }}>
                  See ticket prices, opening hours and get directions.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MonumentCard({ monument, active, onClick }: { monument: Monument; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "#FFFDF8" : "#FAF7F0",
        border: active ? `2px solid ${C.copper}` : `1px solid rgba(27,26,23,0.1)`,
        borderRadius: 14,
        overflow: "hidden",
        textAlign: "left",
        cursor: "pointer",
        padding: 0,
        transition: "all 0.15s",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ height: 110, background: "#E8E0CC", overflow: "hidden" }}>
        {monument.images?.[0] ? (
          <img src={monument.images[0]} alt={monument.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Compass size={26} color="#C0B194" />
          </div>
        )}
      </div>
      <div style={{ padding: "11px 13px" }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "16px", color: C.basalt, lineHeight: 1.2 }}>
          {monument.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
          {monument.city && (
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "#8B7E6A" }}>
              <MapPin size={9} style={{ display: "inline", verticalAlign: -1 }} /> {monument.city}
            </span>
          )}
          {monument.category && (
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "9px", fontWeight: 700, color: C.nile, background: `${C.nile}12`, borderRadius: 4, padding: "1px 6px", textTransform: "capitalize" }}>
              {monument.category}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function DetailPanel({
  monument,
  route,
  routeLoading,
  onMapClick,
  onClose,
}: {
  monument: Monument;
  route: RouteInfo | null;
  routeLoading: boolean;
  onMapClick: (lng: number, lat: number) => void;
  onClose: () => void;
}) {
  const price = (p: number | null | undefined) => (p == null ? "—" : `LE ${p}`);

  return (
    <div style={{ background: "#FAF7F0", border: `1px solid rgba(27,26,23,0.1)`, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ height: 150, background: "#E8E0CC", position: "relative" }}>
        {monument.images?.[0] ? (
          <img src={monument.images[0]} alt={monument.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : null}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: 99, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <X size={16} color={C.basalt} />
        </button>
      </div>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "21px", color: C.basalt, margin: 0, lineHeight: 1.15 }}>
            {monument.title}
          </h2>
        </div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A", marginBottom: 10 }}>
          {monument.city ?? "Egypt"} · {monument.governorate ?? ""}
        </div>
        {monument.description && (
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.basalt}75`, lineHeight: 1.6, margin: "0 0 12px" }}>
            {monument.description}
          </p>
        )}

        <div style={{ background: "#F0EBE0", borderRadius: 12, padding: "13px 15px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Ticket size={14} color={C.copper} />
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: C.nile, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Ticket Prices
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontFamily: "'Inter',sans-serif", fontSize: "11px" }}>
            <div />
            <div style={{ fontWeight: 700, color: `${C.basalt}60`, textAlign: "center" }}>Adult</div>
            <div style={{ fontWeight: 700, color: `${C.basalt}60`, textAlign: "center" }}>Student</div>
            <div style={{ fontWeight: 700, color: C.nile }}>Egyptian</div>
            <div style={{ textAlign: "center" }}>{price(monument.prices?.egyptian?.adult)}</div>
            <div style={{ textAlign: "center" }}>{price(monument.prices?.egyptian?.student)}</div>
            <div style={{ fontWeight: 700, color: C.copper }}>Foreigner</div>
            <div style={{ textAlign: "center" }}>{price(monument.prices?.foreigner?.adult)}</div>
            <div style={{ textAlign: "center" }}>{price(monument.prices?.foreigner?.student)}</div>
          </div>
        </div>

        {(monument.opening_hours?.summer || monument.opening_hours?.winter || monument.opening_hours?.ramadan) && (
          <div style={{ background: "#F0EBE0", borderRadius: 12, padding: "13px 15px", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Clock size={14} color={C.copper} />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: C.nile, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Opening Hours
              </span>
            </div>
            {[
              ["Summer", monument.opening_hours?.summer],
              ["Winter", monument.opening_hours?.winter],
              ["Ramadan", monument.opening_hours?.ramadan],
            ]
              .filter(([, v]) => v)
              .map(([label, v]) => (
                <div key={String(label)} style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Inter',sans-serif", fontSize: "11px", color: `${C.basalt}70`, padding: "3px 0" }}>
                  <span>{label}</span>
                  <strong style={{ color: C.basalt }}>{v}</strong>
                </div>
              ))}
          </div>
        )}

        {monument.url && (
          <a
            href={monument.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              background: `linear-gradient(135deg,${C.nile},${C.nileMid})`,
              color: C.limestone,
              borderRadius: 10,
              padding: "10px 16px",
              fontFamily: "'Inter',sans-serif",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
              marginBottom: 12,
            }}
          >
            <ExternalLink size={14} /> Buy Tickets Online
          </a>
        )}

        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: C.nile, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          Directions
        </div>
        <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", height: 220, border: `1px solid rgba(27,26,23,0.12)` }}>
          <TicketMap
            start={{ lat: monument.latitude, lon: monument.longitude }}
            monument={{ lat: monument.latitude, lon: monument.longitude }}
            route={route}
            onMapClick={onMapClick}
          />
          {routeLoading && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(250,247,240,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 900 }}>
              <Loader2 size={22} color={C.copper} style={{ animation: "spin 1s linear infinite" }} />
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 8, fontFamily: "'Inter',sans-serif", fontSize: "11px", color: `${C.basalt}60` }}>
          <span>
            <Navigation size={11} style={{ display: "inline", verticalAlign: -1 }} />{" "}
            {route ? `${(route.distanceMeters / 1000).toFixed(1)} km` : "—"}
          </span>
          <span>
            <Clock size={11} style={{ display: "inline", verticalAlign: -1 }} />{" "}
            {route ? `${Math.round(route.durationSeconds / 60)} min` : "—"}
          </span>
          <span style={{ fontStyle: "italic", color: `${C.basalt}40` }}>tap map to choose start point</span>
        </div>
      </div>
    </div>
  );
}

function TicketMap({
  start,
  monument,
  route,
  onMapClick,
}: {
  start: { lat: number; lon: number };
  monument: { lat: number; lon: number };
  route: RouteInfo | null;
  onMapClick: (lng: number, lat: number) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const mapInstance = React.useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    let L: any = null;
    (async () => {
      L = (await import("leaflet")).default;
      if (!isMounted || !ref.current) return;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      const map = L.map(ref.current, {
        center: [monument.lat, monument.lon],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });
      mapInstance.current = map;
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map);

      const greenIcon = L.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;border-radius:50%;background:${C.safeGreen};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      const redIcon = L.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;border-radius:50%;background:${C.signalRed};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([start.lat, start.lon], { icon: greenIcon }).addTo(map);
      L.marker([monument.lat, monument.lon], { icon: redIcon }).addTo(map);
      map.on("click", (e: any) => onMapClick(e.latlng.lng, e.latlng.lat));
    })();
    return () => {
      isMounted = false;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    let polyline: any = null;
    (async () => {
      const L = (await import("leaflet")).default;
      if (route && route.coordinates.length > 1) {
        polyline = L.polyline(route.coordinates, { color: C.safeGreen, weight: 4, opacity: 0.85, dashArray: "2, 6" }).addTo(map);
        map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
      }
    })();
    return () => {
      if (polyline) map.removeLayer(polyline);
    };
  }, [route]);

  return <div ref={ref} style={{ width: "100%", height: "100%", background: "#EDE4CC" }} />;
}
