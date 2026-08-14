# Prompt Revisi — AR Photobooth Optik I See You (Alur Finalisasi Foto: Retake, Kustomisasi, QR Stabil)

**Project:** AR Photobooth Optik I See You (`optikiseeyou-glasses.vercel.app`, repo `Yoshput/iseeyouphotobooth`)
**Stack:** Next.js 15.1 (static export, `output: "export"`) + React 18 + TypeScript + Tailwind, Three.js + GSAP, MediaPipe Vision, Cloudinary (unsigned upload, client-side) untuk hosting hasil foto + QR
**Scope:** Mode **Photobooth Biasa** (`/photobooth?mode=photobooth`, state `arEnabled=false`) — BUKAN mode AR Try-On (`?mode=ar`), yang sengaja tidak disentuh (lihat alasan di poin 2)
**File yang disentuh:** cuma `app/photobooth/page.tsx` — tidak perlu ubah file lain (`lib/frameCompositor.ts`, `lib/uploadImage.ts`, dll sudah benar, tinggal diatur ULANG kapan dipanggilnya)
**Tanggal:** 14 Agustus 2026

> Semua "Detail Teknis" di bawah sudah dicek langsung ke source code repo (`Yoshput/iseeyouphotobooth`, branch `main`) — nama state, function, dan nomor baris sudah diverifikasi, bukan tebakan. Kerjakan 2 poin di bawah **satu per satu**, cek Acceptance Criteria tiap poin sebelum lanjut ke poin berikutnya. Jangan ubah fitur lain (termasuk mode AR Try-On) yang tidak disebutkan di sini.

---

## Alur Baru (Target)

**Alur SEKARANG** — 2 celah yang mau dibenerin ditandai ① ②:

```
Pilih Layout → Pilih Tema Frame (awal) → Sesi Foto (countdown per slot, ada jeda
  "between" antar-foto DENGAN pilihan retake … TAPI foto TERAKHIR langsung lompat
  ke compositing tanpa jeda/retake ①)
→ Compositing
→ HASIL: Filter Warna + Tema Frame + preview + QR + Simpan/Cetak/Bagikan SEMUA
  muncul BARENGAN — tiap ganti Filter/Tema di layar ini bikin foto ke-upload ULANG
  ke Cloudinary + QR digenerate ulang ②
```

**Alur BARU yang diminta:**

```
Pilih Layout → Pilih Tema Frame (awal) → Sesi Foto (tiap foto selesai — TERMASUK
  foto terakhir — berhenti dulu: tampilkan hasilnya, pilih "Retake" atau "Lanjut")
→ Compositing (spinner singkat, seperti sekarang, tidak berubah)
→ KUSTOMISASI (BARU): Filter Warna + Tema Frame + preview, TANPA QR / Simpan /
  Cetak / Bagikan. Ganti-ganti sepuasnya — semua proses di klien (canvas), TIDAK
  ADA upload ke Cloudinary di layar ini.
→ tombol "Lanjut, Lihat Hasil →"
→ HASIL AKHIR: preview final + QR (upload ke Cloudinary terjadi SEKALI, tepat di
  transisi ini) + Simpan / Cetak / Bagikan + tombol "Ubah Frame/Filter" (balik ke
  Kustomisasi) + "Ulangi Semua" / "Ganti Layout"
```

---

## 1. Retake / Konfirmasi Setelah Tiap Foto (Termasuk Foto Terakhir)

**Kondisi saat ini:** Jeda antar-foto (`phase === "between"`) sudah ada dan sudah jalan untuk foto ke-1 s/d ke-(N−1): `handleCountdownComplete` (`app/photobooth/page.tsx`, baris ~857–862) sudah berhenti di `"between"` menunggu klik "Lanjut →" (JSX baris ~1066–1079) — bukan auto-lanjut. Tombol retake per-slot juga **sudah always-visible** (bukan hover-only) di panel "Preview Strip" kanan (ikon pojok kanan-atas tiap slot terisi, baris ~569–579, handler `handleRetakeSingleSlot` baris ~789–793).

Yang masih jadi celah:
- **(a)** Untuk foto **terakhir**, begitu selesai, kode langsung `setTimeout(() => setPhase("compositing"), 400)` (baris ~863–866) — tidak pernah mampir ke `"between"`. Nol kesempatan review/retake buat foto terakhir sebelum lanjut ke compositing.
- **(b)** Overlay `"between"` yang sekarang (baris ~1066–1079) cuma nampilin teks progress + tombol "Lanjut →" di atas video kamera live — tidak menampilkan foto yang baru diambil, dan tidak ada tombol Retake di overlay itu sendiri (retake cuma lewat ikon kecil terpisah di panel sebelah).

