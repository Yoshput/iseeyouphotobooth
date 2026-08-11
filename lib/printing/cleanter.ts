/**
 * lib/printing/cleanter.ts
 *
 * Cleanter Android Local Print Bridge Adapter for ESC/POS Thermal 80mm Printers (IWARE XS-80BT).
 * Communicates via client-side HTTP POST to Cleanter local bridge (default http://localhost:9100/print).
 *
 * Supports Android Tablet Chrome, MacBook Safari/Chrome, and iPhone/iPad via Local / Wi-Fi IP Bridge.
 * 100% Client-Side & Static Export Compatible.
 */

import { processImageForThermal } from "../qzPrint";

export interface CleanterPrintOptions {
  hostUrl?: string; // Default: "http://localhost:9100/print"
  timeoutMs?: number; // Default: 8000ms
  autoCut?: boolean; // Default: true
}

export interface CleanterStatus {
  isAvailable: boolean;
  message: string;
}

const DEFAULT_CLEANTER_ENDPOINT = "http://localhost:9100/print";
const DEFAULT_TIMEOUT_MS = 8000;

// Track last executed jobId to prevent duplicate printing on safe retries
let lastPrintedJobId = "";

/**
 * Normalizes host URL to ensure valid http:// or https:// scheme and /print path.
 */
export function getCleanterEndpoint(customHost?: string): string {
  if (!customHost || !customHost.trim()) {
    return DEFAULT_CLEANTER_ENDPOINT;
  }
  let host = customHost.trim();
  if (!/^https?:\/\//i.test(host)) {
    host = `http://${host}`;
  }
  if (!host.endsWith("/print")) {
    host = host.replace(/\/+$/, "") + "/print";
  }
  return host;
}

/**
 * Checks if Cleanter Print Bridge service is active and reachable.
 */
export async function checkCleanterConnection(
  customHost?: string,
  timeoutMs: number = 3000
): Promise<CleanterStatus> {
  const endpoint = getCleanterEndpoint(customHost);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Ping Cleanter endpoint with lightweight OPTIONS/POST
    const response = await fetch(endpoint, {
      method: "OPTIONS",
      signal: controller.signal,
    }).catch(async () => {
      // Fallback ping POST test if OPTIONS is blocked
      return await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ping: true }),
        signal: controller.signal,
      });
    });

    clearTimeout(timeoutId);

    if (response.ok || response.status === 400 || response.status === 405 || response.status === 200) {
      return {
        isAvailable: true,
        message: "Cleanter Print Bridge siap (Terkoneksi ke IWARE XS-80BT)",
      };
    }

    return {
      isAvailable: false,
      message: `Cleanter tidak merespon (Status: ${response.status}). Pastikan app Cleanter berjalan.`,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const isAborted = err instanceof Error && err.name === "AbortError";
    return {
      isAvailable: false,
      message: isAborted
        ? "Koneksi ke Cleanter timeout (3 dtk). Buka & jalankan app Cleanter di Android."
        : "Aplikasi Cleanter tidak terdeteksi di tablet. Pastikan app Cleanter aktif di http://localhost:9100",
    };
  }
}

/**
 * Converts 1-bit dithered image data URL to ESC/POS raster commands with Auto Cut.
 */
export async function generateEscPosRasterPayload(
  imageDataUrl: string,
  autoCut: boolean = true
): Promise<string> {
  // 1. Process image to 1-bit Floyd-Steinberg dithered (576px width for 80mm printable area)
  const ditheredDataUrl = await processImageForThermal(imageDataUrl, 576);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const w = img.width;
      const h = img.height;

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context null"));

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h).data;

      const bytesPerRow = Math.ceil(w / 8);
      const headerSize = 8;
      const imageBytesSize = bytesPerRow * h;
      const cutSize = autoCut ? 7 : 3;

      const buffer = new Uint8Array(headerSize + imageBytesSize + cutSize);

      // GS v 0 (Raster bit image command: 0x1D 0x76 0x30 0x00)
      buffer[0] = 0x1d;
      buffer[1] = 0x76;
      buffer[2] = 0x30;
      buffer[3] = 0x00;
      buffer[4] = bytesPerRow & 0xff;
      buffer[5] = (bytesPerRow >> 8) & 0xff;
      buffer[6] = h & 0xff;
      buffer[7] = (h >> 8) & 0xff;

      let offset = headerSize;
      for (let y = 0; y < h; y++) {
        for (let byteIdx = 0; byteIdx < bytesPerRow; byteIdx++) {
          let byteVal = 0;
          for (let bit = 0; bit < 8; bit++) {
            const x = byteIdx * 8 + bit;
            if (x < w) {
              const pIdx = (y * w + x) * 4;
              const isBlack = imgData[pIdx] < 128;
              if (isBlack) {
                byteVal |= 1 << (7 - bit);
              }
            }
          }
          buffer[offset++] = byteVal;
        }
      }

      // ESC d 5 (feed 5 lines)
      buffer[offset++] = 0x1b;
      buffer[offset++] = 0x64;
      buffer[offset++] = 0x05;

      // GS V 65 0 (full paper cut)
      if (autoCut) {
        buffer[offset++] = 0x1d;
        buffer[offset++] = 0x56;
        buffer[offset++] = 0x41;
        buffer[offset++] = 0x00;
      }

      // Convert Uint8Array to Binary Base64 payload for Cleanter
      let binary = "";
      const len = buffer.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(buffer[i]);
      }
      const base64Payload = btoa(binary);

      resolve(base64Payload);
    };

    img.onerror = (err) => reject(err);
    img.src = ditheredDataUrl;
  });
}

