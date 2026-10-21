import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE_NAME } from "./session";
import { AdminUser, AdminSession } from "@/lib/db/types";

export type SafeAdminUser = Omit<AdminUser, "passwordHash" | "salt">;

export interface AuthSuccess {
  authorized: true;
  user: SafeAdminUser;
  session: AdminSession;
}

export interface AuthFailure {
  authorized: false;
  response: NextResponse;
}

export type AuthResult = AuthSuccess | AuthFailure;

/**
 * Server-side guard for API Route Handlers.
 * Checks Bearer token or HttpOnly session cookie, verifies user existence, active status, and role.
 */
export async function authenticateAdminRequest(
  req: Request,
  options?: { requireOwner?: boolean }
): Promise<AuthResult> {
  let token: string | undefined;

  // 1. Check Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  }

  // 2. Fallback to cookies
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      // ignore
    }
  }

  if (!token) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Akses ditolak: Silakan login terlebih dahulu.",
          code: "UNAUTHENTICATED",
        },
        { status: 401 }
      ),
    };
  }

  const sessionContext = await verifySession(token);
  if (!sessionContext) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Sesi telah berakhir atau tidak valid. Silakan login kembali.",
          code: "SESSION_EXPIRED",
        },
        { status: 401 }
      ),
    };
  }

  const { user, session } = sessionContext;

  if (options?.requireOwner && user.role !== "owner") {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Akses ditolak: Operasi ini membutuhkan hak akses Owner.",
          code: "FORBIDDEN",
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user,
    session,
  };
}
