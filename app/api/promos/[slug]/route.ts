import { NextResponse } from "next/server";
import { getPromoBySlug } from "@/lib/db/repository";
import { isPromoActive } from "@/lib/promo";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Slug tidak valid." },
        { status: 400 }
      );
    }

    const promo = await getPromoBySlug(slug);

    if (!promo || !isPromoActive(promo)) {
      return NextResponse.json(
        { success: false, error: "Promo tidak ditemukan atau sudah tidak aktif." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: promo });
  } catch (err: any) {
    console.error("Error in GET /api/promos/[slug]:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memuat detail promo." },
      { status: 500 }
    );
  }
}
