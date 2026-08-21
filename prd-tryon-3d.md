# PRD — Try-On 3D (Mode Kacamata 3D Baru di AR Try-On)

**Status:** Draft, siap dieksekusi via Antigravity
**Terkait:** `spec-ar-tryon-kacamata.md` (spec AR Try-On awal), `AGENT.md` (aturan project — WAJIB dibaca sebelum eksekusi), `audit-teknis-ar-tryon-iseeyou.md` (audit sebelumnya)
**Prinsip utama:** ADDITIVE. Fitur 2D yang sudah jalan tidak diubah, tidak diganti, tidak disentuh logic-nya.

---

## 1. Latar Belakang

AR Try-On sekarang merender kacamata sebagai PNG transparan di atas bidang datar (`THREE.PlaneGeometry(1,1)` di `GlassesRenderer.tsx`) yang di-scale & diputar sedikit (`rotation.x`/`rotation.y` kecil, dikomentari sendiri di kode sebagai "creates a 3D depth illusion") untuk mensimulasikan kesan 3D. Ini bekerja baik untuk tampilan depan, tapi punya batas struktural: bidang datar tidak bisa benar-benar mengikuti kepala menoleh jauh ke samping — akan terlihat seperti kertas dipuntir, bukan kacamata yang benar-benar berputar di ruang 3D.

Temuan penting dari audit kode: `lib/mediapipe.ts` sudah mengaktifkan `outputFacialTransformationMatrixes: true` — MediaPipe sudah menghitung matriks transformasi 3D penuh (posisi + rotasi + skala kepala) di setiap frame. Data ini mengalir sampai ke `GlassesRenderer.updateFromResult(result, ...)` lewat parameter `result`, tapi **tidak pernah dipakai** — renderer yang ada hanya memakai `computeGlassesAnchor()` dari titik-titik landmark mentah. Try-On 3D pada dasarnya adalah membangun "pendengar" baru untuk data yang sudah tersedia, bukan membangun sistem tracking baru dari nol.

## 2. Masalah yang Diselesaikan

- **Untuk user:** rotasi kepala ke samping terasa kurang natural di mode sekarang; kacamata 3D akan terasa jauh lebih "menempel beneran" saat kepala menoleh — ini salah satu faktor "kece" yang teridentifikasi di audit awal (rendering real-time yang menghormati sudut & kedalaman, bukan cuma tempel datar).
- **Untuk bisnis:** ada nilai jual baru ("Baru! Coba Kacamata 3D") yang bisa jadi konten promosi di 4 cabang toko, tanpa harus migrasi seluruh katalog sekaligus — biaya digitalisasi 3D per SKU cukup besar, jadi model bisnisnya harus bertahap.

## 3. Tujuan (Goals)

1. User bisa mencoba minimal 1 model kacamata dalam mode 3D asli (bukan simulasi bidang datar), dengan rotasi kepala penuh yang natural.
2. Mode 2D existing tetap jadi default dan tetap berjalan persis seperti sekarang — nol regresi.
3. Toggle antar mode terasa menyatu dengan UI yang sudah ada (pola pill/chip seperti toggle "AI Mulus"/"Lipstik" yang sudah ada di `app/photobooth/page.tsx`).
4. Katalog campuran: sebagian model kacamata 2D-only, sebagian (bertahap) punya opsi 3D — bukan all-or-nothing.

## 4. Non-Goals (Sengaja Di Luar Scope)

- **Tidak** memindahkan seluruh katalog (10 model) ke 3D sekaligus. MVP cukup 1-3 model "hero".
- **Tidak** mengubah formula/logic `GlassesRenderer.tsx`, `landmarks.ts`, `videoCover.ts`, atau `mediapipe.ts` yang sudah ada (ditandai "final" di `AGENT.md`).
- **Tidak** menangani oklusi rambut/tangan di iterasi ini (gap ini sudah dicatat di audit awal Bagian 9.5, tetap jadi item terpisah untuk nanti — baik mode 2D maupun 3D sama-sama belum punya ini).
- **Tidak** pakai SDK AR berbayar — tetap MediaPipe + Three.js, keduanya sudah jadi dependency project (`three` sudah ada di `package.json`).

## 5. User Flow

