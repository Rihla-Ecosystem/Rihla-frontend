"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Bell, CheckCheck, Trash2, Inbox, AlertCircle } from "lucide-react";
import { C } from "@/lib/constants/theme";
import { useAuth } from "@/lib/auth";
import { notificationService, NOTIF_TYPE_META, timeAgo, AppNotification } from "@/services/notificationService";

const POLL_INTERVAL = 60000;

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tick = useRef(0);

  const refreshCount = useCallback(async () => {
    if (!user) {
      setUnread(0);
      return;
    }
    try {
      const count = await notificationService.getUnreadCount();
      setUnread(count);
    } catch {
      // silent — server may be offline
    }
  }, [user]);

  const loadList = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await notificationService.getNotifications(1, 20);
      setItems(res.notifications ?? []);
      setUnread(res.notifications?.filter((n) => !n.isRead).length ?? 0);
    } catch (e: any) {
      setError(e?.message || "Could not load notifications");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCount();
    if (!user) return;
    const id = window.setInterval(refreshCount, POLL_INTERVAL);
    return () => window.clearInterval(id);
  }, [refreshCount, user]);

  // Refresh unread count + open list when the tab regains focus.
  useEffect(() => {
    const onFocus = () => {
      refreshCount();
      if (open) loadList();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refreshCount, loadList, open]);

  // While the panel is open, keep the list fresh so new notifications appear live.
  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(loadList, POLL_INTERVAL);
    return () => window.clearInterval(id);
  }, [open, loadList]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      tick.current++;
      loadList();
    }
  };

  const handleMarkRead = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : { ...n })));
    setUnread((u) => Math.max(0, u - 1));
    try {
      await notificationService.markRead(id);
    } catch {
      // optimistic — ignore
    }
  };

  const handleMarkAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
    try {
      await notificationService.markAllRead();
    } catch {
      // optimistic — ignore
    }
  };

  const handleDelete = async (id: string) => {
    const target = items.find((n) => n.id === id);
    setItems((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.isRead) setUnread((u) => Math.max(0, u - 1));
    try {
      await notificationService.deleteNotification(id);
    } catch {
      // optimistic — ignore
    }
  };

  return (
    <div ref={panelRef} style={{ position: "relative" }}>
      <button
        onClick={toggle}
        aria-label="Notifications"
        style={{
          background: "rgba(245,239,224,0.07)",
          border: "1px solid rgba(245,239,224,0.16)",
          borderRadius: 10,
          width: 38,
          height: 38,
          position: "relative",
          cursor: "pointer",
          color: open ? C.solarBright : `${C.limestone}80`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "color 0.2s, border-color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = C.solarBright;
          e.currentTarget.style.borderColor = "rgba(232,168,32,0.55)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = open ? C.solarBright : `${C.limestone}80`;
          e.currentTarget.style.borderColor = "rgba(245,239,224,0.16)";
        }}
      >
        <Bell size={17} strokeWidth={1.9} />
        {unread > 0 && (
          <>
            <span
              style={{
                position: "absolute",
                top: -3,
                right: -3,
                minWidth: 17,
                height: 17,
                padding: "0 4px",
                borderRadius: 99,
                background: C.alertAmber,
                color: "#1B0D05",
                border: "2px solid #162C2C",
                fontFamily: "'Inter',sans-serif",
                fontSize: "10px",
                fontWeight: 800,
                lineHeight: "13px",
                textAlign: "center",
              }}
            >
              {unread > 99 ? "99+" : unread}
            </span>
            <span style={{ position: "absolute", inset: -1, borderRadius: "50%", background: C.alertAmber, animation: "rihlaPing 1.8s ease-out infinite", zIndex: -1 }} />
          </>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 46,
            right: 0,
            width: 360,
            maxWidth: "86vw",
            background: C.limestone,
            borderRadius: 16,
            border: `1px solid ${C.sand}30`,
            boxShadow: "0 24px 60px rgba(20,16,8,0.35)",
            overflow: "hidden",
            zIndex: 60,
            animation: "rihlaFadeUp 0.25s ease-out both",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              background: `linear-gradient(135deg,${C.nile},${C.nileMid})`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Bell size={15} color={C.sand} strokeWidth={2} />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 700, color: C.limestone }}>
                Notifications
              </span>
              {unread > 0 && (
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 700, background: C.alertAmber, color: "#1B0D05", padding: "2px 8px", borderRadius: 99 }}>
                  {unread} new
                </span>
              )}
            </div>
            {items.some((n) => !n.isRead) && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontFamily: "'Inter',sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: `${C.limestone}70`,
                  padding: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.sand)}
                onMouseLeave={(e) => (e.currentTarget.style.color = `${C.limestone}70`)}
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {loading && items.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#A89880", fontFamily: "'Inter',sans-serif", fontSize: "12px" }}>
                Loading notifications…
              </div>
            ) : error && items.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <AlertCircle size={26} color={C.copper} style={{ margin: "0 auto 10px" }} />
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#8B7E6A" }}>{error}</div>
              </div>
            ) : items.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <Inbox size={28} color="#C4B89A" style={{ margin: "0 auto 10px" }} />
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "16px", color: C.nile, marginBottom: 4 }}>
                  You're all caught up
                </div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#8B7E6A" }}>
                  New alerts about your journey will appear here.
                </div>
              </div>
            ) : (
              items.map((n) => {
                const meta = NOTIF_TYPE_META[n.type] ?? NOTIF_TYPE_META.INFO;
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && handleMarkRead(n.id)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "34px 1fr auto",
                      gap: 10,
                      padding: "13px 16px",
                      borderBottom: "1px solid rgba(27,26,23,0.05)",
                      cursor: n.isRead ? "default" : "pointer",
                      background: n.isRead ? "transparent" : `${meta.color}0A`,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!n.isRead) e.currentTarget.style.background = `${meta.color}14`;
                    }}
                    onMouseLeave={(e) => {
                      if (!n.isRead) e.currentTarget.style.background = `${meta.color}0A`;
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: `${meta.color}18`,
                        border: `1px solid ${meta.color}30`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: meta.color,
                        fontFamily: "'Inter',sans-serif",
                        fontSize: "13px",
                        fontWeight: 800,
                      }}
                    >
                      {meta.glyph}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", fontWeight: 700, color: C.nile }}>{n.title}</span>
                        {!n.isRead && <span style={{ width: 7, height: 7, borderRadius: "50%", background: meta.color, flexShrink: 0 }} />}
                      </div>
                      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "11.5px", color: "#6B6354", lineHeight: 1.5, margin: "3px 0 4px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {n.message}
                      </p>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", color: "#A89880" }}>
                        {timeAgo(n.createdAt)}
                        {n.authorName ? ` · by ${n.authorName}` : ""}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(n.id);
                        }}
                        title="Delete notification"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#C4B89A",
                          padding: 2,
                          display: "inline-flex",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = C.signalRed)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#C4B89A")}
                      >
                        <Trash2 size={13} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
