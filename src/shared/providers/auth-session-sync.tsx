"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/shared/lib/auth/auth-client";
import {
  adminSecuritySetupPath,
  fetchAdminStrongAuthStatus,
  meetsAdminStrongAuth,
} from "@/shared/lib/auth/admin-strong-auth";
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

const SECURITY_SETUP_PREFIXES = ["/signin", "/forbidden", "/two-factor", "/profile"];

function isSecurityExemptPath(pathname: string): boolean {
  return SECURITY_SETUP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function AuthSessionSync() {
  const router = useRouter();
  const pathname = usePathname();
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

  useEffect(() => {
    if (isPending || !session?.user || isSecurityExemptPath(pathname)) return;

    let cancelled = false;
    void fetchAdminStrongAuthStatus().then((status) => {
      if (cancelled || meetsAdminStrongAuth(status)) return;
      router.replace(adminSecuritySetupPath(pathname));
      router.refresh();
    });

    return () => {
      cancelled = true;
    };
  }, [session, isPending, pathname, router]);

  return null;
}
