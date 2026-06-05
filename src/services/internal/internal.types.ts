export type InternalTenantSummary = {
  id: string;
  name: string;
  slug: string;
  status: string;
  region: "IN" | "AU";
};

export type InternalTenantFeature = CatalogFeature & {
  isPlatformActive: boolean;
  isEnabled: boolean;
};

export type InternalTenantFeaturesPayload = {
  tenant: InternalTenantSummary;
  features: InternalTenantFeature[];
};

export type CatalogFeature = {
  name: string;
  description: string | null;
  version: string;
};

export type PlatformFeature = CatalogFeature & {
  isActive: boolean;
  enabledTenantCount: number;
};

export type ProvisionTenantPayload = {
  tenantName: string;
  tenantSlug?: string;
  address?: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
  featureNames: string[];
};

export type ProvisionTenantResult = {
  tenant: InternalTenantSummary;
  adminUserId: string;
  adminEmail: string;
};

export type TenantAccessPolicy = {
  enforcePhiMinimumNecessary: boolean;
  defaultSessionTtlMinutes: number | null;
  allowedIpCidrs: string | null;
  requireTwoFactor: boolean;
  requireTwoFactorEnforceAt: string | null;
};

export type InternalTenantSettingsPayload = {
  settings: TenantAccessPolicy;
};
