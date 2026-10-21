import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { authenticateAdminRequest } from "@/lib/auth/guard";
import {
  getFrames,
  getFrameById,
  saveFrame,
  deleteFrame,
  addAuditLog,
} from "@/lib/db/repository";
import { FrameItem } from "@/lib/db/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const shape = searchParams.get("shape") || undefined;
    const onlyPublished = searchParams.get("published") === "true";

    const items = await getFrames({ search, shape, onlyPublished });
    return NextResponse.json({ success: true, data: items });
  } catch (err: any) {
    console.error("Error in GET /api/admin/frames:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memuat katalog frame." },
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
      collection,
      shape,
      image,
      sku,
      material,
      dimensions,
      colors,
      price,
      priceRange,
      priceIncludesLens,
      coverImage,
      images,
      lifestyleImages,
      posterImages,
      specsImage,
      arAssetId,
      glassesId,
      fitWidthRatio,
      ipdScaleRef,
      model3D,
      recommendedFor,
      description,
      style,
      isPublished,
      sortOrder,
    } = body;

    if (!name || !collection || !shape || !image) {
      return NextResponse.json(
        {
          success: false,
          error: "Field wajib belum lengkap: nama frame, nama koleksi, bentuk/shape, dan foto produk harus diisi.",
        },
        { status: 400 }
      );
    }

    const id = body.id || `frame-${Date.now().toString(36)}-${Math.floor(100 + Math.random() * 900)}`;

    const newFrame: FrameItem = {
      id,
      sku: sku ? String(sku).trim() : undefined,
      name: String(name).trim(),
      collection: String(collection).trim(),
      shape: String(shape).trim(),
      material: material ? String(material).trim() : undefined,
      dimensions: dimensions || undefined,
      colors: Array.isArray(colors) ? colors : [],
      price: typeof price === "number" ? price : undefined,
      priceRange: priceRange ? String(priceRange).trim() : undefined,
      priceIncludesLens: Boolean(priceIncludesLens),
      image: String(image).trim(),
      coverImage: coverImage ? String(coverImage).trim() : undefined,
      images: Array.isArray(images) && images.length > 0 ? images : [String(image).trim()],
      lifestyleImages: Array.isArray(lifestyleImages) ? lifestyleImages : [],
      posterImages: Array.isArray(posterImages) ? posterImages : [],
      specsImage: specsImage ? String(specsImage).trim() : undefined,
      arAssetId: arAssetId ? String(arAssetId).trim() : undefined,
      glassesId: glassesId ? String(glassesId).trim() : undefined,
      fitWidthRatio: typeof fitWidthRatio === "number" ? fitWidthRatio : undefined,
      ipdScaleRef: typeof ipdScaleRef === "number" ? ipdScaleRef : undefined,
      model3D: model3D || undefined,
      recommendedFor: Array.isArray(recommendedFor) ? recommendedFor : [],
      description: String(description || "").trim(),
      style: style ? String(style).trim() : undefined,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveFrame(newFrame);

    await addAuditLog({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: "create",
      module: "frames",
      targetId: saved.id,
      details: { name: saved.name, collection: saved.collection },
    });

    try {
      revalidatePath("/katalog");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Frame berhasil ditambahkan.",
      data: saved,
    });
  } catch (err: any) {
    console.error("Error in POST /api/admin/frames:", err);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan frame." },
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
        { success: false, error: "ID frame wajib dicantumkan." },
        { status: 400 }
      );
    }

    const existing = await getFrameById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Frame tidak ditemukan." },
        { status: 404 }
      );
    }

    const updatedFrame: FrameItem = {
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveFrame(updatedFrame);

    await addAuditLog({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: "update",
      module: "frames",
      targetId: saved.id,
      details: { name: saved.name, isPublished: saved.isPublished },
    });

    try {
      revalidatePath("/katalog");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Frame berhasil diperbarui.",
      data: saved,
    });
  } catch (err: any) {
    console.error("Error in PUT /api/admin/frames:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui frame." },
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
        { success: false, error: "ID frame wajib dicantumkan." },
        { status: 400 }
      );
    }

    const existing = await getFrameById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Frame tidak ditemukan." },
        { status: 404 }
      );
    }

    const success = await deleteFrame(id);

    if (success) {
      await addAuditLog({
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: "delete",
        module: "frames",
        targetId: id,
        details: { name: existing.name },
      });

      try {
        revalidatePath("/katalog");
      } catch {}

      return NextResponse.json({
        success: true,
        message: `Frame "${existing.name}" berhasil dihapus.`,
      });
    }

    return NextResponse.json(
      { success: false, error: "Gagal menghapus frame." },
      { status: 500 }
    );
  } catch (err: any) {
    console.error("Error in DELETE /api/admin/frames:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memproses penghapusan frame." },
      { status: 500 }
    );
  }
}
