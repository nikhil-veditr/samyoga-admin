"use client";

import { authClient } from "@/shared/lib/auth/auth-client";
import { useAppQuery } from "@/shared/lib/react-query/hooks";
import { fetchMyProfile } from "./me.api";

export const myProfileQueryKey = ["me", "profile"] as const;

export function useMyProfileQuery() {
  const { data: sessionData, isPending: sessionPending } = authClient.useSession();
  const enabled = Boolean(!sessionPending && sessionData?.user);

  return useAppQuery({
    queryKey: myProfileQueryKey,
    queryFn: fetchMyProfile,
    enabled,
    staleTime: 30_000,
  });
}
