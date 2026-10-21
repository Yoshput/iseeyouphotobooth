import { NextResponse } from "next/server";
import {
  getAdminUserByEmailWithAuth,
  saveAdminUser,
  addAuditLog,
} from "@/lib/db/repository";
import { verifyPassword } from "@/lib/auth/passwords";
import {
  createSession,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/session";

// In-memory rate limiting map
const LOGIN_ATTEMPTS: Record<string, { count: number; lockedUntil: number }> = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";
    const now = Date.now();

    // Check rate limiting
    const attempt = LOGIN_ATTEMPTS[ip];
    if (attempt && attempt.lockedUntil > now) {
      const waitSeconds = Math.ceil((attempt.lockedUntil - now) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Terlalu banyak percobaan gagal. Silakan coba lagi dalam ${waitSeconds} detik.`,
          locked: true,
          waitSeconds,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const user = await getAdminUserByEmailWithAuth(String(email).trim());
    if (!user || !user.isActive) {
      // Record failed attempt
      const currentCount = (attempt ? attempt.count : 0) + 1;
      const willLock = currentCount >= MAX_ATTEMPTS;
      LOGIN_ATTEMPTS[ip] = {
        count: willLock ? 0 : currentCount,
        lockedUntil: willLock ? now + LOCKOUT_MS : 0,
      };

      return NextResponse.json(
        {
          success: false,
          error: "Email atau password tidak sesuai.",
          attemptsLeft: Math.max(0, MAX_ATTEMPTS - currentCount),
        },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(String(password), user.passwordHash, user.salt);
    if (!isValid) {
      const currentCount = (attempt ? attempt.count : 0) + 1;
      const willLock = currentCount >= MAX_ATTEMPTS;
      LOGIN_ATTEMPTS[ip] = {
        count: willLock ? 0 : currentCount,
        lockedUntil: willLock ? now + LOCKOUT_MS : 0,
      };

      await addAuditLog({
        userEmail: user.email,
        action: "login_failed",
        module: "auth",
        ipAddress: ip,
        details: { reason: "Password salah" },
      });

      return NextResponse.json(
        {
          success: false,
          error: "Email atau password tidak sesuai.",
          attemptsLeft: Math.max(0, MAX_ATTEMPTS - currentCount),
        },
        { status: 401 }
      );
    }

    // Success: Reset rate limit
    delete LOGIN_ATTEMPTS[ip];

    // Create session
    const token = await createSession(user.id, ip, userAgent);

    // Update last login
    user.lastLoginAt = new Date().toISOString();
    await saveAdminUser(user);

    await addAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: "login_success",
      module: "auth",
      ipAddress: ip,
      details: { role: user.role },
    });

    const isProd = process.env.NODE_ENV === "production";
    const cookieHeader = `${SESSION_COOKIE_NAME}=${token}; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax${
      isProd ? "; Secure" : ""
    }`;

    const { passwordHash, salt, ...safeUser } = user;

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil.",
      user: safeUser,
      token,
    });

    response.headers.append("Set-Cookie", cookieHeader);
    return response;
  } catch (err: any) {
    console.error("Error in login:", err);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}
