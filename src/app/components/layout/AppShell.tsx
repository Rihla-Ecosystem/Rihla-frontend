"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { C } from "@/lib/constants/theme";
import { Glyph, GlyphFull, Geom } from "@/app/components/atoms";
import {
  MapPin, Bell, Navigation, Wind, Thermometer, Sun, Shield, Search, Map, User, AlertTriangle, Star, Clock, Camera,
  ArrowRight, Globe, Phone, CreditCard, Wifi, CheckCircle, X, ChevronLeft, ChevronRight, Menu,
  Home, Compass, Settings, BarChart2, Wallet, LogOut, Zap, Filter, SlidersHorizontal, BookOpen, Send, Mic, ChevronDown, RefreshCw, Ticket, Banknote, Landmark, Trophy
} from "lucide-react";
import { ShellNavProvider, useShellNav } from "./shell-nav";

export const NAV_ITEMS = [
  { id: "home",    label: "Home",    icon: (a: boolean) => <Home     size={18} strokeWidth={a ? 2.2 : 1.7}/> },
  { id: "explore", label: "Explore", icon: (a: boolean) => <Compass  size={18} strokeWidth={a ? 2.2 : 1.7}/> },
  { id: "monuments", label: "Monuments", icon: (a: boolean) => <Landmark size={18} strokeWidth={a ? 2.2 : 1.7}/> },
  { id: "rafiq",   label: "Rafiq",   icon: (a: boolean) => <Glyph    size={18}/>,                              special: true },
  { id: "safety",  label: "Safety",  icon: (a: boolean) => <Shield   size={18} strokeWidth={a ? 2.2 : 1.7}/> },
  { id: "currency", label: "Currency", icon: (a: boolean) => <Banknote size={18} strokeWidth={a ? 2.2 : 1.7}/> },
  { id: "quests",  label: "Quests",  icon: (a: boolean) => <Trophy   size={18} strokeWidth={a ? 2.2 : 1.7}/> },
  { id: "wallet",  label: "Wallet",  icon: (a: boolean) => <Wallet   size={18} strokeWidth={a ? 2.2 : 1.7}/> },
  { id: "profile", label: "Profile", icon: (a: boolean) => <User     size={18} strokeWidth={a ? 2.2 : 1.7}/> },
  { id: "history", label: "History", icon: (a: boolean) => <Clock    size={18} strokeWidth={a ? 2.2 : 1.7}/> },
{ id: "settings",label: "Settings",icon: (a: boolean) => <Settings size={18} strokeWidth={a ? 2.2 : 1.7}/> },
  { id: "admin",   label: "Admin",   icon: (a: boolean) => <BarChart2 size={18} strokeWidth={a ? 2.2 : 1.7}/>, adminOnly: true },
];

interface ShellContentProps {
  collapsed: boolean;
  activePage: string;
  isAdmin: boolean;
  displayName: string;
  initial: string;
  userLevel: number;
  userXp: number;
  onNavigate: (id: string) => void;
  onLogout: () => void;
  onToggleCollapse?: () => void;
}

