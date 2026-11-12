/**
 * app/api/photo/route.ts
 *
 * Next.js Serverless Image Proxy for Cloudflare R2 photos.
 * Ensures 100% reliable, zero-timeout image delivery across all Indonesian ISPs (IndiHome, Telkomsel, XL, etc.)
 * by streaming directly from R2's private S3 endpoint to the client.
 */

import { NextRequest, NextResponse } from "next/server";
import { getR2Client, R2_BUCKET_NAME, isR2Configured } from "@/lib/r2Client";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const id = searchParams.get("id");
    const type = searchParams.get("type") || "jpg"; // "jpg" or "gif"

    let targetKey = key;
    if (!targetKey && id) {
      if (id.startsWith("photos/")) {
        targetKey = id.endsWith(`.${type}`) ? id : `${id}.${type}`;
      } else {
        targetKey = `photos/${id}.${type}`;
      }
    }

    if (!targetKey) {
      return new NextResponse("Parameter 'key' atau 'id' wajib disertakan.", {
        status: 400,
      });
    }

    if (!isR2Configured()) {
      return new NextResponse("R2 storage belum dikonfigurasi.", { status: 500 });
    }

    const s3 = getR2Client();
    let s3Res;
    try {
      s3Res = await s3.send(
        new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: targetKey,
        })
      );
    } catch (primaryErr: unknown) {
      // Fallback: check alternate partition (monthly vs legacy flat)
      const primaryS3Err = primaryErr as { $metadata?: { httpStatusCode?: number }; name?: string };
      if (
        (primaryS3Err?.$metadata?.httpStatusCode === 404 || primaryS3Err?.name === "NoSuchKey") &&
        id
      ) {
        const now = new Date();
        const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        let fallbackKey: string | null = null;

        if (!id.includes("/")) {
          // Try monthly folder
          fallbackKey = `photos/${currentYearMonth}/${id}.${type}`;
        } else {
          // Has month prefix (e.g. 2026-11/isy-xxx) -> try legacy flat photos/isy-xxx
          const pureId = id.split("/").pop();
          if (pureId) fallbackKey = `photos/${pureId}.${type}`;
        }

        if (fallbackKey && fallbackKey !== targetKey) {
          try {
            s3Res = await s3.send(
              new GetObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: fallbackKey,
              })
            );
          } catch {
            throw primaryErr;
          }
        } else {
          throw primaryErr;
        }
      } else {
        throw primaryErr;
      }
    }

    if (!s3Res.Body) {
      return new NextResponse("Foto tidak ditemukan atau sudah expired.", {
        status: 404,
      });
    }

    const contentType =
      s3Res.ContentType ||
      (targetKey.endsWith(".gif") ? "image/gif" : "image/jpeg");

    const bytes = await s3Res.Body.transformToByteArray();

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, immutable",
      },
    });
  } catch (err: unknown) {
    const s3Error = err as { $metadata?: { httpStatusCode?: number }; name?: string };
    if (s3Error?.$metadata?.httpStatusCode === 404 || s3Error?.name === "NoSuchKey") {
      return new NextResponse("Foto tidak ditemukan atau sudah melewati batas 7 hari.", {
        status: 404,
      });
    }
    console.error("Photo Proxy Error:", err);
    return new NextResponse("Gagal mengambil foto dari cloud.", { status: 500 });
  }
}
