/**
 * lib/webBluetoothPrint.ts
 *
 * Direct Web Bluetooth ESC/POS Thermal Printing for Android Chrome / Mobile Browsers.
 * Allows Android Tablets & Mobile Phones to connect directly to Bluetooth thermal printers
 * (like RPP02N) without needing a PC/Laptop or QZ Tray.
 */

import { processImageForThermal } from "./qzPrint";

// Standard Serial Port Profile (SPP) UUID for ESC/POS Bluetooth printers
const SPP_UUID = "00001101-0000-1000-8000-00805f9b34fb";

export async function isWebBluetoothSupported(): Promise<boolean> {
  return (
    typeof navigator !== "undefined" &&
    "bluetooth" in navigator &&
    typeof (navigator as any).bluetooth?.requestDevice === "function"
  );
}

/**
 * Direct Web Bluetooth ESC/POS Print for Android Chrome / Mobile Tablets.
 */
export async function printPhotoStripWebBluetooth(
  imageDataUrl: string
): Promise<{ success: boolean; message: string }> {
  try {
    const nav = navigator as any;
    if (!nav.bluetooth) {
      return {
        success: false,
        message:
          "Web Bluetooth tidak didukung di browser ini. Gunakan Google Chrome di Android Tablet.",
      };
    }

    // 1. Request Bluetooth Device (Filter for Serial Printers or Accept All Devices)
    const device = await nav.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [SPP_UUID, "000018f0-0000-1000-8000-00805f9b34fb"],
    });

    if (!device || !device.gatt) {
      return { success: false, message: "Koneksi Bluetooth dibatalkan." };
    }

    // 2. Connect to GATT Server
    const server = await device.gatt.connect();

    // 3. Get Serial Service & Characteristic
    let characteristic: any = null;
    const services = await server.getPrimaryServices();

    for (const service of services) {
      const characteristics = await service.getCharacteristics();
      for (const char of characteristics) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          characteristic = char;
          break;
        }
      }
      if (characteristic) break;
    }

    if (!characteristic) {
      return {
        success: false,
        message: "Karakteristik Bluetooth Writable tidak ditemukan pada printer.",
      };
    }

    // 4. Process Image with 1-bit Dithering (576px / 80mm)
    const ditheredDataUrl = await processImageForThermal(imageDataUrl, 576);

    // Convert Base64 image to Raw ESC/POS bytes
    const bytes = await ditheredToEscPosBytes(ditheredDataUrl);

    // 5. Send Chunked Bytes via Bluetooth GATT Characteristic
    const chunkSize = 100; // Safe BLE/Bluetooth SPP MTU chunk size
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      if (characteristic.properties.writeWithoutResponse) {
        await characteristic.writeValueWithoutResponse(chunk);
      } else {
        await characteristic.writeValue(chunk);
      }
      // Brief delay between BLE chunks to prevent buffer overflow
      await new Promise((r) => setTimeout(r, 20));
    }

    return {
      success: true,
      message: `Berhasil mencetak via Bluetooth ke printer "${device.name || "RPP02N"}"!`,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("Web Bluetooth Print Error:", err);
    return {
      success: false,
      message: `Gagal Bluetooth: ${errMsg}`,
    };
  }
}

/**
 * Converts 1-bit dithered PNG to ESC/POS Raster command bytes (GS v 0).
 */
async function ditheredToEscPosBytes(ditheredDataUrl: string): Promise<Uint8Array> {
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
      const commandHeaderSize = 8;
      const imageBytesSize = bytesPerRow * h;
      const feedCutSize = 8;

      const buffer = new Uint8Array(commandHeaderSize + imageBytesSize + feedCutSize);

      // GS v 0 (Raster bit image command: 0x1D 0x76 0x30 0x00)
      buffer[0] = 0x1d;
      buffer[1] = 0x76;
      buffer[2] = 0x30;
      buffer[3] = 0x00;
      buffer[4] = bytesPerRow & 0xff;
      buffer[5] = (bytesPerRow >> 8) & 0xff;
      buffer[6] = h & 0xff;
      buffer[7] = (h >> 8) & 0xff;

      let offset = commandHeaderSize;
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

      // ESC d 5 (feed 5 lines) + GS V 65 0 (full paper cut)
      buffer[offset++] = 0x1b;
      buffer[offset++] = 0x64;
      buffer[offset++] = 0x05;
      buffer[offset++] = 0x1d;
      buffer[offset++] = 0x56;
      buffer[offset++] = 0x41;
      buffer[offset++] = 0x00;

      resolve(buffer);
    };
    img.onerror = (err) => reject(err);
    img.src = ditheredDataUrl;
  });
}
