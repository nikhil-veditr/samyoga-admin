"use client";

import { toast } from "sonner";
import { authClient } from "@/shared/lib/auth/auth-client";
import { useAppMutation, useAppQuery } from "@/shared/lib/react-query/hooks";
import { queryClient } from "@/shared/lib/react-query/query-client";
import {
  fetchCatalogFeatures,
  fetchInternalTenantFeatures,
  fetchInternalTenantSettings,
  fetchInternalTenants,
  fetchInternalUserFeedback,
  fetchPlatformFeatures,
  provisionInternalTenant,
  updateInternalTenantFeatures,
  updateInternalTenantSettings,
  updateInternalTenantStatus,
  updateInternalUserFeedback,
  updatePlatformFeature,
} from "./internal.api";
import type { ProvisionTenantPayload, TenantAccessPolicy, UserFeedbackStatus } from "./internal.types";
export const internalCatalogFeaturesQueryKey = ["internal", "features", "catalog"] as const;
export const internalPlatformFeaturesQueryKey = ["internal", "features", "platform"] as const;
export const internalTenantsQueryKey = ["internal", "tenants"] as const;
export const internalTenantFeaturesQueryKey = (tenantId: string) =>
  ["internal", "tenants", tenantId, "features"] as const;
export const internalTenantSettingsQueryKey = (tenantId: string) =>
  ["internal", "tenants", tenantId, "settings"] as const;

export function useCatalogFeaturesQuery() {
  const { data: sessionData, isPending: sessionPending } = authClient.useSession();
  const enabled = Boolean(!sessionPending && sessionData?.user);

  return useAppQuery({
    queryKey: internalCatalogFeaturesQueryKey,
    queryFn: fetchCatalogFeatures,
    enabled,
    staleTime: 300_000,
  });
}

export function usePlatformFeaturesQuery() {
  const { data: sessionData, isPending: sessionPending } = authClient.useSession();
  const enabled = Boolean(!sessionPending && sessionData?.user);

  return useAppQuery({
    queryKey: internalPlatformFeaturesQueryKey,
    queryFn: fetchPlatformFeatures,
    enabled,
    staleTime: 30_000,
  });
}

export function useUpdatePlatformFeatureMutation() {
  return useAppMutation({
    mutationKey: ["internal", "features", "update"],
    mutationFn: ({ featureName, isActive }: { featureName: string; isActive: boolean }) =>
      updatePlatformFeature(featureName, isActive),
    onSuccess: async (_data, { isActive }) => {
      await queryClient.invalidateQueries({ queryKey: internalPlatformFeaturesQueryKey });
      await queryClient.invalidateQueries({ queryKey: internalCatalogFeaturesQueryKey });
      toast.success(isActive ? "Feature enabled platform-wide" : "Feature disabled platform-wide");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useInternalTenantsQuery() {
  const { data: sessionData, isPending: sessionPending } = authClient.useSession();
  const enabled = Boolean(!sessionPending && sessionData?.user);

  return useAppQuery({
    queryKey: internalTenantsQueryKey,
    queryFn: fetchInternalTenants,
    enabled,
    staleTime: 60_000,
  });
}

export function useInternalTenantFeaturesQuery(tenantId: string | null, dialogOpen: boolean) {
  const { data: sessionData, isPending: sessionPending } = authClient.useSession();
  const enabled = Boolean(!sessionPending && sessionData?.user && tenantId && dialogOpen);

  return useAppQuery({
    queryKey: internalTenantFeaturesQueryKey(tenantId ?? "none"),
    queryFn: () => fetchInternalTenantFeatures(tenantId!),
    enabled,
  });
}

export function useUpdateInternalTenantFeaturesMutation() {
  return useAppMutation({
    mutationKey: ["internal", "tenants", "features", "update"],
    mutationFn: ({
      tenantId,
      features,
    }: {
      tenantId: string;
      features: { name: string; isEnabled: boolean }[];
    }) => updateInternalTenantFeatures(tenantId, features),
    onSuccess: async (_data, { tenantId }) => {
      await queryClient.invalidateQueries({ queryKey: internalTenantFeaturesQueryKey(tenantId) });
      await queryClient.invalidateQueries({ queryKey: internalPlatformFeaturesQueryKey });
      toast.success("Tenant modules updated");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useUpdateTenantStatusMutation() {
  return useAppMutation({
    mutationKey: ["internal", "tenants", "status"],
    mutationFn: ({ tenantId, status }: { tenantId: string; status: "ACTIVE" | "INACTIVE" }) =>
      updateInternalTenantStatus(tenantId, status),
    onSuccess: async (_data, { status }) => {
      await queryClient.invalidateQueries({ queryKey: internalTenantsQueryKey });
      toast.success(status === "ACTIVE" ? "Tenant reactivated" : "Tenant deactivated");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useInternalTenantSettingsQuery(tenantId: string | null, dialogOpen: boolean) {
  const { data: sessionData, isPending: sessionPending } = authClient.useSession();
  const enabled = Boolean(!sessionPending && sessionData?.user && tenantId && dialogOpen);

  return useAppQuery({
    queryKey: internalTenantSettingsQueryKey(tenantId ?? ""),
    queryFn: () => fetchInternalTenantSettings(tenantId!),
    enabled,
    staleTime: 30_000,
  });
}

export function useUpdateInternalTenantSettingsMutation() {
  return useAppMutation({
    mutationKey: ["internal", "tenants", "settings"],
    mutationFn: ({
      tenantId,
      body,
    }: {
      tenantId: string;
      body: Partial<TenantAccessPolicy>;
    }) => updateInternalTenantSettings(tenantId, body),
    onSuccess: async (_data, { tenantId }) => {
      await queryClient.invalidateQueries({ queryKey: internalTenantSettingsQueryKey(tenantId) });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useProvisionTenantMutation() {
  return useAppMutation({
    mutationKey: ["internal", "tenants", "provision"],
    mutationFn: (body: ProvisionTenantPayload) => provisionInternalTenant(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: internalTenantsQueryKey });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export const internalUserFeedbackQueryKey = (filters: {
  status?: UserFeedbackStatus;
  page: number;
}) => ["internal", "feedback", filters] as const;

export function useInternalUserFeedbackQuery(filters: {
  status?: UserFeedbackStatus;
  page: number;
}) {
  const { data: sessionData, isPending: sessionPending } = authClient.useSession();
  const enabled = Boolean(!sessionPending && sessionData?.user);

  return useAppQuery({
    queryKey: internalUserFeedbackQueryKey(filters),
    queryFn: () =>
      fetchInternalUserFeedback({
        status: filters.status,
        page: filters.page,
      }),
    enabled,
    staleTime: 30_000,
  });
}

export function useUpdateInternalUserFeedbackMutation() {
  return useAppMutation({
    mutationKey: ["internal", "feedback", "update"],
    mutationFn: ({
      id,
      status,
      adminNotes,
    }: {
      id: string;
      status?: UserFeedbackStatus;
      adminNotes?: string | null;
    }) => updateInternalUserFeedback(id, { status, adminNotes }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["internal", "feedback"] });
      toast.success("Feedback updated");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
