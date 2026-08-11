/**
 * lib/uploadImage.ts
 *
 * Client-side upload untuk Photo Strip dan Animated GIF langsung ke Cloudinary (Unsigned).
 * Generates a mobile download landing page URL (/download?strip=...&gif=...)
 * dan QR Code dataURL secara client-side via package "qrcode".
 *
 * 100% Static Export Compatible — Tanpa backend / API route.
 */

import { uploadToCloudinary, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "./cloudinary";
import QRCode from "qrcode";

export type UploadResult =
  | {
      ok: true;
      url: string;
      gifUrl?: string;
      qrPageUrl: string;
      qrCodeDataUrl: string;
      provider?: string;
    }
  | { ok: false; error: string };

export async function uploadPhotoForQR(
  stripDataUrl: string,
  gifDataUrl?: string | null
): Promise<UploadResult> {
  try {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      return {
        ok: false,
        error:
          "Cloudinary belum dikonfigurasi. Harap atur NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME dan NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET di Vercel Settings -> Environment Variables.",
      };
    }

    // 1. Upload Photo Strip to Cloudinary
    const stripRes = await uploadToCloudinary(stripDataUrl);
    const stripUrl = stripRes.secure_url;

    // 2. Upload Animated GIF if present
    let gifUrl: string | undefined = undefined;
    if (gifDataUrl) {
      try {
        const gifRes = await uploadToCloudinary(gifDataUrl);
        gifUrl = gifRes.secure_url;
      } catch (gifErr) {
        console.warn("Upload GIF ke Cloudinary gagal, melanjutkan tanpa GIF:", gifErr);
      }
    }

    // 3. Build mobile download page URL
    const host = typeof window !== "undefined" ? window.location.origin : "";
    const qrPageUrl = `${host}/download?strip=${encodeURIComponent(stripUrl)}${
      gifUrl ? `&gif=${encodeURIComponent(gifUrl)}` : ""
    }`;

    // 4. Generate Client-side QR Code DataURL
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
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Gagal mengunggah foto ke Cloudinary";
    console.error("Upload QR Client Error:", err);
    return { ok: false, error: errorMsg };
  }
}
