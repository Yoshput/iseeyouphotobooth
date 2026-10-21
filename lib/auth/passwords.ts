import crypto from "crypto";

export interface HashResult {
  hash: string;
  salt: string;
}

/**
 * Hash a plain password using PBKDF2 with SHA-512 and 100,000 iterations.
 */
export function hashPassword(password: string, existingSalt?: string): HashResult {
  const salt = existingSalt || crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return { hash, salt };
}

/**
 * Verify a plain password against an existing hash and salt with timing-safe comparison.
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computed = hashPassword(password, salt).hash;
    const computedBuffer = Buffer.from(computed, "hex");
    const targetBuffer = Buffer.from(hash, "hex");

    if (computedBuffer.length !== targetBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(computedBuffer, targetBuffer);
  } catch {
    return false;
  }
}
