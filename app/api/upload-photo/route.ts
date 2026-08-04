import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageBase64, gifBase64 } = await req.json();
    if (!imageBase64) {
      return NextResponse.json({ ok: false, error: "No image data" }, { status: 400 });
    }

    const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
    const gifData = gifBase64 && gifBase64.includes(",") ? gifBase64.split(",")[1] : gifBase64;

    let stripUrl = "";
    let gifUrl = "";
    let provider = "";

    // 1. Try ImgBB if key exists
    const imgbbKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || process.env.IMGBB_API_KEY;
    if (imgbbKey) {
      // Upload Strip
      const form = new FormData();
      form.append("image", base64Data);
      form.append("expiration", String(60 * 60 * 24 * 7)); // 7 days

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
        method: "POST",
        body: form,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          stripUrl = json.data.url;
          provider = "imgbb";
        }
      }

      // Upload GIF if available
      if (gifData) {
        const formGif = new FormData();
        formGif.append("image", gifData);
        formGif.append("expiration", String(60 * 60 * 24 * 7));

        const resGif = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
          method: "POST",
          body: formGif,
        });

        if (resGif.ok) {
          const jsonGif = await resGif.json();
          if (jsonGif.success) {
            gifUrl = jsonGif.data.url;
          }
        }
      }
    }

    // 2. Try Cloudinary Unsigned Upload if configured (and ImgBB didn't handle it)
    if (!stripUrl) {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || process.env.CLOUDINARY_UPLOAD_PRESET;

      if (cloudName && uploadPreset) {
        // Upload Strip
        const form = new FormData();
        form.append("file", `data:image/jpeg;base64,${base64Data}`);
        form.append("upload_preset", uploadPreset);
        form.append("folder", "optik_i_see_you_photobooth");

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: form,
        });

        if (res.ok) {
          const json = await res.json();
          stripUrl = json.secure_url;
          provider = "cloudinary";
        }

        // Upload GIF
        if (gifData) {
          const formGif = new FormData();
          formGif.append("file", `data:image/gif;base64,${gifData}`);
          formGif.append("upload_preset", uploadPreset);
          formGif.append("folder", "optik_i_see_you_photobooth");

          const resGif = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formGif,
          });

          if (resGif.ok) {
            const jsonGif = await resGif.json();
            gifUrl = jsonGif.secure_url;
          }
        }
      }
    }

    if (!stripUrl) {
      return NextResponse.json(
        { ok: false, error: "NO_CLOUD_KEYS_CONFIGURED" },
        { status: 200 }
      );
    }

    return NextResponse.json({
      ok: true,
      url: stripUrl,
      gifUrl: gifUrl,
      provider,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Upload failed" }, { status: 500 });
  }
}
