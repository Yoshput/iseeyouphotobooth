"use client";

import { useState, useEffect } from "react";
import {
  connectQZTray,
  fetchQZPrinters,
  printPhotoStripQZ,
} from "@/lib/qzPrint";
import {
  isWebBluetoothSupported,
  printPhotoStripWebBluetooth,
} from "@/lib/webBluetoothPrint";

interface ThermalPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageDataUrl: string;
}

export default function ThermalPrintModal({
  isOpen,
  onClose,
  imageDataUrl,
}: ThermalPrintModalProps) {
  const [printers, setPrinters] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("");
  const [loadingPrinters, setLoadingPrinters] = useState<boolean>(false);
  const [hasWebBluetooth, setHasWebBluetooth] = useState<boolean>(false);
  const [printStatus, setPrintStatus] = useState<
    "idle" | "connecting" | "processing" | "printing" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;

    // Check if Web Bluetooth API is supported (Android Chrome / Tablet)
    isWebBluetoothSupported().then(setHasWebBluetooth);

    // Load saved printer preference
    try {
      const saved = localStorage.getItem("isy_thermal_printer");
      if (saved) setSelectedPrinter(saved);
    } catch {
      // Ignore
    }

    const loadPrinters = async () => {
      setLoadingPrinters(true);
      setStatusMessage("Menghubungkan ke QZ Tray...");

      try {
        const list = await fetchQZPrinters();
        setPrinters(list);
        if (list.length > 0) {
          let saved = "";
          try {
            saved = localStorage.getItem("isy_thermal_printer") || "";
          } catch {
            // Ignore
          }

          // Ensure saved printer exists in list, otherwise select first available
          if (saved && list.includes(saved)) {
            setSelectedPrinter(saved);
          } else {
            const preferred =
              list.find(
                (p) =>
                  p.toLowerCase().includes("rpp") ||
                  p.toLowerCase().includes("pos") ||
                  p.toLowerCase().includes("thermal") ||
                  p.toLowerCase().includes("com")
              ) || list[0];
            setSelectedPrinter(preferred);
            try {
              localStorage.setItem("isy_thermal_printer", preferred);
            } catch {
              // Ignore
            }
          }
        }
        setPrintStatus("idle");
        setStatusMessage("");
      } catch (err) {
        setPrintStatus("error");
        setStatusMessage(
          err instanceof Error
            ? err.message
            : "QZ Tray belum berjalan di komputer ini."
        );
      } finally {
        setLoadingPrinters(false);
      }
    };

    loadPrinters();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPrinter = (printerName: string) => {
    setSelectedPrinter(printerName);
    try {
      localStorage.setItem("isy_thermal_printer", printerName);
    } catch {
      // Ignore
    }
  };

  const handlePrintQZ = async () => {
    if (!selectedPrinter) {
      setPrintStatus("error");
      setStatusMessage("Pilih printer thermal terlebih dahulu.");
      return;
    }

    setPrintStatus("processing");
    setStatusMessage("Memproses dither 1-bit ESC/POS (80mm)...");

    try {
      setPrintStatus("printing");
      setStatusMessage(`Mengirim data cetak ke "${selectedPrinter}"...`);

      const result = await printPhotoStripQZ(imageDataUrl, selectedPrinter);

      if (result.success) {
        setPrintStatus("success");
        setStatusMessage(result.message);
        setTimeout(() => {
          onClose();
          setPrintStatus("idle");
        }, 2500);
      } else {
        setPrintStatus("error");
        setStatusMessage(result.message);
      }
    } catch (err) {
      setPrintStatus("error");
      setStatusMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan saat mencetak"
      );
    }
  };

  const handlePrintDirectBluetooth = async () => {
    setPrintStatus("processing");
    setStatusMessage("Memindai & menghubungkan ke Bluetooth RPP02N...");

    try {
      setPrintStatus("printing");
      const result = await printPhotoStripWebBluetooth(imageDataUrl);

      if (result.success) {
        setPrintStatus("success");
        setStatusMessage(result.message);
        setTimeout(() => {
          onClose();
          setPrintStatus("idle");
        }, 2500);
      } else {
        setPrintStatus("error");
        setStatusMessage(result.message);
      }
    } catch (err) {
      setPrintStatus("error");
      setStatusMessage(
        err instanceof Error ? err.message : "Gagal Bluetooth Tablet"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl space-y-5 border border-isy-line">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-isy-line pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-isy-green-bright/10 text-isy-green-bright text-xl">
              🖨️
            </span>
            <div>
              <h3 className="font-serif text-lg font-black text-isy-green-deep">
                Cetak Struk Thermal 80mm
              </h3>
              <p className="text-[11px] text-isy-ink/60">
                QZ Tray PC / Direct Bluetooth Tablet Chrome
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-isy-mist text-isy-ink/60 hover:bg-isy-line transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Printer Selection (QZ Tray) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-isy-green-deep flex items-center justify-between">
            <span>Printer PC / Laptop (QZ Tray):</span>
            {loadingPrinters && (
              <span className="text-[10px] text-isy-green-bright font-normal animate-pulse">
                Mencari printer...
              </span>
            )}
          </label>

          {printers.length > 0 ? (
            <select
              value={selectedPrinter}
              onChange={(e) => handleSelectPrinter(e.target.value)}
              disabled={printStatus === "processing" || printStatus === "printing"}
              className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2.5 text-xs font-semibold text-isy-ink focus:border-isy-green-bright focus:outline-none shadow-sm cursor-pointer"
            >
              {printers.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          ) : (
            <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 space-y-1">
              <p className="font-bold">⚠️ Printer QZ Tray Tidak Ditemukan</p>
              <p className="text-[11px] text-amber-800/80 leading-relaxed">
                Jalankan QZ Tray di Laptop, ATAU gunakan tombol Direct Bluetooth Tablet di bawah.
              </p>
            </div>
          )}
        </div>

        {/* Status Box */}
        {statusMessage && (
          <div
            className={`rounded-2xl p-3.5 text-xs font-semibold flex items-center gap-3 ${
              printStatus === "success"
                ? "bg-isy-green-bright/10 text-isy-green-deep border border-isy-green-bright/30"
                : printStatus === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-isy-mist text-isy-ink/80 border border-isy-line"
            }`}
          >
            {(printStatus === "processing" || printStatus === "printing") && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-isy-green-bright border-t-transparent shrink-0" />
            )}
            {printStatus === "success" && <span className="text-base">✅</span>}
            {printStatus === "error" && <span className="text-base">❌</span>}
            <span className="leading-relaxed">{statusMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={printStatus === "processing" || printStatus === "printing"}
              className="w-1/3 rounded-xl border border-isy-line py-3 text-xs font-bold text-isy-ink/70 hover:bg-isy-mist transition-colors disabled:opacity-50"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={handlePrintQZ}
              disabled={
                !selectedPrinter ||
                printStatus === "processing" ||
                printStatus === "printing"
              }
              className="w-2/3 flex items-center justify-center gap-1.5 rounded-xl bg-isy-green-bright py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-isy-green-bright/25 hover:bg-isy-green-deep active:scale-95 transition-all disabled:opacity-50"
            >
              <span>Cetak via PC 🖨️</span>
            </button>
          </div>

          {/* Mobile Tablet Direct Bluetooth Button */}
          {hasWebBluetooth && (
            <button
              type="button"
              onClick={handlePrintDirectBluetooth}
              disabled={printStatus === "processing" || printStatus === "printing"}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-isy-green-bright bg-isy-green-bright/10 py-3 text-xs font-black uppercase tracking-wider text-isy-green-deep hover:bg-isy-green-bright hover:text-white transition-all active:scale-95 disabled:opacity-50"
            >
              <span>📱 Cetak Direct Bluetooth Tablet (Tanpa QZ Tray)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
