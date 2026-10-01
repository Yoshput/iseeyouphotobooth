import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { PDFDocument } from "pdf-lib";
import { uploadBufferToR2, isR2Configured } from "@/lib/r2Client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Tidak ada file PDF yang diunggah." },
        { status: 400 }
      );
    }

    // Validation: MIME type & extension
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        { success: false, error: "Format file tidak valid. Harap upload dokumen PDF (.pdf)." },
        { status: 400 }
      );
    }

    // Limit check: 25MB max
    const MAX_SIZE_BYTES = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: "Ukuran file terlalu besar (maksimal 25MB). Gunakan opsi link Google Drive jika file melebihi 25MB.",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);
    const originalSize = originalBuffer.length;

    let finalBuffer: Buffer = originalBuffer;
    let isCompressed = false;

    try {
      // Load PDF and perform optimization (object stream compression, strip unused metadata/xref)
      const pdfDoc = await PDFDocument.load(originalBuffer, {
        ignoreEncryption: true,
        updateMetadata: false,
      });

      // Save with object streams enabled (compresses cross-reference tables and internal objects)
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const compressedBuffer = Buffer.from(compressedBytes);

      // Only use the compressed buffer if it actually saves bytes or equals
      if (compressedBuffer.length <= originalBuffer.length) {
        finalBuffer = compressedBuffer;
        isCompressed = true;
      }
    } catch (pdfErr) {
      console.warn("PDF optimization fallback to original buffer:", pdfErr);
      finalBuffer = originalBuffer;
    }

    const finalSize = finalBuffer.length;
    const savedBytes = Math.max(0, originalSize - finalSize);
    const savedPercentage = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

    // Clean filename
    const timestamp = Date.now();
    const safeBaseName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30);
    const fileName = `prop_${timestamp}_${safeBaseName}.pdf`;

    let publicUrl = "";
    let storageType = "local";

    // 1. If Cloudflare R2 is configured, upload directly to R2 (Zero Vercel storage footprint)
    if (isR2Configured()) {
      try {
        const sponsorBucket =
          process.env.R2_SPONSOR_BUCKET_NAME?.trim() || "isy-sponsor-storage";
        const sponsorDomain =
          process.env.R2_SPONSOR_PUBLIC_DOMAIN?.trim() ||
          "https://pub-e4717ece411e494f82f5057d8bb6382b.r2.dev";

        const r2Key = `proposals/${fileName}`;
        const r2Result = await uploadBufferToR2(
          finalBuffer,
          r2Key,
          "application/pdf",
          sponsorBucket,
          sponsorDomain
        );
        publicUrl = r2Result.publicUrl;
        storageType = "cloudflare_r2";
      } catch (r2Err) {
        console.error("Cloudflare R2 upload error, falling back to local:", r2Err);
      }
    }

    // 2. Fallback to local server disk if R2 is not yet configured or fails
    if (!publicUrl) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "proposals");
      await mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, fileName);
      await writeFile(filePath, finalBuffer);
      publicUrl = `/uploads/proposals/${fileName}`;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      storageType,
      originalSize,
      finalSize,
      savedBytes,
      savedPercentage,
      isCompressed,
      message: `File PDF berhasil diunggah${
        storageType === "cloudflare_r2" ? " ke Cloudflare R2" : ""
      } & dioptimalkan${savedPercentage > 0 ? ` (hemat ${savedPercentage}%)` : ""}.`,
    });
  } catch (err: any) {
    console.error("Error handling proposal upload:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memproses file upload proposal: " + (err.message || "") },
      { status: 500 }
    );
  }
}
