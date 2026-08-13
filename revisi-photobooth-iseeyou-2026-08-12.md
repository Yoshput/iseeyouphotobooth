# Prompt Revisi — AR Photobooth Optik I See You (Round 2: Photobooth + Try-On)

**Project:** AR Photobooth Optik I See You (`optikiseeyou-glasses.vercel.app`, repo `Yoshput/iseeyouphotobooth`)
**Stack:** Next.js 15 (static export) + React 18 + TypeScript + Tailwind, Three.js + GSAP, MediaPipe Vision (face tracking)
**Sumber revisi:** Acha · **Tanggal:** 12 Agustus 2026

> Semua "Detail Teknis" di bawah sudah dicek langsung ke source code repo (`Yoshput/iseeyouphotobooth`, branch `main`), bukan tebakan — termasuk nama file & baris kira-kira. Kerjakan satu per satu, cek Acceptance Criteria tiap poin sebelum lanjut. Poin bertanda ⚠️ punya asumsi yang sebaiknya dikonfirmasi dulu sebelum dikerjakan — daftar lengkapnya ada di bagian akhir.

---

## BAGIAN A — PHOTOBOOTH (5 poin dari Acha)

### A1. Perbanyak Variasi Tema Frame per Jumlah Foto

**Kondisi saat ini:** Katalog tema sekarang ada 8, semua didefinisikan di array `FRAME_THEMES` (`lib/frameCompositor.ts`): `classic-white`, `vintage-film-bw`, `newspaper-editorial`, `frame-koran-custom`, `emerald-luxury`, `vintage-warm`, `pastel-pink`, `midnight-dark`. 6 dari 8 itu "universal" (`supportedPhotoCounts: [1,2,3,4,6]`) — cuma beda kombinasi warna, dirender lewat satu fungsi generik yang sama. Yang beneran beda struktur visualnya cuma `vintage-film-bw`, `newspaper-editorial`, dan `frame-koran-custom`.

**Perubahan diminta:** Tambah lebih banyak opsi tema — termasuk khusus buat layout 3 foto & 4 foto, bukan cuma versi 1-foto yang direcolor.

**Detail teknis:**
- Cara tercepat nambah jumlah: tambah entry baru ke `FRAME_THEMES` dengan kombinasi warna baru — otomatis jalan lewat `compositeFrame()` default branch, tanpa fungsi render baru. Murah, tapi hasilnya tetap 1 pola visual generik.
- Tema yang beneran beda struktur (kayak `vintage-film-bw` / `newspaper-editorial`) butuh fungsi draw sendiri (pola: `drawVintageFilmStripFrame`, `drawNewspaperEditorialFrame`) dan kadang asset custom — effort desain+dev terpisah, lebih berat.
- ⚠️ Perlu diputusin: fokus nambah varian warna dulu (cepat, bisa banyak sekaligus), atau fokus ke tema struktural baru yang lebih dikit tapi lebih beda per jumlah foto?

**Acceptance criteria:**
- [ ] Ada tambahan tema baru di layar "Pilih Tema Frame", jumlah konkret disepakati dulu
- [ ] Tema baru muncul sesuai jumlah foto yang kompatibel (lewat `getCompatibleThemes()`)
- [ ] Preview kartu tema sesuai desain aslinya (lihat juga A5)

---

### A2. Reposisi Tombol "Mulai Foto" + Rapikan Indikator Wajah

**Kondisi saat ini:** Tombol capture (`Mulai Foto — Xs × N Foto` / `Try On & Ambil Foto (1x)`) ada di panel kanan, di ATAS "Preview Strip" — bukan menempel di area kamera. Ada badge `Wajah Terdeteksi!` / `Arahkan ke Kamera` yang mengambang sendiri di bawah preview kamera (`app/photobooth/page.tsx`, ~baris 1059), terpisah dari tombol.

**Perubahan diminta:** Pindahkan tombol ke bawah (dekat kamera), perbesar, kasih efek "timbul"/pressable biar jelas bisa diklik. Badge "Wajah Terdeteksi" dihilangkan, atau digabung tepat di atas tombol.

**Detail teknis:**
- Tombol & badge ini dirender oleh komponen yang sama dipakai baik untuk mode Photobooth biasa maupun Try-On AR (beda cuma teks tombolnya, ~baris 1186–1187). Jadi satu perbaikan layout di sini otomatis berlaku juga untuk poin **B3** — tidak perlu dikerjakan dua kali.
- Ada indikator kedua yang mirip/kemungkinan redundan juga (~baris 1110–1112: `Terdeteksi` / `Tidak ada wajah`) — worth dicek sekalian biar tidak ada 2–3 indikator wajah di tempat berbeda.

