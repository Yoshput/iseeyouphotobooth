import { NextResponse } from "next/server";
import crypto from "crypto";

// Store in-memory rate limiting for IP addresses
const FAILED_ATTEMPTS: Record<string, { count: number; lockedUntil: number }> = {};

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

export async function GET(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const now = Date.now();
    const attemptRecord = FAILED_ATTEMPTS[ip];
    if (attemptRecord && attemptRecord.lockedUntil > now) {
      const remainingSeconds = Math.ceil((attemptRecord.lockedUntil - now) / 1000);
      return NextResponse.json({
        locked: true,
        remainingSeconds,
      });
    }
    return NextResponse.json({
      locked: false,
      remainingSeconds: 0,
      attemptsLeft: attemptRecord ? Math.max(0, MAX_ATTEMPTS - attemptRecord.count) : MAX_ATTEMPTS,
    });
  } catch {
    return NextResponse.json({ locked: false, remainingSeconds: 0 });
  }
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const now = Date.now();

    // Check if IP is currently locked out
    const attemptRecord = FAILED_ATTEMPTS[ip];
    if (attemptRecord && attemptRecord.lockedUntil > now) {
      const remainingSeconds = Math.ceil((attemptRecord.lockedUntil - now) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Akses diblokir sementara karena terlalu banyak percobaan gagal. Silakan coba lagi dalam ${remainingSeconds} detik.`,
          locked: true,
          remainingSeconds,
        },
        { status: 429 }
      );
    }

    const { pin } = await req.json();
    const correctPin = process.env.ADMIN_SPONSOR_PIN || "iseeyou2026";

    // Timing-safe comparison to prevent timing attacks
    const pinBuffer = Buffer.from(String(pin || ""));
    const correctBuffer = Buffer.from(String(correctPin));

    const isMatch =
      pinBuffer.length === correctBuffer.length &&
      crypto.timingSafeEqual(pinBuffer, correctBuffer);

    if (!isMatch) {
      const currentCount = (attemptRecord ? attemptRecord.count : 0) + 1;
      const willLock = currentCount >= MAX_ATTEMPTS;
      const lockedUntil = willLock ? now + LOCKOUT_MS : 0;

      FAILED_ATTEMPTS[ip] = {
        count: willLock ? 0 : currentCount,
        lockedUntil,
      };

      return NextResponse.json(
        {
          success: false,
          error: willLock
            ? "Terlalu banyak percobaan PIN salah. Sistem dikunci selama 5 menit untuk alasan keamanan."
            : `PIN salah. Sisa kesempatan: ${MAX_ATTEMPTS - currentCount} kali.`,
          attemptsLeft: Math.max(0, MAX_ATTEMPTS - currentCount),
          locked: willLock,
          remainingSeconds: willLock ? 300 : 0,
        },
        { status: 401 }
      );
    }

    // Success: Reset rate-limit record and issue token
    delete FAILED_ATTEMPTS[ip];

    // Create a deterministic signed session token based on date + secret
    const token = crypto
      .createHmac("sha256", correctPin)
      .update(`isy_auth_session_${new Date().toISOString().slice(0, 10)}`)
      .digest("hex");

    return NextResponse.json({
      success: true,
      message: "Verifikasi berhasil",
      token,
    });
  } catch (err) {
    console.error("Error in /api/admin/verify:", err);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan internal pada server" },
      { status: 500 }
    );
  }
}
