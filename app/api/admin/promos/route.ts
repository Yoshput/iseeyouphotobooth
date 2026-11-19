import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { authenticateAdminRequest } from "@/lib/auth/guard";
import {
  getPromos,
  getPromoById,
  savePromo,
  deletePromo,
} from "@/lib/db/repository";
import { sanitizeHtml } from "@/lib/sanitize";

export async function GET(req: Request) {
  const auth = await authenticateAdminRequest(req);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") || undefined;
    const onlyActive = searchParams.get("onlyActive") === "true";

    const promos = await getPromos({ search, category, status, onlyActive });
    return NextResponse.json({ success: true, data: promos });
  } catch (err: any) {
    console.error("Error in GET /api/admin/promos:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar promo." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = await authenticateAdminRequest(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const {
      title,
      slug,
      subtitle,
      excerpt,
      description,
      category,
      status,
      startAt,
      endAt,
      heroMediaId,
      heroImageUrl,
      heroImageAlt,
      galleryMediaIds,
      galleryImages,
      detailLayout,
      collageLayout,
      ctaLabel,
      ctaUrl,
      termsAndConditions,
      showOnHomepage,
      showInPopup,
      popupPriority,
      sortOrder,
      seoTitle,
      seoDescription,
    } = body;

    if (!title || !category || !excerpt) {
      return NextResponse.json(
        {
          success: false,
          error: "Field wajib belum lengkap: judul, kategori, dan ringkasan wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (status === "published" && !heroImageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Promo yang diterbitkan wajib memiliki gambar utama.",
        },
        { status: 400 }
      );
    }

    const cleanDescription = description ? sanitizeHtml(description) : "";
    const cleanTerms = termsAndConditions ? sanitizeHtml(termsAndConditions) : "";

    const saved = await savePromo(
      {
        title,
        slug,
        subtitle,
        excerpt,
        description: cleanDescription,
        category,
        status: status || "draft",
        startAt,
        endAt,
        heroMediaId,
        heroImageUrl,
        heroImageAlt,
        galleryMediaIds,
        galleryImages,
        detailLayout,
        collageLayout,
        ctaLabel,
        ctaUrl,
        termsAndConditions: cleanTerms,
        showOnHomepage,
        showInPopup,
        popupPriority: Number(popupPriority) || 0,
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
        seoTitle,
        seoDescription,
      },
      auth.user
    );

    try {
      revalidatePath("/");
      revalidatePath("/promo");
      revalidatePath(`/promo/${saved.slug}`);
      revalidatePath("/admin/promosi");
    } catch {}

    return NextResponse.json({ success: true, data: saved });
  } catch (err: any) {
    console.error("Error in POST /api/admin/promos:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal membuat promo baru." },
      { status: 400 }
    );
  }
}

export async function PUT(req: Request) {
  const auth = await authenticateAdminRequest(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { id, title, description, termsAndConditions } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID promo wajib disertakan." },
        { status: 400 }
      );
    }

    const existing = await getPromoById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Promo tidak ditemukan." },
        { status: 404 }
      );
    }

    const cleanDescription =
      description !== undefined ? sanitizeHtml(description) : existing.description;
    const cleanTerms =
      termsAndConditions !== undefined
        ? sanitizeHtml(termsAndConditions)
        : existing.termsAndConditions;

    const saved = await savePromo(
      {
        ...body,
        description: cleanDescription,
        termsAndConditions: cleanTerms,
        title: title || existing.title,
      },
      auth.user
    );

    try {
      revalidatePath("/");
      revalidatePath("/promo");
      revalidatePath(`/promo/${saved.slug}`);
      if (existing.slug !== saved.slug) {
        revalidatePath(`/promo/${existing.slug}`);
      }
      revalidatePath("/admin/promosi");
    } catch {}

    return NextResponse.json({ success: true, data: saved });
  } catch (err: any) {
    console.error("Error in PUT /api/admin/promos:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal memperbarui promo." },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  const auth = await authenticateAdminRequest(req);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID promo wajib disertakan." },
        { status: 400 }
      );
    }

    const existing = await getPromoById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Promo tidak ditemukan." },
        { status: 404 }
      );
    }

    const success = await deletePromo(id, auth.user);

    try {
      revalidatePath("/");
      revalidatePath("/promo");
      revalidatePath(`/promo/${existing.slug}`);
      revalidatePath("/admin/promosi");
    } catch {}

    return NextResponse.json({ success, message: "Promo berhasil dihapus." });
  } catch (err: any) {
    console.error("Error in DELETE /api/admin/promos:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal menghapus promo." },
      { status: 500 }
    );
  }
}
