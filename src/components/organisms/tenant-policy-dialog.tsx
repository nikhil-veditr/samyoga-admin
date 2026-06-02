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

  useEffect(() => {
    if (data?.settings) {
      setDraft(data.settings);
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
        </div>
      )}
    </Modal>
  );
}
