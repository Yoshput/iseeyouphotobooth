/**
 * lib/printing/cleanter.ts
 *
 * Cleanter Android Local Print Bridge Adapter for ESC/POS Thermal 80mm Printers (IWARE XS-80BT).
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
 * Supports Android Tablet Chrome, MacBook Safari/Chrome, and iPhone/iPad via Local / Wi-Fi IP Bridge.
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

const DEFAULT_CLEANTER_ENDPOINT = "http://localhost:9100/print";
const DEFAULT_TIMEOUT_MS = 10000;

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
    const response = await fetch(endpoint, {
      method: "OPTIONS",
      signal: controller.signal,
    }).catch(async () => {
      // Fallback ping POST test if OPTIONS is blocked
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
 * Sends photobooth receipt print job to Cleanter Android Print Bridge.
 * Uses official Cleanter JSON schema: { "commands": [ { "type": "image", ... }, { "type": "feed" }, { "type": "cut" } ] }
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

    if (response.ok || response.status === 200) {
      lastPrintedJobId = jobId;
      return {
        success: true,
        message: "Struk foto strip berhasil dicetak ke IWARE XS-80BT!",
      };
    }

    // Actionable Error Handling for HTTP 400 Bad Request / Cleanter rejection
    if (response.status === 400) {
      const errText = await response.text().catch(() => "");
      console.error("Cleanter Bad Request 400:", errText);
      return {
        success: false,
        message:
          "Cleanter menolak format cetak (Error 400). Pastikan aplikasi Cleanter di Android sudah terhubung ke printer IWARE XS-80BT.",
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
            "Printer : IWARE XS-80BT (80mm)\n" +
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

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok || response.status === 200) {
      return {
        success: true,
        message: "Tes print berhasil! Printer IWARE XS-80BT siap digunakan.",
      };
    }

    if (response.status === 400) {
      return {
        success: false,
        message: "Cleanter menolak format tes print (400). Pastikan printer IWARE XS-80BT terhubung di app Cleanter.",
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
