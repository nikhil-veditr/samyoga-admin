"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { TableCard } from "@/components/atoms/table-card";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { ListEmptyState } from "@/components/molecules/list-empty-state";
import { ListPageHeaderActions } from "@/components/molecules/list-page-header-actions";
import { ListPageRefreshButton } from "@/components/molecules/list-page-refresh-button";
import { ListTableErrorRow } from "@/components/molecules/list-load-error-state";
import { TableSkeleton } from "@/components/molecules/skeletons/table-skeleton";
import { TenantFeaturesDialog } from "@/components/organisms/tenant-features-dialog";
import { TenantBillingDialog } from "@/components/organisms/tenant-billing-dialog";
import { TenantPolicyDialog } from "@/components/organisms/tenant-policy-dialog";
import { completeListRefresh } from "@/shared/lib/list-refresh-feedback";
import {
  resolveListRefreshButton,
  resolveListTableLoading,
} from "@/shared/lib/resolve-list-table-loading";
import {
  useInternalTenantsQuery,
  useUpdateTenantStatusMutation,
} from "@/services/internal/internal.hooks";
import type { InternalTenantSummary } from "@/services/internal/internal.types";

type PendingTenantStatus = {
  tenant: InternalTenantSummary;
  nextStatus: "ACTIVE" | "INACTIVE";
};

