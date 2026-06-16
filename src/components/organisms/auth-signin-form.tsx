"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Fingerprint, Loader2, LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Checkbox } from "@/components/atoms/checkbox";
import { ThemeCycleControl } from "@/components/molecules/theme-cycle-control";
import { authClient } from "@/shared/lib/auth/auth-client";
import { isSuperAdminUser } from "@/shared/lib/auth/session-user";
import { useSignInMutation } from "@/services/auth/auth.hooks";
import { fetchMyProfile } from "@/services/me/me.api";
import { fieldSchemas } from "@/shared/lib/form/field-schemas";
import { useZodForm } from "@/shared/lib/form/zod-form";
import { z } from "zod";
import { toast } from "sonner";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { normalizeBackupCodeInput } from "@/shared/lib/auth/normalize-backup-code";
import {
  adminSecuritySetupPath,
  fetchAdminStrongAuthStatus,
  meetsAdminStrongAuth,
} from "@/shared/lib/auth/admin-strong-auth";

const signInSchema = z.object({
  email: fieldSchemas.email(),
  password: fieldSchemas.password(),
});

type SignInFormValues = z.infer<typeof signInSchema>;

type BetterAuthSignInResponse = {
  twoFactorRedirect?: boolean;
};

export function AuthSignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const reducedMotion = useReducedMotion();
  const safeNext = useMemo(() => {
    const next = searchParams.get("next");
    return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/signin") ? next : "/";
  }, [searchParams]);

  const [needsTwoFactor, setNeedsTwoFactor] = useState(false);
  const [twoFactorVerifyMode, setTwoFactorVerifyMode] = useState<"totp" | "backup">("totp");
  const [totpCode, setTotpCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(true);
  const [verifyingTwoFactor, setVerifyingTwoFactor] = useState(false);
  const [passkeyBusy, setPasskeyBusy] = useState(false);

  const form = useZodForm<SignInFormValues>({
    schema: signInSchema,
    defaultValues: { email: "", password: "" },
  });
  const signIn = useSignInMutation();

  async function ensureAllowedAndContinue(next: string): Promise<void> {
    const session = await authClient.getSession();
    const sessionUser = session.data?.user;
    let allowed = isSuperAdminUser(sessionUser);

    if (!allowed) {
      try {
        const profile = await fetchMyProfile();
        allowed = profile.superAdmin === true;
      } catch {
        allowed = false;
      }
    }

    if (!allowed) {
      await authClient.signOut();
      router.replace("/forbidden");
      return;
    }

    const strongAuth = await fetchAdminStrongAuthStatus();
    if (!meetsAdminStrongAuth(strongAuth)) {
      router.replace(adminSecuritySetupPath(next));
      router.refresh();
      return;
    }

    router.push(next);
    router.refresh();
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const signInData = await signIn.mutateAsync(values);

    if ((signInData as BetterAuthSignInResponse | undefined)?.twoFactorRedirect === true) {
      setNeedsTwoFactor(true);
      setTwoFactorVerifyMode("totp");
      setTotpCode("");
      setBackupCode("");
      setTrustDevice(true);
      return;
    }

    await ensureAllowedAndContinue(safeNext);
  });

  async function onPasskeySignIn(): Promise<void> {
    setPasskeyBusy(true);
    try {
      const result = await authClient.signIn.passkey();
      if (result?.error) {
        throw new Error(result.error.message ?? "Passkey sign-in failed");
      }

      const data = result.data as BetterAuthSignInResponse | undefined;
      if (data?.twoFactorRedirect === true) {
        setNeedsTwoFactor(true);
        setTwoFactorVerifyMode("totp");
        setTotpCode("");
        setBackupCode("");
        setTrustDevice(true);
        return;
      }

      await ensureAllowedAndContinue(safeNext);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Passkey sign-in failed");
    } finally {
      setPasskeyBusy(false);
    }
  }

  async function onVerifyTotp(): Promise<void> {
    const code = totpCode.trim();
    if (!code) {
      toast.error("Enter your authenticator code.");
      return;
    }

    setVerifyingTwoFactor(true);
    try {
      const res = await authClient.twoFactor.verifyTotp({ code, trustDevice });
      if (res.error) throw new Error(res.error.message ?? "Could not verify TOTP");

      setNeedsTwoFactor(false);
      toast.success("MFA verified");
      await ensureAllowedAndContinue(safeNext);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "MFA verification failed");
    } finally {
      setVerifyingTwoFactor(false);
    }
  }

  async function onVerifyBackup(): Promise<void> {
    const code = normalizeBackupCodeInput(backupCode);
    if (!code) {
      toast.error("Enter a backup code.");
      return;
    }

    setVerifyingTwoFactor(true);
    try {
      const res = await authClient.twoFactor.verifyBackupCode({ code, trustDevice });
      if (res.error) throw new Error(res.error.message ?? "Could not verify backup code");

      setNeedsTwoFactor(false);
      toast.success("MFA verified");
      await ensureAllowedAndContinue(safeNext);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "MFA verification failed");
    } finally {
      setVerifyingTwoFactor(false);
    }
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm"
        initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground">Sign in</h2>
            <p className="mt-1 text-sm text-muted">Platform operators only</p>
          </div>
          <ThemeCycleControl />
        </div>

        {needsTwoFactor ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-background/30">
                <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="truncate font-heading text-base font-semibold text-foreground">MFA required</p>
                <p className="mt-0.5 text-sm text-muted">
                  Verify using your authenticator app or a backup code.
                </p>
              </div>
            </div>

            <Checkbox checked={trustDevice} onChange={(e) => setTrustDevice(e.target.checked)} disabled={verifyingTwoFactor}>
              Trust this device
            </Checkbox>

            {twoFactorVerifyMode === "totp" ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="totp" className="block text-sm font-medium text-foreground">
                    Authenticator code (TOTP)
                  </label>
                  <Input
                    id="totp"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    placeholder="123456"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    disabled={verifyingTwoFactor}
                  />
                </div>
                <Button className="w-full" type="button" disabled={verifyingTwoFactor} onClick={() => void onVerifyTotp()}>
                  {verifyingTwoFactor ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Verify and continue
                </Button>
                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm"
                    disabled={verifyingTwoFactor}
                    onClick={() => setTwoFactorVerifyMode("backup")}
                  >
                    Use a backup code instead
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="backup" className="block text-sm font-medium text-foreground">
                    Backup code
                  </label>
                  <Input
                    id="backup"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value)}
                    placeholder="e.g. 8F3D-... "
                    autoComplete="off"
                    disabled={verifyingTwoFactor}
                  />
                </div>
                <Button className="w-full" type="button" variant="secondary" disabled={verifyingTwoFactor} onClick={() => void onVerifyBackup()}>
                  {verifyingTwoFactor ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Verify backup code
                </Button>
                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm"
                    disabled={verifyingTwoFactor}
                    onClick={() => setTwoFactorVerifyMode("totp")}
                  >
                    Use authenticator app instead
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-2 text-center">
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                disabled={verifyingTwoFactor}
                onClick={() => {
                  setNeedsTwoFactor(false);
                  setTwoFactorVerifyMode("totp");
                  setTotpCode("");
                  setBackupCode("");
                  setTrustDevice(true);
                }}
              >
                Back to password sign-in
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 space-y-3">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                disabled={passkeyBusy || signIn.isPending}
                onClick={() => void onPasskeySignIn()}
              >
                {passkeyBusy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Fingerprint className="mr-2 h-4 w-4" aria-hidden />
                )}
                Sign in with passkey
              </Button>
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/70" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wide">
                  <span className="bg-card px-2 text-muted">or</span>
                </div>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email
                </label>
                <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
                {form.formState.errors.email?.message ? (
                  <p className="text-xs text-danger">{form.formState.errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="pr-10"
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
                  </button>
                </div>
                {form.formState.errors.password?.message ? (
                  <p className="text-xs text-danger">{form.formState.errors.password.message}</p>
                ) : null}
              </div>

              <Button className="w-full" type="submit" disabled={signIn.isPending || passkeyBusy}>
                {signIn.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" aria-hidden />
                    Sign in
                  </>
                )}
              </Button>

              <p className="text-xs text-muted">
                MFA is required for admin access. If you do not have it set up yet, you will be guided to the
                setup step.
              </p>
            </form>
          </>
        )}
      </m.div>
    </LazyMotion>
  );
}
