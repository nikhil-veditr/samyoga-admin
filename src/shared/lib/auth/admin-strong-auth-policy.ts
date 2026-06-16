export const PROFILE_SECURITY_SECTION_ID = "profile-security";
export const PROFILE_PASSKEYS_SECTION_ID = "profile-passkeys";
export const PROFILE_TWO_FACTOR_SECTION_ID = "profile-two-factor";
export const PROFILE_PASSWORD_SECTION_ID = "profile-password";

export type AdminStrongAuthStatus = {
  twoFactorEnabled: boolean;
  passkeyCount: number;
};

export function meetsAdminStrongAuth(status: AdminStrongAuthStatus): boolean {
  return status.twoFactorEnabled || status.passkeyCount > 0;
}

/** Profile route for first-time MFA / passkey setup (optional `next` after login). */
export function adminSecuritySetupPath(next?: string | null): string {
  if (next && next !== "/" && !next.startsWith("/signin") && !next.startsWith("/profile")) {
    return `/profile?setup=security&next=${encodeURIComponent(next)}#${PROFILE_SECURITY_SECTION_ID}`;
  }
  return `/profile?setup=security#${PROFILE_SECURITY_SECTION_ID}`;
}
