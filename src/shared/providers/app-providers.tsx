"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { queryClient } from "@/shared/lib/react-query/query-client";
import { resolveTheme, type ResolvedTheme } from "@/shared/lib/theme/resolved-theme";
import { useSystemDark } from "@/shared/hooks/use-system-dark";
import { useUiStoreHydrated } from "@/shared/hooks/use-ui-store-hydrated";
import { useUiStore } from "@/shared/store/ui-store";
import { AuthSessionSync } from "@/shared/providers/auth-session-sync";

type AppProvidersProps = {
  children: React.ReactNode;
};

function readBootstrapDataTheme(): ResolvedTheme | null {
  if (typeof document === "undefined") return null;
  const v = document.documentElement.getAttribute("data-theme");
  return v === "dark" || v === "light" ? v : null;
}

export function AppProviders({ children }: AppProvidersProps) {
  const persistHydrated = useUiStoreHydrated();
  const [bootstrapTheme] = useState<ResolvedTheme | null>(readBootstrapDataTheme);
  const themePreference = useUiStore((state) => state.themePreference);
  const systemDark = useSystemDark();
  const fromStore = resolveTheme(themePreference, systemDark);
  const resolved = persistHydrated ? fromStore : (bootstrapTheme ?? fromStore);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolved);
  }, [resolved]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSessionSync />
      {children}
      <Toaster richColors position="top-right" theme={resolved} />
    </QueryClientProvider>
  );
}
