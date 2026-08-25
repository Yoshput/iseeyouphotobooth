/**
 * lib/uploadImage.ts
 *
 * Cloud Photo Upload for Photo Strip & Animated GIF to Cloudflare R2 (via /api/upload-photo).
 * Generates an instant mobile download landing page URL (/download?id=...&strip=...)
 * and QR Code dataURL via package "qrcode".
 */

import { uploadToCloudinary, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "./cloudinary";
import QRCode from "qrcode";

export type UploadResult =
  | {
      ok: true;
      url: string;
      gifUrl?: string;
      photoId?: string;
      qrPageUrl: string;
      qrCodeDataUrl: string;
      provider?: "r2" | "cloudinary";
    }
  | { ok: false; error: string };

export async function uploadPhotoForQR(
  stripDataUrl: string,
  gifDataUrl?: string | null
): Promise<UploadResult> {
  // ── 1. Try Upload via Serverless Next.js API Route to Cloudflare R2 ────────
  try {
    const res = await fetch("/api/upload-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stripDataUrl,
        gifDataUrl: gifDataUrl || null,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.stripUrl && data.qrPageUrl) {
        // Generate QR Code dataURL fast with brand styling
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
          photoId: data.photoId,
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

      const host = typeof window !== "undefined" ? window.location.origin : "";
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
