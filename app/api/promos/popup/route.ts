import { NextResponse } from "next/server";
import { getFeaturedPopupPromo } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getFeaturedPopupPromo();
    return NextResponse.json(
      { success: true, data: result },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: any) {
    console.error("Error in GET /api/promos/popup:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memuat konfigurasi popup promo." },
      { status: 500 }
    );
  }
}
