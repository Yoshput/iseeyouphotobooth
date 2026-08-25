/**
 * lib/r2Client.ts
 *
 * Cloudflare R2 (S3-compatible) storage client for Optik I See You Photobooth.
 * Server-side only — keeps API credentials protected.
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

export const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID?.trim() ?? "";
export const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID?.trim() ?? "";
export const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY?.trim() ?? "";
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME?.trim() ?? "iseeyou-photobooth-photos";
export const R2_PUBLIC_DOMAIN = (
  process.env.R2_PUBLIC_DOMAIN ??
  process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN ??
  ""
).trim().replace(/\/+$/, "");

export function isR2Configured(): boolean {
  return Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);
}

let s3ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!s3ClientInstance) {
    if (!isR2Configured()) {
      throw new Error(
        "Cloudflare R2 belum dikonfigurasi. Harap isi R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, dan R2_SECRET_ACCESS_KEY di environment variables Vercel / .env.local."
      );
    }

    s3ClientInstance = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }

  return s3ClientInstance;
}

export interface R2UploadResult {
  key: string;
  publicUrl: string;
}

export async function uploadBufferToR2(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<R2UploadResult> {
  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // 7 days browser cache + immutable for fast CDN delivery
    CacheControl: "public, max-age=604800, immutable",
  });

  await client.send(command);

  const publicUrl = R2_PUBLIC_DOMAIN
    ? `${R2_PUBLIC_DOMAIN}/${key}`
    : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

  return { key, publicUrl };
}
