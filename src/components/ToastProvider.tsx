'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { C } from '@/lib/constants/theme';
import { X, AlertCircle, CheckCircle, Info, Loader2 } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => string;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; iconColor: string; icon: React.ReactNode }> = {
  success: {
    bg: `${C.safeGreen}12`,
    border: C.safeGreen,
    iconColor: C.safeGreen,
    icon: <CheckCircle size={18} />,
  },
  error: {
    bg: `${C.signalRed}12`,
    border: C.signalRed,
    iconColor: C.signalRed,
    icon: <AlertCircle size={18} />,
  },
  warning: {
    bg: `${C.alertAmber}12`,
    border: C.alertAmber,
    iconColor: C.alertAmber,
    icon: <AlertCircle size={18} />,
  },
  info: {
    bg: `${C.faience}12`,
    border: C.faience,
    iconColor: C.faience,
    icon: <Info size={18} />,
  },
  loading: {
    bg: `${C.nile}12`,
    border: C.nile,
    iconColor: C.nile,
    icon: <Loader2 size={18} className="animate-spin" />,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9);
    const newToast: Toast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration ?? 5000);
    }
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, dismissAll }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.type];
          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                background: style.bg,
                border: `1px solid ${style.border}40`,
                borderRadius: 12,
                padding: '14px 16px',
                maxWidth: 380,
                boxShadow: `0 8px 32px ${C.basalt}15`,
                animation: 'slideIn 0.3s ease-out',
              }}
            >
              <div style={{ color: style.iconColor, flexShrink: 0, marginTop: 2 }}>{style.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '14px', fontWeight: 600, color: C.nile, marginBottom: toast.message ? 4 : 0 }}>
                  {toast.title}
                </div>
                {toast.message && (
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: '#8B7E6A', lineHeight: 1.5 }}>
                    {toast.message}
                  </div>
                )}
                {toast.action && (
                  <button
                    onClick={toast.action.onClick}
                    style={{
                      marginTop: 10,
                      background: 'transparent',
                      border: `1.5px solid ${style.border}`,
                      color: style.iconColor,
                      borderRadius: 8,
                      padding: '6px 12px',
                      fontFamily: "'Inter',sans-serif",
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: `${C.limestone}50`,
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}