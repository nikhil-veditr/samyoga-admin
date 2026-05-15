import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchExpressProxiedResponse } from "@/server/api/proxy-to-internal-api";
import { getInternalApiUrl, isInternalApiSameOriginAsNext } from "@/shared/lib/auth/internal-api-url";

async function proxyAuth(req: NextRequest, pathSegments: string[]): Promise<Response> {
  const joined = pathSegments.join("/");
  const base = getInternalApiUrl();

  if (isInternalApiSameOriginAsNext(req.nextUrl.origin, base)) {
    return NextResponse.json(
      {
        message:
          "Auth proxy misconfiguration: INTERNAL_API_URL / BACKEND_INTERNAL_URL / BACKEND_URL points at this Next.js origin. Set it to your Express API only (e.g. http://127.0.0.1:3000 when Next runs on port 3002). Do not reuse NEXT_PUBLIC_SITE_URL here.",
      },
      { status: 502 },
    );
  }

  /** Isolated Better Auth instance + `samyoga-admin.*` cookies (not shared with HMS). */
  const targetUrl = `${base}/api/v1/internal-auth/${joined}${req.nextUrl.search}`;
  return fetchExpressProxiedResponse(req, targetUrl);
}

type Ctx = { params: Promise<{ path?: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxyAuth(req, path ?? []);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxyAuth(req, path ?? []);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxyAuth(req, path ?? []);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxyAuth(req, path ?? []);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxyAuth(req, path ?? []);
}