**Acceptance criteria:**
- [ ] Tombol capture menempel di bagian bawah area kamera, lebih besar dari sekarang
- [ ] Ada efek visual "timbul"/pressable yang jelas terlihat bisa diklik
- [ ] Badge "Wajah Terdeteksi" tidak lagi mengambang sendiri terpisah dari tombol
- [ ] Perilaku sama antara mode Photobooth biasa & Try-On AR

---

### A3. Retake Foto Individual Tanpa Ulang dari Awal + Alur "1 Take → Klik Lagi"

**Kondisi saat ini:** Mekanisme retake per-slot **sudah ada** di kode — state `singleSlotRetake`, handler `handleRetakeSingleSlot`, tombol "Retake Foto #N" per slot di Preview Strip (~baris 552–598). Tapi tombol itu cuma muncul lewat **hover** (`opacity-0 group-hover:opacity-100`) — di tablet/kiosk (device target acara ini) tidak ada hover, jadi tombol ini praktis tidak bisa disentuh sama sekali. Selain itu, alur capture sekarang otomatis lanjut ke foto berikutnya ~1.2 detik setelah tiap foto (`handleCountdownComplete`, ~baris 815–843: begitu `nextSlot < layout.numPhotos`, langsung `setTimeout` 1200ms lalu lanjut countdown sendiri) — bukan menunggu klik user lagi.

**Perubahan diminta:** (a) Retake per-foto harus bisa disentuh di tablet, bukan cuma muncul saat hover. (b) Tiap foto berhenti dulu menunggu klik user sebelum mulai countdown foto berikutnya.

**Detail teknis:**
- (a) Ganti trigger tombol retake dari hover-only jadi selalu terlihat (misal ikon retake kecil permanen di pojok tiap slot yang sudah terisi). Logic `handleRetakeSingleSlot` sendiri sudah benar, tinggal cara munculnya yang perlu diganti.
- (b) Di `handleCountdownComplete`, bagian `setTimeout(() => { setCurrentSlot(nextSlot); setPhase("countdown"); }, 1200)` diganti jadi berhenti di fase menunggu (state `"between"` sudah ada, tinggal jangan auto-lanjut) — baru lanjut countdown setelah ada klik baru dari user.

**Acceptance criteria:**
- [ ] Bisa retake foto tertentu (bukan cuma foto terakhir) tanpa mengulang sesi dari awal, dan bisa di-tap langsung di tablet
- [ ] Setelah 1 foto selesai, sistem berhenti dulu menunggu klik user sebelum countdown foto berikutnya mulai
- [ ] Ditest pakai tap/touch beneran di tablet, bukan cuma mouse hover di laptop

---

### A4. Batasi Frame Koran Khusus Opsi 3 Foto

**Kondisi saat ini:** Theme `frame-koran-custom` ("Frame Koran I See You", `lib/frameCompositor.ts` ~baris 76–91) di-set `supportedPhotoCounts: [1, 2, 3, 4, 6]` — artinya bisa kepilih di SEMUA opsi layout. Padahal fungsi `drawFrameKoranCustomOverlay()` (~baris 570–612) selalu pakai 3 koordinat slot foto yang tetap (proporsional dari ukuran asli `Frame Koran.png`, 1333×2000px), berapa pun jumlah foto yang sebenarnya dipilih. Kalau layout 1/2/4 foto kepilih bareng tema ini, hasil composite-nya salah (foto ke-4 dst kebuang, atau slot kosong).

**Perubahan diminta:** Tema ini cuma boleh muncul kalau user pilih opsi 3 foto.

**Detail teknis:** Ganti `supportedPhotoCounts: [1, 2, 3, 4, 6]` jadi `supportedPhotoCounts: [3]` pada object theme id `frame-koran-custom`.

⚠️ **Perlu dikonfirmasi:** dengan `supportedPhotoCounts: [3]`, tema ini available di SEMUA 3 varian layout "3 Foto" (`trio_vert`/Strip Vertikal, `trio_grid`/Grid Kombinasi, `trio_koran`/Frame Koran) karena ketiganya `numPhotos=3`. Kalau maksudnya "3 foto manapun", ini sudah pas. Kalau maksudnya "khusus pas pilih kartu layout 3 Foto / Frame Koran itu sendiri", ganti jadi `supportedLayoutIds: ["trio_koran"]` — pola yang sama persis dipakai `newspaper-editorial` untuk `["solo", "duo_vert"]` (~baris 74).

**Acceptance criteria:**
- [ ] Frame Koran tidak muncul lagi sebagai pilihan saat layout 1, 2, atau 4 foto dipilih
- [ ] Frame Koran tetap berfungsi normal saat layout 3 foto dipilih
- [ ] Sudah dikonfirmasi cakupannya: "3 foto manapun" atau "khusus layout Frame Koran"

