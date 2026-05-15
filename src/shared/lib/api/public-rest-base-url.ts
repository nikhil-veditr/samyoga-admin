function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

function stripEdgeSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, "");
}

/**
 * REST API base for browser `fetchClient` calls: **`domain` + `/` + `api version`** (no trailing slash).
 *
 * - **Browser:** If `NEXT_PUBLIC_API_DOMAIN` / `NEXT_PUBLIC_API_BASE_URL` are set → **direct** calls to
 *   Express (e.g. `https://api.samyoga.in/api/v1/...`). Session cookies must use a shared parent
 *   **`Domain`** on the API (`BETTER_AUTH_COOKIE_DOMAIN` on BE, e.g. `*.samyoga.in` → `.samyoga.in`).
 * - If unset → **`window.location.origin`** (same-origin proxy or local Next-only API).
 * - **Server / build:** Falls back to `http://localhost:3003` when no env domain is set (SSR/tests).
 * - **Version:** `NEXT_PUBLIC_API_VERSION` (default `api/v1`).
 */
export function getPublicRestApiBaseUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_API_DOMAIN?.trim() || process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "";

  const version = stripEdgeSlashes(process.env.NEXT_PUBLIC_API_VERSION?.trim() || "api/v1");

  if (typeof window !== "undefined") {
    const domain =
      explicit.length > 0 ? stripTrailingSlashes(explicit) : window.location.origin;
    return `${domain}/${version}`;
  }

  const domain =
    explicit.length > 0 ? stripTrailingSlashes(explicit) : "http://localhost:3003";
  return `${domain}/${version}`;
}
