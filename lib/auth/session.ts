import crypto from "crypto";
import { cookies } from "next/headers";
import {
  createAdminSession,
  getAdminSession,
  revokeAdminSession,
  getAdminUserById,
} from "@/lib/db/repository";
import { AdminUser, AdminSession } from "@/lib/db/types";

export const SESSION_COOKIE_NAME = "isy_admin_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface SessionContext {
  user: Omit<AdminUser, "passwordHash" | "salt">;
  session: AdminSession;
}

/**
 * Generate a cryptographically secure random session token.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a new admin session and persist it.
 */
export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();

  const session: AdminSession = {
    id: `ses-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    userId,
    token,
    ipAddress,
    userAgent,
    expiresAt,
    createdAt: new Date().toISOString(),
  };

  await createAdminSession(session);
  return token;
}

/**
 * Verify a session token and return the associated active user.
 */
export async function verifySession(token: string): Promise<SessionContext | null> {
  if (!token) return null;

  const session = await getAdminSession(token);
  if (!session) return null;

  const user = await getAdminUserById(session.userId);
  if (!user || !user.isActive) {
    return null;
  }

  const { passwordHash, salt, ...safeUser } = user;
  return { user: safeUser, session };
}

/**
 * Get current admin session in Server Components and Route Handlers.
 */
export async function getServerAdminSession(): Promise<SessionContext | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySession(token);
  } catch {
    return null;
  }
}

/**
 * Invalidate session.
 */
export async function destroySession(token: string): Promise<void> {
  if (token) {
    await revokeAdminSession(token);
  }
}
