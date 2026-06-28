"use client";

import { authClient } from "@/shared/lib/auth/auth-client";
import { useAuthStoreHydrated } from "@/shared/hooks/use-auth-store-hydrated";
import { useAuthStore } from "@/shared/store/auth-store";

/** Keeps admin shell mounted and drives skeleton chrome until session + auth store have settled. */
export function useAdminChromeLoading(): boolean {
  const authHydrated = useAuthStoreHydrated();
  const { isPending: sessionPending } = authClient.useSession();
  const user = useAuthStore((s) => s.user);

  if (!authHydrated || sessionPending) return true;
  if (!user) return true;

  return false;
}