---

### A5. Preview Tema "Frame Koran" Masih Blank & Beda dari Hasil Akhir

**Kondisi saat ini:** Komponen `VisualThemeMockup` (`components/ui/FrameThemePicker.tsx`) cuma punya rendering visual khusus (flag `isNewspaper`) untuk `theme.id === "newspaper-editorial"`. Theme `frame-koran-custom` tidak match kondisi manapun di komponen ini, jadi preview kartunya jatuh ke branch default/generik (kartu putih polos placeholder biasa) — bukan preview desain koran aslinya. Sudah ada asset yang didesain khusus untuk ini — `Frame Koran_preview.png` dan `Frame_Koran_transparent_preview.png` (`public/frame photobooth/`) — tapi belum direferensikan sama sekali di kode manapun (sudah dicek, 0 hasil).

**Perubahan diminta:** Preview kartu tema Frame Koran harus menampilkan desain aslinya, dan konsisten dengan hasil foto akhir.

**Detail teknis:**
- Tambah cabang kondisi baru di `VisualThemeMockup` khusus `theme.id === "frame-koran-custom"` (pola serupa `isNewspaper` yang sudah ada), menampilkan `Frame Koran_preview.png` sebagai thumbnail — asset ini sepertinya memang sudah disiapkan untuk kebutuhan ini (~200KB, jauh lebih kecil dari versi overlay full-res ~1.3MB).
- Sekalian audit tema lain (kalau ada) yang preview-nya belum tentu representatif dari hasil `compositeFrame()` asli — sesuai concern di catatan Acha soal konsistensi preview vs hasil akhir.

**Acceptance criteria:**
- [ ] Kartu preview "Frame Koran I See You" menampilkan desain koran asli, bukan kartu generik
- [ ] Preview konsisten (warna, layout) dengan hasil foto akhir setelah di-composite
- [ ] Tema lain (kalau ada yang preview-nya belum representatif) sekalian dibereskan

---

## BAGIAN B — TRY-ON (3 poin dari Acha)

### B1. Tambah Opsi Frame + Perbaiki 2 Frame Kosong + Kalibrasi Auto-Fit

**Kondisi saat ini:** `manifest.json` (`public/glasses/`) punya 8 entry, termasuk `round-gold` (Round Gold Wire, file: `round-gold.png`) dan `clear-antirad` (Clear Anti-Rad, file: `clear-antirad.png`). Kedua file PNG ini **tidak ada sama sekali** di folder `public/glasses/` (isinya cuma: `aviator-frame.png`, `aviator-silver.png`, `caramel-frame.png/jpg`, `cateye-frame.png`, `clubmaster-frame.png`, `clubmaster-black.png`, `oval-frame.png`, `square-frame.png`). Makanya 2 opsi itu kosong saat diklik (gambar 404) — asetnya memang belum pernah diupload, bukan bug render.

**Perubahan diminta:** Siapkan asset untuk 2 frame kosong itu, tambah lebih banyak opsi (gaya yang paling dicari), pastikan posisi/skala tiap frame baru dikalibrasi dengan baik di wajah.

**Detail teknis:**
- Quick win yang worth dicek dulu: folder `public/glasses/Transparan-Frame Depan/` sudah berisi 5 asset (`Frame Aviator.png`, `Frame Cat Eye.png`, `Frame Hitam.png`, `Frame Oval.png`, `Kacamata Frame.png`) yang sepertinya belum pernah didaftarkan ke `manifest.json` — kemungkinan batch asset yang lebih baru. Worth dicek dulu apakah 5 asset ini bisa langsung dipakai (termasuk untuk mengisi slot Round Gold-Wire & Clear Anti-Rad) sebelum generate PNG baru dari nol.
- Tiap entry baru wajib dikasih `fitWidthRatio` & `ipdScaleRef` yang dikalibrasi manual per-asset — dan ini **harus** ditest langsung di device asli pakai kamera & wajah beneran, tidak bisa ditebak dari kode saja. Ini proses yang sama seperti yang sebelumnya dipakai untuk membenarkan 8 frame yang sekarang sudah jalan.
- ⚠️ Selain 2 yang Acha sebutkan: katalog produk (`lib/catalog.ts`, koleksi "Shades Edition") juga menyimpan `glassesId: "sunglasses-classic"` & `glassesId: "sunglasses-modern"` yang juga tidak ada di manifest maupun asset PNG-nya. Field ini belum di-link ke fitur try-on manapun di halaman katalog saat ini (jadi belum jadi bug yang kelihatan user), tapi worth diberesin bareng biar konsisten nanti.
- ⚠️ "Gaya yang paling dicari" perlu referensi lebih spesifik dari Acha (nama produk/gaya tertentu, atau data best-seller toko), atau bisa dicocokkan ke 7 koleksi yang sudah ada fotonya di `/katalog` (Cat Eye Edition, Metro Deek, New Collection, Quiet Luxury, Shades Of Elegance, Titanium Edition, Shades Edition) biar try-on & katalog konsisten.

