import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/admin/:path*"],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow login page and public assets
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }

  // 2. Check for the admin session cookie
  const sessionToken = req.cookies.get("isy_admin_session")?.value;

  if (!sessionToken || sessionToken.trim() === "") {
    // Immediate server-side redirect to login with unauthorized notice
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("notice", "unauthorized");
    return NextResponse.redirect(loginUrl);
  }

  // 3. User has session token -> allow through with strict security headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}
