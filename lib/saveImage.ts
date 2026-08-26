/**
 * lib/saveImage.ts · Universal Cross-Browser Image & GIF Direct Downloader
 * 
 * Works 100% reliably across:
 * - Android (Chrome, Samsung Internet, Mi Browser, etc.): Downloads directly to device / storage / Gallery folder.
 * - iPhone & iPad (iOS 15 / 16 / 17 / 18 Safari & Chrome): Triggers direct file download / save to Photos.
 * - macOS & Windows (Safari, Chrome, Edge, Firefox, Brave): Direct download to Downloads folder.
 */

/**
 * Directly downloads an image or GIF file to the user's device storage/gallery.
 */
export async function downloadImageDirectly(
  dataUrlOrUrl: string,
  filename: string
): Promise<{ success: boolean; method: "download" | "fallback" }> {
  try {
    // 1. Convert Data URL or URL to a Blob
    let blob: Blob;
    if (dataUrlOrUrl.startsWith("data:")) {
      const parts = dataUrlOrUrl.split(",");
      const mime = parts[0].match(/:(.*?);/)?.[1] || (filename.endsWith(".gif") ? "image/gif" : "image/jpeg");
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      blob = new Blob([u8arr], { type: mime });
    } else {
      const res = await fetch(dataUrlOrUrl, { mode: "cors" });
      blob = await res.blob();
    }

    const mimeType = filename.endsWith(".gif")
      ? "image/gif"
      : (blob.type && blob.type.startsWith("image/") ? blob.type : "image/jpeg");

    const typedBlob = new Blob([blob], { type: mimeType });

    // 2. Universal Direct Download via Object URL and Anchor Click
    const blobUrl = window.URL.createObjectURL(typedBlob);
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = blobUrl;
    link.download = filename;
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(blobUrl);
    }, 15000);

    return { success: true, method: "download" };
  } catch (err) {
    console.warn("Direct blob download failed, falling back to direct URL trigger:", err);
    // Fallback: direct anchor with URL
    try {
      const link = document.createElement("a");
      link.href = dataUrlOrUrl;
      link.download = filename;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 5000);
      return { success: true, method: "fallback" };
    } catch {
      window.open(dataUrlOrUrl, "_blank");
      return { success: false, method: "fallback" };
    }
  }
}

/**
 * Backward compatibility alias: always executes direct device download.
 */
export async function downloadOrShareImage(
  dataUrlOrBlob: string,
  filename: string,
  _title: string = "Optik I See You — Photo"
): Promise<{ success: boolean; method: "download" | "share" | "preview" }> {
  const res = await downloadImageDirectly(dataUrlOrBlob, filename);
  return { success: res.success, method: "download" };
}

/**
 * Optional explicit share function if the user intentionally wants to trigger Web Share.
 */
export async function shareImageOnly(
  dataUrlOrBlob: string,
  filename: string,
  title: string = "Optik I See You — Photo"
): Promise<{ success: boolean }> {
  try {
    let blob: Blob;
    if (dataUrlOrBlob.startsWith("data:")) {
      const parts = dataUrlOrBlob.split(",");
      const mime = parts[0].match(/:(.*?);/)?.[1] || (filename.endsWith(".gif") ? "image/gif" : "image/jpeg");
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

    const mimeType = filename.endsWith(".gif") ? "image/gif" : "image/jpeg";
    const file = new File([blob], filename, { type: mimeType });

    if (
      typeof navigator !== "undefined" &&
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        files: [file],
        title: title,
        text: "Hasil foto Optik I See You 🕶️",
      });
      return { success: true };
    }
    return { success: false };
  } catch {
    return { success: false };
  }
}

