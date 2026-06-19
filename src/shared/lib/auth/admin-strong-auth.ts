"use client";

import { authClient } from "@/shared/lib/auth/auth-client";
import { betterAuthEnvelopeFetch, unwrapSamyogaEnvelopeJson } from "@/shared/lib/auth/envelope-fetch";
import { getBetterAuthBrowserBaseUrl } from "@/shared/lib/auth/internal-api-url";
import type { AdminStrongAuthStatus } from "@/shared/lib/auth/admin-strong-auth-policy";

export type { AdminStrongAuthStatus } from "@/shared/lib/auth/admin-strong-auth-policy";
export {
  adminSecuritySetupPath,
  meetsAdminStrongAuth,
  PROFILE_PASSKEYS_SECTION_ID,
  PROFILE_PASSWORD_SECTION_ID,
  PROFILE_SECURITY_SECTION_ID,
  PROFILE_TWO_FACTOR_SECTION_ID,
} from "@/shared/lib/auth/admin-strong-auth-policy";

type SessionUserWithMfa = {
  twoFactorEnabled?: boolean;
};

async function readTwoFactorEnabledFromFreshSession(): Promise<boolean> {
  try {
    const res = await betterAuthEnvelopeFetch(`${getBetterAuthBrowserBaseUrl()}get-session`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return false;

    const parsed: unknown = await res.json();
    const body = unwrapSamyogaEnvelopeJson(parsed);
    if (!body || typeof body !== "object" || !("user" in body)) return false;

    const user = (body as { user?: SessionUserWithMfa }).user;
    return user?.twoFactorEnabled === true;
  } catch {
    return false;
  }
}

async function readPasskeyCount(): Promise<number> {
  try {
    const result = await authClient.passkey.listUserPasskeys();
    if (!result.error && Array.isArray(result.data)) {
      return result.data.length;
    }
  } catch {
    /* fall through */
  }
  return 0;
}

/** Fresh session + passkey list — avoids stale React Query session trapping users on profile. */
export async function fetchAdminStrongAuthStatus(): Promise<AdminStrongAuthStatus> {
  const [twoFactorEnabled, passkeyCount] = await Promise.all([
    readTwoFactorEnabledFromFreshSession(),
    readPasskeyCount(),
  ]);

  return { twoFactorEnabled, passkeyCount };
}
