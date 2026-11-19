# Technical Audit Report — Optik I See You Virtual Try-On Engine
**Dokumen:** `docs/TRYON-TECHNICAL-AUDIT.md`  
**Tanggal:** 19 November 2026  
**Auditor:** Senior Full-Stack & Computer Vision Specialist  

---

## 1. Arsitektur Komponen & Alur Data

Virtual Try-On Optik I See You dibangun di atas arsitektur modular yang memisahkan antara layer video/computer vision, layer rendering Three.js, dan layer interaksi bisnis/katalog:

```
[Browser Camera / Photo Upload]
             │
             ▼
    [MediaPipe Tasks Vision]  <── (FilesetResolver /wasm + GPU/CPU Delegate)
             │ (468/478 Landmarks & Pose Matrix)
             ▼
      [FaceTracker.tsx] ── (videoCover.ts: Aspect-Ratio Cover Transform)
             │
     ┌───────┴────────────────────────────────┐
     ▼                                        ▼
[GlassesRenderer.tsx (2D)]        [Glasses3DRenderer.tsx (3D)]
Three.js OrthographicCamera       Three.js Scene + GLTFLoader + PMREM
Plane Geometry + Texture Map      GLB Model + Clipping Planes
     │                                        │
     └───────┬────────────────────────────────┘
             ▼
  [TryOnExperience.tsx (Main UI)]
  - AI Face Shape Classifier (lib/faceShape.ts)
  - Frame Calibration & Scale (lib/tryOnCalibration.ts)
  - Product Catalog & Compare 2 Frames (lib/catalog.ts)
  - WhatsApp Smart Routing (lib/branches.ts)
```

---

## 2. Investigasi Mendalam Masalah Teknis

### 2.1 WebGL: `texImage3D: FLIP_Y or PREMULTIPLY_ALPHA`
* **Gejala:** Console log menampilkan pesan `WebGL: INVALID_OPERATION: texImage3D: FLIP_Y or PREMULTIPLY_ALPHA isn't allowed for uploading 3D textures`.
* **Akar Masalah (Root Cause):**
  Spesifikasi WebGL 2.0 (OpenGL ES 3.0 Section 3.7.6) melarang keras pemanggilan `texImage3D` ketika parameter global `UNPACK_FLIP_Y_WEBGL` atau `UNPACK_PREMULTIPLY_ALPHA_WEBGL` bernilai `true`.
  Penyebabnya berasal dari dua sumber:
  1. MediaPipe Tasks Vision (`vision_wasm_internal.js`) menggunakan WebGL2 untuk alokasi tensor 3D pada delegasi GPU.
  2. Three.js secara default mengeset `pixelStorei(UNPACK_FLIP_Y_WEBGL, true)` saat mengunggah tekstur 2D (`TextureLoader`). Jika ada context sharing atau state machine WebGL yang tidak dinormalisasi kembali ke `false` setelah render pass, MediaPipe menerima state kotor (*dirty WebGL state*) saat mengalokasikan tensor 3D berikutnya.
* **Solusi & Pencegahan:**
  - Pastikan canvas Three.js menggunakan konteks WebGL terisolasi (`preserveDrawingBuffer: true`, `alpha: true`).
  - Lakukan normalisasi reset `pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)` dan `pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)` setelah Three.js texture upload.
  - Tangani pelepasan memori tekstur secara tepat (dispose 1x, bukan berkali-kali di dalam loop `maxFaces`).
  - Tambahkan event listener `webglcontextlost` dan `webglcontextrestored` pada canvas untuk memulihkan renderer jika browser kehabisan memori GPU.

### 2.2 Delegasi MediaPipe (GPU vs CPU Fallback)
* **Gejala:** Muncul pesan `INFO: Created TensorFlow Lite XNNPACK delegate for CPU`.
* **Akar Masalah:**
  Pada perangkat mobile (terutama iOS Safari atau browser dengan batas WebGL contexts), pembuatan konteks GPU kedua dapat gagal. `lib/mediapipe.ts` sudah memiliki blok `try...catch` yang otomatis beralih ke delegasi CPU XNNPACK. Ini adalah perilaku fallback yang benar (*by design*), bukan bug.
* **Optimasi:**
  - Tambahkan benchmark runtime untuk mengukur stabilitas FPS antara GPU dan CPU.
  - Sediakan running mode yang stabil tanpa inisialisasi ulang model saat pengguna hanya mengganti produk.

### 2.3 Lifecycle Kamera & Penghematan Resource
* **Temuan:**
  Ketika pengguna beralih dari mode kamera langsung (*Live Camera*) ke mode upload foto (*Photo Mode*), kamera laptop/HP terkadang masih menyala di latar belakang, memboroskan baterai dan resource perangkat.
