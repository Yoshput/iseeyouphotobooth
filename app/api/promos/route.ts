import { NextResponse } from "next/server";
import { getPublicPromos, getHomepagePromos } from "@/lib/db/repository";
import { PromoCategory } from "@/lib/db/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = (searchParams.get("category") as PromoCategory) || undefined;
    const isHomepage = searchParams.get("homepage") === "true";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    };

    if (isHomepage) {
      const items = await getHomepagePromos(limit || 3);
      return NextResponse.json({ success: true, data: items }, { headers });
    }

    const items = await getPublicPromos({ category, limit });
    return NextResponse.json({ success: true, data: items }, { headers });
  } catch (err: any) {
    console.error("Error in public GET /api/promos:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memuat data promosi publik." },
      { status: 500 }
    );
  }
}
