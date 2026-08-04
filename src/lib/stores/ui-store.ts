"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarOpen: boolean;
  contextSidebarOpen: boolean;
  locale: "en" | "ar";

  toggleSidebar: () => void;
  toggleContextSidebar: () => void;
  setLocale: (l: "en" | "ar") => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      contextSidebarOpen: false,
      locale: "en",

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleContextSidebar: () =>
        set((s) => ({ contextSidebarOpen: !s.contextSidebarOpen })),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "rihla-ui",
      partialize: (state) => ({ locale: state.locale }),
    }
  )
);