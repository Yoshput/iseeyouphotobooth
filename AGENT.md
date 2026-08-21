# Project: I See You AR Photobooth

## Context
Web photobooth dengan AR try-on kacamata untuk Optik I See You Purwokerto.
Target selesai akhir Agustus 2026. Client-side only, no backend AI server.

## ARAHAN DESAIN — FINAL, JANGAN DEVIASI
Tema: **putih/krem minimalist + hijau**, BUKAN dark/neon. Ada iterasi
sebelumnya di Stitch yang keluar tema gelap — itu supersede, dibatalkan.
Source of truth lengkap ada di `design.md` (baca dulu sebelum sentuh UI):
- Background gradasi lembut putih → `isy-mist`, subtle, tetap terasa "putih bersih"
- Warna brand: `isy-green-deep` (#1B4332, dari logo asli) untuk teks/judul,
  `isy-green-bright` (#2FA84F) untuk CTA/badge/aksen
- Logo asli ada di `public/brand-logo-green.png` — pakai ini, jangan generate logo baru
- Signature element: ring hijau solid (bukan gradasi) di sekitar wajah saat
  terdeteksi — lihat §4 design.md kenapa ring gradasi dibuang

## Status
Scaffold sudah ada dan berjalan: FaceTracker + GlassesRenderer +
useFaceTracking (1 wajah, 1 kacamata, kalibrasi manual), sudah responsif
(tablet/laptop/HP). Tema warna baru saja diganti ke light theme — cek
`tailwind.config.ts` dan `app/photobooth/page.tsx` sudah diupdate, tapi
masih scaffold kasar, BUKAN hasil final UI. Yang belum: UI final sesuai
design.md secara detail, mode berdua/berempat belum di-test di device
fisik, capture/share flow, frame overlay, GSAP transitions, ring
scan-indicator hijau (§4 design.md) belum diimplementasi.

## Device Target
Device utama: **tablet Samsung**, kiosk-style di event (portrait, di
tripod/stand). Laptop Windows & HP itu skenario sekunder. Prioritas QA:
tablet dulu, baru laptop & HP.

Implementasi responsive:
- `useElementSize` (ResizeObserver) — viewport & canvas Three.js mengikuti
  ukuran container beneran.
- `lib/videoCover.ts` — WAJIB dipahami sebelum ubah logic positioning.
  Video kamera (native resolution beda-beda per device) ditampilkan pakai
  `object-cover`; semua landmark position dikoreksi lewat cover-transform
  ini supaya kacamata tetap nempel akurat lintas device. Jangan
  dihapus/dilewati.
- `app/photobooth/page.tsx` — full-bleed di tablet & HP, card ter-center
  dengan aspect ratio tetap di layar lebar (laptop).
- Viewport di-lock zoom (`layout.tsx`) karena ini kiosk, bukan web biasa.

## Stack
- Next.js 15 App Router + TypeScript
- @mediapipe/tasks-vision (Face Landmarker, GPU delegate, VIDEO mode)
- Three.js untuk render overlay kacamata (orthographic camera, plane per wajah)
- GSAP untuk animasi UI
- Tailwind untuk styling (token warna sudah di `tailwind.config.ts`, ikuti itu — jangan hardcode hex baru di komponen)

## Struktur folder
/app
  /photobooth        -> halaman utama kamera + AR
/components
  /ar                 -> FaceTracker.tsx, GlassesRenderer.tsx (arsitekturnya sudah final, jangan rombak tanpa alasan kuat)
  /ui                 -> ModeSelector, Countdown, FrameOverlay, ShutterButton (BELUM ADA — next task)
/lib
  /mediapipe.ts, /landmarks.ts, /videoCover.ts -> logic computer vision, sudah final
/public
  /brand-logo-green.png -> logo resmi, pakai ini
  /glasses/           -> aset PNG transparan + manifest.json
  /frames/            -> aset bingkai — BELUM ADA ISINYA

## Coding rules
- Semua computer vision logic dipisah dari komponen UI React (pola
  useFaceTracking + GlassesRenderer.updateFromResult sudah final)
- JANGAN setState per-frame di komponen React
- Kalibrasi fitWidthRatio manual per asset kacamata, dicatat di manifest.json
- Mobile-first tapi tablet-first secara device priority (lihat Device Target)
- Semua warna dari token Tailwind di `tailwind.config.ts`, bukan hex inline

## Jangan lakukan
- Jangan pakai tema gelap/neon — sudah final dibatalkan, lihat §ARAHAN DESAIN
- Jangan pakai ring gradasi pink-oranye-ungu di mana pun
- Jangan kirim frame video ke server manapun (privasi wajah, semua proses lokal)
- Jangan pakai library face-tracking berbayar (Banuba dkk) — MediaPipe cukup
- Jangan reset arsitektur FaceTracker/GlassesRenderer/videoCover yang sudah ada

## UPDATE — Review Pass (Agustus 2026)

### Bug diperbaiki
- **AR kacamata meleset dari wajah**: root cause bukan di math posisi (itu
  udah benar), tapi di ASSET: PNG kacamata cuma di-crop longgar (banyak
  padding transparan, tidak konsisten antar file) DAN kode pakai aspect
  ratio hardcode `0.42` yang nggak cocok sama satupun asset asli (asli
  ~0.33-0.37). Sudah diperbaiki:
  1. Semua PNG di `public/glasses/` di-crop ketat ke bounding box konten
     (sudah dijalankan di project ini, lihat commit history / cek ukuran file)
  2. `GlassesRenderer.tsx` sekarang BACA aspect ratio asli dari texture yang
     ke-load, bukan angka hardcode — kalau ke depannya ada asset baru masuk
     dengan proporsi beda, otomatis menyesuaikan, TIDAK PERLU ubah kode lagi
  3. `fitWidthRatio` di `manifest.json` dikalibrasi ulang ke ~1.4-1.5
     (sebelumnya 1.6-2.0, kegedean)
  - **PENTING**: kalau nambah asset kacamata baru, WAJIB crop rapat ke tepi
    konten (hilangkan padding transparan berlebih) sebelum dipakai — kalau
    tidak, kalibrasi `fitWidthRatio` jadi nggak konsisten lagi.

### Flow baru: 2 mode setelah "Mulai"
- `/start` — halaman pilih mode baru (AR Try-On vs Photobooth Biasa)
- `/photobooth?ai=1` → mode AR penuh (existing flow)
- `/photobooth?ai=0` → mode tanpa AR sama sekali: glasses overlay, AI
  toggle, badge rekomendasi, dan strip pilihan kacamata semua disembunyikan
  (lihat state `arEnabled` di `app/photobooth/page.tsx`) — HANYA countdown +
  layout + capture yang tampil.

### Landing page (app/page.tsx)
- Semua emoji dihapus dari seluruh project (bukan cuma landing) untuk
  tampilan lebih simple/elegant
- Section badge trust ("Gratis & No Login" dll) dihapus
- CTA sekarang ke `/start`, bukan langsung `/photobooth`
- Section baru: **4 Cabang** — carousel auto-slide 3 detik, swipeable,
  title-only per slide (nama + kota), klik → modal detail (alamat lengkap,
  jam, embed peta, tombol "Buka Rute" ke Google Maps). Komponennya di
  `components/ui/BranchCarousel.tsx`, data di `lib/branches.ts`
  (koordinat 4 cabang sudah diisi dari data toko).

### Rekomendasi 10+ frame berbasis bentuk wajah
- `lib/faceShape.ts` sekarang punya 6 kategori (Oval, Round, Square, Heart,
  Diamond, Oblong — standar industri optik) dan fungsi baru
  `rankGlassesForShape(shape, catalog, topN)` yang me-ranking SEMUA item
  katalog (bukan cuma 1 rekomendasi fixed seperti sebelumnya).
- **BELUM di-wire ke UI** — fungsinya sudah siap pakai, tapi katalog masih
  cuma 5 model kacamata (+ "Tanpa Kacamata"). Fungsi ranking ini nggak ada
  cap keras di angka manapun; begitu katalog diisi 10+ model kacamata asli
  dengan tag `recommendedFor` yang benar, tinggal panggil
  `rankGlassesForShape(faceResult.shape, manifest, 12)` buat dapat daftar
  urut 12 rekomendasi teratas, lalu render sebagai list/carousel di panel
  hasil scan. Ini next task, bukan sudah selesai.

### CS WhatsApp setelah try-on
- Tombol "Tanya Stok ke CS" muncul di layar hasil foto KALAU mode AR aktif
  dan ada kacamata yang dicoba. Nomor & template pesan ada di
  `lib/branches.ts` (`csWhatsappUrl`) — satu sumber, jangan hardcode nomor
  WA di komponen manapun.


### YANG MASIH PERLU DARI TOKO (nggak bisa saya buatkan)
- Foto depan & dalam toko untuk 4 cabang (taruh di `public/branches/<id>-depan.jpg`
  dan `<id>-dalam.jpg`, lalu sambungkan ke placeholder di `BranchCarousel.tsx`)
- 10+ PNG kacamata asli (transparan, crop rapat) kalau mau fitur rekomendasi
  bentuk wajah benar-benar terasa "banyak pilihan" — sistemnya sudah siap,
  tinggal asetnya
- Konfirmasi source foto katalog (`public/catalog-glasses.jpg`) itu placeholder
  atau final

---

## UPDATE — Revisi Alur Finalisasi Foto (14 Agustus 2026)

**Scope:** Mode Photobooth Biasa (`?mode=photobooth`, `arEnabled=false`) saja. Mode AR Try-On tidak diubah sama sekali.
**File diubah:** HANYA `app/photobooth/page.tsx`

### 1. Retake / Konfirmasi Setelah Tiap Foto (Termasuk Foto Terakhir)

**Sebelum:** Foto terakhir begitu selesai langsung lompat ke compositing (setTimeout 400ms). Nol kesempatan review/retake. Overlay "between" hanya menampilkan teks progress dan tombol "Lanjut →" tanpa preview foto.

**Sesudah:**
- `handleCountdownComplete` — branch foto terakhir (else) sekarang juga `setPhase("between")`, bukan langsung compositing.
- `handleNextPhoto` — sekarang cek `photos.filter(Boolean).length >= layout.numPhotos`:
  - Semua slot terisi → `setPhase("compositing")`
  - Belum → `setPhase("countdown")`
- Overlay `"between"` baru: **overlay penuh** (bukan hanya action bar bawah) — menampilkan preview foto yang baru diambil (`photos[currentSlot - 1]`) dengan badge nomor foto, tombol **Retake** (wired ke `handleRetakeSingleSlot(justTakenIdx)`) dan CTA **"Lanjut →"** / **"Selesai, Lanjut →"** (beda teks sesuai kondisi semua slot terisi).
- Ikon retake per-slot di Preview Strip kanan tetap dipertahankan (jalur retake foto-foto sebelumnya).

### 2. Pisahkan Kustomisasi dari Hasil Akhir + Fix QR Refresh

**Sebelum:** Setelah compositing, langsung masuk `"result"`. Semua ada di satu layar: chip Filter + Tema Frame + QR + Simpan + Cetak. Tiap tap chip → `compositeUrl` baru → useEffect upload terpicu → Cloudinary upload ulang + QR re-generate. Screenshot: "Mengunggah Foto…" muncul berkali-kali.

**Sesudah:**
- Tambah `"customize"` ke `BoothPhase` union type.
- Jalur non-AR compositing → `setPhase("customize")` (bukan langsung `"result"`).
- **Layar Kustomisasi** (`phase === "customize"`): chip Filter Warna + chip Tema Frame + preview gambar/GIF. TANPA QR/Simpan/Cetak/Bagikan. Tombol baru **"Lanjut, Lihat Hasil →"** → `setPhase("result")`.
- **Layar Hasil Akhir** (`phase === "result"`): preview gambar/GIF + QRBox + Simpan + Cetak + Bagikan + tombol **"Ubah Frame / Filter"** → kembali ke `setPhase("customize")`. Chip Filter/Tema Frame **tidak ada** di layar ini (harus lewat Ubah Frame/Filter dulu).
- `useEffect` upload tidak diubah strukturnya — guard `phase !== "result"` otomatis memblokir upload saat kustomisasi.
- **Skip-upload optimization:** `lastUploadedCompositeRef` (useRef) menyimpan `compositeUrl` terakhir yang sukses di-upload. `doUpload()` skip jika `compositeUrl === lastUploadedCompositeRef.current && uploadPhase === "done"` — cegah double upload saat bolak-balik Hasil ↔ Kustomisasi tanpa ganti apapun.
- `doUpload` diubah ke `useCallback` (dependency: `phase, compositeUrl, gifUrl, uploadPhase`).
- Animasi fade-in GSAP baris 420: `phase === "result"` → `phase === "result" || phase === "customize"`.

### TypeScript
- Build: `tsc --noEmit` exit 0, zero errors.

---

## UPDATE — Rilis Try-On 3D Asli (Agustus 2026)

**Scope:** Mode AR Try-On 3D (`components/ar/Glasses3DRenderer.tsx`, `lib/glasses3DGeometry.ts`).
**Prinsip:** ADDITIVE ONLY. File 2D existing (`GlassesRenderer.tsx`, `landmarks.ts`, `videoCover.ts`, `mediapipe.ts`) tidak diubah logikanya sama sekali (nol regresi).

### 1. Komponen & Fitur Baru
- `components/ar/Glasses3DRenderer.tsx`: Renderer 3D dengan Three.js `PerspectiveCamera`, GLTF loader, dan dekomposisi matriks `facialTransformationMatrixes` MediaPipe (posisi, rotasi quaternion via `slerp`, dan skala fisik).
- `lib/glasses3DGeometry.ts`: Generator geometri 3D kacamata prosedural instan dengan dimensi optik nyata (`frameWidthMm`, `bridgeMm`, `templeMm`), engsel logam, tangkai kacamata 3D ke belakang telinga, dan lensa optik fisik reflektif.
- `components/ar/FaceTracker.tsx`: Menerima prop `renderMode: "2d" | "3d"` dan meneruskan konfigurasi 3D ke `Glasses3DRenderer`.
- `app/photobooth/page.tsx`:
  - Toggle chip **"Mode 3D"** di panel kontrol AR (muncul pada model yang memiliki konfigurasi `model3D`).
  - Badge **"3D"** pada thumbnail kacamata di selector strip.
  - Auto-fallback mulus ke 2D saat memilih model tanpa `model3D`.
- `public/glasses/manifest.json`: Field opsional `model3D` ditambahkan untuk model hero (`square-frame`, `oval-pastel`, `round-frame`, `cateye-pastel`, `cateye-frame`, `clubmaster-frame`, `sunglasses-black`).