export function TenantsPanel() {
  const { data: tenants, isPending, isFetching, isError, refetch } = useInternalTenantsQuery();
  const updateStatus = useUpdateTenantStatusMutation();
  const [pending, setPending] = useState<PendingTenantStatus | null>(null);
  const [featuresTenant, setFeaturesTenant] = useState<InternalTenantSummary | null>(null);
  const [policyTenant, setPolicyTenant] = useState<InternalTenantSummary | null>(null);
  const [billingTenant, setBillingTenant] = useState<InternalTenantSummary | null>(null);

  const rowCount = tenants?.length ?? 0;
  const { controlsBusy, showInitialSkeleton, showEmptyState } = useMemo(
    () =>
      resolveListTableLoading({
        isPending,
        isFetching,
        isError,
        rowCount,
      }),
    [isPending, isFetching, isError, rowCount],
  );
  const refreshState = resolveListRefreshButton({ isPending, isFetching, isError });

  const closeDialog = (): void => {
    if (!updateStatus.isPending) setPending(null);
  };

  const confirmStatusChange = async (): Promise<void> => {
    if (!pending) return;
    await updateStatus.mutateAsync({
      tenantId: pending.tenant.id,
      status: pending.nextStatus,
    });
    setPending(null);
  };

  const deactivating = pending != null && pending.nextStatus === "INACTIVE";
  const reactivating = pending != null && pending.nextStatus === "ACTIVE";

  return (
    <div className="mx-auto max-w-6xl">
      <TableCard shellClassName="p-6">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">All tenants</h2>
            <p className="mt-1 text-sm text-muted">
              Hospital workspaces on the platform. Deactivated tenants cannot sign in to HMS.
            </p>
          </div>
          <ListPageHeaderActions>
            <ListPageRefreshButton
              busy={refreshState.busy}
              spinning={refreshState.spinning}
              onClick={() =>
                void completeListRefresh(refetch, {
                  successMessage: "Tenants list updated",
                  errorMessage: "Could not refresh tenants",
                })
              }
            />
            <Link href="/tenants/new">
              <Button type="button" disabled={controlsBusy}>
                <Plus className="mr-2 h-4 w-4" />
                Provision tenant
              </Button>
            </Link>
          </ListPageHeaderActions>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Slug</th>
                <th className="py-2 pr-4 font-medium">Region</th>
                <th className="py-2 pr-4 font-medium">Plan</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isError ? (
                <ListTableErrorRow
                  colSpan={6}
                  message="Could not load tenants."
                  onRetry={() => void refetch()}
                />
              ) : showInitialSkeleton ? (
                <TableSkeleton rows={8} columns={6} asTableRows />
              ) : showEmptyState ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <ListEmptyState
                      icon={Building2}
                      title="No tenants yet"
                      description="Provision a hospital workspace to enable HMS access for your first customer."
                      primaryAction={{
                        label: "Provision tenant",
                        onClick: () => {
                          window.location.href = "/tenants/new";
                        },
                      }}
                    />
                  </td>
                </tr>
              ) : (
                tenants?.map((t) => {
                  const active = t.status === "ACTIVE";
                  return (
                    <tr key={t.id} className="border-b border-border/60 last:border-0">
                      <td className="py-3 pr-4 font-medium text-foreground">{t.name}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-muted">{t.slug}</td>
                      <td className="py-3 pr-4 text-muted">{t.region === "AU" ? "Australia" : "India"}</td>
                      <td className="py-3 pr-4 text-muted">
                        <span className="capitalize">
                          {t.isLifetimeFree
                            ? `${t.tierSlug ?? t.subscriptionTier.toLowerCase()} · free`
                            : t.tierSlug ?? t.subscriptionTier.toLowerCase()}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize transition ${
                            active ? "bg-primary/15 text-primary" : "bg-danger/10 text-danger"
                          }`}
                        >
                          {t.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            className="px-3 py-1 text-xs"
                            disabled={controlsBusy || updateStatus.isPending}
                            onClick={() => setFeaturesTenant(t)}
                          >
                            Modules
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="px-3 py-1 text-xs"
                            disabled={controlsBusy || updateStatus.isPending}
                            onClick={() => setPolicyTenant(t)}
                          >
                            Policy
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="px-3 py-1 text-xs"
                            disabled={controlsBusy || updateStatus.isPending}
                            onClick={() => setBillingTenant(t)}
                          >
                            Billing
                          </Button>
                          {active ? (
                            <Button
                              type="button"
                              variant="danger"
                              className="px-3 py-1 text-xs"
                              disabled={controlsBusy || updateStatus.isPending}
                              onClick={() => setPending({ tenant: t, nextStatus: "INACTIVE" })}
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              className="px-3 py-1 text-xs"
                              disabled={controlsBusy || updateStatus.isPending}
                              onClick={() => setPending({ tenant: t, nextStatus: "ACTIVE" })}
                            >
                              Reactivate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </TableCard>

      <TenantFeaturesDialog
        tenant={featuresTenant}
        open={featuresTenant != null}
        onOpenChange={(open) => {
          if (!open) setFeaturesTenant(null);
        }}
      />

      <ConfirmDialog
        open={deactivating}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        title={`Deactivate ${pending?.tenant.name ?? "tenant"}?`}
        description={
          pending
            ? `Members of ${pending.tenant.name} (${pending.tenant.slug}) will lose HMS access until you reactivate this workspace. Existing data is preserved.`
            : undefined
        }
        confirmLabel="Deactivate tenant"
        destructive
        pending={updateStatus.isPending}
        confirmNameMatch={pending?.tenant.slug}
        confirmFieldKey={pending?.tenant.id}
        onConfirm={confirmStatusChange}
      />

      <TenantPolicyDialog
        tenant={policyTenant}
        open={policyTenant != null}
        onOpenChange={(open) => {
          if (!open) setPolicyTenant(null);
        }}
      />

      <TenantBillingDialog
        tenant={billingTenant}
        open={billingTenant != null}
        onOpenChange={(open) => {
          if (!open) setBillingTenant(null);
        }}
      />

      <ConfirmDialog
        open={reactivating}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        title={`Reactivate ${pending?.tenant.name ?? "tenant"}?`}
        description={
          pending
            ? `Restores HMS access for ${pending.tenant.name}. Members can sign in again if their accounts are still active.`
            : undefined
        }
        confirmLabel="Reactivate tenant"
        pending={updateStatus.isPending}
        confirmNameMatch={pending?.tenant.slug}
        confirmFieldKey={pending?.tenant.id}
        onConfirm={confirmStatusChange}
      />
    </div>
  );
}
