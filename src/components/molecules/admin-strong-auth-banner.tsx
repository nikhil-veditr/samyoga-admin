"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  adminSecuritySetupPath,
  fetchAdminStrongAuthStatus,
  meetsAdminStrongAuth,
} from "@/shared/lib/auth/admin-strong-auth";

export function AdminStrongAuthBanner() {
  const pathname = usePathname();
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const refresh = async (): Promise<void> => {
      const status = await fetchAdminStrongAuthStatus();
      if (!cancelled) setNeedsSetup(!meetsAdminStrongAuth(status));
    };

    void refresh();
    const id = window.setInterval(() => void refresh(), 5_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pathname]);

  if (!needsSetup || pathname.startsWith("/profile") || pathname.startsWith("/two-factor")) {
    return null;
  }

  const setupHref = adminSecuritySetupPath(pathname);

  return (
    <div
      className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 md:px-6"
      role="status"
    >
      <div className="flex flex-wrap items-start gap-3 text-sm">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden />
        <p className="min-w-0 flex-1 text-foreground">
          <span className="font-medium">Set up sign-in security.</span>{" "}
          <span className="text-muted">
            Add a passkey or enable two-factor authentication on your admin account.
          </span>
        </p>
        <Link
          href={setupHref}
          className="shrink-0 font-medium text-primary underline-offset-4 hover:underline"
        >
          Open security settings
        </Link>
      </div>
    </div>
  );
}
