"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/shared/lib/auth/auth-client";
import { isSuperAdminUser } from "@/shared/lib/auth/session-user";
import { useAuthStore } from "@/shared/store/auth-store";

type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  superAdmin?: boolean;
  twoFactorEnabled?: boolean;
};

export function AuthSessionSync() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const setFromBetterAuth = useAuthStore((s) => s.setFromBetterAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    if (isPending) return;

    const u = session?.user as SessionUser | undefined;
    if (!u?.id) {
      clearAuth();
      return;
    }

    if (!isSuperAdminUser(u)) {
      clearAuth();
      void authClient.signOut();
      router.replace("/forbidden");
      return;
    }

    setFromBetterAuth({
      id: u.id,
      email: u.email,
      firstName: u.firstName ?? undefined,
      lastName: u.lastName ?? undefined,
      superAdmin: true,
    });
  }, [session, isPending, setFromBetterAuth, clearAuth, router]);

  return null;
}
