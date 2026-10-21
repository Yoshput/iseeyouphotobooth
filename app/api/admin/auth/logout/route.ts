import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroySession, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { authenticateAdminRequest } from "@/lib/auth/guard";
import { addAuditLog } from "@/lib/db/repository";

export async function POST(req: Request) {
  try {
    const auth = await authenticateAdminRequest(req);
    let tokenToRevoke: string | undefined;

    if (auth.authorized) {
      tokenToRevoke = auth.session.token;
      await addAuditLog({
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: "logout",
        module: "auth",
      });
    } else {
      const cookieStore = await cookies();
      tokenToRevoke = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    }

    if (tokenToRevoke) {
      await destroySession(tokenToRevoke);
    }

    const response = NextResponse.json({
      success: true,
      message: "Logout berhasil.",
    });

    response.headers.append(
      "Set-Cookie",
      `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`
    );

    return response;
  } catch (err: any) {
    console.error("Error in logout:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memproses logout." },
      { status: 500 }
    );
  }
}
