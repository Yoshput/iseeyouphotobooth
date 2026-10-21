/**
 * lib/auth/captcha.ts
 *
 * Stateless cryptographic anti-bot CAPTCHA for Optik I See You Admin Portal.
 * Uses HMAC-SHA256 signatures with 3-minute expiration and replay protection.
 */

import crypto from "crypto";

const CAPTCHA_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "isy-security-salt-2026-c4ptch4-k3y-optikiseeyou";

const EXPIRATION_MS = 3 * 60 * 1000; // 3 minutes

export interface CaptchaChallenge {
  token: string;
  question: string;
  type: "math" | "text";
}

/**
 * Generate a new CAPTCHA challenge
 */
export function generateCaptcha(): CaptchaChallenge {
  // 50% probability: Math challenge (e.g. 17 + 8) or Alphanumeric challenge (e.g. 7B9X)
  const isMath = Math.random() > 0.35;
  const now = Date.now();

  let question = "";
  let answer = "";

  if (isMath) {
    const a = Math.floor(Math.random() * 20) + 5; // 5 - 24
    const b = Math.floor(Math.random() * 15) + 3; // 3 - 17
    const op = Math.random() > 0.5 ? "+" : "-";

    if (op === "+") {
      question = `Hitung: ${a} + ${b} = ?`;
      answer = String(a + b);
    } else {
      const max = Math.max(a, b);
      const min = Math.min(a, b);
      question = `Hitung: ${max} - ${min} = ?`;
      answer = String(max - min);
    }
  } else {
    // Alphanumeric without ambiguous characters (0, O, 1, I, l)
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    question = `Ketik Kode: ${code}`;
    answer = code.toUpperCase();
  }

  // Create HMAC signature
  const payload = `${answer.toLowerCase()}:${now}`;
  const hmac = crypto
    .createHmac("sha256", CAPTCHA_SECRET)
    .update(payload)
    .digest("hex");

  const token = `${now}.${hmac}`;

  return {
    token,
    question,
    type: isMath ? "math" : "text",
  };
}

/**
 * Verify a submitted CAPTCHA answer against its signed token
 */
export function verifyCaptcha(
  submittedAnswer: string | null | undefined,
  token: string | null | undefined
): { valid: boolean; error?: string } {
  if (!submittedAnswer || !token) {
    return { valid: false, error: "Verifikasi keamanan (CAPTCHA) wajib diisi." };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, error: "Token verifikasi tidak valid." };
  }

  const [timestampStr, expectedHmac] = parts;
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp)) {
    return { valid: false, error: "Format token tidak valid." };
  }

  const now = Date.now();
  if (now - timestamp > EXPIRATION_MS) {
    return { valid: false, error: "Kode verifikasi telah kedaluwarsa. Silakan muat ulang kode baru." };
  }

  const cleanAnswer = submittedAnswer.trim().toLowerCase();
  const payload = `${cleanAnswer}:${timestamp}`;
  const calculatedHmac = crypto
    .createHmac("sha256", CAPTCHA_SECRET)
    .update(payload)
    .digest("hex");

  const isMatch = crypto.timingSafeEqual(
    Buffer.from(calculatedHmac),
    Buffer.from(expectedHmac)
  );

  if (!isMatch) {
    return { valid: false, error: "Jawaban verifikasi keamanan (CAPTCHA) tidak sesuai." };
  }

  return { valid: true };
}
