import type { NextRequest } from "next/server";
import { getInternalApiUrl } from "@/shared/lib/auth/internal-api-url";
import { unwrapSamyogaEnvelopeJson } from "@/shared/lib/auth/envelope-fetch";

export type BetterAuthSessionPayload = {
  session: Record<string, unknown> | null;
  user?: Record<string, unknown> | null;
};

export async function getBetterAuthSession(request: NextRequest): Promise<BetterAuthSessionPayload | null> {
  const cookie = request.headers.get("cookie") ?? "";
  const url = `${getInternalApiUrl()}/api/v1/internal-auth/get-session`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { cookie, "accept-encoding": "identity" },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    /** Network/DNS errors (e.g. missing `INTERNAL_API_URL` on Vercel → default localhost) must not crash `proxy`. */
    return null;
  }

  if (!res.ok) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = await res.json();
  } catch {
    return null;
  }

  const body = unwrapSamyogaEnvelopeJson(parsed);
  if (!body || typeof body !== "object") {
    return null;
  }

  const record = body as Record<string, unknown>;
  const session = record.session;
  if (!session || typeof session !== "object") {
    return null;
  }

  return {
    session: session as Record<string, unknown>,
    user: record.user && typeof record.user === "object" ? (record.user as Record<string, unknown>) : null,
  };
}
