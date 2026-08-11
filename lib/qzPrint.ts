/**
 * lib/qzPrint.ts
 *
 * QZ Tray Integration & ESC/POS 80mm Thermal Printer Image Compositor with Floyd-Steinberg Dithering.
 * Supports Bluetooth Classic SPP (Virtual COM Port) & Windows Spooler Thermal Printers.
 *
 * 100% Client-Side & Static Export Compatible.
 */

import qz from "qz-tray";

export interface QZPrintStatus {
  isConnected: boolean;
  printers: string[];
  error?: string;
}

/**
 * Memastikan WebSocket QZ Tray lokal terhubung.
 */
export async function connectQZTray(): Promise<boolean> {
  try {
    if (qz.websocket.isActive()) {
      return true;
    }

    // Set SHA-256 promise override jika QZ Tray dalam mode unsigned
    qz.api.setPromiseType((promise: (resolve: (val?: unknown) => void, reject: (err?: unknown) => void) => void) =>
      new Promise(promise)
    );

    await qz.websocket.connect({ retries: 2, delay: 1 });
    return true;
  } catch (err) {
    console.warn("QZ Tray connection failed:", err);
    return false;
  }
}

/**
 * Mengambil daftar printer yang terdeteksi di Windows / QZ Tray.
 */
export async function fetchQZPrinters(): Promise<string[]> {
  const connected = await connectQZTray();
  if (!connected) {
    throw new Error(
      "Tidak dapat terhubung ke QZ Tray. Pastikan aplikasi QZ Tray sudah berjalan di komputer ini."
    );
  }

  const printerList = await qz.printers.find();
  if (Array.isArray(printerList)) {
    return printerList.map((p) => String(p));
  } else if (typeof printerList === "string") {
    return [printerList];
  }
  return [];
}

/**
 * Mengolah gambar (dataURL) menjadi Hitam-Putih 1-bit dengan Floyd-Steinberg Dithering
 * dan me-resize ke lebar printable area printer 80mm (576 piksel).
 */
export async function processImageForThermal(
  imageDataUrl: string,
  targetWidth: number = 576
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const scale = targetWidth / img.width;
      const targetHeight = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return reject(new Error("Gagal menginisialisasi canvas context"));
      }

      // 1. Draw image with clean white background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // 2. Extract RGBA pixel data
      const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const data = imgData.data;
      const w = targetWidth;
      const h = targetHeight;

      // 3. Convert to Grayscale array (float 0-255)
      const gray = new Float32Array(w * h);
      for (let i = 0; i < data.length; i += 4) {
        // Luminance formula
        gray[i / 4] =
          0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }

      // 4. Apply Floyd-Steinberg Dithering Algorithm
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = y * w + x;
          const oldPixel = gray[idx];
          const newPixel = oldPixel < 128 ? 0 : 255;
          gray[idx] = newPixel;

          const error = oldPixel - newPixel;

          if (x + 1 < w) gray[idx + 1] += error * (7 / 16);
          if (y + 1 < h) {
            if (x > 0) gray[idx + w - 1] += error * (3 / 16);
            gray[idx + w] += error * (5 / 16);
            if (x + 1 < w) gray[idx + w + 1] += error * (1 / 16);
          }
        }
      }

      // 5. Write back 1-bit dithered pixels to Canvas
      for (let i = 0; i < gray.length; i++) {
        const val = gray[i] < 128 ? 0 : 255;
        const p = i * 4;
        data[p] = val;
        data[p + 1] = val;
        data[p + 2] = val;
        data[p + 3] = 255;
      }

      ctx.putImageData(imgData, 0, 0);

      // Return processed base64 PNG
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = (err) => reject(err);
    img.src = imageDataUrl;
  });
}

/**
 * Mencetak gambar Photo Strip ke Thermal Receipt Printer 80mm via QZ Tray.
 */
export async function printPhotoStripQZ(
  imageDataUrl: string,
  printerName: string
): Promise<{ success: boolean; message: string }> {
  try {
    const connected = await connectQZTray();
    if (!connected) {
      return {
        success: false,
        message:
          "Tidak dapat terhubung ke QZ Tray. Pastikan QZ Tray sudah berjalan di komputer.",
      };
    }

    // 1. Convert photo strip to dithered 1-bit thermal image (576px width for 80mm)
    const ditheredDataUrl = await processImageForThermal(imageDataUrl, 576);

    // Clean base64 string
    const base64Data = ditheredDataUrl.replace(/^data:image\/\w+;base64,/, "");

    // 2. Create QZ Tray Printer Configuration
    const config = qz.configs.create(printerName, {
      rasterize: true,
      scaleContent: false,
    });

    // 3. Print Data Payload (Pixel Image + ESC/POS Feed & Cut commands as valid JSONObjects)
    const printData = [
      {
        type: "pixel",
        format: "image",
        flavor: "base64",
        data: base64Data,
        options: {
          language: "ESCPOS",
          dotDensity: "double",
        },
      },
      {
        type: "raw",
        format: "command",
        flavor: "hex",
        data: "1B64051D564100", // ESC d 5 (feed 5 lines) + GS V 65 0 (paper cut) in HEX
      },
    ];

    await qz.print(config, printData);

    return {
      success: true,
      message: `Foto strip berhasil dicetak di printer "${printerName}"!`,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("Print Photo Strip Error:", err);
    return {
      success: false,
      message: `Gagal mencetak: ${errMsg}`,
    };
  }
}
