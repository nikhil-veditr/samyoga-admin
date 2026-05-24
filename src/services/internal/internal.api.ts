import { fetchClient } from "@/shared/lib/fetch/fetch-client";
import type {
  CatalogFeature,
  InternalTenantFeaturesPayload,
  InternalTenantSummary,
  PlatformFeature,
  ProvisionTenantPayload,
  ProvisionTenantResult,
} from "./internal.types";

export async function fetchCatalogFeatures(): Promise<CatalogFeature[]> {
  const data = await fetchClient<{ features: CatalogFeature[] }>({
    endpoint: "/internal/features?activeOnly=true",
    silent: true,
  });
  return data?.features ?? [];
}

export async function fetchPlatformFeatures(): Promise<PlatformFeature[]> {
  const data = await fetchClient<{ features: PlatformFeature[] }>({
    endpoint: "/internal/features",
    silent: true,
  });
  return data?.features ?? [];
}

export async function updatePlatformFeature(
  featureName: string,
  isActive: boolean,
): Promise<PlatformFeature> {
  const data = await fetchClient<{ feature: PlatformFeature }>({
    endpoint: `/internal/features/${encodeURIComponent(featureName)}`,
    method: "PATCH",
    body: { isActive },
  });
  if (!data?.feature) throw new Error("Failed to update feature");
  return data.feature;
}

export async function fetchInternalTenants(): Promise<InternalTenantSummary[]> {
  const data = await fetchClient<{ tenants: InternalTenantSummary[] }>({
    endpoint: "/internal/tenants",
    silent: true,
  });
  return data?.tenants ?? [];
}

export async function updateInternalTenantStatus(
  tenantId: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<InternalTenantSummary> {
  const data = await fetchClient<{ tenant: InternalTenantSummary }>({
    endpoint: `/internal/tenants/${encodeURIComponent(tenantId)}/status`,
    method: "PATCH",
    body: { status },
  });
  if (!data?.tenant) throw new Error("Failed to update tenant status");
  return data.tenant;
}

export async function fetchInternalTenantFeatures(
  tenantId: string,
): Promise<InternalTenantFeaturesPayload> {
  const data = await fetchClient<InternalTenantFeaturesPayload>({
    endpoint: `/internal/tenants/${encodeURIComponent(tenantId)}/features`,
    silent: true,
  });
  if (!data?.tenant || !data.features) throw new Error("Failed to load tenant modules");
  return data;
}

export async function updateInternalTenantFeatures(
  tenantId: string,
  features: { name: string; isEnabled: boolean }[],
): Promise<InternalTenantFeaturesPayload> {
  const data = await fetchClient<InternalTenantFeaturesPayload>({
    endpoint: `/internal/tenants/${encodeURIComponent(tenantId)}/features`,
    method: "PATCH",
    body: { features },
  });
  if (!data?.tenant || !data.features) throw new Error("Failed to update tenant modules");
  return data;
}

export async function provisionInternalTenant(
  body: ProvisionTenantPayload,
): Promise<ProvisionTenantResult> {
  const data = await fetchClient<ProvisionTenantResult>({
    endpoint: "/internal/tenants",
    method: "POST",
    body,
  });
  if (!data) throw new Error("Provisioning failed");
  return data;
}
