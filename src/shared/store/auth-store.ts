"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  /** Mirrors Better Auth / User.superAdmin — authorize on the server. */
  superAdmin: boolean;
};

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setFromBetterAuth: (user: AuthUser) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setFromBetterAuth: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "samyoga-admin-auth-store",
      version: 1,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      merge: (persistedState, currentState) => {
        const raw = persistedState as Partial<AuthState> & { accessToken?: unknown } | undefined;
        if (!raw || typeof raw !== "object") return currentState;
        const { accessToken: _drop, ...rest } = raw as Record<string, unknown>;
        return { ...currentState, ...rest } as AuthState;
      },
    },
  ),
);
