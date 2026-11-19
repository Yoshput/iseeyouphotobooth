# Baseline & Safety Audit Report — Optik I See You Virtual Try-On
**Tanggal Audit:** 19 November 2026  
**Branch Kerja:** `feat/advanced-virtual-try-on-engine` (dibuat dari `main` commit `3960609`)  
**Status Working Tree Awal:** Clean  
**Auditor:** Senior Full-Stack & Computer Vision Specialist  

---

## 1. Ringkasan Eksekutif & Status Baseline

Audit baseline ini dilakukan untuk memetakan arsitektur dasar, dependensi, pipeline computer vision, rendering Three.js, integrasi katalog, serta kesiapan sistem Virtual Try-On Optik I See You sebelum dilakukan peningkatan menyeluruh.

### Metrik Baseline
| Komponen | Status Awal | Keterangan |
|---|---|---|
| **Branch Safety** | ISOLATED | Bekerja di branch `feat/advanced-virtual-try-on-engine` terpisah dari `main` |
| **Next.js Build** | PASS | 69 rute terkompilasi bersih tanpa error TypeScript (`npx tsc --noEmit` lolos) |
| **Core Face Tracking** | AKTIF | MediaPipe Tasks Vision 0.10.14 dengan 468/478 face landmarks |
| **Rendering 2D** | AKTIF | Three.js OrthographicCamera dengan plane texture kacamata |
| **Rendering 3D** | TERBATAS | Modul `Glasses3DRenderer.tsx` tersedia namun di-bypass (hardcoded `renderMode="2d"`) |
| **AI Face Shape** | AKTIF SEBAGIAN | Mendukung 6 bentuk wajah namun scoring katalog masih biner (100 vs 20) |
| **CSP & Security** | PERLU UPDATE | `static.cloudflareinsights.com` belum terdaftar di `script-src` |
| **Unit Testing** | BELUM ADA | Belum ada test suite terotomatisasi di repositori |

---

## 2. Inventarisasi Dependensi Aktual

Berdasarkan pemeriksaan `package.json` dan `package-lock.json`:

```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.1117.0",
    "@aws-sdk/s3-request-presigner": "^3.1144.0",
    "@mediapipe/tasks-vision": "^0.10.14",
    "@supabase/supabase-js": "^2.118.0",
    "canvas-confetti": "^1.9.4",
    "gifenc": "^1.0.3",
    "gsap": "^3.12.5",
    "lucide-react": "^1.31.0",
    "next": "^15.1.7",
    "pdf-lib": "^1.17.1",
    "peerjs": "^1.5.5",
    "qrcode": "^1.5.4",
    "qz-tray": "^2.2.6",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "three": "^0.166.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/three": "^0.166.0",
    "autoprefixer": "^10",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5"
  }
}
```

*Prinsip Safety:* Tidak ada dependensi major yang akan di-upgrade secara sembrono untuk menjaga kompatibilitas Photobooth dan modul AR yang sudah stabil.

---

## 3. Peta Komponen & File-Level Inventory

| File Path | Peran Saat Ini | Dependensi Terkait | Isu Teridentifikasi | Rencana Perbaikan |
|---|---|---|---|---|
| `app/try-on/page.tsx` | Entry route halaman Try-On | `TryOnExperience.tsx` | Minimalist wrapper | Pertahankan |
| `components/try-on/TryOnExperience.tsx` | Main orchestrator Virtual Try-On | `FaceTracker`, `PhotoTryOnCanvas`, `tryOnCalibration`, `faceShape` | Hardcoded `renderMode="2d"`, perbandingan 2 frame belum ada, scoring AI biner | Implementasi hybrid 2D/3D toggle, Compare A vs B, smart scoring |
| `components/try-on/PhotoTryOnCanvas.tsx` | Mode upload foto client-side | MediaPipe Image Landmarker, Canvas 2D | Berjalan baik, perlu sinkronisasi kalibrasi scale & offset | Samakan kalibrasi dengan live camera |
| `components/ar/FaceTracker.tsx` | Shared Camera + Face Tracking bridge | `useFaceTracking`, `GlassesRenderer`, `Glasses3DRenderer` | Shared dengan `/photobooth`. Konsol menekan error GL | Bersihkan WebGL context lifecycle tanpa merusak Photobooth |
| `components/ar/GlassesRenderer.tsx` | 2D Three.js Glasses Overlay | Three.js, `videoCover.ts`, `landmarks.ts` | Disposing texture 4x dalam loop | Dispose texture tepat 1x, tambahkan WebGL context lost handler |
| `components/ar/Glasses3DRenderer.tsx` | 3D GLB Model Renderer | Three.js GLTFLoader, RoomEnvironment | Tersedia 6 GLB valid namun belum terintegrasi di TryOnExperience | Integrasikan hybrid 2D/3D dengan fallback mulus |
| `lib/landmarks.ts` | Ekstraksi landmark wajah & anchor math | MediaPipe landmarks, Three.js | Offset Y_OFFSET_FACTOR (-0.075) sudah bagus | Pertahankan koreksi aspect ratio |
| `lib/videoCover.ts` | Koreksi aspect ratio video-to-canvas | Native resolution vs container | Menghitung cover transform secara akurat | Wajib dijaga (tidak boleh diubah) |
| `lib/faceShape.ts` | Klasifikasi 6 bentuk wajah & ranking | Landmark Euclidean math | Scoring biner (100 vs 20), temporal window masih sederhana | Scoring multi-faktor transparan & temporal stability |
| `lib/catalog.ts` | Master data katalog produk | Branch, colors, dimensions, verified specs | Data katalog lengkap dan akurat | Hubungkan detail dimensi & harga ke try-on card |
| `next.config.ts` | Next.js configuration & CSP | Security headers | `static.cloudflareinsights.com` terblokir CSP | Tambahkan domain resmi ke script-src & connect-src |

---

## 4. Perlindungan Regresi Terhadap Fitur Eksisting

Fitur-fitur berikut diverifikasi dan dikunci agar tidak mengalami regresi:
1. **`/photobooth`**: Menggunakan shared component `FaceTracker.tsx`. Seluruh interface props `FaceTracker` dijamin 100% backward-compatible.
2. **Photobooth 4-Grid & Gesture Detection**: Tetap menggunakan `useGestureTracking` dan tidak disentuh.
3. **Thermal Printing & QZ Tray**: Modul `lib/printing/` dan `lib/qzPrint.ts` tetap terisolasi.
4. **Promo Management System**: Modul `/promo` dan `promo.optikiseeyou.com` tetap stabil.

---

## 5. Kesimpulan Baseline & Langkah Lanjut
Baseline aman dan stabil. Pekerjaan dilanjutkan ke **PHASE 1 (Technical Audit)** dan penyusunan **PHASE 2–9 Execution Plan**.
