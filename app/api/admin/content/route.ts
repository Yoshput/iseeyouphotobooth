import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { authenticateAdminRequest } from "@/lib/auth/guard";
import {
  getWebsiteSettings,
  saveWebsiteSettings,
  addAuditLog,
} from "@/lib/db/repository";

export async function GET() {
  try {
    const settings = await getWebsiteSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (err: any) {
    console.error("Error in GET /api/admin/content:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memuat pengaturan website." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const auth = await authenticateAdminRequest(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const existing = await getWebsiteSettings();

    const updated = {
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveWebsiteSettings(updated);

    await addAuditLog({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: "update",
      module: "settings",
      details: { changes: Object.keys(body) },
    });

    try {
      revalidatePath("/");
      revalidatePath("/cabang");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Pengaturan konten website berhasil disimpan.",
      data: saved,
    });
  } catch (err: any) {
    console.error("Error in PUT /api/admin/content:", err);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan pengaturan website." },
      { status: 500 }
    );
  }
}
