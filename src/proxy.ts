import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminStrongAuthCompliance } from "@/server/auth/admin-strong-auth";
import { adminSecuritySetupPath } from "@/shared/lib/auth/admin-strong-auth-policy";
import { isSuperAdminUser } from "@/shared/lib/auth/session-user";
import { getBetterAuthSession } from "@/server/auth/get-session";

const PUBLIC_PATHS = ["/signin", "/forbidden", "/two-factor"];
const SECURITY_SETUP_PATHS = ["/profile", "/two-factor"];

const isPublicPath = (pathname: string): boolean => {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
};

const isSecuritySetupPath = (pathname: string): boolean => {
  return SECURITY_SETUP_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  let session: Awaited<ReturnType<typeof getBetterAuthSession>> = null;
  try {
    session = await getBetterAuthSession(request);
  } catch {
    session = null;
  }

  const user = session?.user;
  const superAdmin = isSuperAdminUser(user);

  if (!session && !isPublicPath(pathname) && !isSecuritySetupPath(pathname)) {
    const signIn = new URL("/signin", request.url);
    signIn.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(signIn);
  }

  if (session && !superAdmin && pathname !== "/forbidden") {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  if (session && superAdmin) {
    const { compliant } = await getAdminStrongAuthCompliance(request);
    const onSecuritySetupPage = isSecuritySetupPath(pathname);

    if (!compliant && !onSecuritySetupPage) {
      const next = pathname + request.nextUrl.search;
      const setupPath = adminSecuritySetupPath(next === "/" ? null : next);
      const url = new URL(setupPath.split("#")[0] ?? "/profile", request.url);
      const hash = setupPath.includes("#") ? setupPath.split("#")[1] : undefined;
      if (hash) url.hash = hash;
      return NextResponse.redirect(url);
    }

    if (compliant && isPublicPath(pathname) && pathname !== "/forbidden") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
