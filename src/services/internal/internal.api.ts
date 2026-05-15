import { fetchClient } from "@/shared/lib/fetch/fetch-client";
import type {
  CatalogFeature,
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
