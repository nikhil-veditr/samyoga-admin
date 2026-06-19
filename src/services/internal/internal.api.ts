import { fetchClient } from "@/shared/lib/fetch/fetch-client";
import type {
  CatalogFeature,
  InternalTenantFeaturesPayload,
  InternalTenantSettingsPayload,
  InternalTenantSummary,
  InternalUserFeedbackItem,
  InternalUserFeedbackListPayload,
  PlatformFeature,
  ProvisionTenantPayload,
  ProvisionTenantResult,
  TenantAccessPolicy,
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

export async function fetchInternalTenantSettings(
  tenantId: string,
): Promise<InternalTenantSettingsPayload> {
  const data = await fetchClient<InternalTenantSettingsPayload>({
    endpoint: `/internal/tenants/${encodeURIComponent(tenantId)}/settings`,
    silent: true,
  });
  if (!data?.settings) throw new Error("Failed to load tenant policy");
  return data;
}

export async function updateInternalTenantSettings(
  tenantId: string,
  body: Partial<TenantAccessPolicy>,
): Promise<InternalTenantSettingsPayload> {
  const data = await fetchClient<InternalTenantSettingsPayload>({
    endpoint: `/internal/tenants/${encodeURIComponent(tenantId)}/settings`,
    method: "PATCH",
    body,
  });
  if (!data?.settings) throw new Error("Failed to update tenant policy");
  return data;
}

export async function updateInternalTenantLifetimeFree(
  tenantId: string,
  body: { enabled: boolean; tierSlug?: string },
): Promise<{ enabled: boolean }> {
  const data = await fetchClient<{ enabled: boolean }>({
    endpoint: `/internal/tenants/${encodeURIComponent(tenantId)}/lifetime-free`,
    method: "PATCH",
    body,
  });
  if (!data) throw new Error("Failed to update lifetime complimentary access");
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

export async function fetchInternalUserFeedback(params?: {
  status?: string;
  tenantId?: string;
  page?: number;
}): Promise<InternalUserFeedbackListPayload> {
  const query: Record<string, string> = {};
  if (params?.status) query.status = params.status;
  if (params?.tenantId) query.tenantId = params.tenantId;
  if (params?.page) query.page = String(params.page);

  const data = await fetchClient<InternalUserFeedbackListPayload>({
    endpoint: "/internal/feedback",
    query: Object.keys(query).length > 0 ? query : undefined,
    silent: true,
  });
  return (
    data ?? {
      items: [],
      pagination: { page: 1, limit: 25, total: 0, totalPages: 1 },
    }
  );
}

export async function updateInternalUserFeedback(
  id: string,
  body: { status?: string; adminNotes?: string | null },
): Promise<InternalUserFeedbackItem> {
  const data = await fetchClient<InternalUserFeedbackItem>({
    endpoint: `/internal/feedback/${encodeURIComponent(id)}`,
    method: "PATCH",
    body,
  });
  if (!data) throw new Error("Failed to update feedback");
  return data;
}