function ShellContent({
  collapsed, activePage, isAdmin, displayName, initial, userLevel, userXp, onNavigate, onLogout, onToggleCollapse,
}: ShellContentProps) {
  return (
    <>
      <div style={{ padding: collapsed ? "18px 14px" : "26px 20px", borderBottom: `1px solid ${C.limestone}10`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <Glyph size={56} light/>
        {!collapsed && <div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "22px", fontWeight: 500, color: C.limestone, lineHeight: 1 }}>رحلة Rihla</div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: `${C.sand}80`, marginTop: 3 }}>AI Companion</div></div>}
      </div>
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        {NAV_ITEMS.map(({ id, label, icon, adminOnly }) => {
          if (adminOnly && !isAdmin) return null;
          const a = activePage === id;
          return (
            <button key={id} onClick={() => onNavigate(id)} style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, padding: collapsed ? "11px 0" : "10px 13px", borderRadius: 10, border: "none", background: (id as any).special || id === "rafiq" ? (a ? `${C.faience}25` : `${C.faience}10`) : a ? `${C.limestone}12` : "transparent", color: id === "rafiq" ? (a ? C.faience : `${C.faience}70`) : a ? C.limestone : `${C.limestone}45`, cursor: "pointer", transition: "all 0.15s", width: "100%", justifyContent: collapsed ? "center" : "flex-start", whiteSpace: "nowrap" }}>
              <span style={{ flexShrink: 0 }}>{icon(a)}</span>
              {!collapsed && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: a ? 600 : 400 }}>{label}</span>}
              {!collapsed && a && id !== "rafiq" && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: C.solar }}/>}
              {!collapsed && id === "rafiq" && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: C.faience, boxShadow: `0 0 0 3px ${C.faience}30` }}/>}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: collapsed ? "12px 8px" : "12px", borderTop: `1px solid ${C.limestone}10`, display: "flex", flexDirection: "column", gap: 4 }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${C.sand}40,${C.copper}40)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "13px", fontWeight: 500, color: C.limestone }}>{initial}</span></div>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.limestone, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div><div style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: `${C.limestone}45` }}>Level {userLevel} · {userXp} XP</div></div>
          </div>
        )}
        {onToggleCollapse && (
          <button onClick={onToggleCollapse} style={{ background: "none", border: "none", color: `${C.limestone}40`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 6, padding: "8px 10px", borderRadius: 8 }}>
            <Menu size={16} strokeWidth={2}/>{!collapsed && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px" }}>Collapse</span>}
          </button>
        )}
        <button onClick={onLogout} style={{ background: "none", border: "none", color: `${C.limestone}35`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 6, padding: "8px 10px", borderRadius: 8 }}>
          <LogOut size={15} strokeWidth={2}/>{!collapsed && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px" }}>Sign out</span>}
        </button>
      </div>
    </>
  );
}

export function AppShell({ activePage, setPage, go, children }: { activePage: string; setPage: (s: string) => void; go: (s: string) => void; children: React.ReactNode }) {
  return (
    <ShellNavProvider>
      <AppShellInner activePage={activePage} setPage={setPage} go={go}>{children}</AppShellInner>
    </ShellNavProvider>
  );
}

function AppShellInner({ activePage, setPage, go, children }: { activePage: string; setPage: (s: string) => void; go: (s: string) => void; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { open, setOpen } = useShellNav();
  const { user, logout } = useAuth();

  const isAdmin = user?.role?.name?.toLowerCase() === "admin" || user?.roleId === 2;
  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    go("landing");
  };

  const displayName = user?.displayName || "Traveler";
  const initial = displayName.charAt(0).toUpperCase();
  const userLevel = user?.level ?? 1;
  const userXp = user?.xp ?? 0;

  const navigate = (id: string) => {
    setPage(id);
    setOpen(false);
  };

  const contentProps = { activePage, isAdmin, displayName, initial, userLevel, userXp, onNavigate: navigate, onLogout: handleLogout };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, overflow: "hidden" }}>
      <aside className="hidden lg:flex" style={{ width: collapsed ? 64 : 220, background: "#111009", flexDirection: "column", flexShrink: 0, transition: "width 0.25s ease", overflow: "hidden" }}>
        <ShellContent {...contentProps} collapsed={collapsed} onToggleCollapse={() => setCollapsed(c => !c)} />
      </aside>

      {open && (
        <div onClick={() => setOpen(false)} className="lg:hidden" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 40, backdropFilter: "blur(2px)" }} />
      )}

      <aside
        className="lg:hidden"
        style={{ position: "fixed", top: 0, bottom: 0, left: 0, width: 240, background: "#111009", zIndex: 45, flexDirection: "column", transition: "translate 0.25s ease", translate: open ? "0" : "-100%", willChange: "translate", boxShadow: "4px 0 24px rgba(0,0,0,0.4)" }}
      >
        <button onClick={() => setOpen(false)} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", color: `${C.limestone}45`, cursor: "pointer", zIndex: 2 }} aria-label="Close menu">
          <X size={18} strokeWidth={2}/>
        </button>
        <ShellContent {...contentProps} collapsed={false} />
      </aside>

      <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", minWidth: 0 }}>{children}</main>
    </div>
  );
}