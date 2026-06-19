"use client";

import { useState } from "react";
import { Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { SelectField, type SelectOption } from "@/components/atoms/select-field";
import { Modal } from "@/components/atoms/modal";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { useUpdateTenantLifetimeFreeMutation } from "@/services/internal/internal.hooks";
import type { InternalTenantSummary } from "@/services/internal/internal.types";

const TIER_OPTIONS: SelectOption[] = [
  { value: "professional", label: "Professional" },
  { value: "enterprise", label: "Enterprise" },
];

type TenantBillingDialogProps = {
  tenant: InternalTenantSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TenantBillingDialog({ tenant, open, onOpenChange }: TenantBillingDialogProps) {
  const updateLifetimeFree = useUpdateTenantLifetimeFreeMutation();
  const [tierSlug, setTierSlug] = useState("enterprise");
  const [confirmEnable, setConfirmEnable] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);

  const close = (): void => {
    if (updateLifetimeFree.isPending) return;
    setConfirmEnable(false);
    setConfirmDisable(false);
    onOpenChange(false);
  };

  const grantLifetimeFree = async (): Promise<void> => {
    if (!tenant) return;
    await updateLifetimeFree.mutateAsync({
      tenantId: tenant.id,
      enabled: true,
      tierSlug,
    });
    setConfirmEnable(false);
    close();
  };

  const revokeLifetimeFree = async (): Promise<void> => {
    if (!tenant) return;
    await updateLifetimeFree.mutateAsync({
      tenantId: tenant.id,
      enabled: false,
    });
    setConfirmDisable(false);
    close();
  };

  if (!tenant) return null;

  const planLabel = tenant.isLifetimeFree
    ? `${tenant.tierSlug ?? tenant.subscriptionTier} (lifetime free)`
    : tenant.tierSlug ?? tenant.subscriptionTier.toLowerCase();

  return (
    <>
      <Modal
        open={open}
        onOpenChange={(next) => {
          if (!next) close();
          else onOpenChange(true);
        }}
        size="md"
        closeDisabled={updateLifetimeFree.isPending}
        header={
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Billing — {tenant.name}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Grant complimentary lifetime access or review the workspace subscription state.
            </p>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-border/70 bg-card/40 p-4 text-sm">
            <p className="text-muted">Current plan</p>
            <p className="mt-1 font-medium capitalize text-foreground">{planLabel}</p>
            <p className="mt-2 text-xs text-muted">
              Status: {tenant.subscriptionStatus?.toLowerCase() ?? "none"}
              {tenant.trialEndsAt && !tenant.isLifetimeFree
                ? ` · trial ends ${new Date(tenant.trialEndsAt).toLocaleDateString()}`
                : null}
            </p>
          </div>

          <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <Gift className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <p className="font-medium text-foreground">Lifetime complimentary access</p>
                  <p className="mt-1 text-sm text-muted">
                    Skips trial expiry and paid checkout for this hospital. Tenant admins upgrade
                    plans from workspace settings unless this is enabled.
                  </p>
                </div>

                {tenant.isLifetimeFree ? (
                  <Button
                    type="button"
                    variant="danger"
                    disabled={updateLifetimeFree.isPending}
                    onClick={() => setConfirmDisable(true)}
                  >
                    Remove lifetime free
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Entitlement tier
                      </label>
                      <SelectField
                        inputId="lifetime-free-tier"
                        options={TIER_OPTIONS}
                        value={TIER_OPTIONS.find((o) => o.value === tierSlug) ?? TIER_OPTIONS[1] ?? null}
                        onChange={(opt) => {
                          if (opt?.value) setTierSlug(opt.value);
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      disabled={updateLifetimeFree.isPending}
                      onClick={() => setConfirmEnable(true)}
                    >
                      {updateLifetimeFree.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                          Saving…
                        </>
                      ) : (
                        "Grant lifetime free"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-muted">
            Paid upgrades remain available to the tenant in Workspace settings → Billing (upgrade
            only, no self-serve downgrade).
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmEnable}
        onOpenChange={setConfirmEnable}
        title={`Grant lifetime free to ${tenant.name}?`}
        description={`Applies the ${tierSlug} entitlements with no billing expiry. The hospital admin will not need checkout to stay active.`}
        confirmLabel="Grant lifetime free"
        pending={updateLifetimeFree.isPending}
        confirmNameMatch={tenant.slug}
        confirmFieldKey={`${tenant.id}-grant`}
        onConfirm={grantLifetimeFree}
      />

      <ConfirmDialog
        open={confirmDisable}
        onOpenChange={setConfirmDisable}
        title={`Remove lifetime free from ${tenant.name}?`}
        description="The workspace returns to normal trial or paid billing rules. Existing Dodo subscriptions are not cancelled automatically."
        confirmLabel="Remove lifetime free"
        destructive
        pending={updateLifetimeFree.isPending}
        confirmNameMatch={tenant.slug}
        confirmFieldKey={`${tenant.id}-revoke`}
        onConfirm={revokeLifetimeFree}
      />
    </>
  );
}
