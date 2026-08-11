/**
 * lib/printing/cleanter.ts
 *
 * Cleanter Android Local Print Bridge Adapter for ESC/POS Thermal 80mm Printers (IWARE XS-80BT / RPP02N).
 * Communicates via client-side HTTP POST to Cleanter local bridge (default http://localhost:9100/print).
 *
 * Cleanter PrintJob Request Schema:
 * {
 *   "commands": [
 *     { "type": "image", "value": "data:image/png;base64,..." },
 *     { "type": "feed", "lines": 3 },
 *     { "type": "cut" }
 *   ]
 * }
 *
 * 100% Client-Side & Static Export Compatible.
 */

import { processImageForThermal } from "../qzPrint";

export interface CleanterPrintOptions {
  hostUrl?: string; // Default: "http://localhost:9100/print"
  timeoutMs?: number; // Default: 10000ms
  autoCut?: boolean; // Default: true
}

export interface CleanterStatus {
  isAvailable: boolean;
  message: string;
  detail?: string;
}

export type CleanterCommand =
  | { type: "image"; value: string }
  | { type: "text"; value: string }
  | { type: "feed"; lines: number }
  | { type: "cut" }
  | { type: "raw"; value: string };

export interface CleanterPrintJob {
  commands: CleanterCommand[];
}

export interface CleanterResult {
  success: boolean;
  message: string;
  detail?: string;
  requestPayload?: string;
}

const DEFAULT_CLEANTER_ENDPOINT = "http://localhost:9100/print";
const DEFAULT_TIMEOUT_MS = 10000;

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
    const response = await fetch(endpoint, {
      method: "OPTIONS",
      signal: controller.signal,
    }).catch(async () => {
      return await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commands: [] }),
        signal: controller.signal,
      });
    });

    clearTimeout(timeoutId);

    if (response.ok || response.status === 400 || response.status === 405 || response.status === 200) {
      return {
        isAvailable: true,
        message: "Cleanter Print Bridge siap (Terkoneksi ke Printer)",
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
 * Sends photobooth receipt print job to Cleanter Android Print Bridge.
 * Logs full request & response bodies to browser console for debugging.
 */
export async function printPhotoboothReceipt(
  imageDataUrl: string,
  options: CleanterPrintOptions = {}
): Promise<CleanterResult> {
  const endpoint = getCleanterEndpoint(options.hostUrl);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const autoCut = options.autoCut ?? true;

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
    // 1. Process photo strip into 1-bit Floyd-Steinberg dithered PNG (576px width for 80mm thermal paper)
    const ditheredDataUrl = await processImageForThermal(imageDataUrl, 576);

    // 2. Build official Cleanter PrintJob command list
    const commands: CleanterCommand[] = [
      {
        type: "image",
        value: ditheredDataUrl,
      },
      {
        type: "feed",
        lines: 3,
      },
    ];

    if (autoCut) {
      commands.push({ type: "cut" });
    }

    const payload: CleanterPrintJob = { commands };
    const payloadJsonStr = JSON.stringify(payload, null, 2);

    // LOG FULL REQUEST TO BROWSER CONSOLE
    console.log("==========================================");
    console.log("🚀 [CLEANTER REQUEST POST]:", endpoint);
    console.log("📦 [CLEANTER REQUEST BODY]:\n", payloadJsonStr);
    console.log("==========================================");

    // 3. Send payload to Cleanter print bridge
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const resText = await response.text().catch(() => "");

    // LOG FULL RESPONSE TO BROWSER CONSOLE
    console.log("==========================================");
    console.log("📥 [CLEANTER RESPONSE STATUS]:", response.status, response.statusText);
    console.log("📄 [CLEANTER RESPONSE BODY]:\n", resText);
    console.log("==========================================");

    if (response.ok || response.status === 200) {
      lastPrintedJobId = jobId;
      return {
        success: true,
        message: "Struk foto strip berhasil dicetak!",
        detail: resText,
        requestPayload: payloadJsonStr,
      };
    }

    return {
      success: false,
      message: `Cleanter menolak cetak (Status HTTP ${response.status}).`,
      detail: resText || `HTTP Status Code ${response.status}`,
      requestPayload: payloadJsonStr,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const isAborted = err instanceof Error && err.name === "AbortError";

    if (isAborted) {
      return {
        success: false,
        message: "Cetak timeout. Pastikan printer menyala dan terhubung di app Cleanter.",
        detail: "AbortError: Request timeout setelah " + timeoutMs + "ms",
      };
    }

    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("❌ [CLEANTER PRINT ERROR]:", err);

    return {
      success: false,
      message: `Gagal mencetak: ${errMsg}`,
      detail: errMsg,
    };
  }
}

/**
 * Sends a lightweight Test Print receipt to verify functionality before an event.
 * Logs full request & response bodies to browser console.
 */
export async function printTestReceipt(
  options: CleanterPrintOptions = {}
): Promise<CleanterResult> {
  const endpoint = getCleanterEndpoint(options.hostUrl);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const dateStr = new Date().toLocaleString("id-ID");

    const payload: CleanterPrintJob = {
      commands: [
        {
          type: "text",
          value:
            "================================\n" +
            "   OPTIK I SEE YOU PHOTOBOOTH   \n" +
            "        PRINTER TEST OK!        \n" +
            "================================\n",
        },
        {
          type: "text",
          value:
            "Printer : IWARE XS-80BT / RPP02N\n" +
            "Status  : CLEANTER BRIDGE READY\n" +
            "Waktu   : " +
            dateStr +
            "\n",
        },
        {
          type: "feed",
          lines: 3,
        },
        {
          type: "cut",
        },
      ],
    };

    const payloadJsonStr = JSON.stringify(payload, null, 2);

    console.log("==========================================");
    console.log("🚀 [CLEANTER TEST PRINT REQUEST]:", endpoint);
    console.log("📦 [CLEANTER TEST PRINT BODY]:\n", payloadJsonStr);
    console.log("==========================================");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const resText = await response.text().catch(() => "");

    console.log("==========================================");
    console.log("📥 [CLEANTER TEST PRINT RESPONSE STATUS]:", response.status);
    console.log("📄 [CLEANTER TEST PRINT RESPONSE BODY]:\n", resText);
    console.log("==========================================");

    if (response.ok || response.status === 200) {
      return {
        success: true,
        message: "Tes print berhasil! Printer siap digunakan.",
        detail: resText,
        requestPayload: payloadJsonStr,
      };
    }

    return {
      success: false,
      message: `Cleanter menolak tes print (HTTP ${response.status}).`,
      detail: resText || `HTTP Status ${response.status}`,
      requestPayload: payloadJsonStr,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: "Cleanter bridge tidak terdeteksi.",
      detail: errMsg,
    };
  }
}
