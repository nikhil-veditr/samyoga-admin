"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";

import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
import { Input } from "@/components/atoms/input";
import { authClient } from "@/shared/lib/auth/auth-client";
import { normalizeBackupCodeInput } from "@/shared/lib/auth/normalize-backup-code";
import {
  fetchAdminStrongAuthStatus,
  meetsAdminStrongAuth,
} from "@/shared/lib/auth/admin-strong-auth";

type TwoFactorSetup = {
  totpURI: string;
  backupCodes: string[];
};

type BetterAuthUserWithTwoFactor = {
  twoFactorEnabled?: boolean;
};

function safeNextTarget(nextRaw: string | null): string {
  const next = nextRaw ?? null;
  if (!next) return "/";
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  if (next.startsWith("/signin") || next.startsWith("/two-factor")) return "/";
  return next;
}

function TwoFactorClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();

  const next = useMemo(() => safeNextTarget(searchParams.get("next")), [searchParams]);

  const { data: session, isPending: sessionPending } = authClient.useSession();

  const twoFactorEnabled = (session?.user as BetterAuthUserWithTwoFactor | undefined)?.twoFactorEnabled === true;
  const hasSession = Boolean(session?.user);

  useEffect(() => {
    if (sessionPending || !hasSession) return;
    let cancelled = false;
    void fetchAdminStrongAuthStatus().then((status) => {
      if (cancelled || !meetsAdminStrongAuth(status)) return;
      router.replace(next);
      router.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, [sessionPending, hasSession, next, router]);

  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [setupPending, setSetupPending] = useState(false);

  const [totpCode, setTotpCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(true);

  async function onEnable(): Promise<void> {
    setSetupPending(true);
    try {
      const res = await authClient.twoFactor.enable({ issuer: "Samyoga Admin" });
      if (res.error) throw new Error(res.error.message ?? "Failed to enable 2FA");
      const data = res.data as { totpURI: string; backupCodes: string[] };
      setSetup({ totpURI: data.totpURI, backupCodes: data.backupCodes });
      toast.success("2FA setup created. Verify your code to finish.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not enable 2FA";
      toast.error(message);
    } finally {
      setSetupPending(false);
    }
  }

  async function onVerifyTotp(): Promise<void> {
    const code = totpCode.trim();
    if (!code) {
      toast.error("Enter your authenticator code.");
      return;
    }

    setSetupPending(true);
    try {
      const res = await authClient.twoFactor.verifyTotp({ code, trustDevice });
      if (res.error) throw new Error(res.error.message ?? "Could not verify TOTP");
      toast.success("2FA verified");
      router.push(next);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not verify TOTP";
      toast.error(message);
    } finally {
      setSetupPending(false);
    }
  }

  async function onVerifyBackup(): Promise<void> {
    const code = normalizeBackupCodeInput(backupCode);
    if (!code) {
      toast.error("Enter a backup code.");
      return;
    }

    setSetupPending(true);
    try {
      const res = await authClient.twoFactor.verifyBackupCode({ code, trustDevice });
      if (res.error) throw new Error(res.error.message ?? "Could not verify backup code");
      toast.success("2FA verified");
      router.push(next);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not verify backup code";
      toast.error(message);
    } finally {
      setSetupPending(false);
    }
  }

  const showSetup = hasSession && !twoFactorEnabled;

  return (
    <div className="w-full max-w-xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-semibold text-foreground">Two-factor security</h2>
          <p className="mt-1 text-sm text-muted">
            {twoFactorEnabled ? "Your admin MFA is enabled." : "Set up or verify MFA to continue."}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/60 p-2.5">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
        </div>
      </div>

      <LazyMotion features={domAnimation}>
        <AnimatePresence mode="wait" initial={false}>
          {sessionPending ? (
            <m.div
              key="loading"
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="flex items-center gap-2 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Checking session…
              </div>
            </m.div>
          ) : twoFactorEnabled ? (
            <m.div
              key="enabled"
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border border-border bg-card p-6"
            >
              <p className="text-sm text-muted">
                MFA is already enabled for your admin account. Continue to the portal.
              </p>
              <div className="mt-5">
                <Button
                  className="w-full"
                  type="button"
                  onClick={() => {
                    router.push(next);
                    router.refresh();
                  }}
                >
                  Continue
                </Button>
              </div>
            </m.div>
          ) : showSetup ? (
            <m.div
              key="setup"
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="space-y-5">
                {setup ? (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">Scan & verify</p>
                        <p className="mt-1 text-sm text-muted">
                          Add Samyoga Admin to your authenticator app, then verify the first code.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setSetup(null)}
                        disabled={setupPending}
                      >
                        Re-generate
                      </Button>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
                      <div className="flex items-center justify-center rounded-xl border border-border/60 bg-background/30 p-3">
                        <div className="text-primary">
                          <QRCodeSVG value={setup.totpURI} size={150} bgColor="transparent" fgColor="currentColor" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">Backup codes</p>
                          <p className="text-xs text-muted">Store these offline. Each code works once.</p>
                          <div className="max-h-[14rem] space-y-2 overflow-y-auto rounded-lg border border-border/60 bg-background/30 p-3">
                            <ul className="flex flex-wrap gap-2">
                              {setup.backupCodes.map((c) => (
                                <li key={c}>
                                  <button
                                    type="button"
                                    className="rounded-md border border-border/70 bg-card px-2 py-1 text-[11px] font-medium text-foreground hover:border-primary/40 hover:bg-primary/5"
                                    onClick={async () => {
                                      try {
                                        await navigator.clipboard.writeText(c);
                                        toast.success("Copied");
                                      } catch {
                                        toast.error("Copy failed");
                                      }
                                    }}
                                  >
                                    {c}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-xl border border-border/60 bg-background/30 p-4">
                      <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <label htmlFor="totp" className="text-sm font-medium text-foreground">
                              Authenticator code (TOTP)
                            </label>
                            <Input
                              id="totp"
                              value={totpCode}
                              onChange={(e) => setTotpCode(e.target.value)}
                              placeholder="123456"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              disabled={setupPending}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label htmlFor="backup" className="text-sm font-medium text-foreground">
                              Backup code (optional)
                            </label>
                            <Input
                              id="backup"
                              value={backupCode}
                              onChange={(e) => setBackupCode(e.target.value)}
                              placeholder="e.g. 8F3D-... "
                              disabled={setupPending}
                            />
                          </div>
                        </div>

                        <Checkbox checked={trustDevice} onChange={(e) => setTrustDevice(e.target.checked)}>
                          Trust this device
                        </Checkbox>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Button type="button" onClick={() => void onVerifyTotp()} disabled={setupPending}>
                          {setupPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
                          Verify TOTP
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => void onVerifyBackup()}
                          disabled={setupPending}
                        >
                          {setupPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
                          Verify backup
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-foreground">Enable MFA</p>
                      <p className="mt-1 text-sm text-muted">
                        This will create a new authenticator secret and generate backup codes for your admin account.
                      </p>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-background/30 p-4">
                      <Button type="button" className="w-full" onClick={() => void onEnable()} disabled={setupPending}>
                        {setupPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
                        Create authenticator setup
                      </Button>
                      <p className="mt-2 text-xs text-muted">
                        Tip: you can verify with the authenticator code or a backup code.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </m.div>
          ) : (
            <m.div
              key="verify-only"
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Verify your sign-in</p>
                  <p className="mt-1 text-sm text-muted">
                    Enter your authenticator code (or a backup code) to complete login.
                  </p>
                </div>

                <div className="space-y-3 rounded-xl border border-border/60 bg-background/30 p-4">
                  <div className="space-y-1.5">
                    <label htmlFor="totp-verify" className="text-sm font-medium text-foreground">
                      Authenticator code (TOTP)
                    </label>
                    <Input
                      id="totp-verify"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      placeholder="123456"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      disabled={setupPending}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="backup-verify" className="text-sm font-medium text-foreground">
                      Backup code (optional)
                    </label>
                    <Input
                      id="backup-verify"
                      value={backupCode}
                      onChange={(e) => setBackupCode(e.target.value)}
                      placeholder="e.g. 8F3D-... "
                      disabled={setupPending}
                    />
                  </div>

                  <Checkbox checked={trustDevice} onChange={(e) => setTrustDevice(e.target.checked)}>
                    Trust this device
                  </Checkbox>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button type="button" onClick={() => void onVerifyTotp()} disabled={setupPending}>
                      {setupPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
                      Verify
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => void onVerifyBackup()} disabled={setupPending}>
                      {setupPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
                      Use backup
                    </Button>
                  </div>
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </LazyMotion>
    </div>
  );
}

export default function TwoFactorPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted">Loading…</div>}>
      <TwoFactorClientPage />
    </Suspense>
  );
}

