"use client";

import { useCallback } from "react";
import { queryClient } from "@/shared/lib/react-query/query-client";
import {
  internalCatalogFeaturesQueryKey,
  internalPlatformFeaturesQueryKey,
  internalTenantsQueryKey,
  internalUserFeedbackQueryKey,
} from "@/services/internal/internal.hooks";
import {
  fetchCatalogFeatures,
  fetchInternalTenants,
  fetchInternalUserFeedback,
  fetchPlatformFeatures,
} from "@/services/internal/internal.api";

const prefetchedNavKeys = new Set<string>();

const PREFETCH_ROUTES = new Set(["/", "/tenants", "/features", "/feedback"]);

export function shouldPrefetchNavRoute(href: string): boolean {
  return PREFETCH_ROUTES.has(href);
}

export function useNavPrefetch() {
  const prefetchNav = useCallback((href: string) => {
    if (!shouldPrefetchNavRoute(href)) return;
    if (prefetchedNavKeys.has(href)) return;
    prefetchedNavKeys.add(href);

    const staleTime = 60_000;

    if (href === "/" || href === "/tenants") {
      void queryClient.prefetchQuery({
        queryKey: internalTenantsQueryKey,
        queryFn: fetchInternalTenants,
        staleTime,
      });
      return;
    }

    if (href === "/features") {
      void queryClient.prefetchQuery({
        queryKey: internalPlatformFeaturesQueryKey,
        queryFn: fetchPlatformFeatures,
        staleTime,
      });
      void queryClient.prefetchQuery({
        queryKey: internalCatalogFeaturesQueryKey,
        queryFn: fetchCatalogFeatures,
        staleTime,
      });
      return;
    }

    if (href === "/feedback") {
      const filters = { page: 1, limit: 25, status: undefined as undefined };
      void queryClient.prefetchQuery({
        queryKey: internalUserFeedbackQueryKey(filters),
        queryFn: () => fetchInternalUserFeedback(filters),
        staleTime,
      });
    }
  }, []);

  return prefetchNav;
}
