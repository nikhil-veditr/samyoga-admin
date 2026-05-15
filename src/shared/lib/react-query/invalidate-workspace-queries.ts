import { queryClient } from "@/shared/lib/react-query/query-client";

/** Marks tenant-scoped caches stale and refetches active observers — call after changing active workspace. */
export function invalidateWorkspaceScopedQueries(): void {
  void queryClient.invalidateQueries({ queryKey: ["permissions"] });
  void queryClient.invalidateQueries({ queryKey: ["me", "dashboard-summary"] });
  void queryClient.invalidateQueries({ queryKey: ["roles"] });
}
