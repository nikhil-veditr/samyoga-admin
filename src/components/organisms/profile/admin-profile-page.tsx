"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, ShieldCheck, UserRound } from "lucide-react";
import { AdminSurface } from "@/components/atoms/admin-surface";
import { Button } from "@/components/atoms/button";
import { Skeleton } from "@/components/atoms/skeleton";
import { ProfilePageSkeleton } from "@/components/molecules/skeletons/admin-page-skeletons";
import { ProfileChangePasswordSection } from "@/components/organisms/profile/profile-change-password-section";
import { ProfilePasskeysSection } from "@/components/organisms/profile/profile-passkeys-section";
import { PROFILE_SECURITY_SECTION_ID } from "@/components/organisms/profile/profile-passkeys.shared";
import { ProfileTwoFactorSection } from "@/components/organisms/profile/profile-two-factor-section";
import { useMyProfileQuery } from "@/services/me/me.hooks";
import {
  fetchAdminStrongAuthStatus,
  meetsAdminStrongAuth,
} from "@/shared/lib/auth/admin-strong-auth";
import { authClient } from "@/shared/lib/auth/auth-client";
import { useAuthStore } from "@/shared/store/auth-store";

function safeNextTarget(nextRaw: string | null): string {
  if (!nextRaw) return "/";
  if (!nextRaw.startsWith("/") || nextRaw.startsWith("//")) return "/";
  if (nextRaw.startsWith("/signin") || nextRaw.startsWith("/profile")) return "/";
  return nextRaw;
}

function AdminProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authUser = useAuthStore((s) => s.user);
  const { data: sessionPayload } = authClient.useSession();
  const { data: profile, isPending: profilePending } = useMyProfileQuery();

  const setupMode = searchParams.get("setup") === "security";
  const nextTarget = useMemo(() => safeNextTarget(searchParams.get("next")), [searchParams]);

  const sessionUser = sessionPayload?.user as
    | { email?: string; twoFactorEnabled?: boolean }
    | undefined;
  const displayEmail = profile?.email ?? authUser?.email ?? sessionUser?.email ?? "";
  const displayName =
    [profile?.firstName ?? authUser?.firstName, profile?.lastName ?? authUser?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || displayEmail;

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const [strongAuth, setStrongAuth] = useState<{
    twoFactorEnabled: boolean;
    passkeyCount: number;
  } | null>(null);

  // Refresh strong-auth status so setup banners and Continue appear after enabling MFA/passkey.
  useEffect(() => {
    let cancelled = false;
    const refresh = async (): Promise<void> => {
      const status = await fetchAdminStrongAuthStatus();
      if (!cancelled) setStrongAuth(status);
    };
    void refresh();
    const id = window.setInterval(() => void refresh(), 2_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [sessionUser?.twoFactorEnabled]);

  const compliant = strongAuth ? meetsAdminStrongAuth(strongAuth) : false;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-6 md:px-6 md:py-8">
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-primary">
          <UserRound className="h-5 w-5" aria-hidden />
          <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">Profile</h1>
        </div>
        <p className="text-sm text-muted">
          Manage your sign-in methods and password for the internal admin portal.
        </p>
      </header>

      <AdminSurface elevated className="p-5">
        <p className="text-sm text-muted">Signed in as</p>
        {profilePending && !profile ? (
          <Skeleton className="mt-2 h-7 w-48" />
        ) : (
          <p className="mt-1 font-heading text-lg font-semibold text-foreground">{displayName}</p>
        )}
        {displayEmail ? <p className="mt-0.5 text-sm text-muted">{displayEmail}</p> : null}
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
          <Shield className="h-3 w-3 text-secondary" aria-hidden />
          Super admin · platform operator
        </p>
      </AdminSurface>

      {!compliant ? (
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden />
            <div className="space-y-2">
              <p className="font-medium text-foreground">Set up sign-in security</p>
              <p className="text-muted">
                Add a passkey or enable two-factor authentication before using the admin portal. Either method
                satisfies the MFA requirement.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {setupMode && compliant ? (
        <section className="rounded-xl border border-primary/30 bg-primary/10 p-4">
          <p className="text-sm font-medium text-foreground">Security setup complete</p>
          <p className="mt-1 text-sm text-muted">You can continue to the portal.</p>
          <Button
            type="button"
            className="mt-3"
            onClick={() => {
              router.push(nextTarget);
              router.refresh();
            }}
          >
            Continue to portal
          </Button>
        </section>
      ) : null}

      <section
        id={PROFILE_SECURITY_SECTION_ID}
        className="scroll-mt-6 space-y-6"
        aria-label="Sign-in and security"
      >
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">Sign-in &amp; security</h2>
          <p className="mt-1 text-sm text-muted">
            Passkeys, authenticator apps, and your account password.
          </p>
        </div>

        <ProfilePasskeysSection />
        <ProfileTwoFactorSection />
        <ProfileChangePasswordSection />
      </section>
    </div>
  );
}

export function AdminProfilePage() {
  return (
    <Suspense fallback={<ProfilePageSkeleton />}>
      <AdminProfilePageContent />
    </Suspense>
  );
}
