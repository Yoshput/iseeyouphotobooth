import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, isR2Configured } from "@/lib/r2Client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Cloudflare R2 belum dikonfigurasi di server.",
        },
        { status: 500 }
      );
    }

    const { fileName, fileType, fileSize } = await req.json();

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: "Nama file tidak boleh kosong." },
        { status: 400 }
      );
    }

    const isPdf =
      fileName.toLowerCase().endsWith(".pdf") ||
      fileType === "application/pdf";

    if (!isPdf) {
      return NextResponse.json(
        { success: false, error: "Hanya dokumen PDF (.pdf) yang diperbolehkan." },
        { status: 400 }
      );
    }

    // Max 50MB for direct-to-R2 upload
    const MAX_SIZE = 50 * 1024 * 1024;
    if (fileSize && fileSize > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "Ukuran file melebihi batas 50MB." },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const safeBaseName = String(fileName)
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30);
    const cleanFileName = `prop_${timestamp}_${safeBaseName}.pdf`;
    const r2Key = `proposals/${cleanFileName}`;

    const sponsorBucket =
      process.env.R2_SPONSOR_BUCKET_NAME?.trim() || "isy-sponsor-storage";
    const sponsorDomain = (
      process.env.R2_SPONSOR_PUBLIC_DOMAIN?.trim() ||
      "https://pub-e4717ece411e494f82f5057d8bb6382b.r2.dev"
    ).replace(/\/+$/, "");

    const client = getR2Client();

    const command = new PutObjectCommand({
      Bucket: sponsorBucket,
      Key: r2Key,
      ContentType: "application/pdf",
      CacheControl: "public, max-age=604800, immutable",
    });

    // Presigned PUT URL valid for 15 minutes (900 seconds)
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 });
    const publicUrl = `${sponsorDomain}/${r2Key}`;

    return NextResponse.json({
      success: true,
      uploadUrl,
      publicUrl,
      fileName: cleanFileName,
      r2Key,
    });
  } catch (err: any) {
    console.error("Error generating presigned R2 upload URL:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal membuat URL upload Cloudflare R2: " + (err.message || ""),
      },
      { status: 500 }
    );
  }
}
