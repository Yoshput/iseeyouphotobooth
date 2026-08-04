/**
 * lib/uploadImage.ts
 *
 * Uploads both Photo Strip and Animated GIF to Cloudinary/ImgBB via Next.js API route.
 * Generates a mobile download landing page URL (/download?strip=...&gif=...) for QR Code scanning.
 */

export type UploadResult =
  | { ok: true; url: string; gifUrl?: string; qrPageUrl: string; provider?: string }
  | { ok: false; error: string };

export async function uploadPhotoForQR(
  stripDataUrl: string,
  gifDataUrl?: string | null
): Promise<UploadResult> {
  try {
    const res = await fetch("/api/upload-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: stripDataUrl,
        gifBase64: gifDataUrl || null,
      }),
    });

    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }

    const json = await res.json();
    if (!json.ok) {
      if (json.error === "NO_CLOUD_KEYS_CONFIGURED") {
        return { ok: false, error: "IMGBB_KEY_MISSING" };
      }
      return { ok: false, error: json.error || "Upload gagal" };
    }

    const host = typeof window !== "undefined" ? window.location.origin : "";
    const qrPageUrl = `${host}/download?strip=${encodeURIComponent(json.url)}&gif=${encodeURIComponent(json.gifUrl || "")}`;

    return {
      ok: true,
      url: json.url,
      gifUrl: json.gifUrl,
      qrPageUrl,
      provider: json.provider,
    };
  } catch {
    return { ok: false, error: "Koneksi gagal — pastikan terhubung internet" };
  }
}