* **Solusi:**
  Hentikan seluruh `MediaStreamTrack` secara proaktif saat `tryOnMode === "photo"` dan saat komponen di-unmount, lalu inisialisasi ulang secara instan ketika pengguna kembali ke mode kamera langsung.

### 2.4 Sistem Rekomendasi Bentuk Wajah (AI Match)
* **Temuan:**
  1. Klasifikasi wajah saat ini mengandalkan 3 rasio sederhana (`lengthRatio`, `jawRatio`, `foreheadRatio`). Jika pengguna menunduk atau menoleh sedikit, klasifikasi bisa melompat (*jitter*).
  2. Scoring katalog saat ini biner: nilai 100 untuk frame yang memiliki tag `recommendedFor`, dan nilai 20 untuk frame lain. Tidak ada skor bertingkat atau penjelasan objektif.
* **Solusi:**
  - Implementasikan filter jendela temporal (*sliding window temporal aggregation*) dengan minimum 12 observasi valid untuk menstabilkan bentuk wajah sebelum memicu rekomendasi.
  - Buat **Intelligent Multi-Criteria Frame Compatibility Scoring (0–100%)**:
    - Kontras bentuk wajah vs geometri bingkai (+40 pts)
    - Proporsi lebar bingkai terhadap lebar wajah (+30 pts)
    - Gaya dan aksen alis/browline (+20 pts)
    - Preferensi warna dan kesesuaian optik (+10 pts)
  - Tampilkan alasan rekomendasi yang transparan dan informatif dalam bahasa Indonesia (misal: *"Frame kotak memberikan kontras tegas yang menyeimbangkan siluet wajah bulat Anda secara harmonis"*).
  - Berikan dropdown manual override agar pengguna dapat bebas memilih bentuk wajah lain tanpa terkunci deteksi otomatis.

### 2.5 Hybrid 2D / 3D Virtual Try-On
* **Temuan:**
  File `Glasses3DRenderer.tsx` dan 6 model GLB kacamata valid sudah tersedia di Cloudflare R2, namun halaman `TryOnExperience.tsx` mengunci `renderMode="2d"`.
* **Solusi:**
  - Hadirkan tombol pill toggle **2D / 3D** yang intuitif.
  - Mode default tetap **2D** (sangat ringan, cepat, dan kompatibel luas).
  - Untuk produk yang memiliki model 3D (`model3D`), pengguna dapat beralih ke mode 3D secara seamless.
  - Jika aset 3D gagal dimuat karena kendala jaringan, sistem otomatis kembali ke mode 2D tanpa memunculkan layar putih atau crash.

### 2.6 Fitur Bandingkan 2 Frame (Compare Frames A vs B)
* **Temuan:**
  Pengguna sering bimbang antara dua model kacamata (misalnya Cat-Eye vs Clubmaster). Belum ada fitur untuk membandingkan keduanya secara berdampingan.
* **Solusi:**
  Tambahkan modul **Bandingkan Kacamata (Compare A vs B)**:
  - Memilih Frame A dan Frame B dari katalog.
  - Membandingkan foto produk, bentuk frame, warna, material, dimensi (lebar lensa, bridge, panjang tangkai), dan skor kecocokan wajah.
  - Tombol 1-klik untuk langsung mencoba frame yang dipilih ke kamera.

### 2.7 Content Security Policy (CSP)
* **Temuan:**
  `static.cloudflareinsights.com` dan `https://*.supabase.co` belum terdaftar di `next.config.ts`, menyebabkan browser memblokir analitik Cloudflare dan koneksi database tertentu.
* **Solusi:**
  Tambahkan domain resmi tersebut ke whitelist CSP di `next.config.ts`.

---

## 3. Matriks Risiko & Rencana Pengujian Regresi

| Area Perubahan | Risiko Potensial | Strategi Mitigasi |
|---|---|---|
| `components/ar/FaceTracker.tsx` | Kerusakan pada `/photobooth` | Pertahankan semua props interface lama. Uji alur Photobooth 4-Grid. |
| `components/ar/GlassesRenderer.tsx` | Error Three.js context lost | Single-dispose texture, isolasi WebGL canvas. |
| `lib/faceShape.ts` | Kesalahan deteksi bentuk wajah | Tambahkan automated unit test untuk 6 bentuk wajah. |
| `next.config.ts` | Pelonggaran keamanan berlebih | Hanya izinkan subdomain resmi Cloudflare & Supabase yang terverifikasi. |
