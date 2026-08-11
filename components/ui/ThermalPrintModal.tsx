"use client";

import { useState, useEffect } from "react";
import {
  checkCleanterConnection,
  printPhotoboothReceipt,
  printTestReceipt,
  CleanterStatus,
} from "@/lib/printing/cleanter";
import {
  connectQZTray,
  fetchQZPrinters,
  printPhotoStripQZ,
} from "@/lib/qzPrint";

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
  // Mode selection: "cleanter" (Android Tablet / Default) or "qz" (PC Desktop Fallback)
  const [printMode, setPrintMode] = useState<"cleanter" | "qz">("cleanter");

  // Cleanter Bridge State
  const [cleanterHost, setCleanterHost] = useState<string>("");
  const [cleanterStatus, setCleanterStatus] = useState<CleanterStatus>({
    isAvailable: false,
    message: "Memeriksa koneksi Cleanter Print Bridge...",
  });
  const [isCheckingCleanter, setIsCheckingCleanter] = useState<boolean>(false);

  // QZ Tray Desktop Fallback State
  const [qzPrinters, setQzPrinters] = useState<string[]>([]);
  const [selectedQzPrinter, setSelectedQzPrinter] = useState<string>("");
  const [loadingQzPrinters, setLoadingQzPrinters] = useState<boolean>(false);

  // Print Job Status
  const [printStatus, setPrintStatus] = useState<
    "idle" | "connecting" | "processing" | "printing" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Load saved host or printer preference
    try {
      const savedHost = localStorage.getItem("isy_cleanter_host");
      if (savedHost) setCleanterHost(savedHost);

      const savedQz = localStorage.getItem("isy_thermal_printer");
      if (savedQz) setSelectedQzPrinter(savedQz);
    } catch {
      // Ignore
    }

    // Auto-check Cleanter connection on modal open
    handleRefreshCleanter();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRefreshCleanter = async () => {
    setIsCheckingCleanter(true);
    setErrorDetail(null);
    const status = await checkCleanterConnection(cleanterHost);
    setCleanterStatus(status);
    setIsCheckingCleanter(false);
  };

  const handleSaveHost = (newHost: string) => {
    setCleanterHost(newHost);
    try {
      localStorage.setItem("isy_cleanter_host", newHost);
    } catch {
      // Ignore
    }
  };

  const handlePrintCleanter = async () => {
    setPrintStatus("processing");
    setStatusMessage("Memproses dither 1-bit ESC/POS (80mm)...");
    setErrorDetail(null);

    try {
      setPrintStatus("printing");
      setStatusMessage("Mengirim payload cetak ke Cleanter Bridge (IWARE / RPP02N)...");

      const result = await printPhotoboothReceipt(imageDataUrl, {
        hostUrl: cleanterHost,
        timeoutMs: 10000,
        autoCut: true,
      });

      if (result.success) {
        setPrintStatus("success");
        setStatusMessage(result.message);
        setErrorDetail(null);
        setTimeout(() => {
          onClose();
          setPrintStatus("idle");
        }, 2500);
      } else {
        setPrintStatus("error");
        setStatusMessage(result.message);
        setErrorDetail(result.detail || null);
      }
    } catch (err) {
      setPrintStatus("error");
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage("Terjadi kesalahan saat mencetak");
      setErrorDetail(msg);
    }
  };

  const handleTestPrintCleanter = async () => {
    setPrintStatus("processing");
    setStatusMessage("Mengirim struk tes ke printer...");
    setErrorDetail(null);

    try {
      const result = await printTestReceipt({ hostUrl: cleanterHost });
      if (result.success) {
        setPrintStatus("success");
        setStatusMessage(result.message);
        setErrorDetail(null);
        setTimeout(() => setPrintStatus("idle"), 3000);
      } else {
        setPrintStatus("error");
        setStatusMessage(result.message);
        setErrorDetail(result.detail || null);
      }
    } catch (err) {
      setPrintStatus("error");
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage("Cleanter bridge tidak merespon.");
      setErrorDetail(msg);
    }
  };

  const handleLoadQzPrinters = async () => {
    setLoadingQzPrinters(true);
    try {
      const list = await fetchQZPrinters();
      setQzPrinters(list);
      if (list.length > 0 && !selectedQzPrinter) {
        setSelectedQzPrinter(list[0]);
      }
    } catch (err) {
      setStatusMessage("QZ Tray tidak aktif di PC/Laptop ini.");
    } finally {
      setLoadingQzPrinters(false);
    }
  };

  const handlePrintQZ = async () => {
    if (!selectedQzPrinter) return;
    setPrintStatus("processing");
    setStatusMessage("Memproses cetak via QZ Tray Desktop...");
    setErrorDetail(null);

    try {
      setPrintStatus("printing");
      const result = await printPhotoStripQZ(imageDataUrl, selectedQzPrinter);
      if (result.success) {
        setPrintStatus("success");
        setStatusMessage(result.message);
        setErrorDetail(null);
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
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage("Gagal cetak QZ Tray");
      setErrorDetail(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl space-y-5 border border-isy-line">
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
              <p className="text-[11px] font-semibold text-isy-ink/60">
                IWARE XS-80BT / RPP02N · ESC/POS Auto Cutter
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

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 rounded-2xl bg-isy-mist p-1 text-xs font-extrabold">
          <button
            onClick={() => setPrintMode("cleanter")}
            className={`rounded-xl py-2 transition-all ${
              printMode === "cleanter"
                ? "bg-isy-green-deep text-white shadow-md"
                : "text-isy-ink/70 hover:text-isy-green-deep"
            }`}
          >
            📱 Android / Tablet (Cleanter)
          </button>
          <button
            onClick={() => {
              setPrintMode("qz");
              if (qzPrinters.length === 0) handleLoadQzPrinters();
            }}
            className={`rounded-xl py-2 transition-all ${
              printMode === "qz"
                ? "bg-isy-green-deep text-white shadow-md"
                : "text-isy-ink/70 hover:text-isy-green-deep"
            }`}
          >
            💻 Laptop / PC (QZ Tray)
          </button>
        </div>

        {/* CLEANTER MODE PANEL */}
        {printMode === "cleanter" && (
          <div className="space-y-4">
            {/* Status Card */}
            <div
              className={`rounded-2xl p-4 text-xs space-y-1.5 border transition-all ${
                cleanterStatus.isAvailable
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <div className="flex items-center justify-between font-extrabold">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      cleanterStatus.isAvailable
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-amber-500"
                    }`}
                  />
                  {cleanterStatus.isAvailable
                    ? "Printer Cleanter Siap"
                    : "Cleanter Bridge Tidak Terdeteksi"}
                </span>

                <button
                  type="button"
                  onClick={handleRefreshCleanter}
                  disabled={isCheckingCleanter}
                  className="text-[10px] underline font-bold text-isy-green-deep hover:text-isy-green-bright"
                >
                  {isCheckingCleanter ? "Cek..." : "🔄 Cek Ulang"}
                </button>
              </div>

              <p className="text-[11px] leading-relaxed">
                {cleanterStatus.message}
              </p>

              {!cleanterStatus.isAvailable && (
                <div className="pt-1 text-[10.5px] text-amber-800/90 font-medium space-y-1 border-t border-amber-200/60 mt-2">
                  <p>💡 <strong>Petunjuk Operator Event:</strong></p>
                  <p>1. Buka aplikasi <strong>Cleanter</strong> di Tablet Android.</p>
                  <p>2. Pastikan printer <strong>RPP02N / IWARE</strong> terhubung di app Cleanter.</p>
                </div>
              )}
            </div>

            {/* Optional Wi-Fi Host IP Input */}
            <div className="space-y-1">
              <details className="group">
                <summary className="text-[11px] font-bold text-isy-ink/60 cursor-pointer hover:text-isy-green-deep select-none">
                  🌐 Pengaturan IP Wi-Fi Cleanter (Opsional untuk iPhone/MacBook)
                </summary>
                <div className="pt-2">
                  <input
                    type="text"
                    value={cleanterHost}
                    onChange={(e) => handleSaveHost(e.target.value)}
                    placeholder="http://localhost:9100/print (atau IP Tablet 192.168.1.xxx)"
                    className="w-full rounded-xl border border-isy-line bg-white px-3 py-2 text-xs text-isy-ink font-mono focus:border-isy-green-bright focus:outline-none"
                  />
                </div>
              </details>
            </div>
          </div>
        )}

        {/* QZ TRAY PC MODE PANEL */}
        {printMode === "qz" && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-isy-green-deep flex items-center justify-between">
              <span>Target Printer PC/Laptop:</span>
              {loadingQzPrinters && (
                <span className="text-[10px] text-isy-green-bright animate-pulse">
                  Mencari...
                </span>
              )}
            </label>

            {qzPrinters.length > 0 ? (
              <select
                value={selectedQzPrinter}
                onChange={(e) => {
                  setSelectedQzPrinter(e.target.value);
                  localStorage.setItem("isy_thermal_printer", e.target.value);
                }}
                className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2.5 text-xs font-semibold text-isy-ink focus:border-isy-green-bright focus:outline-none"
              >
                {qzPrinters.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-xl bg-gray-50 p-3 text-xs text-isy-ink/60">
                Klik refresh jika QZ Tray sudah aktif di PC/Laptop kamu.
              </div>
            )}
          </div>
        )}

        {/* Action Status Message Box */}
        {statusMessage && (
          <div className="space-y-2">
            <div
              className={`rounded-2xl p-3.5 text-xs font-semibold flex items-center gap-3 ${
                printStatus === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
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

            {/* RAW DEBUGGING ERROR DETAIL BOX */}
            {errorDetail && (
              <div className="rounded-2xl border border-red-200 bg-red-950 p-3 text-[10.5px] font-mono text-red-200 space-y-1 overflow-hidden">
                <p className="font-bold text-red-400">🔍 Detail Respons Teknis Cleanter (Debug):</p>
                <div className="max-h-36 overflow-y-auto whitespace-pre-wrap break-all rounded-lg bg-black/50 p-2 text-[10px] leading-relaxed">
                  {errorDetail}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          {printMode === "cleanter" ? (
            <>
              <button
                type="button"
                onClick={handlePrintCleanter}
                disabled={printStatus === "processing" || printStatus === "printing"}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-isy-green-bright py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-isy-green-bright/25 hover:bg-isy-green-deep active:scale-95 transition-all disabled:opacity-50"
              >
                <span>Cetak Foto Strip 🖨️</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestPrintCleanter}
                  disabled={printStatus === "processing" || printStatus === "printing"}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-isy-line bg-isy-mist py-2.5 text-xs font-bold text-isy-green-deep hover:bg-isy-line active:scale-95 transition-all"
                >
                  <span>🧪 Tes Print Printer</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={printStatus === "processing" || printStatus === "printing"}
                  className="rounded-xl border border-isy-line py-2.5 text-xs font-bold text-isy-ink/70 hover:bg-isy-mist transition-colors"
                >
                  Tutup
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 rounded-xl border border-isy-line py-3 text-xs font-bold text-isy-ink/70 hover:bg-isy-mist transition-colors"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handlePrintQZ}
                disabled={!selectedQzPrinter || printStatus === "processing"}
                className="w-2/3 flex items-center justify-center gap-1.5 rounded-xl bg-isy-green-bright py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:bg-isy-green-deep active:scale-95 transition-all disabled:opacity-50"
              >
                <span>Cetak via PC 🖨️</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
