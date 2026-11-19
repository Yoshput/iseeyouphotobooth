import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { authenticateAdminRequest } from "@/lib/auth/guard";
import { updatePromoStatus, getPromoById } from "@/lib/db/repository";
import { PromoStatus } from "@/lib/db/types";

export async function PATCH(req: Request) {
  const auth = await authenticateAdminRequest(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "ID dan status promo wajib disertakan." },
        { status: 400 }
      );
    }

    if (!["draft", "published", "archived"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Status harus salah satu dari: draft, published, archived." },
        { status: 400 }
      );
    }

    const updated = await updatePromoStatus(id, status as PromoStatus, auth.user);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Promo tidak ditemukan." },
        { status: 404 }
      );
    }

    try {
      revalidatePath("/");
      revalidatePath("/promo");
      revalidatePath(`/promo/${updated.slug}`);
      revalidatePath("/admin/promosi");
    } catch {}

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("Error in PATCH /api/admin/promos/status:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal mengubah status promo." },
      { status: 400 }
    );
  }
}
