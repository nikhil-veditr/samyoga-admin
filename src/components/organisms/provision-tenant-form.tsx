"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
import { Input } from "@/components/atoms/input";
import { SelectField, type SelectOption } from "@/components/atoms/select-field";
import { InlineFeedback } from "@/components/atoms/inline-feedback";
import { TableCard } from "@/components/atoms/table-card";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { TableSkeleton } from "@/components/molecules/skeletons/table-skeleton";
import {
  DEFAULT_PROVISION_FEATURES,
  FEATURE_LABELS,
  type CatalogFeatureName,
} from "@/shared/config/feature-labels";
import { fieldSchemas } from "@/shared/lib/form/field-schemas";
import { useZodForm } from "@/shared/lib/form/zod-form";
import { useCatalogFeaturesQuery, useProvisionTenantMutation } from "@/services/internal/internal.hooks";

const REGION_OPTIONS: SelectOption[] = [
  { value: "IN", label: "India (IN)" },
  { value: "AU", label: "Australia (AU)" },
];

const provisionSchema = z.object({
  tenantName: z.string().trim().min(2, "Hospital name is required"),
  tenantSlug: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v), {
      message: "Slug: lowercase letters, numbers, hyphens only",
    }),
  address: z.string().trim().optional(),
  region: z.enum(["IN", "AU"]),
  featureNames: z.array(z.string()).min(1, "Select at least one feature"),
  adminFirstName: z.string().trim().min(1, "First name is required"),
  adminLastName: z.string().trim().min(1, "Last name is required"),
  adminEmail: fieldSchemas.email(),
  adminPassword: fieldSchemas.password(),
});

type ProvisionFormValues = z.infer<typeof provisionSchema>;

function featureLabel(name: string): string {
  return FEATURE_LABELS[name as CatalogFeatureName] ?? name.replace(/_/g, " ").toLowerCase();
}