**Acceptance criteria:**
- [ ] "Round Gold Wire" & "Clear Anti-Rad" tampil normal saat dipilih
- [ ] Ada tambahan opsi frame baru sesuai arahan gaya dari Acha
- [ ] Semua frame (lama & baru) posisinya pas di wajah — tidak kekecilan/kegedean/naik ke atas — ditest di device asli
- [ ] Ditest di minimal 1 Android & 1 tablet sebelum dianggap selesai

---

### B2. Hilangkan Badge "Wajah Terdeteksi" yang Tumpang Tindih

**Kondisi saat ini:** Ada 2 sistem indikator status wajah yang jalan independen & bisa tumpang tindih. **(1)** `FaceGuideOverlay.tsx` + `lib/faceGuide.ts` — status pill yang sudah cukup canggih & fungsional: pesannya berubah sesuai posisi wajah asli — "Terlalu jauh, mendekat ke kamera" untuk status `far`, "Terlalu dekat, geser sedikit menjauh" untuk `close`, "Posisi Pas! Terdeteksi" untuk `ideal`, dst (ini yang muncul di screenshot). **(2)** Badge legacy terpisah langsung di `app/photobooth/page.tsx` (~baris 1059): `{faceDetected ? "Wajah Terdeteksi!" : "Arahkan ke Kamera"}` — cuma berdasarkan boolean sederhana, tidak memberi arahan posisi apa-apa. Keduanya render bersamaan → tumpang tindih persis seperti yang dikeluhkan.

**Perubahan diminta:** Hilangkan badge yang tumpang tindih; indikator yang tersisa harus benar-benar fungsional, bukan cuma tampilan.

**Detail teknis:** Hapus badge legacy (~baris 1050–1059), biarkan `FaceGuideOverlay` jadi satu-satunya sumber status — komponen ini sudah lebih lengkap (arahan far/close/kiri/kanan/atas/bawah/ideal), jadi tidak ada fungsi yang hilang. Ada juga indikator ketiga yang mirip (~baris 1110–1112: `Terdeteksi`/`Tidak ada wajah`) — worth dicek & dirapikan sekalian.

**Acceptance criteria:**
- [ ] Cuma ada 1 indikator status wajah yang tampil di layar try-on
- [ ] Indikator yang tersisa memberi arahan akurat & real-time, bukan cuma teks "terdeteksi"

---

### B3. Pindah Tombol "Mulai Try On" ke Bawah Layar Kamera

**Kondisi saat ini:** Sama seperti poin **A2** — tombol ada di panel kanan bagian atas, bukan menempel di bawah area kamera.

**Perubahan diminta:** Pindah ke bawah layar dekat kamera — alasannya fitur ini akan dipakai di tablet/iPad, jadi butuh posisi yang ergonomis untuk disentuh.

**Detail teknis:** Ini komponen/JSX yang sama dengan tombol capture di mode Photobooth biasa (lihat A2) — satu perbaikan layout di sana otomatis berlaku di sini juga, tidak perlu dikerjakan dua kali. Prioritaskan test di ukuran layar tablet/iPad, bukan cuma laptop/desktop, karena itu device target sebenarnya.

**Acceptance criteria:**
- [ ] Tombol menempel di bawah area kamera, gampang dijangkau di tablet/iPad
- [ ] Ditest langsung di ukuran layar tablet, bukan cuma preview browser desktop

---

## Catatan / Perlu Dikonfirmasi ke Acha

- **A1:** fokus nambah varian warna dulu (cepat, banyak sekaligus), atau tema struktural baru yang lebih beda per jumlah foto (effort lebih besar, lebih sedikit)?
- **A4:** Frame Koran available di semua layout 3-foto, atau khusus pas pilih kartu layout "3 Foto / Frame Koran" itu sendiri?
- **B1:** referensi spesifik "gaya paling dicari" biar arah nambah frame try-on tepat sasaran — atau boleh dicocokkan ke 7 koleksi yang sudah ada di `/katalog`?
- **B1:** sekalian benerin `glassesId` "sunglasses-classic"/"sunglasses-modern" yang juga belum ada asetnya (belum jadi bug aktif, tapi bakal kena kalau fitur "coba AR dari katalog" nanti dihubungkan)?
