import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { authenticateAdminRequest } from "@/lib/auth/guard";
import {
  getSoftlens,
  getSoftlensById,
  saveSoftlens,
  deleteSoftlens,
  addAuditLog,
} from "@/lib/db/repository";
import { SoftlensItem } from "@/lib/db/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const onlyPublished = searchParams.get("published") === "true";

    const items = await getSoftlens({ search, category, onlyPublished });
    return NextResponse.json({ success: true, data: items });
  } catch (err: any) {
    console.error("Error in GET /api/admin/softlens:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memuat katalog softlens." },
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
      name,
      category,
      type,
      colorFamily,
      coverImage,
      basePrice,
      brand,
      description,
      specs,
      diameter,
      waterContent,
      usageDuration,
      volume,
      isAccessory,
      hasPriceRange,
      maxPrice,
      badgeText,
      variants,
      isPublished,
      sortOrder,
    } = body;

    if (!name || !category || !coverImage || typeof basePrice !== "number") {
      return NextResponse.json(
        {
          success: false,
          error: "Field wajib belum lengkap: nama produk, kategori, foto utama, dan harga dasar wajib diisi.",
        },
        { status: 400 }
      );
    }

    const id = body.id || `softlens-${Date.now().toString(36)}-${Math.floor(100 + Math.random() * 900)}`;

    const newItem: SoftlensItem = {
      id,
      name: String(name).trim(),
      brand: brand ? String(brand).trim() : undefined,
      category: category === "Aksesoris dan Perawatan" ? "Aksesoris dan Perawatan" : "Softlens",
      type: type === "accessory" ? "accessory" : "lens",
      colorFamily: colorFamily || "natural",
      coverImage: String(coverImage).trim(),
      description: String(description || "").trim(),
      specs: Array.isArray(specs) ? specs : [],
      diameter: diameter ? String(diameter).trim() : undefined,
      waterContent: waterContent ? String(waterContent).trim() : undefined,
      usageDuration: usageDuration ? String(usageDuration).trim() : undefined,
      volume: volume ? String(volume).trim() : undefined,
      isAccessory: Boolean(isAccessory),
      basePrice: Number(basePrice),
      basePriceFormatted: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(basePrice)),
      hasPriceRange: Boolean(hasPriceRange),
      maxPrice: typeof maxPrice === "number" ? maxPrice : undefined,
      maxPriceFormatted:
        typeof maxPrice === "number"
          ? new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
            }).format(maxPrice)
          : undefined,
      badgeText: badgeText ? String(badgeText).trim() : undefined,
      variants: Array.isArray(variants) ? variants : [],
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveSoftlens(newItem);

    await addAuditLog({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: "create",
      module: "softlens",
      targetId: saved.id,
      details: { name: saved.name, category: saved.category, price: saved.basePrice },
    });

    try {
      revalidatePath("/softlens");
      revalidatePath("/katalog");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Produk softlens berhasil ditambahkan.",
      data: saved,
    });
  } catch (err: any) {
    console.error("Error in POST /api/admin/softlens:", err);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan produk softlens." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const auth = await authenticateAdminRequest(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID produk softlens wajib dicantumkan." },
        { status: 400 }
      );
    }

    const existing = await getSoftlensById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Produk softlens tidak ditemukan." },
        { status: 404 }
      );
    }

    const updatedItem: SoftlensItem = {
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveSoftlens(updatedItem);

    await addAuditLog({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: "update",
      module: "softlens",
      targetId: saved.id,
      details: { name: saved.name, isPublished: saved.isPublished },
    });

    try {
      revalidatePath("/softlens");
      revalidatePath("/katalog");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Produk softlens berhasil diperbarui.",
      data: saved,
    });
  } catch (err: any) {
    console.error("Error in PUT /api/admin/softlens:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui produk softlens." },
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
        { success: false, error: "ID produk softlens wajib dicantumkan." },
        { status: 400 }
      );
    }

    const existing = await getSoftlensById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Produk softlens tidak ditemukan." },
        { status: 404 }
      );
    }

    const success = await deleteSoftlens(id);

    if (success) {
      await addAuditLog({
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: "delete",
        module: "softlens",
        targetId: id,
        details: { name: existing.name },
      });

      try {
        revalidatePath("/softlens");
        revalidatePath("/katalog");
      } catch {}

      return NextResponse.json({
        success: true,
        message: `Produk "${existing.name}" berhasil dihapus.`,
      });
    }

    return NextResponse.json(
      { success: false, error: "Gagal menghapus produk softlens." },
      { status: 500 }
    );
  } catch (err: any) {
    console.error("Error in DELETE /api/admin/softlens:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memproses penghapusan produk softlens." },
      { status: 500 }
    );
  }
}
