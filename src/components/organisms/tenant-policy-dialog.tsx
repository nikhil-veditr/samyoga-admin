"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
import { Input } from "@/components/atoms/input";
import { Modal } from "@/components/atoms/modal";
import {
  useInternalTenantSettingsQuery,
  useUpdateInternalTenantSettingsMutation,
} from "@/services/internal/internal.hooks";
import type { InternalTenantSummary, TenantAccessPolicy } from "@/services/internal/internal.types";

function defaultEnforceDateInput(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 14);
  return date.toISOString().slice(0, 10);
}

function enforceDateFromGraceDays(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const GRACE_PERIOD_PRESETS = [
  { label: "7 days", days: 7 },
  { label: "14 days", days: 14 },
  { label: "30 days", days: 30 },
] as const;

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return defaultEnforceDateInput();
  return iso.slice(0, 10);
}

function toEnforceAtIso(dateInput: string): string {
  return `${dateInput}T23:59:59.999Z`;
}

type TenantPolicyDialogProps = {
  tenant: InternalTenantSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TenantPolicyDialog({ tenant, open, onOpenChange }: TenantPolicyDialogProps) {
  const tenantId = tenant?.id ?? null;
  const { data, isPending, isError } = useInternalTenantSettingsQuery(tenantId, open);
  const updateSettings = useUpdateInternalTenantSettingsMutation();

  const [draft, setDraft] = useState<TenantAccessPolicy | null>(null);
  const [enforceDateInput, setEnforceDateInput] = useState(defaultEnforceDateInput);

  useEffect(() => {
    if (data?.settings) {
      setDraft(data.settings);
      setEnforceDateInput(toDateInputValue(data.settings.requireTwoFactorEnforceAt));
    }
  }, [data?.settings]);

  const close = (): void => {
    if (updateSettings.isPending) return;
    setDraft(null);
    onOpenChange(false);
  };

  const save = async (): Promise<void> => {
    if (!tenantId || !draft) return;
    await updateSettings.mutateAsync({
      tenantId,
      body: {
        enforcePhiMinimumNecessary: draft.enforcePhiMinimumNecessary,
        defaultSessionTtlMinutes: draft.defaultSessionTtlMinutes,
        allowedIpCidrs: draft.allowedIpCidrs,
        requireTwoFactor: draft.requireTwoFactor,
        requireTwoFactorEnforceAt: draft.requireTwoFactor
          ? toEnforceAtIso(enforceDateInput)
          : null,
      },
    });
    toast.success("Compliance settings updated");
    close();
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
      size="md"
      closeDisabled={updateSettings.isPending}
      header={
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">Compliance policy</h2>
          <p className="mt-1 text-sm text-muted">
            {tenant ? `${tenant.name} · ${tenant.slug}` : "Tenant access and PHI controls"}
          </p>
        </div>
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" disabled={updateSettings.isPending} onClick={close}>
            Cancel
          </Button>
          <Button type="button" disabled={updateSettings.isPending || !draft} onClick={() => void save()}>
            {updateSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Save policy
          </Button>
        </div>
      }
    >
      {isPending ? (
        <p className="text-sm text-muted">Loading policy…</p>
      ) : isError || !draft ? (
        <p className="text-sm text-danger">Could not load tenant policy.</p>
      ) : (
        <div className="space-y-4">
          <Checkbox
            checked={draft.enforcePhiMinimumNecessary}
            onChange={(e) =>
              setDraft((prev) =>
                prev ? { ...prev, enforcePhiMinimumNecessary: e.target.checked } : prev,
              )
            }
          >
            Enforce PHI minimum necessary on lab reports
          </Checkbox>
          <div className="space-y-1.5">
            <label htmlFor="session-ttl" className="text-sm font-medium text-foreground">
              Default session TTL (minutes)
            </label>
            <Input
              id="session-ttl"
              type="number"
              min={5}
              max={1440}
              value={draft.defaultSessionTtlMinutes ?? ""}
              onChange={(e) => {
                const raw = e.target.value.trim();
                setDraft((prev) =>
                  prev
                    ? {
                        ...prev,
                        defaultSessionTtlMinutes: raw === "" ? null : Number.parseInt(raw, 10),
                      }
                    : prev,
                );
              }}
            />
            <p className="text-xs text-muted">Leave empty to use platform default (30 minutes).</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="ip-cidrs" className="text-sm font-medium text-foreground">
              Allowed IP CIDRs
            </label>
            <Input
              id="ip-cidrs"
              placeholder="10.0.0.0/8, 192.168.1.0/24"
              value={draft.allowedIpCidrs ?? ""}
              onChange={(e) =>
                setDraft((prev) =>
                  prev
                    ? {
                        ...prev,
                        allowedIpCidrs: e.target.value.trim() === "" ? null : e.target.value,
                      }
                    : prev,
                )
              }
            />
            <p className="text-xs text-muted">
              Comma-separated list. Empty allows all IPs (subject to HMS network controls).
            </p>
          </div>
          <div className="space-y-3 rounded-xl border border-border/60 p-3">
            <Checkbox
              checked={draft.requireTwoFactor}
              onChange={(e) => {
                const checked = e.target.checked;
                setDraft((prev) => (prev ? { ...prev, requireTwoFactor: checked } : prev));
                if (checked && !draft.requireTwoFactorEnforceAt) {
                  setEnforceDateInput(defaultEnforceDateInput());
                }
              }}
            >
              Require passkey or authenticator (2FA)
            </Checkbox>
            {draft.requireTwoFactor ? (
              <div className="space-y-1.5 pl-6">
                <label htmlFor="two-factor-enforce-date" className="text-sm font-medium text-foreground">
                  Enforcement date
                </label>
                <div className="flex flex-wrap gap-2">
                  {GRACE_PERIOD_PRESETS.map((preset) => (
                    <Button
                      key={preset.days}
                      type="button"
                      variant="secondary"
                      className="h-8 px-2.5 py-1.5 text-xs"
                      onClick={() => setEnforceDateInput(enforceDateFromGraceDays(preset.days))}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
                <Input
                  id="two-factor-enforce-date"
                  type="date"
                  value={enforceDateInput}
                  onChange={(e) => setEnforceDateInput(e.target.value)}
                />
                <p className="text-xs text-muted">
                  Until this date, members see a reminder banner in HMS. After it, editing patient and
                  clinical records is blocked until they add a passkey or turn on authenticator 2FA.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </Modal>
  );
}
