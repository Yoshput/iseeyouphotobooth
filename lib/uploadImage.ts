/**
 * lib/uploadImage.ts
 *
 * Cloud Photo Upload for Photo Strip & Animated GIF to Cloudflare R2 (via /api/upload-photo).
 * Features:
 * - Instant 0-second QR Code pre-generation before upload
 * - Decoupled background uploading
 * - Fallback to Cloudinary if R2 is unavailable
 */

import { uploadToCloudinary, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "./cloudinary";
import QRCode from "qrcode";

export type UploadResult =
  | {
      ok: true;
      url: string;
      gifUrl?: string;
      photoId: string;
      qrPageUrl: string;
      qrCodeDataUrl: string;
      provider?: "r2" | "cloudinary";
    }
  | { ok: false; error: string };

/**
 * Generate a unique Photo ID on the client side instantly.
 */
export function generatePhotoId(): string {
  return `isy-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Generate QR Code dataURL and download page URL instantly (0 ms delay).
 */
export async function generateInstantQR(photoId: string): Promise<{
  qrPageUrl: string;
  qrCodeDataUrl: string;
}> {
  const host =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://optikiseeyou.com";

  const qrPageUrl = `${host}/download?id=${encodeURIComponent(photoId)}`;

  const qrCodeDataUrl = await QRCode.toDataURL(qrPageUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 280,
    color: { dark: "#116B3C", light: "#FFFFFF" },
  });

  return { qrPageUrl, qrCodeDataUrl };
}

/**
 * Upload Photo Strip and optional Animated GIF to Cloudflare R2 (or Cloudinary fallback).
 */
export async function uploadPhotoForQR(
  stripDataUrl: string,
  gifDataUrl?: string | null,
  existingPhotoId?: string | null
): Promise<UploadResult> {
  const photoId = existingPhotoId || generatePhotoId();

  // ── 1. Try Upload via Serverless Next.js API Route to Cloudflare R2 ────────
  try {
    const res = await fetch("/api/upload-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stripDataUrl,
        gifDataUrl: gifDataUrl || null,
        photoId,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.stripUrl && data.qrPageUrl) {
        const qrCodeDataUrl = await QRCode.toDataURL(data.qrPageUrl, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 280,
          color: { dark: "#116B3C", light: "#FFFFFF" },
        });

        return {
          ok: true,
          url: data.stripUrl,
          gifUrl: data.gifUrl || undefined,
          photoId: data.photoId || photoId,
          qrPageUrl: data.qrPageUrl,
          qrCodeDataUrl,
          provider: "r2",
        };
      }
    }
  } catch (r2Err) {
    console.warn("R2 API upload failed or unavailable, checking fallback:", r2Err);
  }

  // ── 2. Fallback to Cloudinary if R2 is not configured or in transition ────
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
    try {
      const stripRes = await uploadToCloudinary(stripDataUrl);
      const stripUrl = stripRes.secure_url;

      let gifUrl: string | undefined = undefined;
      if (gifDataUrl) {
        try {
          const gifRes = await uploadToCloudinary(gifDataUrl);
          gifUrl = gifRes.secure_url;
        } catch (gifErr) {
          console.warn("Upload GIF ke Cloudinary gagal, melanjutkan tanpa GIF:", gifErr);
        }
      }

      const host = typeof window !== "undefined" ? window.location.origin : "https://optikiseeyou.com";
      const qrPageUrl = `${host}/download?strip=${encodeURIComponent(stripUrl)}${
        gifUrl ? `&gif=${encodeURIComponent(gifUrl)}` : ""
      }`;

      const qrCodeDataUrl = await QRCode.toDataURL(qrPageUrl, {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 280,
        color: { dark: "#116B3C", light: "#FFFFFF" },
      });

      return {
        ok: true,
        url: stripUrl,
        gifUrl,
        photoId,
        qrPageUrl,
        qrCodeDataUrl,
        provider: "cloudinary",
      };
    } catch (cErr) {
      console.warn("Cloudinary upload error:", cErr);
    }
  }

  return {
    ok: false,
    error:
      "Cloudflare R2 belum dikonfigurasi. Harap isi R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, dan R2_BUCKET_NAME di Vercel Settings -> Environment Variables.",
  };
}