1. User masuk AR Try-On seperti biasa (`/photobooth?mode=ar`), kamera aktif, wajah terdeteksi (flow tidak berubah).
2. Di baris pilihan kacamata (yang sekarang: Tanpa Kacamata / Hexagonal Plastik Pastel / dst), model yang punya versi 3D diberi penanda visual kecil (badge "3D").
3. Saat user pilih model yang punya versi 3D, muncul toggle baru di dekat toggle "AI Mulus"/"Lipstik" yang sudah ada: **"Mode 3D"** (default OFF/2D, supaya perilaku default tidak berubah dari sekarang).
4. User nyalakan toggle → renderer diam-diam berpindah dari `GlassesRenderer` (2D) ke `Glasses3DRenderer` (3D) tanpa perlu scan ulang wajah atau reset kamera.
5. Kalau user pindah ke model yang tidak punya versi 3D sementara toggle 3D aktif → otomatis fallback ke 2D, toggle disembunyikan/nonaktif untuk model itu (bukan error atau layar kosong).

## 6. Scope MVP

- 1-3 model kacamata "hero" dengan aset 3D asli (format `.glb`).
- 1 komponen renderer baru (`Glasses3DRenderer.tsx`), hidup berdampingan dengan `GlassesRenderer.tsx` yang ada.
- 1 toggle UI baru mengikuti pola toggle existing.
- Extension skema `manifest.json` yang backward-compatible (entry lama tanpa field 3D tetap valid apa adanya).

## 7. Kriteria Sukses

- Model 3D mengikuti rotasi kepala (kiri-kanan, atas-bawah) secara natural sampai ±45° tanpa terlihat pecah/melayang.
- FPS tetap di atas ambang yang nyaman di device Android kelas menengah (ukur & bandingkan dengan FPS mode 2D di device yang sama — lihat bagian testing di dokumen teknis).
- Mode 2D, di semua 10 model existing, terbukti tidak berubah sama sekali (regression check).
- Toggle 2D/3D bisa dipindah bolak-balik tanpa lag/reset kamera.

## 8. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Performa turun di HP kelas bawah (geometri 3D + perspective camera lebih berat dari bidang datar) | 2D tetap default; 3D murni opt-in per model; wajib load-test di device Android low-mid sebelum rilis (lihat dokumen teknis) |
| Ukuran/posisi 3D "kegedean/kekecilan" seperti histori bug sizing 2D sebelumnya (lihat audit Bagian 9) | Sistem skala 3D SENGAJA dibuat terpisah total dari `fitWidthRatio`/`ipdScaleRef` (sistem lama), pakai satuan metrik asli dari `facialTransformationMatrixes` + dimensi fisik (mm) per model — dijelaskan di dokumen teknis |
| Aset 3D mahal/lambat dibuat untuk seluruh katalog | MVP sengaja dibatasi 1-3 model, bukan seluruh katalog — lihat §9 |
| Regresi ke mode 2D yang sudah stabil | Arsitektur additive: file lama nol perubahan logic, hanya ditambah 1 prop opsional di `FaceTracker.tsx` |

## 9. Keputusan yang Masih Terbuka (Butuh Input Kamu)

Ini bukan yang menghambat Antigravity mulai kerja (bagian teknis di dokumen kedua bisa langsung jalan), tapi 2 hal ini sebaiknya kamu putuskan sebelum tahap pengisian aset:

1. **Sumber aset 3D:** mau photogrammetry scan frame fisik asli kamu (paling akurat ke produk beneran, tapi perlu biaya/alat scan — misal jasa scan 3D atau app seperti Polycam/KIRI Engine + kamera yang layak), atau beli/lisensi model 3D kacamata generik lalu disesuaikan warnanya (lebih cepat & murah, tapi tidak 100% identik ke produk fisik di toko)?
2. **Model mana yang jadi "hero" 3D pertama?** Sebaiknya pilih yang paling laris/paling sering di-try, biar dampaknya paling kerasa duluan.

Kalau belum ada jawaban, dokumen teknis di file kedua tetap bisa dieksekusi penuh sampai tahap "siap diisi model .glb" — dua keputusan ini cuma soal isi kontennya, bukan soal cara kerja sistemnya.
