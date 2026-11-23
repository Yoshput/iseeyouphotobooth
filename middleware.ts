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

    // C. Clean URL normalization on promo subdomain:
    // If accessing /promo or /promo/slug on subdomain, normalize to / or /slug
    if (pathname === "/promo") {
      return NextResponse.redirect(new URL("/", req.url), 307);
    }
    if (pathname.startsWith("/promo/")) {
      const cleanSlug = pathname.replace(/^\/promo\//, "");
      return NextResponse.redirect(new URL(`/${cleanSlug}`, req.url), 307);
    }

    // D. Internal rewrites to Next.js /promo page handler
    // promo.optikiseeyou.com/ -> rewrite to /promo
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/promo", req.url));
    }

    // Rewrite /slug to /promo/slug (e.g. /promo-lensa-antifog-blueray, /promo-hari-guru, /undian-akhir-tahun)
    // Ensure we don't rewrite if pathname is already /promo or begins with /promo/
    if (pathname !== "/promo" && !pathname.startsWith("/promo/")) {
      return NextResponse.rewrite(new URL(`/promo${pathname}`, req.url));
    }

    return NextResponse.next();
  }

  // 3. Handle Main Domain: Redirect promo visits to the dedicated promo subdomain
  if (!isPromoSubdomain && (pathname === "/promo" || pathname.startsWith("/promo/"))) {
    const isMainProduction =
      hostname === "optikiseeyou.com" ||
      hostname === "www.optikiseeyou.com";

    if (isMainProduction) {
      const slug = pathname.replace(/^\/promo\/?/, "");
      const targetUrl = slug
        ? `https://promo.optikiseeyou.com/${slug}`
        : "https://promo.optikiseeyou.com";
      return NextResponse.redirect(targetUrl, 307);
    }
  }

  // 4. Handle Main Domain: Admin Route Protection
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
