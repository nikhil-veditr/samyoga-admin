/** Catalog feature names — keep in sync with Prisma `FeatureName` in samyoga-be. */
export const FEATURE_NAMES = [
  "LAB_MANAGEMENT",
  "PATIENT_RECORDS",
  "APPOINTMENT_SCHEDULING",
  "BILLING_AND_INVOICING",
  "ROLE_MANAGEMENT",
  "USER_MANAGEMENT",
  "TENANT_MANAGEMENT",
  "CLINICAL_DOCUMENTS",
  "ADMISSIONS",
  "AUDIT_AND_COMPLIANCE",
] as const;

export type CatalogFeatureName = (typeof FEATURE_NAMES)[number];

export const FEATURE_LABELS: Record<CatalogFeatureName, string> = {
  LAB_MANAGEMENT: "Lab management",
  PATIENT_RECORDS: "Patient records",
  APPOINTMENT_SCHEDULING: "Appointments",
  BILLING_AND_INVOICING: "Billing & invoicing",
  ROLE_MANAGEMENT: "Role management",
  USER_MANAGEMENT: "User management",
  TENANT_MANAGEMENT: "Workspace settings",
  CLINICAL_DOCUMENTS: "Clinical documents",
  ADMISSIONS: "Admissions",
  AUDIT_AND_COMPLIANCE: "Audit & compliance",
};

/** Sensible defaults when provisioning a new hospital workspace. */
export const DEFAULT_PROVISION_FEATURES: CatalogFeatureName[] = [
  "USER_MANAGEMENT",
  "TENANT_MANAGEMENT",
  "ROLE_MANAGEMENT",
  "LAB_MANAGEMENT",
  "PATIENT_RECORDS",
];
