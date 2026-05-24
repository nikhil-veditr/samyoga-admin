"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { TableCard } from "@/components/atoms/table-card";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import {
  FEATURE_LABELS,
  type CatalogFeatureName,
} from "@/shared/config/feature-labels";
import {
  usePlatformFeaturesQuery,
  useUpdatePlatformFeatureMutation,
} from "@/services/internal/internal.hooks";
import type { PlatformFeature } from "@/services/internal/internal.types";

type PendingToggle = {
  feature: PlatformFeature;
  nextActive: boolean;
};

function featureLabel(name: string): string {
  return FEATURE_LABELS[name as CatalogFeatureName] ?? name.replace(/_/g, " ").toLowerCase();
}

export function PlatformFeaturesPanel() {
  const { data: features, isPending } = usePlatformFeaturesQuery();
  const updateFeature = useUpdatePlatformFeatureMutation();
  const [pending, setPending] = useState<PendingToggle | null>(null);

  const closeDialog = (): void => {
    if (!updateFeature.isPending) setPending(null);
  };

  const confirmToggle = async (): Promise<void> => {
    if (!pending) return;
    await updateFeature.mutateAsync({
      featureName: pending.feature.name,
      isActive: pending.nextActive,
    });
    setPending(null);
  };

  const disabling = pending != null && !pending.nextActive;
  const enabling = pending != null && pending.nextActive;

  return (
    <>
      <TableCard shellClassName="p-6">
        <div className="mb-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">Platform features</h2>
          <p className="mt-1 text-sm text-muted">
            Disable a module to block all tenant HMS APIs that require it. Tenant provisioning only lists
            active modules.
          </p>
        </div>
        {isPending ? (
          <p className="text-sm text-muted">Loading features…</p>
        ) : features && features.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2 pr-4 font-medium">Feature</th>
                  <th className="py-2 pr-4 font-medium">Version</th>
                  <th className="py-2 pr-4 font-medium">Tenants enabled</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature) => (
                  <tr key={feature.name} className="border-b border-border/60 last:border-0">
                    <td className="py-3 pr-4">
                      <span className="block font-medium text-foreground">{featureLabel(feature.name)}</span>
                      {feature.description ? (
                        <span className="mt-0.5 block text-xs text-muted">{feature.description}</span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 text-muted">{feature.version}</td>
                    <td className="py-3 pr-4 text-muted">{feature.enabledTenantCount}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          feature.isActive
                            ? "bg-primary/15 text-primary"
                            : "bg-danger/10 text-danger"
                        }`}
                      >
                        {feature.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-3">
                      {feature.isActive ? (
                        <Button
                          type="button"
                          variant="danger"
                          className="px-3 py-1 text-xs"
                          disabled={updateFeature.isPending}
                          onClick={() => setPending({ feature, nextActive: false })}
                        >
                          Disable
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-3 py-1 text-xs"
                          disabled={updateFeature.isPending}
                          onClick={() => setPending({ feature, nextActive: true })}
                        >
                          Enable
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">No features in catalog. Run database seed.</p>
        )}
      </TableCard>

      <ConfirmDialog
        open={disabling}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        title={`Disable ${pending ? featureLabel(pending.feature.name) : "feature"}?`}
        description={
          pending
            ? `This immediately blocks every HMS API that requires ${featureLabel(pending.feature.name)} for all tenants. ${pending.feature.enabledTenantCount} tenant(s) currently have this module enabled in their workspace — those assignments stay, but API permission checks will fail until you re-enable the feature. Review affected tenants on the tenants page and adjust modules if needed.`
            : undefined
        }
        confirmLabel="Disable platform-wide"
        destructive
        pending={updateFeature.isPending}
        confirmNameMatch={pending?.feature.name}
        confirmFieldKey={pending?.feature.name}
        onConfirm={confirmToggle}
      >
        {pending && pending.feature.enabledTenantCount > 0 ? (
          <Link
            href="/tenants"
            className="mt-3 inline-flex text-sm font-medium text-primary underline underline-offset-2 hover:text-primary/90"
          >
            Open tenants list ({pending.feature.enabledTenantCount} with this module enabled)
          </Link>
        ) : null}
      </ConfirmDialog>

      <ConfirmDialog
        open={enabling}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        title={`Enable ${pending ? featureLabel(pending.feature.name) : "feature"}?`}
        description={
          pending
            ? `Restores ${featureLabel(pending.feature.name)} in the platform catalog. Tenants can use APIs for this module only if it is also enabled on their workspace.`
            : undefined
        }
        confirmLabel="Enable platform-wide"
        pending={updateFeature.isPending}
        confirmNameMatch={pending?.feature.name}
        confirmFieldKey={pending?.feature.name}
        onConfirm={confirmToggle}
      />
    </>
  );
}