/**
 * Sends photobooth receipt print job to Cleanter Android Print Bridge.
 */
export async function printPhotoboothReceipt(
  imageDataUrl: string,
  options: CleanterPrintOptions = {}
): Promise<{ success: boolean; message: string }> {
  const endpoint = getCleanterEndpoint(options.hostUrl);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const autoCut = options.autoCut ?? true;

  // Prevent duplicate print execution on quick accidental double-clicks
  const jobId = `${Date.now()}_${imageDataUrl.slice(-20)}`;
  if (jobId === lastPrintedJobId) {
    return {
      success: false,
      message: "Permintaan cetak sedang diproses. Mohon tunggu sejenak.",
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // 1. Process photo strip into dithered ESC/POS payload
    const escPosBase64 = await generateEscPosRasterPayload(imageDataUrl, autoCut);

    // 2. Send payload to Cleanter print bridge
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: escPosBase64,
        type: "base64",
        printer: "IWARE XS-80BT",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok || response.status === 200) {
      lastPrintedJobId = jobId;
      return {
        success: true,
        message: "Struk foto strip berhasil dicetak ke IWARE XS-80BT!",
      };
    }

    const resText = await response.text().catch(() => "");
    return {
      success: false,
      message: `Cleanter menolak cetak (${response.status}): ${resText || "Periksa koneksi Bluetooth printer."}`,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const isAborted = err instanceof Error && err.name === "AbortError";

    if (isAborted) {
      return {
        success: false,
        message:
          "Cetak timeout. Pastikan printer IWARE XS-80BT menyala dan terhubung di app Cleanter.",
      };
    }

    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes("Failed to fetch") || errMsg.includes("NetworkError")) {
      return {
        success: false,
        message:
          "Tidak dapat terhubung ke Cleanter (http://localhost:9100). Buka & jalankan app Cleanter di tablet Android kamu.",
      };
    }

    return {
      success: false,
      message: `Gagal mencetak: ${errMsg}`,
    };
  }
}

/**
 * Sends a lightweight Test Print receipt to verify IWARE XS-80BT functionality before an event.
 */
export async function printTestReceipt(
  options: CleanterPrintOptions = {}
): Promise<{ success: boolean; message: string }> {
  const endpoint = getCleanterEndpoint(options.hostUrl);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    // Generate simple ESC/POS text test receipt payload
    const testText =
      "\x1B\x40" + // ESC @ (Initialize printer)
      "\x1B\x61\x01" + // Align center
      "\x1B\x45\x01" + // Bold on
      "================================\n" +
      "OPTIK I SEE YOU PHOTOBOOTH\n" +
      "PRINTER TEST OK!\n" +
      "================================\n" +
      "\x1B\x45\x00" + // Bold off
      "Printer : IWARE XS-80BT (80mm)\n" +
      "Status  : CLEANTER BRIDGE OK\n" +
      "Waktu   : " +
      new Date().toLocaleString("id-ID") +
      "\n\n\n\n" +
      "\x1B\x64\x04" + // ESC d 4 (feed 4 lines)
      "\x1D\x56\x41\x00"; // GS V 65 0 (auto cut)

    const base64Text = btoa(testText);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: base64Text,
        type: "base64",
        printer: "IWARE XS-80BT",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok || response.status === 200) {
      return {
        success: true,
        message: "Tes print berhasil! Printer IWARE XS-80BT siap digunakan.",
      };
    }

    return {
      success: false,
      message: "Gagal tes print. Pastikan printer terhubung di app Cleanter.",
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      success: false,
      message:
        "Cleanter bridge tidak terdeteksi. Buka app Cleanter di tablet Android.",
    };
  }
}
