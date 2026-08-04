"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Shield, Users, ScrollText, CreditCard, RefreshCw, ShieldOff, AlertTriangle, Loader2, Search,
} from "lucide-react";
import { C } from "@/lib/constants/theme";
import { TopBar } from "@/app/components/layout/TopBar";
import { useAuth } from "@/lib/auth";
import { adminService } from "@/services/adminService";
import type { AuditLog } from "@/services/adminService";

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [pkgFilter, setPkgFilter] = useState<"all" | "active" | "inactive">("all");

  const isAdmin = user?.role?.name?.toLowerCase() === "admin" || user?.roleId === 2;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [u, a, p] = await Promise.all([
        adminService.getUsers(),
        adminService.getAuditLogs(),
        adminService.getTokenPackages(),
      ]);
      setUsers(u);
      setAudits(a);
      setPackages(p);
    } catch (err: any) {
      setError(err?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const toggleBan = async (id: string) => {
    setBusy(`ban_${id}`);
    setError(null);
    try {
      await adminService.toggleBan(id);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isBanned: !u.isBanned } : u))
      );
    } catch (err: any) {
      setError(err?.message || "Failed to toggle ban");
    } finally {
      setBusy(null);
    }
  };

  const changeRole = async (id: string, roleId: number) => {
    setBusy(`role_${id}`);
    setError(null);
    try {
      await adminService.changeRole(id, roleId);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, roleId } : u)));
    } catch (err: any) {
      setError(err?.message || "Failed to change role");
    } finally {
      setBusy(null);
    }
  };

  const togglePackage = async (id: number, active: boolean) => {
    setBusy(`pkg_${id}`);
    setError(null);
    try {
      await adminService.updateTokenPackageStatus(id, !active);
      setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !active } : p)));
    } catch (err: any) {
      setError(err?.message || "Failed to update package");
    } finally {
      setBusy(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.displayName || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const filteredPackages = useMemo(() => {
    if (pkgFilter === "all") return packages;
    const active = pkgFilter === "active";
    return packages.filter((p) => !!p.isActive === active);
  }, [packages, pkgFilter]);

  if (!isAdmin) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TopBar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: `${C.copper}12`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Shield size={30} color={C.copper} strokeWidth={2} />
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "22px", fontWeight: 600, color: C.nile, marginBottom: 8 }}>
              Admin only
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#8B7E6A", lineHeight: 1.6 }}>
              This area is restricted to administrators and moderators.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <TopBar />
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", maxWidth: 1100 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "24px", fontWeight: 600, color: C.nile }}>Admin Console</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#8B7E6A", marginTop: 2 }}>
              Users · roles · moderation · audit trail
            </div>
          </div>
          <button onClick={load} disabled={loading} style={{ background: C.nile, border: "none", borderRadius: 9, padding: "9px 16px", color: C.limestone, fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 }}>
            {loading ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} strokeWidth={2} />} Refresh
          </button>
        </div>

        {error && (
          <div style={{ background: `${C.signalRed}10`, border: `1px solid ${C.signalRed}28`, borderRadius: 10, padding: "10px 14px", display: "flex", gap: 9, alignItems: "flex-start", margin: "14px 0" }}>
            <AlertTriangle size={14} color={C.signalRed} style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: C.signalRed }}>{error}</div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, margin: "16px 0", marginTop: 20 }}>
          {[
            { label: "Total Users", value: users.length, icon: <Users size={18} color={C.copper} />, tint: `${C.copper}12` },
            { label: "Audit Events", value: audits.length, icon: <ScrollText size={18} color={C.faience} />, tint: `${C.faience}12` },
            { label: "Token Packages", value: packages.length, icon: <CreditCard size={18} color={C.solar} />, tint: `${C.solar}12` },
            { label: "Banned", value: users.filter((u) => u.isBanned).length, icon: <ShieldOff size={18} color={C.signalRed} />, tint: `${C.signalRed}12` },
          ].map((s) => (
            <div key={s.label} style={{ background: `linear-gradient(150deg,#FAF7F0,#F5EDD8)`, border: `1px solid ${C.sand}22`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: s.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "22px", fontWeight: 700, color: C.nile, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A", marginTop: 4 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div style={{ background: `linear-gradient(150deg,#FAF7F0,#F5EDD8)`, border: `1px solid ${C.sand}22`, borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid rgba(27,26,23,0.07)`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "17px", fontWeight: 600, color: C.nile }}>Users</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative" }}>
                <Search size={13} color="#A89880" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  placeholder="Search name or email…"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ background: "#FAF7F0", border: "1px solid rgba(27,26,23,0.12)", borderRadius: 8, padding: "7px 12px 7px 30px", fontFamily: "'Inter',sans-serif", fontSize: "12px", color: C.basalt, outline: "none", width: 220 }}
                />
              </div>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880" }}>{filteredUsers.length} / {users.length} accounts</span>
            </div>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#A89880", fontFamily: "'Inter',sans-serif", fontSize: "13px" }}>Loading…</div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#A89880", fontFamily: "'Inter',sans-serif", fontSize: "13px" }}>
              {userSearch ? "No users match your search." : "No users found."}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: `${C.sand}12` }}>
                    {["Name", "Email", "Role", "Status", "Actions"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, color: C.copper, letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: `1px solid ${C.sand}22` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid rgba(27,26,23,0.05)" }}>
                      <td style={{ padding: "11px 16px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.basalt }}>{u.displayName || "—"}</td>
                      <td style={{ padding: "11px 16px", fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#8B7E6A" }}>{u.email}</td>
                      <td style={{ padding: "11px 16px", fontFamily: "'Inter',sans-serif", fontSize: "12px", color: C.faience, fontWeight: 600 }}>{(u.role?.name || "user")}</td>
                      <td style={{ padding: "11px 16px" }}>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: u.isBanned ? C.signalRed : C.safeGreen, background: u.isBanned ? `${C.signalRed}12` : `${C.safeGreen}12`, padding: "3px 9px", borderRadius: 99 }}>
                          {u.isBanned ? "Banned" : u.isEmailVerified ? "Active" : "Unverified"}
                        </span>
                      </td>
                      <td style={{ padding: "11px 16px", display: "flex", gap: 6 }}>
                        <button
                          onClick={() => toggleBan(u.id)}
                          disabled={busy === `ban_${u.id}`}
                          style={{ background: u.isBanned ? C.safeGreen : C.signalRed, border: "none", borderRadius: 7, padding: "6px 10px", fontSize: "11px", fontFamily: "'Inter',sans-serif", fontWeight: 600, color: "#fff", cursor: "pointer" }}
                        >
                          {u.isBanned ? "Unban" : "Ban"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Token packages */}
          <div style={{ background: `linear-gradient(150deg,#FAF7F0,#F0EDD8)`, border: `1px solid ${C.sand}22`, borderRadius: 14, padding: "14px 18px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "17px", fontWeight: 600, color: C.nile }}>Token Packages</div>
              <div style={{ display: "flex", gap: 6 }}>
                {([["all", "All"], ["active", "Active"], ["inactive", "Inactive"]] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setPkgFilter(key)}
                    style={{
                      background: pkgFilter === key ? C.nile : "#FAF7F0",
                      border: `1.5px solid ${pkgFilter === key ? C.nile : "rgba(27,26,23,0.12)"}`,
                      borderRadius: 99,
                      padding: "4px 12px",
                      fontFamily: "'Inter',sans-serif",
                      fontSize: "11px",
                      fontWeight: pkgFilter === key ? 700 : 500,
                      color: pkgFilter === key ? C.limestone : "#6B6354",
                      cursor: "pointer",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {filteredPackages.length === 0 ? (
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#A89880" }}>
                {packages.length === 0 ? "No packages loaded." : "No packages match this filter."}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filteredPackages.map((p) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(27,26,23,0.05)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600, color: C.basalt }}>{p.name}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#8B7E6A" }}>{p.tokens.toLocaleString()} tokens · {p.currency} {p.price}</div>
                  </div>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: p.isActive ? C.safeGreen : C.signalRed, background: p.isActive ? `${C.safeGreen}12` : `${C.signalRed}12`, padding: "3px 9px", borderRadius: 99 }}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => togglePackage(p.id, p.isActive)}
                    disabled={busy === `pkg_${p.id}`}
                    style={{ background: C.nile, border: "none", borderRadius: 7, padding: "6px 10px", fontSize: "11px", fontFamily: "'Inter',sans-serif", fontWeight: 600, color: C.limestone, cursor: "pointer" }}
                  >
                    {p.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit logs */}
        <div style={{ background: `linear-gradient(150deg,#FAF7F0,#F0EAD8)`, border: `1px solid ${C.sand}22`, borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.sand}22`, fontFamily: "'Cormorant Garamond',serif", fontSize: "17px", fontWeight: 600, color: C.nile }}>
            Audit Log
          </div>
          {audits.length === 0 ? (
            <div style={{ padding: 24, fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#A89880" }}>No audit events yet.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {audits.slice(0, 12).map((a) => (
                    <tr key={a.id} style={{ borderBottom: "1px solid rgba(27,26,23,0.05)" }}>
                      <td style={{ padding: "9px 18px", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: C.faience }}>{a.action}</td>
                      <td style={{ padding: "9px 18px", fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#8B7E6A" }}>{a.actor?.displayName || a.actor?.email || a.actorId || "—"} → {a.target?.displayName || a.target?.email || a.targetUserId || "—"}</td>
                      <td style={{ padding: "9px 18px", fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#A89880", textAlign: "right" }}>
                        {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}