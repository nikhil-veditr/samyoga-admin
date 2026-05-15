import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { TENANT_ID_HEADER } from "@/shared/constants/http-headers";

/** Hop-by-hop / unsafe when body bytes were re-buffered after upstream fetch. */
const SKIP_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
]);

/** Headers to forward from the browser → Express (session cookie, tenant, CSRF-related hints). */
export function forwardExpressProxyRequestHeaders(req: NextRequest): Headers {
  const headers = new Headers();
  headers.set("accept-encoding", "identity");

  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const ct = req.headers.get("content-type");
  if (ct) headers.set("content-type", ct);

  const origin = req.headers.get("origin");
  if (origin) headers.set("origin", origin);

  const referer = req.headers.get("referer");
  if (referer) headers.set("referer", referer);

  const ua = req.headers.get("user-agent");
  if (ua) headers.set("user-agent", ua);

  const tenant = req.headers.get(TENANT_ID_HEADER);
  if (tenant) headers.set(TENANT_ID_HEADER, tenant);

  const host = req.headers.get("host");
  if (host) {
    headers.set("x-forwarded-host", host);
    headers.set("x-forwarded-proto", req.nextUrl.protocol.replace(":", ""));
  }

  return headers;
}

function applyUpstreamSetCookies(upstream: Response, target: Response): void {
  const list = upstream.headers.getSetCookie?.();
  if (list?.length) {
    for (const c of list) {
      target.headers.append("Set-Cookie", c);
    }
    return;
  }
  const single = upstream.headers.get("set-cookie");
  if (single) {
    target.headers.append("Set-Cookie", single);
  }
}

/**
 * Proxy from Next (`App Router` route handler) to Express. Forwards **Cookie** (Better Auth session)
 * and **`x-tenant-id`** — unlike `next.config` `rewrites` → external URLs, which often omit cookies.
 */
export async function fetchExpressProxiedResponse(req: NextRequest, targetUrl: string): Promise<Response> {
  const method = req.method;
  const body =
    method === "GET" || method === "HEAD" || method === "OPTIONS" ? undefined : await req.arrayBuffer();

  const upstream = await fetch(targetUrl, {
    method,
    headers: forwardExpressProxyRequestHeaders(req),
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const payload = await upstream.arrayBuffer();

  const outHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "set-cookie" || SKIP_RESPONSE_HEADERS.has(lower)) return;
    outHeaders.append(key, value);
  });
  outHeaders.set("content-length", String(payload.byteLength));

  const res = new NextResponse(payload, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: outHeaders,
  });
  applyUpstreamSetCookies(upstream, res);
  return res;
}
