"use client";

import { authClient } from "@/shared/lib/auth/auth-client";
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

export async function fetchAdminStrongAuthStatus(): Promise<AdminStrongAuthStatus> {
  const session = await authClient.getSession();
  const user = session.data?.user as { twoFactorEnabled?: boolean } | undefined;
  const twoFactorEnabled = user?.twoFactorEnabled === true;

  let passkeyCount = 0;
  if (!twoFactorEnabled) {
    try {
      const result = await authClient.passkey.listUserPasskeys();
      if (!result.error && Array.isArray(result.data)) {
        passkeyCount = result.data.length;
      }
    } catch {
      passkeyCount = 0;
    }
  }

  return { twoFactorEnabled, passkeyCount };
}
