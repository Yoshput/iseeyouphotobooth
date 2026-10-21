import { NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/auth/guard";
import {
  getMediaFiles,
  deleteMediaFile,
  addAuditLog,
} from "@/lib/db/repository";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;

    const files = await getMediaFiles({ search, category });
    return NextResponse.json({ success: true, data: files });
  } catch (err: any) {
    console.error("Error in GET /api/admin/media:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memuat media library." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const auth = await authenticateAdminRequest(req);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID media diperlukan." },
        { status: 400 }
      );
    }

    const result = await deleteMediaFile(id);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.inUseWarning || "Gagal menghapus file media.",
        },
        { status: 409 }
      );
    }

    await addAuditLog({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: "delete",
      module: "media",
      targetId: id,
    });

    return NextResponse.json({
      success: true,
      message: "File media berhasil dihapus.",
    });
  } catch (err: any) {
    console.error("Error in DELETE /api/admin/media:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memproses penghapusan media." },
      { status: 500 }
    );
  }
}
