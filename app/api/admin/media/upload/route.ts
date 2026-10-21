import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { authenticateAdminRequest } from "@/lib/auth/guard";
import { isR2Configured, uploadBufferToR2 } from "@/lib/r2Client";
import { saveMediaFile, addAuditLog } from "@/lib/db/repository";
import { MediaFile } from "@/lib/db/types";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  const auth = await authenticateAdminRequest(req);
  if (!auth.authorized) return auth.response;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const altText = (formData.get("altText") as string) || "";
    const category = (formData.get("category") as string) || "general";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Tidak ada file yang diunggah." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Format file tidak diizinkan (${file.type}). Hanya JPG, PNG, WebP, GIF, dan SVG yang didukung.`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: "Ukuran file melebihi batas maksimum 10MB.",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sanitize filename
    const originalName = file.name || "media";
    const ext = path.extname(originalName) || `.${file.type.split("/")[1] || "jpg"}`;
    const cleanBase = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-");
    const uniqueFileName = `${cleanBase}-${Date.now()}${ext}`;
    const storageKey = `media/${category}/${uniqueFileName}`;

    let publicUrl = "";

    // 1. Primary: Upload to Cloudflare R2
    if (isR2Configured()) {
      const uploadResult = await uploadBufferToR2(buffer, storageKey, file.type);
      publicUrl = uploadResult.publicUrl;
    } else {
      // 2. Fallback: Local filesystem
      const uploadDir = path.join(process.cwd(), "public", "uploads", category);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const localFilePath = path.join(uploadDir, uniqueFileName);
      fs.writeFileSync(localFilePath, buffer);
      publicUrl = `/uploads/${category}/${uniqueFileName}`;
    }

    const mediaId = `med-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const mediaRecord: MediaFile = {
      id: mediaId,
      name: originalName,
      url: publicUrl,
      filePath: storageKey,
      sizeBytes: file.size,
      mimeType: file.type,
      altText: altText || originalName,
      category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveMediaFile(mediaRecord);

    await addAuditLog({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: "upload",
      module: "media",
      targetId: saved.id,
      details: { filename: saved.name, url: saved.url, size: saved.sizeBytes },
    });

    return NextResponse.json({
      success: true,
      message: "File berhasil diunggah.",
      data: saved,
    });
  } catch (err: any) {
    console.error("Error in /api/admin/media/upload:", err);
    return NextResponse.json(
      { success: false, error: "Gagal mengunggah file media." },
      { status: 500 }
    );
  }
}
