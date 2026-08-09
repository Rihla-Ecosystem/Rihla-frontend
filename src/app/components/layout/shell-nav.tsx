'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface ShellNavContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  close: () => void;
}

const ShellNavContext = createContext<ShellNavContextValue | null>(null);

export function ShellNavProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const value = useMemo<ShellNavContextValue>(
    () => ({
      open,
      setOpen,
      toggle: () => setOpen((v) => !v),
      close: () => setOpen(false),
    }),
    [open],
  );

  return <ShellNavContext.Provider value={value}>{children}</ShellNavContext.Provider>;
}

export function useShellNav(): ShellNavContextValue {
  const ctx = useContext(ShellNavContext);
  if (!ctx) {
    return { open: false, setOpen: () => {}, toggle: () => {}, close: () => {} };
  }
  return ctx;
}