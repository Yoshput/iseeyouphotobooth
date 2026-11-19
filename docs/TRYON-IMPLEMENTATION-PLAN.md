# Master Implementation Plan — I See You Virtual Try-On Engine
**Dokumen:** `docs/TRYON-IMPLEMENTATION-PLAN.md`  
**Target Rilis:** Production-Ready Virtual Try-On  
**Status:** In Progress (Phases 0–1 Complete, Executing Phases 2–9)  

---

## Urutan Fase Implementasi

### Phase 2: Core Tracking & Calibration Enhancement
- [ ] Optimalkan penanganan lifecycle kamera di `components/ar/FaceTracker.tsx`: matikan stream saat beralih ke mode photo.
- [ ] Stabilkan orientasi roll/pitch/yaw dan pertahankan kalibrasi scale `1.16` dan offset vertikal `Y_OFFSET_FACTOR = -0.075`.
- [ ] Pastikan face loss recovery bekerja halus (tidak ada flickering kacamata saat wajah keluar sebentar dari frame).

### Phase 3: WebGL & MediaPipe Optimization + CSP Fix
- [ ] Bersihkan texture upload pipeline di `components/ar/GlassesRenderer.tsx` (single-dispose pattern).
- [ ] Tambahkan context loss / context restored listener pada WebGL canvas Three.js.
- [ ] Perbarui `next.config.ts`: Tambahkan `https://static.cloudflareinsights.com` dan `https://*.supabase.co` ke CSP header resmi.

### Phase 4: Smart AI Match & Face Shape Recommendation
- [ ] Perbarui `lib/faceShape.ts`:
  - 6 kategori bentuk wajah: Oval, Round, Square, Heart, Diamond, Oblong.
  - Multi-criteria compatibility scoring (0–100%) dengan bobot transparan.
  - Penjelasan objektif dan edukatif dalam bahasa Indonesia untuk setiap kombinasi wajah dan frame.
  - Temporal sliding window stability (minimum 10-15 observasi sebelum stabil).
  - Manual shape override support.

### Phase 5: Hybrid 2D / 3D Virtual Try-On
- [ ] Aktifkan toggle 2D / 3D di `components/try-on/TryOnExperience.tsx` untuk kacamata yang memiliki aset GLB (`model3D`).
- [ ] Mode 2D sebagai default instan yang ringan.
- [ ] Fallback otomatis ke 2D jika model 3D gagal diunduh atau perangkat tidak mendukung WebGL complex shader.

### Phase 6: UX/UI Redesign, Compare Frames & Catalog
- [ ] Tingkatkan kartu katalog frame dengan data dimensi resmi (`lensWidth`, `bridgeWidth`, `frameWidth`, warna) dari `lib/catalog.ts`.
- [ ] Implementasikan fitur **Bandingkan 2 Frame (Compare A vs B)**:
  - Perbandingan visual berdampingan.
  - Perbandingan bentuk, warna, dimensi, dan skor keserasian wajah.
  - Tombol 1-klik untuk langsung mencoba frame yang dipilih.
- [ ] Sempurnakan layout responsif Desktop, Tablet, dan Mobile.
- [ ] Tingkatkan alur Capture Photo (Ambil Foto Try-On) dengan download HD instan.

### Phase 7: WhatsApp & Multi-Branch Shopping Integration
- [ ] Generate link WhatsApp pintar dengan pre-filled text yang mencantumkan nama frame, gaya, warna, dan cabang tujuan (Purwokerto, Purbalingga, Wonosobo, Cilacap).
- [ ] Pastikan URL encoding aman dan tidak ada placeholder palsu.

### Phase 8: Automated Unit Testing & Regression Protection
- [ ] Buat unit test suite menggunakan `node:test` bawaan:
  - `tests/faceShape.test.ts`
  - `tests/frameMatching.test.ts`
  - `tests/videoCover.test.ts`
  - `tests/calibration.test.ts`
  - `tests/whatsappRouting.test.ts`
- [ ] Jalankan verifikasi regresi pada modul `/photobooth` dan AR 3D.

### Phase 9: QA Report & Deployment Checklist
- [ ] Buat laporan QA lengkap di `docs/TRYON-QA-REPORT.md`.
- [ ] Buat catatan perubahan di `docs/TRYON-CHANGELOG.md`.
- [ ] Buat deployment checklist di `docs/TRYON-DEPLOYMENT-CHECKLIST.md`.
