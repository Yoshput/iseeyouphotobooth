/**
 * app/api/upload-photo/route.ts
 *
 * Next.js Serverless API Route for uploading photobooth composites to Cloudflare R2.
 * Protected backend endpoint — R2 credentials never exposed to client browser.
 */

import { NextRequest, NextResponse } from "next/server";
import { uploadBufferToR2, isR2Configured } from "@/lib/r2Client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface UploadPayload {
  stripDataUrl: string;
  gifDataUrl?: string | null;
  photoId?: string;
}

export async function POST(req: NextRequest) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Cloudflare R2 belum dikonfigurasi di server. Harap atur R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, dan R2_BUCKET_NAME di Vercel Settings -> Environment Variables.",
        },
        { status: 500 }
      );
    }

    const body: UploadPayload = await req.json();
    const { stripDataUrl, gifDataUrl, photoId } = body;

    if (!stripDataUrl || typeof stripDataUrl !== "string") {
      return NextResponse.json(
        { ok: false, error: "Parameter 'stripDataUrl' wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Generate clean unique photo ID
    const uniqueId =
      photoId ||
      `isy-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // 2. Decode Photo Strip (JPEG / PNG base64) to binary Buffer
    const stripBase64 = stripDataUrl.replace(/^data:image\/\w+;base64,/, "");
    const stripBuffer = Buffer.from(stripBase64, "base64");
    const stripKey = `photos/${uniqueId}.jpg`;

    // 3. Upload Photo Strip to Cloudflare R2
    const stripResult = await uploadBufferToR2(
      stripBuffer,
      stripKey,
      "image/jpeg"
    );

    // 4. Upload Animated GIF if present
    let gifResult: { key: string; publicUrl: string } | null = null;
    if (gifDataUrl && typeof gifDataUrl === "string") {
      try {
        const gifBase64 = gifDataUrl.replace(/^data:image\/\w+;base64,/, "");
        const gifBuffer = Buffer.from(gifBase64, "base64");
        const gifKey = `photos/${uniqueId}.gif`;
        gifResult = await uploadBufferToR2(gifBuffer, gifKey, "image/gif");
      } catch (gifErr) {
        console.warn("Upload GIF ke R2 gagal (melanjutkan tanpa GIF):", gifErr);
      }
    }

    // 5. Determine fast public photo URL (uses custom domain if set, otherwise Next.js serverless proxy)
    const hostHeader = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const origin = hostHeader ? `${proto}://${hostHeader}` : "";
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || origin || "https://optikiseeyou.com").replace(/\/+$/, "");

    const isCustomDomain =
      stripResult.publicUrl &&
      !stripResult.publicUrl.includes(".r2.dev") &&
      !stripResult.publicUrl.includes("cloudflarestorage.com");

    const finalStripUrl = isCustomDomain
      ? stripResult.publicUrl
      : `${siteUrl}/api/photo?id=${encodeURIComponent(uniqueId)}&type=jpg`;

    const finalGifUrl = gifResult
      ? isCustomDomain
        ? gifResult.publicUrl
        : `${siteUrl}/api/photo?id=${encodeURIComponent(uniqueId)}&type=gif`
      : null;

    const qrPageUrl = `${siteUrl}/download?id=${encodeURIComponent(uniqueId)}`;

    return NextResponse.json({
      ok: true,
      photoId: uniqueId,
      stripUrl: finalStripUrl,
      gifUrl: finalGifUrl,
      qrPageUrl,
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Terjadi kesalahan internal saat mengunggah foto ke R2.";
    console.error("R2 Upload Route Error:", err);
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
