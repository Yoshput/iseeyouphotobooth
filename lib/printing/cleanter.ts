/**
 * lib/printing/cleanter.ts
 *
 * Cleanter Android Local Print Bridge Adapter — Official API Schema.
 * Documentation: https://cleanter.cleancode.id/
 *
 * Official PrintJob schema:
 * POST http://localhost:9100/print
 * {
 *   "content": [
 *     { "type": "image", "base64": "<pure base64, NO data-url prefix>", "align": "center", "dither": true },
 *     { "type": "text", "value": "..." },
 *     { "type": "feed", "lines": 3 }
 *   ],
 *   "cut": true,
 *   "paperWidth": 80
 * }
 *
 * Health check: GET http://localhost:9100/health
 *
 * 100% Client-Side & Static Export Compatible.
 */

import { processImageForThermal } from "../qzPrint";

export interface CleanterPrintOptions {
  hostUrl?: string;     // Base host, e.g. "http://192.168.1.10:9100" (default: "http://localhost:9100")
  timeoutMs?: number;   // Default: 10000ms
  autoCut?: boolean;    // Default: true
}

export interface CleanterStatus {
  isAvailable: boolean;
  message: string;
  detail?: string;
}

// Official Cleanter content block types
export type CleanterContentBlock =
  | { type: "image"; base64: string; align?: "left" | "center" | "right"; dither?: boolean }
  | { type: "text"; value: string; align?: "left" | "center" | "right"; bold?: boolean }
  | { type: "feed"; lines: number }
  | { type: "barcode"; value: string; format?: string }
  | { type: "qr"; value: string };

// Official Cleanter PrintJob top-level body
export interface CleanterPrintJob {
  content: CleanterContentBlock[];
  cut?: boolean;
  paperWidth?: number;
  printer?: string;
}

export interface CleanterResult {
  success: boolean;
  message: string;
  detail?: string;
  requestPayload?: string;
}

const DEFAULT_BRIDGE_HOST = "http://localhost:9100";
const DEFAULT_TIMEOUT_MS = 10000;

let lastPrintedJobId = "";

/**
 * Resolves the Cleanter bridge base host from an optional custom host string.
 * Strips trailing slashes; does NOT add "/print" or "/health" — callers append that.
 */
export function getCleanterBaseHost(customHost?: string): string {
  if (!customHost || !customHost.trim()) return DEFAULT_BRIDGE_HOST;
  let host = customHost.trim();
  // Remove /print or /health suffix if user accidentally included it
  host = host.replace(/\/(print|health)\/?$/, "");
  // Remove trailing slashes
  host = host.replace(/\/+$/, "");
  // Ensure protocol
  if (!/^https?:\/\//i.test(host)) host = `http://${host}`;
  return host;
}

/**
 * Strips the data-URL prefix from a base64 string.
 * e.g. "data:image/png;base64,iVBOR..." → "iVBOR..."
 * If already pure base64, returns as-is.
 */
function stripDataUrlPrefix(dataUrl: string): string {
  const commaIdx = dataUrl.indexOf(",");
  if (commaIdx !== -1) return dataUrl.slice(commaIdx + 1);
  return dataUrl;
}

/**
 * Official: checks if Cleanter bridge is alive via GET /health.
 */
export async function checkCleanterConnection(
  customHost?: string,
  timeoutMs: number = 3000
): Promise<CleanterStatus> {
  const host = getCleanterBaseHost(customHost);
  const endpoint = `${host}/health`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        isAvailable: true,
        message: "Cleanter Print Bridge siap (Terkoneksi ke Printer)",
      };
    }

    return {
      isAvailable: false,
      message: `Cleanter merespon tapi tidak siap (Status: ${response.status}).`,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const isAborted = err instanceof Error && err.name === "AbortError";
    return {
      isAvailable: false,
      message: isAborted
        ? "Koneksi ke Cleanter timeout. Buka & jalankan app Cleanter di Android."
        : "Aplikasi Cleanter tidak terdeteksi. Pastikan app Cleanter aktif di port 9100.",
    };
  }
}

/**
 * Official: sends a print job to Cleanter bridge via POST /print.
 * Uses { "content": [...], "cut": true, "paperWidth": 80 } schema.
 */
