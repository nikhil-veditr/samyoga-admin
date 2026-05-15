import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchExpressProxiedResponse } from "@/server/api/proxy-to-internal-api";
import { getInternalApiUrl, isInternalApiSameOriginAsNext } from "@/shared/lib/auth/internal-api-url";

/**
 * Proxies `/api/v1/*` (except `/api/v1/auth/*`, which has its own route) to Express so cookies and
 * `x-tenant-id` reach the API. Without this, same-origin calls like `/api/v1/users/...` hit Next
 * and return **404** (no page/route).
 */
async function proxyExpressV1(req: NextRequest, segments: string[] | undefined): Promise<Response> {
  const base = getInternalApiUrl();
  if (isInternalApiSameOriginAsNext(req.nextUrl.origin, base)) {
    return NextResponse.json(
      {
        message:
          "API proxy misconfiguration: INTERNAL_API_URL / BACKEND_INTERNAL_URL / BACKEND_URL points at this Next.js origin. Set it to your Express API host (e.g. http://127.0.0.1:3000 when Next runs on another port).",
      },
      { status: 502 },
    );
  }

  const joined = (segments ?? []).join("/");
  const suffix = joined.length > 0 ? `/${joined}` : "";
  const targetUrl = `${base}/api/v1${suffix}${req.nextUrl.search}`;
  return fetchExpressProxiedResponse(req, targetUrl);
}

type Ctx = { params: Promise<{ path?: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxyExpressV1(req, path);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxyExpressV1(req, path);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxyExpressV1(req, path);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxyExpressV1(req, path);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxyExpressV1(req, path);
}
