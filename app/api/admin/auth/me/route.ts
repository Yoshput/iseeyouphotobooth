import { NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/auth/guard";

export async function GET(req: Request) {
  const auth = await authenticateAdminRequest(req);
  if (!auth.authorized) {
    return auth.response;
  }

  return NextResponse.json({
    success: true,
    user: auth.user,
  });
}
