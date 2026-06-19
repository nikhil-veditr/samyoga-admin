export type InternalTenantSummary = {
  id: string;
  name: string;
  slug: string;
  status: string;
  region: "IN" | "AU";
  subscriptionTier: string;
  tierSlug: string | null;
  subscriptionStatus: string | null;
  trialEndsAt: string | null;
  isLifetimeFree: boolean;
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
  region?: "IN" | "AU";
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

export type UserFeedbackCategory =
  | "GENERAL"
  | "BUG"
  | "LAB_REPORT"
  | "PRINT"
  | "PATIENTS"
  | "APPOINTMENTS"
  | "CLINICAL_DOCUMENTS"
  | "OTHER";

export type UserFeedbackSeverity = "BLOCKER" | "ANNOYANCE" | "NICE_TO_HAVE";

export type UserFeedbackStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "FIXED"
  | "WONT_FIX"
  | "CLOSED";

export type InternalUserFeedbackItem = {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  reporterUserId: string;
  reporterEmail: string;
  reporterName: string | null;
  category: UserFeedbackCategory;
  severity: UserFeedbackSeverity;
  status: UserFeedbackStatus;
  summary: string;
  details: string | null;
  context: Record<string, unknown> | null;
  adminNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InternalUserFeedbackListPayload = {
  items: InternalUserFeedbackItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
