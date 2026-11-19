import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes (handled directly)
     * 2. /_next (Next.js internals, static files, image optimizer)
     * 3. Static files: favicon.ico, robots.txt, sitemap.xml, or files with extensions
     */
    "/((?!api/|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.[\\w]+$).*)",
    "/admin/:path*",
  ],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Determine hostname (normalized without port)
  const hostHeader =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    req.nextUrl.host ||
    "";
  const hostname = hostHeader.split(":")[0].toLowerCase();

  const isPromoSubdomain =
    hostname === "promo.optikiseeyou.com" ||
    hostname.startsWith("promo.") ||
    hostname === "promo.localhost";

  // 2. Handle Promo Subdomain
  if (isPromoSubdomain) {
    // A. Disallow admin on promo subdomain; safely redirect to main domain
    if (pathname.startsWith("/admin")) {
      const mainDomain =
        hostname === "promo.optikiseeyou.com"
          ? "https://optikiseeyou.com"
          : `http://${hostname.replace(/^promo\./, "") || "localhost"}:3000`;
      return NextResponse.redirect(new URL(pathname, mainDomain));
    }

    // B. Pass through APIs and Next.js internals
    if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
      return NextResponse.next();
    }

    // C. Internal rewrites to /promo namespace
    // promo.optikiseeyou.com/ -> rewrite to /promo
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/promo", req.url));
    }

    // If pathname is not already prefixed with /promo, rewrite internally
    if (!pathname.startsWith("/promo")) {
      return NextResponse.rewrite(new URL(`/promo${pathname}`, req.url));
    }

    return NextResponse.next();
  }

  // 3. Handle Main Domain: Admin Route Protection
  if (pathname.startsWith("/admin")) {
    // Allow login route
    if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
      return NextResponse.next();
    }

    // Check admin session cookie
    const sessionToken = req.cookies.get("isy_admin_session")?.value;

    if (!sessionToken || sessionToken.trim() === "") {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("notice", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }

    // Session exists -> attach security headers
    const response = NextResponse.next();
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return response;
  }

  return NextResponse.next();
}
