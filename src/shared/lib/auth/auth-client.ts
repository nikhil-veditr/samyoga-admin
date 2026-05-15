"use client";

import { createAuthClient } from "better-auth/react";
import { betterAuthEnvelopeFetch } from "@/shared/lib/auth/envelope-fetch";
import { getBetterAuthBrowserBaseUrl } from "@/shared/lib/auth/internal-api-url";

/**
 * Same-origin Better Auth via Next `/api/v1/auth/*` proxy.
 * Single `baseURL` including trailing slash — do not pass separate `basePath` here; combined
 * origin + `/api/v1/auth` without `/` breaks relative route resolution in `@better-fetch/fetch`.
 */
export const authClient = createAuthClient({
  baseURL: getBetterAuthBrowserBaseUrl(),
  fetchOptions: {
    customFetchImpl: betterAuthEnvelopeFetch,
  },
});