**Perubahan diminta:** Setiap 1 foto selesai — termasuk foto terakhir — sistem berhenti dulu, tampilkan hasil fotonya, kasih 2 pilihan jelas: **Retake** (ambil ulang foto ini) atau **Lanjut**. Kalau itu foto terakhir, "Lanjut" mengarah ke compositing, bukan ke countdown foto berikutnya.

**Detail teknis:**
1. Di `handleCountdownComplete`, ganti branch `else` (kasus foto terakhir, baris ~863–866) dari langsung `setPhase("compositing")` jadi juga `setPhase("between")`, disamakan dengan branch foto non-terakhir.
2. Overlay `"between"` (baris ~1066–1079) butuh tahu "masih ada foto lagi" vs "ini foto terakhir", supaya CTA-nya beda:
   - Masih ada slot kosong → "Lanjut ke Foto Berikutnya" → `setPhase("countdown")` (perilaku `handleNextPhoto` sekarang, baris ~797–801, dipertahankan apa adanya).
   - Semua slot sudah terisi → "Selesai, Lanjut →" → `setPhase("compositing")` (perlu percabangan baru — bisa extend `handleNextPhoto` atau function terpisah).
   - Cara hitung "semua slot terisi" yang aman: `photos.filter(Boolean).length >= layout.numPhotos`. **Jangan** pakai `currentSlot >= layout.numPhotos` mentah — `currentSlot` juga dipakai jalur `singleSlotRetake` (baris ~829, ~841–854) yang logic-nya sedikit beda, jadi turunan dari `photos` lebih aman.
3. Tambahkan preview foto yang baru diambil ke overlay `"between"` itu sendiri. Pada titik render overlay ini, `currentSlot` sudah di-set ke slot BERIKUTNYA (lihat `setCurrentSlot(nextSlot)` sebelum `setPhase("between")`) — jadi foto yang baru selesai = `photos[currentSlot - 1]`, dan target retake-nya = `handleRetakeSingleSlot(currentSlot - 1)`. Hati-hati index ini, gampang salah satu.
4. Tambah tombol "Retake" langsung di overlay `"between"`, wired ke `handleRetakeSingleSlot(currentSlot - 1)` (handler-nya sudah ada, baris ~789–793 — tinggal dipanggil dari tempat baru ini, tidak perlu logic baru).
5. Ikon retake kecil di panel "Preview Strip" (baris ~569–579) **tetap dipertahankan apa adanya** — ini jalur retake buat foto-foto sebelumnya (bukan cuma yang barusan), tetap berguna, tidak digantikan oleh poin ini.

**Acceptance criteria:**
- [ ] Setelah TIAP foto (termasuk foto terakhir), sistem berhenti dan menampilkan preview + pilihan Retake/Lanjut — bukan auto-lanjut
- [ ] Retake dari overlay ini mengulang foto yang BARU diambil dengan index yang tepat (bukan foto slot lain)
- [ ] Setelah foto terakhir dikonfirmasi ("Lanjut"/"Selesai"), baru masuk `"compositing"` lalu Kustomisasi (poin 2)
- [ ] Ikon retake per-slot di Preview Strip tetap berfungsi seperti sekarang
- [ ] Ditest pakai tap langsung di tablet (device target utama sesuai `AGENT.md`), bukan cuma mouse hover di laptop

---

## 2. Pisahkan "Kustomisasi Frame & Filter" dari "Hasil Akhir" (QR/Simpan/Cetak/Bagikan) — Sekalian Benerin QR yang Ke-Refresh Terus

**Kondisi saat ini:** Begitu compositing selesai, `phase` langsung jadi `"result"` (useEffect compositing baris ~904–935, baris ~927 untuk jalur non-AR). Komponen `StripPreview` (baris ~397–603), branch "Photobooth strip result" (dibuka dengan guard `if (phase === "result" && compositeUrl)` di baris 451), me-render SEMUA ini BARENGAN: chip Filter Warna (baris ~465–476), chip Tema Frame (baris ~478–492), preview gambar, `QRBox` (baris ~507–515), tombol Simpan/Cetak/Bagikan (baris ~517–536), dan Ulangi Semua/Ganti Layout (baris ~538–547).

