"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TableSkeleton } from "@/components/molecules/skeletons/table-skeleton";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
import { Modal } from "@/components/atoms/modal";
import {
  FEATURE_LABELS,
  type CatalogFeatureName,
} from "@/shared/config/feature-labels";
import {
  useInternalTenantFeaturesQuery,
  useUpdateInternalTenantFeaturesMutation,
} from "@/services/internal/internal.hooks";
import type { InternalTenantFeature, InternalTenantSummary } from "@/services/internal/internal.types";

type TenantFeaturesDialogProps = {
  tenant: InternalTenantSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function featureLabel(name: string): string {
  return FEATURE_LABELS[name as CatalogFeatureName] ?? name.replace(/_/g, " ").toLowerCase();
}

export function TenantFeaturesDialog({ tenant, open, onOpenChange }: TenantFeaturesDialogProps) {
  const tenantId = tenant?.id ?? null;
  const { data, isPending, isError } = useInternalTenantFeaturesQuery(tenantId, open);
  const updateFeatures = useUpdateInternalTenantFeaturesMutation();

  const [draft, setDraft] = useState<Record<string, boolean>>({});

  const features = useMemo(() => data?.features ?? [], [data?.features]);
  const merged = useMemo(() => {
    return features.map((f) => ({
      ...f,
      enabled: draft[f.name] ?? f.isEnabled,
    }));
  }, [features, draft]);

  const dirty = useMemo(() => {
    return features.some((f) => (draft[f.name] ?? f.isEnabled) !== f.isEnabled);
  }, [features, draft]);

  const close = (): void => {
    if (updateFeatures.isPending) return;
    setDraft({});
    onOpenChange(false);
  };

  const toggle = (feature: InternalTenantFeature, next: boolean): void => {
    if (next && !feature.isPlatformActive) {
      toast.error("Enable this module platform-wide before assigning it to a tenant.");
      return;
    }
    setDraft((prev) => ({ ...prev, [feature.name]: next }));
  };

  const save = async (): Promise<void> => {
    if (!tenantId || !dirty) return;
    const payload = merged.map((f) => ({ name: f.name, isEnabled: f.enabled }));
    await updateFeatures.mutateAsync({ tenantId, features: payload });
    setDraft({});
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
      size="lg"
      closeDisabled={updateFeatures.isPending}
      header={
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Modules — {tenant?.name ?? "Tenant"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Enable or disable hospital workspace modules. New modules are granted to the protected ADMIN role
            automatically.
          </p>
        </div>
      }
      footer={
        <>
          <Button type="button" variant="ghost" disabled={updateFeatures.isPending} onClick={close}>
            Cancel
          </Button>
          <Button type="button" disabled={!dirty || updateFeatures.isPending} onClick={() => void save()}>
            {updateFeatures.isPending ? "Saving…" : "Save modules"}
          </Button>
        </>
      }
    >
      {isPending ? (
        <TableSkeleton rows={6} className="py-2" />
      ) : isError ? (
        <p className="py-6 text-sm text-danger">Could not load tenant modules.</p>
      ) : merged.length === 0 ? (
        <p className="py-6 text-sm text-muted">No catalog modules found.</p>
      ) : (
        <ul className="max-h-[min(24rem,60vh)] space-y-2 overflow-y-auto pr-1">
          {merged.map((feature) => (
            <li
              key={feature.name}
              className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 dark:bg-background/25"
            >
              <Checkbox
                checked={feature.enabled}
                disabled={updateFeatures.isPending || (!feature.isPlatformActive && !feature.enabled)}
                onChange={(e) => toggle(feature, e.target.checked)}
                aria-label={`Enable ${featureLabel(feature.name)}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{featureLabel(feature.name)}</p>
                {feature.description ? (
                  <p className="mt-0.5 text-xs text-muted">{feature.description}</p>
                ) : null}
                {!feature.isPlatformActive ? (
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-200">
                    Platform-disabled —{" "}
                    <Link href="/features" className="underline underline-offset-2">
                      enable in platform features
                    </Link>{" "}
                    before turning on for this tenant.
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
