"use client";

import { Check, Copy, Download, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
import { Input } from "@/components/atoms/input";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { PROFILE_TWO_FACTOR_SECTION_ID } from "@/components/organisms/profile/profile-passkeys.shared";
import { authClient } from "@/shared/lib/auth/auth-client";
import { parseTotpUri } from "@/shared/lib/auth/parse-totp-uri";

type EnableStep = "idle" | "scan" | "backup";

async function copyText(label: string, text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  } catch {
    toast.error(`Could not copy ${label.toLowerCase()}`);
  }
}

function BackupCodesPanel({
  codes,
  acknowledged,
  onAcknowledgedChange,
  onDone,
  doneDisabled,
  doneLabel = "Done",
}: {
  codes: string[];
  acknowledged: boolean;
  onAcknowledgedChange: (checked: boolean) => void;
  onDone: () => void;
  doneDisabled: boolean;
  doneLabel?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
        <p className="font-medium text-foreground">Save your backup codes</p>
        <p className="mt-1 text-muted">
          Use these if you lose your phone. Each code works once. Store them in a password manager or another
          secure place.
        </p>
        {codes.length > 0 ? (
          <ul className="mt-3 grid gap-1 font-mono text-xs text-foreground">
            {codes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-muted">No backup codes were returned. Contact support if needed.</p>
        )}
        {codes.length > 0 ? (
          <Button
            type="button"
            variant="secondary"
            className="mt-3 w-full sm:w-auto"
            onClick={() => void copyText("Backup codes", codes.join("\n"))}
          >
            <Copy className="h-4 w-4" aria-hidden />
            Copy all backup codes
          </Button>
        ) : null}
      </div>

      <Checkbox align="start" checked={acknowledged} onChange={(e) => onAcknowledgedChange(e.target.checked)}>
        I have saved my backup codes in a secure place
      </Checkbox>

      <Button type="button" disabled={doneDisabled || !acknowledged} onClick={onDone}>
        <Check className="h-4 w-4" aria-hidden />
        {doneLabel}
      </Button>
    </div>
  );
}

export function ProfileTwoFactorSection() {
  const { data: sessionPayload, refetch } = authClient.useSession();
  const user = sessionPayload?.user as { twoFactorEnabled?: boolean; email?: string } | undefined;
  const enabled = user?.twoFactorEnabled === true;

  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [enableStep, setEnableStep] = useState<EnableStep>("idle");
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [backupAcknowledged, setBackupAcknowledged] = useState(false);
  const [showManualSetup, setShowManualSetup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [regenerateConfirmOpen, setRegenerateConfirmOpen] = useState(false);
  const [regeneratedBackupCodes, setRegeneratedBackupCodes] = useState<string[] | null>(null);
  const [regenerateAcknowledged, setRegenerateAcknowledged] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const parsedTotp = useMemo(() => (totpUri ? parseTotpUri(totpUri) : null), [totpUri]);

  const downloadQrImage = (): void => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "samyoga-admin-authenticator-qr.png";
    a.click();
    toast.success("QR image downloaded");
  };

  const resetEnableFlow = (): void => {
    setEnableStep("idle");
    setTotpUri(null);
    setBackupCodes([]);
    setBackupAcknowledged(false);
    setShowManualSetup(false);
    setTotpCode("");
    setPassword("");
  };

  const startEnable = async (): Promise<void> => {
    if (!password.trim()) {
      toast.error("Enter your password to enable two-factor authentication");
      return;
    }
    setBusy(true);
    try {
      const result = await authClient.twoFactor.enable({ password });
      if (result.error) {
        throw new Error(result.error.message ?? "Could not start 2FA setup");
      }
      const uri = result.data?.totpURI ?? null;
      const codes = (result.data?.backupCodes as string[] | undefined) ?? [];
      setTotpUri(uri);
      setBackupCodes(codes);
      setEnableStep("scan");
      toast.message("Scan the QR code with your authenticator app, then enter a verification code");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not enable 2FA");
    } finally {
      setBusy(false);
    }
  };

  const confirmEnable = async (): Promise<void> => {
    if (totpCode.trim().length < 6) {
      toast.error("Enter the 6-digit code from your authenticator app");
      return;
    }
    setBusy(true);
    try {
      const result = await authClient.twoFactor.verifyTotp({ code: totpCode.trim() });
      if (result.error) {
        throw new Error(result.error.message ?? "Invalid verification code");
      }
      toast.success("Authenticator verified");
      setEnableStep("backup");
      setTotpCode("");
      setTotpUri(null);
      setShowManualSetup(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  };

  const finishBackupStep = async (): Promise<void> => {
    if (!backupAcknowledged) {
      toast.error("Confirm that you have saved your backup codes");
      return;
    }
    toast.success("Two-factor authentication is enabled");
    resetEnableFlow();
    await refetch();
  };

  const disable2fa = async (): Promise<void> => {
    if (!password.trim()) {
      toast.error("Enter your password to disable two-factor authentication");
      return;
    }
    setBusy(true);
    try {
      const result = await authClient.twoFactor.disable({ password });
      if (result.error) {
        throw new Error(result.error.message ?? "Could not disable 2FA");
      }
      toast.success("Two-factor authentication disabled");
      resetEnableFlow();
      setRegeneratedBackupCodes(null);
      setRegenerateAcknowledged(false);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not disable 2FA");
    } finally {
      setBusy(false);
    }
  };

  const regenerateBackupCodes = async (): Promise<void> => {
    if (!password.trim()) {
      toast.error("Enter your password to generate new backup codes");
      return;
    }
    setBusy(true);
    try {
      const result = await authClient.twoFactor.generateBackupCodes({ password });
      if (result.error) {
        throw new Error(result.error.message ?? "Could not generate backup codes");
      }
      const codes = (result.data?.backupCodes as string[] | undefined) ?? [];
      if (codes.length === 0) {
        throw new Error("No backup codes were returned");
      }
      setRegeneratedBackupCodes(codes);
      setRegenerateAcknowledged(false);
      setRegenerateConfirmOpen(false);
      toast.message("Save these codes — your previous backup codes no longer work");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate backup codes");
    } finally {
      setBusy(false);
    }
  };

  const finishRegeneratedBackupCodes = (): void => {
    setRegeneratedBackupCodes(null);
    setRegenerateAcknowledged(false);
    setPassword("");
    toast.success("New backup codes saved");
  };

  return (
    <section
      id={PROFILE_TWO_FACTOR_SECTION_ID}
      className="scroll-mt-6 rounded-xl border border-border/70 bg-card/60 p-5 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12 text-primary">
          <ShieldCheck className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">Two-factor authentication</h2>
            <p className="mt-1 text-sm text-muted">
              Add a TOTP authenticator app for an extra sign-in step. Required on every device after password
              sign-in unless you trust the device during verification.
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              Status: {enabled ? "Enabled" : "Not enabled"}
            </p>
          </div>

          {!enabled ? (
            <div className="space-y-3">
              {enableStep === "idle" ? (
                <>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Current password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button type="button" disabled={busy} onClick={() => void startEnable()}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                    Set up authenticator
                  </Button>
                </>
              ) : null}

              {enableStep === "scan" ? (
                <>
                  {totpUri ? (
                    <div className="flex flex-col items-center gap-3 rounded-lg border border-border/60 bg-background/50 p-4">
                      <QRCodeCanvas
                        ref={qrCanvasRef}
                        value={totpUri}
                        size={200}
                        level="M"
                        includeMargin
                        aria-label="QR code for authenticator setup"
                      />
                      <p className="max-w-sm text-center text-sm text-muted">
                        Scan with Google Authenticator or your phone camera.
                      </p>
                      <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={downloadQrImage}>
                        <Download className="h-4 w-4" aria-hidden />
                        Download QR image
                      </Button>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                    onClick={() => setShowManualSetup((v) => !v)}
                  >
                    {showManualSetup ? "Hide manual setup" : "Can't scan? Enter setup key manually"}
                  </button>

                  {showManualSetup && parsedTotp ? (
                    <div className="space-y-2 rounded-lg border border-border/60 bg-background/40 p-3 text-sm">
                      <p>
                        <span className="text-muted">Issuer: </span>
                        <span className="font-medium text-foreground">{parsedTotp.issuer}</span>
                      </p>
                      <p>
                        <span className="text-muted">Account: </span>
                        <span className="font-medium text-foreground">{parsedTotp.account}</span>
                      </p>
                      <p className="break-all font-mono text-xs text-foreground">{parsedTotp.secret}</p>
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full sm:w-auto"
                        onClick={() => void copyText("Setup key", parsedTotp.secret)}
                      >
                        <Copy className="h-4 w-4" aria-hidden />
                        Copy setup key
                      </Button>
                    </div>
                  ) : null}

                  <Input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="6-digit verification code"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" disabled={busy} onClick={() => void confirmEnable()}>
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                      Confirm and enable
                    </Button>
                    <Button type="button" variant="ghost" disabled={busy} onClick={resetEnableFlow}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : null}

              {enableStep === "backup" ? (
                <BackupCodesPanel
                  codes={backupCodes}
                  acknowledged={backupAcknowledged}
                  onAcknowledgedChange={setBackupAcknowledged}
                  onDone={() => void finishBackupStep()}
                  doneDisabled={busy}
                />
              ) : null}
            </div>
          ) : regeneratedBackupCodes ? (
            <BackupCodesPanel
              codes={regeneratedBackupCodes}
              acknowledged={regenerateAcknowledged}
              onAcknowledgedChange={setRegenerateAcknowledged}
              onDone={finishRegeneratedBackupCodes}
              doneDisabled={busy}
              doneLabel="I've saved these codes"
            />
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-border/60 bg-background/40 p-3 text-sm text-muted">
                <p className="font-medium text-foreground">Backup codes</p>
                <p className="mt-1">
                  Backup codes cannot be viewed after setup. Generate a new set if you have lost yours — this
                  replaces all previous codes immediately.
                </p>
              </div>
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="Current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => {
                    if (!password.trim()) {
                      toast.error("Enter your password to generate new backup codes");
                      return;
                    }
                    setRegenerateConfirmOpen(true);
                  }}
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <RefreshCw className="h-4 w-4" aria-hidden />
                  )}
                  Generate new backup codes
                </Button>
                <Button type="button" variant="ghost" disabled={busy} onClick={() => void disable2fa()}>
                  Disable two-factor
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={regenerateConfirmOpen}
        onOpenChange={(open) => {
          if (!busy) setRegenerateConfirmOpen(open);
        }}
        title="Generate new backup codes?"
        description="All existing backup codes will stop working immediately. Save the new codes in a secure place before closing this screen."
        confirmLabel={busy ? "Generating…" : "Generate new codes"}
        destructive
        pending={busy}
        onConfirm={regenerateBackupCodes}
      />
    </section>
  );
}