export async function printReceipt(
  content: CleanterContentBlock[],
  options: CleanterPrintOptions = {}
): Promise<void> {
  const host = getCleanterBaseHost(options.hostUrl);
  const endpoint = `${host}/print`;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const autoCut = options.autoCut ?? true;

  const payload: CleanterPrintJob = {
    content,
    cut: autoCut,
    paperWidth: 80,
  };

  const payloadStr = JSON.stringify(payload);

  console.log("==========================================");
  console.log("🚀 [CLEANTER REQUEST POST]:", endpoint);
  console.log("📦 [CLEANTER REQUEST BODY]:", JSON.stringify(payload, (k, v) =>
    k === "base64" && typeof v === "string" && v.length > 80
      ? v.slice(0, 80) + `...(${v.length} chars total)`
      : v
  , 2));
  console.log("==========================================");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payloadStr,
    signal: AbortSignal.timeout(timeoutMs),
  });

  const resText = await res.text().catch(() => "");
  console.log("==========================================");
  console.log("📥 [CLEANTER RESPONSE STATUS]:", res.status, res.statusText);
  console.log("📄 [CLEANTER RESPONSE BODY]:", resText);
  console.log("==========================================");

  if (!res.ok) {
    let detail = resText;
    try {
      const json = JSON.parse(resText);
      detail = json.detail ?? json.message ?? resText;
    } catch { /* not JSON */ }
    throw new Error(`Print failed: ${res.status} ${detail}`);
  }
}

/**
 * Sends photobooth photo strip print job to Cleanter.
 * Processes imageDataUrl → 1-bit dithered PNG 80mm (576px) → strips data-URL prefix → sends as image block.
 */
export async function printPhotoboothReceipt(
  imageDataUrl: string,
  options: CleanterPrintOptions = {}
): Promise<CleanterResult> {
  const jobId = `${Date.now()}_${imageDataUrl.slice(-20)}`;
  if (jobId === lastPrintedJobId) {
    return { success: false, message: "Permintaan cetak sedang diproses. Mohon tunggu sejenak." };
  }

  try {
    // 1. Convert photo to 1-bit Floyd-Steinberg dithered PNG at 576px width (80mm)
    const ditheredDataUrl = await processImageForThermal(imageDataUrl, 576);

    // 2. Strip the data-URL prefix — Cleanter requires PURE base64 only
    const pureBase64 = stripDataUrlPrefix(ditheredDataUrl);

    // 3. Build content array per official Cleanter schema
    const content: CleanterContentBlock[] = [
      {
        type: "image",
        base64: pureBase64,    // ← pure base64, no "data:image/png;base64," prefix
        align: "center",
        dither: true,
      },
      {
        type: "feed",
        lines: 3,
      },
    ];

    // 4. Send to Cleanter
    await printReceipt(content, options);

    lastPrintedJobId = jobId;
    return {
      success: true,
      message: "Struk foto strip berhasil dicetak!",
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);

    if (errMsg.includes("AbortError") || errMsg.includes("timeout")) {
      return {
        success: false,
        message: "Cetak timeout. Pastikan printer menyala dan terhubung di app Cleanter.",
        detail: errMsg,
      };
    }
    if (errMsg.includes("Failed to fetch") || errMsg.includes("NetworkError")) {
      return {
        success: false,
        message: "Tidak dapat terhubung ke Cleanter (localhost:9100). Buka app Cleanter di Android.",
        detail: errMsg,
      };
    }

    return {
      success: false,
      message: `Gagal mencetak: ${errMsg.replace("Print failed: ", "")}`,
      detail: errMsg,
    };
  }
}

/**
 * Test print — verifies IWARE XS-80BT / RPP02N functionality before an event.
 */
export async function printTestReceipt(
  options: CleanterPrintOptions = {}
): Promise<CleanterResult> {
  const dateStr = new Date().toLocaleString("id-ID");

  const content: CleanterContentBlock[] = [
    {
      type: "text",
      value: "================================\n",
      align: "center",
    },
    {
      type: "text",
      value: "  OPTIK I SEE YOU PHOTOBOOTH  \n",
      align: "center",
      bold: true,
    },
    {
      type: "text",
      value: "       PRINTER TEST OK!       \n",
      align: "center",
      bold: true,
    },
    {
      type: "text",
      value: "================================\n",
      align: "center",
    },
    {
      type: "text",
      value: `Printer : RPP02N / IWARE XS-80BT\nStatus  : CLEANTER BRIDGE READY\nWaktu   : ${dateStr}\n`,
    },
    {
      type: "feed",
      lines: 3,
    },
  ];

  try {
    await printReceipt(content, options);
    return { success: true, message: "Tes print berhasil! Printer siap digunakan." };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Tes print gagal: ${errMsg.replace("Print failed: ", "")}`,
      detail: errMsg,
    };
  }
}
