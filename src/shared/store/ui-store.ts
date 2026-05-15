"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemePreference } from "@/shared/lib/theme/resolved-theme";

type UiPersisted = Pick<UiState, "themePreference">;

type UiState = {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  cycleThemePreference: () => void;
};

const cycleOrder: ThemePreference[] = ["system", "light", "dark"];

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      themePreference: "system",
      setThemePreference: (themePreference) => set({ themePreference }),
      cycleThemePreference: () => {
        const current = get().themePreference;
        const idx = cycleOrder.indexOf(current);
        const next = cycleOrder[(idx === -1 ? 0 : idx + 1) % cycleOrder.length];
        set({ themePreference: next });
      },
    }),
    {
      name: "samyoga-ui-store",
      partialize: (state): UiPersisted => ({ themePreference: state.themePreference }),
      merge: (persistedState, currentState) => {
        const raw = persistedState as Partial<UiPersisted> & { theme?: string } | undefined;
        if (!raw || typeof raw !== "object") return currentState;
        let themePreference = currentState.themePreference;
        if (
          raw.themePreference === "system" ||
          raw.themePreference === "light" ||
          raw.themePreference === "dark"
        ) {
          themePreference = raw.themePreference;
        } else if (raw.theme === "dark") {
          themePreference = "dark";
        } else if (raw.theme === "light") {
          themePreference = "light";
        }
        return { ...currentState, themePreference };
      },
    },
  ),
);
