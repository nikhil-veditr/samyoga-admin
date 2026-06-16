import { authClient } from "@/shared/lib/auth/auth-client";
import {
  PROFILE_PASSKEYS_SECTION_ID,
  PROFILE_PASSWORD_SECTION_ID,
  PROFILE_SECURITY_SECTION_ID,
  PROFILE_TWO_FACTOR_SECTION_ID,
} from "@/shared/lib/auth/admin-strong-auth-policy";

export const PROFILE_PASSKEYS_QUERY_KEY = ["profile", "passkeys"] as const;

export type PasskeyRow = {
  id: string;
  name?: string | null;
  deviceType?: string | null;
  transports?: string | null;
  createdAt?: string | Date | null;
};

export async function fetchUserPasskeys(): Promise<PasskeyRow[]> {
  const result = await authClient.passkey.listUserPasskeys();
  if (result.error) {
    throw new Error(result.error.message ?? "Could not load passkeys");
  }
  return (result.data ?? []) as PasskeyRow[];
}

export {
  PROFILE_PASSKEYS_SECTION_ID,
  PROFILE_SECURITY_SECTION_ID,
  PROFILE_TWO_FACTOR_SECTION_ID,
  PROFILE_PASSWORD_SECTION_ID,
};

export const PROFILE_SECURITY_SECTION_HASHES = [
  PROFILE_SECURITY_SECTION_ID,
  PROFILE_PASSKEYS_SECTION_ID,
  PROFILE_TWO_FACTOR_SECTION_ID,
  PROFILE_PASSWORD_SECTION_ID,
] as const;
