'use client';

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { RafiqContext } from '@/lib/rafiq';
import RafiqModal from '@/app/components/rafiq/RafiqModal';

interface RafiqModalOpenOpts {
  context?: RafiqContext;
  initialQuery?: string;
}

interface RafiqContextValue {
  openRafiq: (opts?: RafiqModalOpenOpts) => void;
  closeRafiq: () => void;
}

const RafiqContextCtx = createContext<RafiqContextValue>({
  openRafiq: () => {},
  closeRafiq: () => {},
});

export function useRafiq(): RafiqContextValue {
  return useContext(RafiqContextCtx);
}

export default function RafiqProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<RafiqContext | null>(null);
  const [initialQuery, setInitialQuery] = useState<string | undefined>(undefined);
  const modalRef = useRef<{ open: (o?: { context?: RafiqContext; initialQuery?: string }) => void } | null>(null);

  const openRafiq = useCallback((opts?: RafiqModalOpenOpts) => {
    setContext(opts?.context ?? null);
    setInitialQuery(opts?.initialQuery);
    setOpen(true);
  }, []);

  const closeRafiq = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo<RafiqContextValue>(() => ({ openRafiq, closeRafiq }), [openRafiq, closeRafiq]);

  return (
    <RafiqContextCtx.Provider value={value}>
      {children}
      <RafiqModal
        open={open}
        onClose={closeRafiq}
        context={context}
        initialQuery={initialQuery}
        onOpenChange={setOpen}
      />
    </RafiqContextCtx.Provider>
  );
}