/**
 * Origin of the Express API (Better Auth + REST), used only from the Next.js server
 * (route handlers, proxy, `get-session` helper).
 *
 * **Never** point this at the Next.js site URL — the auth proxy would call itself and `get-session`
 * requests fail with network errors in the browser.
 *
 * Env resolution order:
 * - `INTERNAL_API_URL` (preferred)
 * - `BACKEND_INTERNAL_URL`
 * - `BACKEND_URL`
 * - default `http://127.0.0.1:3000` (Samyoga BE default `PORT`)
 *
 * Browser REST (`fetch-client`): **`NEXT_PUBLIC_API_DOMAIN`** (Express public URL, e.g. `https://api.samyoga.in`)
 * + **`NEXT_PUBLIC_API_VERSION`** when the SPA calls the API **directly** (not proxied). Requires BE
 * **`BETTER_AUTH_COOKIE_DOMAIN`** + explicit **`CORS_ORIGIN`** for credentialed cookies. Auth stays on
 * same-origin **`…/api/v1/auth/*`** (Next route handler → this URL).
 *
 * **Vercel / serverless:** set one of these to your **public** API origin (HTTPS URL reachable from the internet).
 * The default `127.0.0.1` only works on your laptop — without an env override, session checks return “logged out” (never crash the proxy).
 */
export function getInternalApiUrl(): string {
  const raw =
    process.env.INTERNAL_API_URL ??
    process.env.BACKEND_INTERNAL_URL ??
    process.env.BACKEND_URL ??
    "";
  const trimmed = raw.replace(/\/+$/, "");
  if (trimmed.length > 0) return trimmed;
  return "http://127.0.0.1:3000";
}

/** Browser-accessible origin for the Next app (session cookies are set on this host). */
export function getPublicSiteUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3003";
}

/**
 * Absolute Better Auth base URL for `createAuthClient`.
 * Must end with a trailing `/` so `@better-fetch/fetch` resolves relative paths like `sign-in/email`
 * against `/api/v1/auth/` (see WHATWG URL resolution — without `/`, `auth` is dropped).
 */
export function getBetterAuthBrowserBaseUrl(): string {
  const origin = getPublicSiteUrl().replace(/\/+$/, "");
  return `${origin}/api/v1/auth/`;
}

/** Detect misconfiguration where the server tries to proxy Better Auth to itself. */
export function isInternalApiSameOriginAsNext(requestOrigin: string, internalBaseUrl: string): boolean {
  try {
    const a = new URL(requestOrigin);
    const b = new URL(internalBaseUrl.startsWith("http") ? internalBaseUrl : `http://${internalBaseUrl}`);
    const portA = a.port || (a.protocol === "https:" ? "443" : "80");
    const portB = b.port || (b.protocol === "https:" ? "443" : "80");
    const hostA = a.hostname.toLowerCase();
    const hostB = b.hostname.toLowerCase();
    const sameLoopback =
      (hostA === "localhost" || hostA === "127.0.0.1") && (hostB === "localhost" || hostB === "127.0.0.1");
    if (sameLoopback && portA === portB) {
      return true;
    }
    return hostA === hostB && portA === portB;
  } catch {
    return false;
  }
}
