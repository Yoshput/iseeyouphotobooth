import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { authenticateAdminRequest } from "@/lib/auth/guard";
import { getPromoPopupSettings, savePromoPopupSettings } from "@/lib/db/repository";

export async function GET(req: Request) {
  const auth = await authenticateAdminRequest(req);
  if (!auth.authorized) return auth.response;

  try {
    const settings = await getPromoPopupSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (err: any) {
    console.error("Error in GET /api/admin/promos/settings:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memuat pengaturan popup promo." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const auth = await authenticateAdminRequest(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const updated = await savePromoPopupSettings(body, auth.user);

    try {
      revalidatePath("/");
      revalidatePath("/admin/promosi");
    } catch {}

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("Error in PUT /api/admin/promos/settings:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal menyimpan pengaturan popup promo." },
      { status: 400 }
    );
  }
}
