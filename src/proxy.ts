import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getBetterAuthSession } from "@/server/auth/get-session";
import { isSuperAdminUser } from "@/shared/lib/auth/session-user";

const PUBLIC_PATHS = ["/signin", "/forbidden"];

const isPublicPath = (pathname: string): boolean => {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
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

  if (!session && !isPublicPath(pathname)) {
    const signIn = new URL("/signin", request.url);
    signIn.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(signIn);
  }

  if (session && !superAdmin && pathname !== "/forbidden") {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  if (session && superAdmin && isPublicPath(pathname) && pathname !== "/forbidden") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
