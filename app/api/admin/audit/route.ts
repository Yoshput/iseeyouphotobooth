import { NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/auth/guard";
import { getAuditLogs } from "@/lib/db/repository";

export async function GET(req: Request) {
  const auth = await authenticateAdminRequest(req);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const module = searchParams.get("module") || undefined;
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const logs = await getAuditLogs({ module, limit });
    return NextResponse.json({ success: true, data: logs });
  } catch (err: any) {
    console.error("Error in GET /api/admin/audit:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memuat log audit." },
      { status: 500 }
    );
  }
}