export function ProvisionTenantForm() {
  const router = useRouter();
  const provision = useProvisionTenantMutation();
  const [pendingValues, setPendingValues] = useState<ProvisionFormValues | null>(null);
  const { data: catalogFeatures, isPending: featuresLoading } = useCatalogFeaturesQuery();

  const form = useZodForm<ProvisionFormValues>({
    schema: provisionSchema,
    defaultValues: {
      tenantName: "",
      tenantSlug: "",
      address: "",
      region: "IN",
      featureNames: [...DEFAULT_PROVISION_FEATURES],
      adminFirstName: "",
      adminLastName: "",
      adminEmail: "",
      adminPassword: "",
    },
  });

  const selectedFeatures = form.watch("featureNames");

  const toggleFeature = (name: string, checked: boolean): void => {
    const current = form.getValues("featureNames");
    if (checked) {
      if (!current.includes(name)) {
        form.setValue("featureNames", [...current, name], { shouldValidate: true });
      }
    } else {
      form.setValue(
        "featureNames",
        current.filter((n) => n !== name),
        { shouldValidate: true },
      );
    }
  };

  const selectAll = (): void => {
    const all = (catalogFeatures ?? []).map((f) => f.name);
    form.setValue("featureNames", all, { shouldValidate: true });
  };

  const selectDefaults = (): void => {
    const available = new Set((catalogFeatures ?? []).map((f) => f.name));
    form.setValue(
      "featureNames",
      DEFAULT_PROVISION_FEATURES.filter((n) => available.has(n)),
      { shouldValidate: true },
    );
  };

  const onSubmit = form.handleSubmit((values) => {
    setPendingValues(values);
  });

  const confirmProvision = async (): Promise<void> => {
    if (!pendingValues) return;
    await provision.mutateAsync({
      tenantName: pendingValues.tenantName,
      tenantSlug: pendingValues.tenantSlug?.trim() || undefined,
      address: pendingValues.address?.trim() || undefined,
      region: pendingValues.region,
      featureNames: pendingValues.featureNames,
      adminFirstName: pendingValues.adminFirstName,
      adminLastName: pendingValues.adminLastName,
      adminEmail: pendingValues.adminEmail,
      adminPassword: pendingValues.adminPassword,
    });
    setPendingValues(null);
    router.push("/tenants");
    router.refresh();
  };

  const confirmMatch = pendingValues?.tenantName.trim() ?? "";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-foreground">Provision new tenant</h1>
        <p className="mt-1 text-sm text-muted">
          Creates the hospital workspace, enables selected features, an ADMIN role with permissions for those
          features, and the first admin user.
        </p>
      </div>

      <TableCard shellClassName="p-6">
        <form onSubmit={onSubmit} className="space-y-8">
          <fieldset className="space-y-4 rounded-2xl border border-border/60 bg-background/30 p-5">
            <legend className="text-xs font-medium uppercase tracking-wide text-muted">Hospital</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="tenantName" className="block text-sm font-medium text-foreground">
                  Name
                </label>
                <Input id="tenantName" {...form.register("tenantName")} placeholder="City General Hospital" />
                {form.formState.errors.tenantName?.message && (
                  <p className="text-xs text-danger">{form.formState.errors.tenantName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="tenantSlug" className="block text-sm font-medium text-foreground">
                  Slug (optional)
                </label>
                <Input id="tenantSlug" {...form.register("tenantSlug")} placeholder="city-general" />
                {form.formState.errors.tenantSlug?.message && (
                  <p className="text-xs text-danger">{form.formState.errors.tenantSlug.message}</p>
                )}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-foreground">
                  Address (optional)
                </label>
                <Input id="address" {...form.register("address")} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="region" className="block text-sm font-medium text-foreground">
                  Data region
                </label>
                <SelectField
                  inputId="region"
                  options={REGION_OPTIONS}
                  value={REGION_OPTIONS.find((o) => o.value === form.watch("region")) ?? REGION_OPTIONS[0] ?? null}
                  onChange={(opt) => {
                    if (opt?.value === "IN" || opt?.value === "AU") {
                      form.setValue("region", opt.value, { shouldValidate: true });
                    }
                  }}
                  isSearchable={false}
                />
                <p className="text-xs text-muted">
                  Primary residency / regulatory region for this workspace.
                </p>
                {form.formState.errors.region?.message && (
                  <p className="text-xs text-danger">{form.formState.errors.region.message}</p>
                )}
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-3 rounded-2xl border border-border/60 bg-background/30 p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <legend className="text-xs font-medium uppercase tracking-wide text-muted">Features to enable</legend>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" className="px-3 py-1 text-xs" onClick={selectDefaults}>
                  Starter set
                </Button>
                <Button type="button" variant="ghost" className="px-3 py-1 text-xs" onClick={selectAll}>
                  Select all
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted">
              Only platform-active modules are listed. Selected modules are turned on for this tenant; the first
              admin receives full permissions for them.
            </p>
            {form.formState.errors.featureNames?.message && (
              <InlineFeedback variant="error">{form.formState.errors.featureNames.message}</InlineFeedback>
            )}
            {featuresLoading ? (
              <TableSkeleton rows={6} className="py-1" />
            ) : (
              <div className="grid gap-2 rounded-xl border border-border/60 bg-card/40 p-4 sm:grid-cols-2">
                {(catalogFeatures ?? []).map((feature) => {
                  const checked = selectedFeatures.includes(feature.name);
                  return (
                    <Checkbox
                      key={feature.name}
                      checked={checked}
                      align="start"
                      onChange={(e) => toggleFeature(feature.name, e.target.checked)}
                    >
                      <span className="block text-sm font-medium text-foreground">{featureLabel(feature.name)}</span>
                      {feature.description ? (
                        <span className="mt-0.5 block text-xs text-muted">{feature.description}</span>
                      ) : null}
                    </Checkbox>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-muted">{selectedFeatures.length} feature(s) selected</p>
          </fieldset>

          <fieldset className="space-y-4 rounded-2xl border border-border/60 bg-background/30 p-5">
            <legend className="text-xs font-medium uppercase tracking-wide text-muted">First admin user</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="adminFirstName" className="block text-sm font-medium text-foreground">
                  First name
                </label>
                <Input id="adminFirstName" autoComplete="off" {...form.register("adminFirstName")} />
                {form.formState.errors.adminFirstName?.message && (
                  <p className="text-xs text-danger">{form.formState.errors.adminFirstName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="adminLastName" className="block text-sm font-medium text-foreground">
                  Last name
                </label>
                <Input id="adminLastName" autoComplete="off" {...form.register("adminLastName")} />
                {form.formState.errors.adminLastName?.message && (
                  <p className="text-xs text-danger">{form.formState.errors.adminLastName.message}</p>
                )}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="adminEmail" className="block text-sm font-medium text-foreground">
                  Email
                </label>
                <Input id="adminEmail" type="email" autoComplete="off" {...form.register("adminEmail")} />
                {form.formState.errors.adminEmail?.message && (
                  <p className="text-xs text-danger">{form.formState.errors.adminEmail.message}</p>
                )}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="adminPassword" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  id="adminPassword"
                  type="password"
                  autoComplete="new-password"
                  {...form.register("adminPassword")}
                />
                {form.formState.errors.adminPassword?.message && (
                  <p className="text-xs text-danger">{form.formState.errors.adminPassword.message}</p>
                )}
              </div>
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={provision.isPending || featuresLoading}>
              {provision.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Provisioning…
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create tenant
                </>
              )}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.push("/tenants")}>
              Cancel
            </Button>
          </div>
        </form>
      </TableCard>

      <ConfirmDialog
        open={pendingValues != null}
        onOpenChange={(open) => {
          if (!open && !provision.isPending) setPendingValues(null);
        }}
        title="Provision this tenant?"
        description={
          pendingValues
            ? `Creates ${pendingValues.tenantName.trim()} with ${pendingValues.featureNames.length} module(s) and admin ${pendingValues.adminEmail.trim()}. This cannot be undone from the portal except by deactivating the workspace.`
            : undefined
        }
        confirmLabel="Create tenant"
        pending={provision.isPending}
        confirmNameMatch={confirmMatch}
        confirmFieldKey={confirmMatch}
        onConfirm={confirmProvision}
      />
    </div>
  );
}