**Akar masalah QR ke-refresh (sudah dikonfirmasi di kode, bukan dugaan):** `handleSelectTheme` & `handleSelectFilter` (baris ~877–901) selalu manggil `compositeFrame(...)` ulang tiap chip di-tap (ini normal, memang buat update preview). Masalahnya, useEffect upload (baris ~968–972):
```js
useEffect(() => {
  if (phase !== "result" || !compositeUrl) return;
  doUpload();
}, [phase, compositeUrl, gifUrl]);
```
ikut ke-trigger tiap `compositeUrl` berubah, SELAMA `phase === "result"`. Karena Filter Warna & Tema Frame ada di layar yang SAMA dengan `phase === "result"`, tiap tap chip = `compositeUrl` baru = `doUpload()` jalan lagi = 2 file (strip + GIF) ke-upload ulang ke Cloudinary + QR digenerate ulang (`lib/uploadImage.ts` → `uploadPhotoForQR`). Ini persis yang bikin status "Mengunggah Foto… Menyiapkan QR" muncul berkali-kali di screenshot yang dikirim.

**Perubahan diminta:** (sesuai Alur Baru di atas) Pisah jadi 2 layar: **Kustomisasi** (Filter + Tema Frame + preview, tanpa QR/Simpan/Cetak/Bagikan, ganti-ganti bebas tanpa upload apapun) → tombol "Lanjut, Lihat Hasil" → **Hasil Akhir** (preview final + QR + Simpan/Cetak/Bagikan; upload+QR digenerate SEKALI di titik transisi itu).

**Detail teknis:**
1. Tambah `"customize"` ke union type `BoothPhase` (baris 37–45), di antara `"compositing"` dan `"result"`.
2. Di useEffect compositing (baris ~904–935): jalur **non-AR** (baris ~924–934) ganti `setPhase("result")` (~baris 927) → `setPhase("customize")`. Jalur **AR Try-On** (baris ~908–921) **JANGAN diubah** — tetap `setPhase("result")` langsung. Alasan: AR Try-On tidak punya konsep Tema Frame/Filter untuk di-kustomisasi (`compositeArTryOnFrame` tidak menerima parameter tema/filter, dan komponen hasilnya `TryOnResult` memang tidak punya prop `onSelectTheme`/`onSelectFilter`) — jadi tidak butuh layar Kustomisasi sama sekali.
3. Ada **6 titik** di file ini yang mengecek `phase === "result"` / `phase !== "result"` — sudah diverifikasi lengkap (grep seluruh file), ini daftarnya supaya tidak ada yang kelewat:

   | Baris | Sekarang | Perlu diubah jadi |
   |---|---|---|
   | 420 | `phase === "result" && ref.current` (animasi fade-in masuk) | tambahkan `\|\| phase === "customize"` — biar animasi masuk juga jalan pas masuk Kustomisasi |
   | 437 | `phase === "result" && isArMode && photos[0]` (render `TryOnResult`) | **tidak berubah** (AR tidak pernah masuk `"customize"`) |
   | 451 | `phase === "result" && compositeUrl` (guard pembuka blok Filter/Tema/QR/Simpan) | jadi `(phase === "customize" \|\| phase === "result") && compositeUrl` — lalu di **dalam** blok ini baru dipecah sesuai poin 4 di bawah |
   | 670 | `rightActive = phase !== "frame-select"` | **tidak berubah** (`"customize"` otomatis membuat `rightActive = true`, sudah benar) |
   | 951, 969 | guard di `doUpload` & useEffect upload | **tidak berubah** — justru inilah yang bikin fix ini otomatis jalan (lihat poin 5) |

