import type { NextRequest } from "next/server";
import { unwrapSamyogaEnvelopeJson } from "@/shared/lib/auth/envelope-fetch";
import { getInternalApiUrl } from "@/shared/lib/auth/internal-api-url";
import { isSuperAdminUser } from "@/shared/lib/auth/session-user";
import { getBetterAuthSession } from "./get-session";

type SessionUserWithMfa = {
  twoFactorEnabled?: boolean;
};

async function fetchPasskeyCount(request: NextRequest): Promise<number> {
  const cookie = request.headers.get("cookie") ?? "";
  const url = `${getInternalApiUrl()}/api/v1/internal-auth/passkey/list-user-passkeys`;

  try {
    const res = await fetch(url, {
      headers: { cookie, accept: "application/json", "accept-encoding": "identity" },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return 0;

    const parsed: unknown = await res.json();
    const body = unwrapSamyogaEnvelopeJson(parsed);
    return Array.isArray(body) ? body.length : 0;
  } catch {
    return 0;
  }
}

export async function getAdminStrongAuthCompliance(request: NextRequest): Promise<{
  hasSession: boolean;
  superAdmin: boolean;
  compliant: boolean;
}> {
  const session = await getBetterAuthSession(request);
  const user = session?.user;
  const hasSession = Boolean(user);
  const superAdmin = isSuperAdminUser(user);

  if (!hasSession || !superAdmin) {
    return { hasSession, superAdmin, compliant: true };
  }

  const twoFactorEnabled =
    user && typeof user === "object" && (user as SessionUserWithMfa).twoFactorEnabled === true;

  const passkeyCount = await fetchPasskeyCount(request);
  if (twoFactorEnabled || passkeyCount > 0) {
    return { hasSession, superAdmin, compliant: true };
  }

  return { hasSession, superAdmin, compliant: false };
}
