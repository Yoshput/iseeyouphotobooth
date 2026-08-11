/**
 * lib/cloudinary.ts
 * Upload foto ke Cloudinary via unsigned preset dari client.
 * Static export friendly — tidak butuh server/API route.
 */

export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
export const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  expires_at?: number;
}

/**
 * Upload blob/dataURL foto ke Cloudinary.
 * Mengembalikan URL publik permanent (https://) yang bisa di-QR-kan.
 */
export async function uploadToCloudinary(
  blobOrDataUrl: Blob | string
): Promise<CloudinaryUploadResult> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary belum dikonfigurasi. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME dan NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET di Vercel Settings -> Environment Variables."
    );
  }

  const formData = new FormData();

  if (typeof blobOrDataUrl === "string") {
    // dataURL → blob
    const res = await fetch(blobOrDataUrl);
    const blob = await res.blob();
    formData.append("file", blob, "photobooth.jpg");
  } else {
    formData.append("file", blobOrDataUrl, "photobooth.jpg");
  }

  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET.trim());

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME.trim()}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    let errMessage = "";
    try {
      const errJson = await response.json();
      errMessage = errJson.error?.message || JSON.stringify(errJson);
    } catch {
      errMessage = await response.text();
    }
    throw new Error(`Cloudinary (${response.status}): ${errMessage}`);
  }

  const data = await response.json();
  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    expires_at: data.expires_at,
  };
}