4. Di dalam blok baris 451 (setelah guard-nya digabung), pecah kontennya jadi 2 bagian sesuai `phase`:
   - **`phase === "customize"`**: tab Foto/GIF, chip Filter Warna, chip Tema Frame, preview gambar — persis seperti sekarang, TANPA `QRBox`, TANPA Simpan/Cetak/Bagikan, TANPA Ulangi Semua/Ganti Layout. Tambah 1 tombol CTA baru, contoh **"Lanjut, Lihat Hasil →"**, `onClick` → `setPhase("result")`.
   - **`phase === "result"`**: preview gambar final, `QRBox`, Simpan/Cetak/Bagikan, Ulangi Semua/Ganti Layout — persis seperti sekarang. Tambah 1 tombol baru **"Ubah Frame/Filter"**, `onClick` → `setPhase("customize")`.
   - ⚠️ **Perlu diputuskan:** di layar `"result"`, chip Filter Warna/Tema Frame direkomendasikan **disembunyikan total** (user wajib lewat tombol "Ubah Frame/Filter" dulu) — ini paling konsisten sama permintaan awal ("...baru muncul cetak foto, simpan, share dan qr code baru muncul" setelah kedua pilihan selesai) dan otomatis mencegah bug refresh muncul lagi dari jalur lain. Kalau maunya chip tetap kelihatan & langsung bisa diedit di layar Hasil juga, itu perlu kerjaan tambahan di luar poin 5 di bawah — sebaiknya dikonfirmasi dulu.
5. useEffect upload (baris ~968–972) **tidak perlu diubah strukturnya** — begitu poin 1–4 selesai, dia otomatis cuma jalan pas `phase` beneran `"result"` (yaitu pas user tap "Lanjut, Lihat Hasil" dari Kustomisasi), karena selama Kustomisasi `phase === "customize"`, bukan `"result"`, jadi guard yang sudah ada otomatis memblokirnya.
6. ⚠️ **Edge case worth ditangani:** kalau user dari Hasil balik ke Kustomisasi (tombol "Ubah Frame/Filter") TANPA ganti apa-apa, lalu tap "Lanjut, Lihat Hasil" lagi — `phase` balik jadi `"result"`, dan karena `phase` termasuk dependency di useEffect upload, ini tetap akan trigger `doUpload()` lagi walau `compositeUrl` sama persis (upload & QR baru terbuang percuma, network request nggak perlu). **Rekomendasi:** simpan compositeUrl terakhir yang SUKSES di-upload (misal `useRef`), lalu skip `doUpload()` kalau `compositeUrl` sekarang sama dengan itu — langsung `setPhase("result")` pakai QR/link lama. Boleh dikerjakan sekalian di poin ini, atau ditandai sebagai polish susulan kalau waktu mepet — tapi tolong minimal di-flag di PR/commit message kalau belum sempat.

**Acceptance criteria:**
- [ ] Setelah compositing, user masuk layar Kustomisasi (Filter + Tema Frame) — QR/Simpan/Cetak/Bagikan belum muncul sama sekali di sini
- [ ] Ganti-ganti Filter Warna & Tema Frame di Kustomisasi TIDAK memicu request ke Cloudinary (cek tab Network browser: nol request Cloudinary selama di layar ini)
- [ ] Baru setelah tap "Lanjut, Lihat Hasil", layar Hasil Akhir muncul dengan QR + Simpan + Cetak + Bagikan
- [ ] Upload ke Cloudinary + generate QR cuma terjadi 1x per kunjungan ke Hasil Akhir — dicek juga skenario bolak-balik Hasil ⇄ Kustomisasi tanpa ganti apa-apa
- [ ] Tombol "Ubah Frame/Filter" di Hasil Akhir berfungsi balik ke Kustomisasi
- [ ] Mode AR Try-On (`?mode=ar`) tidak terpengaruh sama sekali — tetap langsung compositing → result seperti sekarang
- [ ] Ditest di tablet (device target utama), bukan cuma laptop

---

## Catatan / Perlu Dikonfirmasi

- **Poin 2, detail teknis #4:** setuju chip Filter Warna/Tema Frame disembunyikan total di layar Hasil Akhir (harus lewat "Ubah Frame/Filter" dulu)? Ini asumsi default yang dipakai di atas.
- **Poin 2, detail teknis #6:** skip-upload-kalau-tidak-ada-perubahan — dikerjakan sekalian sekarang, atau boleh susulan?
- Tombol "Ulangi Semua" & "Ganti Layout" diasumsikan tetap tinggal di layar Hasil Akhir saja (bukan juga di Kustomisasi), sesuai urutan yang diminta ("...qr code, simpan, share, dan ganti layout atau retake semua" disebut di langkah terakhir). Betul begitu, atau perlu juga ada di Kustomisasi?
- Setelah kedua poin ini selesai & ditest di tablet, tolong tambahkan ringkasan perubahan ke bagian "UPDATE" di `AGENT.md`, mengikuti pola yang sudah ada di file itu.
