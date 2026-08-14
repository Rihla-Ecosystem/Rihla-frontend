'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface ShellNavContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  close: () => void;
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const ShellNavContext = createContext<ShellNavContextValue | null>(null);

export function ShellNavProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('rihla:sidebar-collapsed') === '1') {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rihla:sidebar-collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  const value = useMemo<ShellNavContextValue>(
    () => ({
      open,
      setOpen,
      toggle: () => setOpen((v) => !v),
      close: () => setOpen(false),
      collapsed,
      toggleCollapsed: () => setCollapsed((v) => !v),
    }),
    [open, collapsed],
  );

  return <ShellNavContext.Provider value={value}>{children}</ShellNavContext.Provider>;
}

export function useShellNav(): ShellNavContextValue {
  const ctx = useContext(ShellNavContext);
  if (!ctx) {
    return { open: false, setOpen: () => {}, toggle: () => {}, close: () => {}, collapsed: false, toggleCollapsed: () => {} };
  }
  return ctx;
}