"use client";

import { Fingerprint, KeyRound, Loader2, Trash2 } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { AdminSurface } from "@/components/atoms/admin-surface";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import {
  PROFILE_PASSKEYS_QUERY_KEY,
  PROFILE_PASSKEYS_SECTION_ID,
  fetchUserPasskeys,
  type PasskeyRow,
} from "@/components/organisms/profile/profile-passkeys.shared";
import { authClient } from "@/shared/lib/auth/auth-client";
import {
  formatPasskeyKindLabel,
  SUGGESTED_SECURITY_KEY_LABEL,
} from "@/shared/lib/auth/format-passkey-display";
import {
  getSuggestedPasskeyLabel,
  getSuggestedPasskeyLabelServerSnapshot,
  subscribeSuggestedPasskeyLabel,
} from "@/shared/lib/auth/suggest-passkey-label";
import { useAppQuery } from "@/shared/lib/react-query/hooks";

type RegisteringMode = "platform" | "cross-platform" | null;

export function ProfilePasskeysSection() {
  const [registeringMode, setRegisteringMode] = useState<RegisteringMode>(null);
  const [passkeyNameOverride, setPasskeyNameOverride] = useState<string | null>(null);
  const suggestedPasskeyLabel = useSyncExternalStore(
    subscribeSuggestedPasskeyLabel,
    getSuggestedPasskeyLabel,
    getSuggestedPasskeyLabelServerSnapshot,
  );
  const passkeyName = passkeyNameOverride ?? suggestedPasskeyLabel;
  const [deleteTarget, setDeleteTarget] = useState<PasskeyRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const passkeysQuery = useAppQuery({
    queryKey: PROFILE_PASSKEYS_QUERY_KEY,
    queryFn: fetchUserPasskeys,
    staleTime: 30_000,
  });

  const passkeys = passkeysQuery.data ?? [];
  const loading = passkeysQuery.isPending;
  const registering = registeringMode !== null;

  const addPasskey = async (authenticatorAttachment: "platform" | "cross-platform"): Promise<void> => {
    const fallbackName =
      authenticatorAttachment === "cross-platform"
        ? SUGGESTED_SECURITY_KEY_LABEL
        : suggestedPasskeyLabel || "Samyoga Admin";
    const name = passkeyName.trim() || fallbackName;

    setRegisteringMode(authenticatorAttachment);
    try {
      const result = await authClient.passkey.addPasskey({
        name,
        authenticatorAttachment,
      });
      if (result.error) {
        throw new Error(result.error.message ?? "Could not register passkey");
      }
      toast.success(
        authenticatorAttachment === "cross-platform"
          ? "Security key registered. Use Sign in with passkey on any computer while your key is connected."
          : "Passkey added. Next time, use Sign in with passkey on the sign-in page.",
      );
      setPasskeyNameOverride(null);
      await passkeysQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Passkey registration cancelled or failed");
    } finally {
      setRegisteringMode(null);
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await authClient.passkey.deletePasskey({ id: deleteTarget.id });
      if (result.error) {
        throw new Error(result.error.message ?? "Could not remove passkey");
      }
      toast.success("Passkey removed");
      setDeleteTarget(null);
      await passkeysQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove passkey");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AdminSurface
        as="section"
        id={PROFILE_PASSKEYS_SECTION_ID}
        className="scroll-mt-6 p-5"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
            <Fingerprint className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">Passkeys</h2>
              <p className="mt-1 text-sm text-muted">
                Sign in with Face ID, Touch ID, Windows Hello, or register a USB/NFC security key. A passkey or
                authenticator app satisfies the admin portal MFA requirement.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="passkey-label" className="text-xs font-medium uppercase tracking-wide text-muted">
                Label (optional)
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <Input
                  id="passkey-label"
                  className="min-w-0 flex-1"
                  placeholder="e.g. Mac · Safari or YubiKey 5"
                  value={passkeyName}
                  onChange={(e) => setPasskeyNameOverride(e.target.value)}
                />
                <Button
                  type="button"
                  className="w-full shrink-0 py-2.5 sm:w-auto"
                  disabled={registering}
                  onClick={() => void addPasskey("platform")}
                >
                  {registeringMode === "platform" ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : null}
                  Add this device
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full shrink-0 gap-1.5 py-2.5 sm:w-auto"
                  disabled={registering}
                  onClick={() => {
                    if (passkeyNameOverride === null && passkeyName === suggestedPasskeyLabel) {
                      setPasskeyNameOverride(SUGGESTED_SECURITY_KEY_LABEL);
                    }
                    void addPasskey("cross-platform");
                  }}
                >
                  {registeringMode === "cross-platform" ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <KeyRound className="h-4 w-4 shrink-0" aria-hidden />
                  )}
                  Add security key
                </Button>
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-muted">Loading passkeys…</p>
            ) : passkeys.length === 0 ? (
              <p className="text-sm text-muted">No passkeys or security keys registered yet.</p>
            ) : (
              <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
                {passkeys.map((pk) => (
                  <li key={pk.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{pk.name?.trim() || "Passkey"}</p>
                      {pk.deviceType || pk.transports ? (
                        <p className="text-xs text-muted">{formatPasskeyKindLabel(pk)}</p>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="shrink-0 text-danger hover:text-danger"
                      aria-label={`Remove ${pk.name ?? "passkey"}`}
                      onClick={() => setDeleteTarget(pk)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </AdminSurface>

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
        title="Remove this passkey?"
        description="You will not be able to sign in with this device or security key until you register it again."
        confirmLabel={deleting ? "Removing…" : "Remove passkey"}
        destructive
        pending={deleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
