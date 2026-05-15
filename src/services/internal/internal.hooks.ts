"use client";

import { toast } from "sonner";
import { authClient } from "@/shared/lib/auth/auth-client";
import { useAppMutation, useAppQuery } from "@/shared/lib/react-query/hooks";
import { queryClient } from "@/shared/lib/react-query/query-client";
import {
  fetchCatalogFeatures,
  fetchInternalTenants,
  fetchPlatformFeatures,
  provisionInternalTenant,
  updateInternalTenantStatus,
  updatePlatformFeature,
} from "./internal.api";
import type { ProvisionTenantPayload } from "./internal.types";

export const internalCatalogFeaturesQueryKey = ["internal", "features", "catalog"] as const;
export const internalPlatformFeaturesQueryKey = ["internal", "features", "platform"] as const;
export const internalTenantsQueryKey = ["internal", "tenants"] as const;

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
