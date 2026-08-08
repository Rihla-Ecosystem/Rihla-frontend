"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";
import { C } from "@/lib/constants/theme";
import { TopBar } from "@/app/components/layout/TopBar";
import { monumentsService, normalizeName, type Monument } from "@/services/monumentsService";
import { geoApi, googleMapsDirectionsUrl } from "@/lib/api/geo";
import { useLocation } from "@/providers/LocationProvider";
import { buildMonumentSite, isScamSite } from "@/app/data/monument-catalog";
import { govNameColor } from "@/app/app/explore/components/ExploreSearchBar";
import { ALL_SITES, type RihlaSite } from "@/app/data/rihla-data";
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
  AlertTriangle,
  Star,
  Sparkles,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

const DEFAULT_LOCATION = { latitude: 30.0444, longitude: 31.2357 };
const CATEGORY_FILTERS = ["all", "archaeological", "islamic", "christian"] as const;
const SORTS = [
  { id: "recommended", label: "Recommended" },
  { id: "rating", label: "Top rated" },
  { id: "name", label: "Name A–Z" },
  { id: "price", label: "Price: low first" },
] as const;

type LatLng = { latitude: number; longitude: number };

interface RouteInfo {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
  approximate?: boolean;
}

export default function MonumentsPage() {
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
  const [scamOnly, setScamOnly] = useState(false);
  const [sort, setSort] = useState<string>("recommended");

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

  const origin = useMemo(() => ({ lat: start.latitude, lon: start.longitude }), [start]);

  // site-lookups: monumentId -> enriched RihlaSite
  const siteByMonument = useMemo(() => {
    if (!monuments) return new Map<string, RihlaSite>();
    return new Map(
      monuments.map((m, i) => [m.id, buildMonumentSite(m, i, origin)])
    );
  }, [monuments, origin]);

  const monumentByTitle = useMemo(() => {
    const m = new Map<string, Monument>();
    monuments?.forEach((mon) => m.set(normalizeName(mon.title), mon));
    return m;
  }, [monuments]);

  const selected = useMemo(
    () => monuments?.find((m) => m.id === selectedId) ?? null,
    [monuments, selectedId]
  );
  const selectedSite = selected ? siteByMonument.get(selected.id) ?? null : null;

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
    let list = monuments.filter((m) => {
      if (category !== "all" && m.category !== category) return false;
      if (governorate !== "all" && m.governorate !== governorate) return false;
      if (scamOnly && !isScamSite(m)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !m.title.toLowerCase().includes(q) &&
          !(m.city ?? "").toLowerCase().includes(q) &&
          !(m.governorate ?? "").toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });

    switch (sort) {
      case "rating":
        list = [...list].sort(
          (a, b) =>
            (siteByMonument.get(b.id)?.rating ?? 0) -
            (siteByMonument.get(a.id)?.rating ?? 0)
        );
        break;
      case "name":
        list = [...list].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "price":
        list = [...list].sort(
          (a, b) =>
            (a.prices?.foreigner?.adult ?? Infinity) -
            (b.prices?.foreigner?.adult ?? Infinity)
        );
        break;
      default:
        break;
    }
    return list;
  }, [monuments, category, governorate, scamOnly, search, sort, siteByMonument]);

  const handleMapClick = (lng: number, latClick: number) => {
    setStart({ longitude: lng, latitude: latClick });
  };

  const filterControl: React.CSSProperties = {
    background: "#FAF7F0",
    border: `1.5px solid rgba(27,26,23,0.13)`,
    borderRadius: 10,
    padding: "9px 12px",
    fontFamily: "'Inter',sans-serif",
    fontSize: "13px",
    color: C.basalt,
    outline: "none",
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg }}>
      <TopBar location="Monuments of Egypt" onRafiq={() => router.push("/app/rafiq")} />

      {/* Hero header */}
      <div
        style={{
          background: `linear-gradient(135deg,${C.nile},${C.nileMid})`,
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: `${C.limestone}55`, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>
            Historic Sites of Egypt
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(22px,3vw,34px)", fontWeight: 400, color: C.limestone, lineHeight: 1.1, margin: 0 }}>
            Monuments <span style={{ fontStyle: "italic", color: C.sand }}>of Egypt</span>
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: `${C.limestone}12`, border: `1px solid ${C.limestone}22`, borderRadius: 99, padding: "7px 14px" }}>
          <Compass size={14} color={C.sand} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.limestone }}>
            {monuments?.length ?? 0} monuments · {governorates.length} governorates
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 1180, width: "100%", margin: "0 auto", padding: "20px 32px", boxSizing: "border-box", flex: 1 }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220, display: "flex", alignItems: "center" }}>
            <Search size={15} color="#8B7E6A" style={{ position: "absolute", left: 12 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search monuments, cities…"
              style={{ ...filterControl, width: "100%", paddingLeft: 36 }}
            />
          </div>
          <select value={governorate} onChange={(e) => setGovernorate(e.target.value)} style={filterControl}>
            <option value="all">All governorates</option>
            {governorates.map((g, i) => (
              <option key={g} value={g} style={{ color: govNameColor(g, i) }}>{g}</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={filterControl}>
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 18 }}>
          {CATEGORY_FILTERS.map((c) => (
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
          <button
            onClick={() => setScamOnly((v) => !v)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: scamOnly ? `${C.alertAmber}22` : "#FAF7F0",
              color: scamOnly ? C.alertAmber : C.nile,
              border: scamOnly ? `1.5px solid ${C.alertAmber}70` : `1.5px solid rgba(27,26,23,0.13)`,
              borderRadius: 99,
              padding: "7px 16px",
              fontFamily: "'Inter',sans-serif",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <AlertTriangle size={13} strokeWidth={2.2} /> Scam alerts
          </button>
          <span style={{ marginLeft: "auto", fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A" }}>
            {filtered.length} shown
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 460px", gap: 20, alignItems: "start" }}>
          {/* Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 14 }}>
            {monuments === null ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: 190, background: "rgba(27,26,23,0.06)", borderRadius: 14, animation: "pulse 1.4s ease-in-out infinite" }} />
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
                  site={siteByMonument.get(m.id) ?? null}
                  scam={isScamSite(m)}
                  active={selectedId === m.id}
                  onClick={() => setSelectedId(m.id)}
                />
              ))
            )}
          </div>

          {/* Rich detail panel */}
          <div style={{ position: "sticky", top: 76, maxHeight: "calc(100vh - 92px)", overflowY: "auto" }}>
            {selected && selectedSite ? (
              <DetailPanel
                monument={selected}
                site={selectedSite}
                start={start}
                route={route}
                routeLoading={routeLoading}
                onMapClick={handleMapClick}
                onClose={() => setSelectedId(null)}
                onFullPage={() => router.push(`/app/monuments/${encodeURIComponent(selected.id)}`)}
                monumentByTitle={monumentByTitle}
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
                  Stories, ticket prices, scam alerts, opening hours and directions.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Cards ── */

function MonumentCard({
  monument,
  site,
  scam,
  active,
  onClick,
}: {
  monument: Monument;
  site: RihlaSite | null;
  scam: boolean;
  active: boolean;
  onClick: () => void;
}) {
  const foreignAdult = monument.prices?.foreigner?.adult;
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
      <div style={{ height: 110, background: "#E8E0CC", overflow: "hidden", position: "relative" }}>
        {monument.images?.[0] ? (
          <img src={monument.images[0]} alt={monument.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Compass size={26} color="#C0B194" />
          </div>
        )}
        {scam && (
          <span style={{ position: "absolute", top: 8, left: 8, display: "inline-flex", alignItems: "center", gap: 4, background: `${C.alertAmber}e0`, color: "#fff", fontSize: "9px", fontWeight: 700, borderRadius: 99, padding: "2px 8px" }}>
            <AlertTriangle size={9} strokeWidth={2.5} /> Scam alert
          </span>
        )}
      </div>
      <div style={{ padding: "11px 13px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "16px", color: C.basalt, lineHeight: 1.2 }}>
          {monument.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {monument.city && (
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "#8B7E6A" }}>
              <MapPin size={9} style={{ display: "inline", verticalAlign: -1 }} /> {monument.city}
            </span>
          )}
          {site && site.rating > 0 && (
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: C.sand, display: "inline-flex", alignItems: "center", gap: 3 }}>
              <Star size={10} fill={C.sand} strokeWidth={0} /> {site.rating}
            </span>
          )}
        </div>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "9px", fontWeight: 700, color: C.nile, background: `${C.nile}12`, borderRadius: 4, padding: "1px 6px", textTransform: "capitalize" }}>
            {monument.category}
          </span>
          {foreignAdult != null && (
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, color: C.copper }}>
              LE {foreignAdult}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ── Rich detail panel ── */

function DetailPanel({
  monument,
  site,
  start,
  route,
  routeLoading,
  onMapClick,
  onClose,
  onFullPage,
  monumentByTitle,
}: {
  monument: Monument;
  site: RihlaSite;
  start: LatLng;
  route: RouteInfo | null;
  routeLoading: boolean;
  onMapClick: (lng: number, lat: number) => void;
  onClose: () => void;
  onFullPage: () => void;
  monumentByTitle: Map<string, Monument>;
}) {
  const price = (p: number | null | undefined) => (p == null ? "—" : `LE ${p}`);
  const [expanded, setExpanded] = useState(false);
  const story = site.story || monument.description || "";
  const storyShort = story.length > 320 ? story.slice(0, 320).trimEnd() + "…" : story;

  const nearbyMonuments = useMemo(() => {
    const list: { monument: Monument; name: string }[] = [];
    for (const id of site.nearby ?? []) {
      const curated = ALL_SITES.find((s) => s.id === id);
      if (!curated) continue;
      const match = monumentByTitle.get(normalizeName(curated.name));
      if (match) list.push({ monument: match, name: curated.name });
      if (list.length >= 3) break;
    }
    return list;
  }, [site.nearby, monumentByTitle]);

  return (
    <div style={{ background: "#FAF7F0", border: `1px solid rgba(27,26,23,0.1)`, borderRadius: 16, overflow: "hidden" }}>
      {/* Header image */}
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
        {site.scam && (
          <span style={{ position: "absolute", bottom: 10, left: 10, display: "inline-flex", alignItems: "center", gap: 5, background: `${C.alertAmber}e0`, color: "#fff", fontSize: "10px", fontWeight: 700, borderRadius: 99, padding: "4px 10px" }}>
            <AlertTriangle size={10} strokeWidth={2.5} /> Known scam patterns — read below
          </span>
        )}
      </div>

      <div style={{ padding: "16px 18px" }}>
        {/* Title + rating */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "22px", color: C.basalt, margin: 0, lineHeight: 1.15 }}>
            {monument.title}
          </h2>
          {site.rating > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <Star size={13} fill={C.sand} strokeWidth={0} />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.sand }}>{site.rating}</span>
            </div>
          )}
        </div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A", marginBottom: 10 }}>
          {monument.city ?? "Egypt"} · {monument.governorate ?? ""} · {site.cat}
        </div>

        {/* Story */}
        {story && (
          <div style={{ marginBottom: 12 }}>
            <SectionLabel>Story</SectionLabel>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.basalt}75`, lineHeight: 1.6, margin: 0 }}>
              {expanded ? story : storyShort}
              {story.length > 320 && (
                <button onClick={() => setExpanded((v) => !v)} style={{ background: "none", border: "none", color: C.copper, fontWeight: 700, cursor: "pointer", padding: 0, marginLeft: 4, fontSize: "12px" }}>
                  {expanded ? "less" : "more"}
                </button>
              )}
            </p>
          </div>
        )}

        {/* Scam scenario */}
        {site.scam && site.scamDetail && (
          <div style={{ background: `${C.alertAmber}14`, border: `1px solid ${C.alertAmber}55`, borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <AlertTriangle size={14} color={C.alertAmber} />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, color: C.alertAmber, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Scam scenarios
              </span>
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.basalt}85`, lineHeight: 1.6 }}>
              {site.scamDetail}
            </div>
          </div>
        )}

        {/* Tips */}
        {site.tips.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <SectionLabel>Visitor tips</SectionLabel>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
              {site.tips.slice(0, 4).map((t, i) => (
                <li key={i} style={{ display: "flex", gap: 7, fontFamily: "'Inter',sans-serif", fontSize: "12px", color: `${C.basalt}75`, lineHeight: 1.5 }}>
                  <Sparkles size={12} color={C.solar} style={{ marginTop: 2, flexShrink: 0 }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rafiq insight */}
        {site.rafiqInsight && (
          <div style={{ background: `${C.faience}10`, borderLeft: `3px solid ${C.faience}`, borderRadius: 8, padding: "10px 12px", marginBottom: 12, fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "13px", color: `${C.nile}90`, lineHeight: 1.55 }}>
            {site.rafiqInsight}
          </div>
        )}

        {/* Prices */}
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

        {/* Opening hours */}
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

        {/* Buy tickets */}
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

        {/* Nearby */}
        {nearbyMonuments.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <SectionLabel>Nearby</SectionLabel>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {nearbyMonuments.map((n) => (
                <a
                  key={n.monument.id}
                  href={`/app/monuments/${encodeURIComponent(n.monument.id)}`}
                  style={{ background: "#F0EBE0", border: "none", borderRadius: 99, padding: "5px 12px", fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: C.nile, textDecoration: "none", cursor: "pointer" }}
                >
                  {n.name} →
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Directions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: C.nile, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Directions
          </div>
          <a
            href={googleMapsDirectionsUrl(start, { latitude: monument.latitude, longitude: monument.longitude })}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: 99,
              padding: "4px 10px",
              fontFamily: "'Inter',sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              color: "#1D4ED8",
              textDecoration: "none",
            }}
          >
            <MapPin size={11} /> Open in Google Maps
          </a>
        </div>
        <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", height: 220, border: `1px solid rgba(27,26,23,0.12)` }}>
          <MonumentMap
            start={{ lat: start.latitude, lon: start.longitude }}
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
        <div style={{ display: "flex", gap: 14, marginTop: 8, fontFamily: "'Inter',sans-serif", fontSize: "11px", color: `${C.basalt}60`, flexWrap: "wrap" }}>
          <span>
            <Navigation size={11} style={{ display: "inline", verticalAlign: -1 }} />{" "}
            {route ? `${(route.distanceMeters / 1000).toFixed(1)} km` : "—"}
          </span>
          <span>
            <Clock size={11} style={{ display: "inline", verticalAlign: -1 }} />{" "}
            {route ? `${Math.round(route.durationSeconds / 60)} min` : "—"}
          </span>
          {route?.approximate && (
            <span style={{ color: "#B45309", fontWeight: 600 }}>Approximate route</span>
          )}
          <span style={{ fontStyle: "italic", color: `${C.basalt}40` }}>tap map to choose start point</span>
        </div>

        {/* Full page */}
        <button
          onClick={onFullPage}
          style={{
            marginTop: 14,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            background: "linear-gradient(135deg,#C4623A,#8A5A34)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "11px 16px",
            fontFamily: "'Inter',sans-serif",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Open full page <ArrowRight size={15} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, color: C.nile, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
      {children}
    </div>
  );
}

/* ── Map ── */

function MonumentMap({
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
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
      });
      mapInstance.current = map;
      L.control.zoom({ position: "bottomright" }).addTo(map);
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
