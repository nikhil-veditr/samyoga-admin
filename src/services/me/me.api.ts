import { fetchClient } from "@/shared/lib/fetch/fetch-client";
import type { AdminUserProfile } from "./me.types";

/** Current user profile — used to confirm `superAdmin` when session payload is incomplete. */
export async function fetchMyProfile(): Promise<AdminUserProfile> {
  const data = await fetchClient<{ user: AdminUserProfile }>({
    endpoint: "/me/profile",
    silent: true,
  });
  if (!data?.user) throw new Error("Profile not found");
  return data.user;
}
