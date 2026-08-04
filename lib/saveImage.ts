/**
 * lib/saveImage.ts · Universal Cross-Browser Image & GIF Download / Web Share
 * 
 * Works 100% reliably across:
 * - Mobile Safari (iPhone / iPad iOS 15+ / iOS 17 / iOS 18) via Web Share API
 * - macOS Safari / Chrome / Firefox via native Blob Download
 * - Android WebKit / Chrome via Web Share API & Download
 */

export async function downloadOrShareImage(
  dataUrlOrBlob: string,
  filename: string,
  title: string = "Optik I See You — Photo"
): Promise<{ success: boolean; method: "share" | "download" | "preview" }> {
  try {
    // 1. Convert Data URL or URL to a Blob
    let blob: Blob;
    if (dataUrlOrBlob.startsWith("data:")) {
      const parts = dataUrlOrBlob.split(",");
      const mime = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg";
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      blob = new Blob([u8arr], { type: mime });
    } else {
      const res = await fetch(dataUrlOrBlob);
      blob = await res.blob();
    }

    const mimeType = blob.type || (filename.endsWith(".gif") ? "image/gif" : "image/jpeg");
    const file = new File([blob], filename, { type: mimeType });

    // 2. iOS Safari & Android Web Share API (native "Save Image to Photos" sheet)
    if (
      typeof navigator !== "undefined" &&
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({
          files: [file],
          title: title,
          text: "Hasil foto Optik I See You 🕶️",
        });
        return { success: true, method: "share" };
      } catch (shareErr) {
        // User cancelled share sheet or share failed — fall back to download
        if ((shareErr as Error)?.name === "AbortError") {
          return { success: false, method: "share" };
        }
      }
    }

    // 3. Desktop / Standard Download fallback
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 10000);

    return { success: true, method: "download" };
  } catch (err) {
    console.warn("Direct download/share failed, fallback to new tab preview:", err);
    // 4. Ultimate Fallback: Open in new window/tab so user can long-press to save
    const win = window.open(dataUrlOrBlob, "_blank");
    if (!win) {
      window.location.href = dataUrlOrBlob;
    }
    return { success: true, method: "preview" };
  }
}
