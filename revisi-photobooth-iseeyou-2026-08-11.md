# Prompt Revisi — AR Photobooth Optik I See You

**Project:** AR Photobooth Optik I See You (`optikiseeyou-glasses.vercel.app`, repo `Yoshput/iseeyouphotobooth`)
**Stack:** Next.js 15 (static export) + React 18 + TypeScript + Tailwind, Three.js + GSAP, MediaPipe Vision (face tracking)
**Sumber revisi:** Atasan · **Tanggal:** 11 Agustus 2026

> Kerjakan 7 poin di bawah ini **satu per satu**, sesuai urutan. Setiap poin punya Kondisi Saat Ini → Perubahan Diminta → Detail Teknis → Acceptance Criteria. Jangan ubah fitur lain yang tidak disebutkan di sini. Cek acceptance criteria tiap poin sebelum lanjut ke poin berikutnya.

---

## 1. Reposisi Vertikal Asset Kacamata (AR Try-On)

**Kondisi saat ini:** Posisi kacamata saat try-on masih terlalu tinggi di wajah, belum pas di jembatan hidung.

**Perubahan diminta:** Turunkan posisi vertikal asset kacamata, lalu fitting ulang.

**Detail teknis:**
- Logic anchor kemungkinan besar ada di `useFaceTracking.ts` / `GlassesRenderer.tsx` / `landmarks.ts` — file yang sama yang sebelumnya dipakai untuk fix IPD-scale & smoothing.
- Cek landmark referensi yang dipakai sebagai anchor sumbu-Y (biasanya nose bridge / mid-eye line dari MediaPipe FaceLandmarker), lalu koreksi offset vertikalnya.
- **Penting:** offset harus proporsional terhadap ukuran wajah (relatif terhadap IPD/jarak antar landmark), bukan pixel tetap — supaya tetap konsisten saat user maju-mundur dari kamera, sama seperti pendekatan `ipdScaleRef` yang sudah dipakai untuk scaling.
- Test pakai kacamata asli di wajah user (catatan sebelumnya: render sempat mengecil lagi saat dites dengan kacamata asli) — pastikan regresi ukuran tidak muncul lagi bareng fix posisi ini.

**Acceptance criteria:**
- [ ] Kacamata terlihat pas di jembatan hidung, tidak "mengambang" di atas alis
- [ ] Posisi konsisten saat wajah bergerak maju/mundur/miring
- [ ] Ditest di Android, iOS Safari, MacBook, tablet

---

## 2. Redesain Tombol Aksi di Homepage (Hero Section)

**Kondisi saat ini:** 4 tombol pil di bawah CTA utama: Katalog Frame, Pricelist Lensa, Konsultasi Gratis, Toko Shopee.

**Perubahan diminta:**
- Hapus tombol **Konsultasi Gratis** dari grid ini — fungsinya digantikan oleh ikon WA baru (lihat poin berikut).
- **Toko Shopee** tidak dihapus, tapi direlokasi: dari grid tombol lama, jadi ikon bulat di bawah foto kacamata hero, **di sebelah kanan** ikon WA (berdampingan — WA di kiri, Shopee di kanan).
- Tambahkan 1 ikon WA bulat baru di posisi yang sama, **di bawah foto kacamata hero**, di sebelah kiri ikon Shopee.
- Style kedua ikon (WA & Shopee): bulat, efek transparan timbul/embossed (glassmorphism — background putih/frosted semi-transparan, soft shadow, sedikit bevel 3D supaya jelas terlihat bisa diklik/hover), konsisten satu sama lain.
- **Katalog Frame** dan **Pricelist Lensa** tetap di posisi baris tombol semula, tapi diperbesar dan di-restyle supaya konsisten dengan gaya "transparan timbul" yang sama seperti kedua ikon baru.

**Detail teknis:**
- Link ikon WA & Shopee: pakai link/nomor yang sama dengan yang sebelumnya terhubung ke tombol "Konsultasi Gratis" dan "Toko Shopee" lama — jangan ganti tujuan link, cuma pindah posisi & ganti tampilan jadi ikon bulat.
- Layout: WA dan Shopee sejajar horizontal (side by side) tepat di bawah foto/asset kacamata hero yang melayang.
- Style referensi: glassmorphic circular button — `backdrop-filter: blur()`, background rgba putih transparan, box-shadow lembut, border tipis putih semi-transparan; hover/active state: scale up sedikit + shadow lebih dalam, biar affordance klik-nya jelas.

**Acceptance criteria:**
- [ ] Tombol Konsultasi Gratis & Toko Shopee sudah tidak ada di grid tombol lama
- [ ] Ikon WA & Shopee (bulat, style glass/timbul transparan) muncul berdampingan di bawah foto kacamata hero — WA di kiri, Shopee di kanan
- [ ] Katalog Frame & Pricelist Lensa lebih besar dari sebelumnya, style matching
- [ ] Rapi & proporsional di layar mobile

---

## 3. Ganti Foto Frame Hero (Bukan Aviator)

**Kondisi saat ini:** Hero menampilkan 1 foto kacamata aviator (silver frame, lensa gradient) dengan efek melayang/floating.

**Perubahan diminta:** Ganti aviator → foto model frame **polos putih**, tampilkan **2 model foto** (bukan cuma 1), efek floating tetap sama seperti sekarang.

**Detail teknis:**
- Idealnya asset diambil dari folder asset kacamata yang sudah dikategorikan (oval, round/bulat, aviator, cat-eye, dst) — pastikan varian "polos putih" ini memang ada & konsisten dengan katalog yang bisa dicoba di fitur AR, supaya tidak menampilkan produk yang sebenarnya tidak tersedia untuk try-on.
- Pertahankan animasi 3D/GSAP floating + parallax mouse yang sudah ada di hero (idle rotation dari 3D hero model) — cuma ganti source model/foto, jangan hapus animasinya.
- Sekalian dicek ulang bug empty-space (3D model kadang gagal render di hero) saat mengganti asset ini.

**Acceptance criteria:**
- [ ] 2 foto frame polos putih tampil di hero, bukan aviator
- [ ] Efek floating/animasi tetap smooth seperti versi sebelumnya
- [ ] Tidak ada empty space / asset gagal render

---

## 4. Form Nama + No. WA di Ruang Pesan CS (Katalog & Try-On)

**Kondisi saat ini:** Sudah ada template pesan WA otomatis untuk tombol "tanya stok" pasca try-on, tapi belum ada input nama & nomor WA dari user sebelum chat dibuka.

**Perubahan diminta:** Tambahkan field Nama + No. WA sebelum user diarahkan ke chat CS, berlaku di **2 tempat**: halaman Katalog dan halaman/hasil Try-On.

**Detail teknis:**
- Alur yang disarankan: user klik tombol "Chat CS" / "Tanya Stok" → modal kecil muncul, isi Nama & No. WA → data otomatis disisipkan ke template pesan WA yang **sudah ada** (extend template lama, jangan bikin dari nol) → baru redirect ke link WA.
- Validasi minimal: nomor WA format Indonesia (08xx atau +62).
- Bisa dibuat 1 komponen shared (misal `<ContactCSModal />`) dipakai di kedua halaman biar konsisten & gampang di-maintain.

**Asumsi yang perlu dicek:** poin ini diasumsikan merujuk ke flow WA yang sudah ada (bukan bikin in-app chat room baru dari nol). Kalau maksud atasan ternyata chat widget in-app terpisah, perlu diklarifikasi dulu sebelum dikerjakan.

**Acceptance criteria:**
- [ ] Modal Nama + No. WA muncul sebelum WA chat terbuka, di halaman Katalog
- [ ] Modal yang sama juga muncul di halaman Try-On
- [ ] Nama & no. WA yang diisi benar-benar masuk ke pesan WA yang terkirim, bukan cuma dikumpulkan lalu diabaikan

---

## 5. Fix QR Scan Simpan Foto (Error di Safari, Android, MacBook, Tablet)

**Kondisi saat ini:** Fitur scan QR untuk simpan foto hasil photobooth error di semua platform tersebut.

**Langkah 0 — konfirmasi dulu ke Antigravity:** tanyakan apakah project saat ini masih pakai static export (`output: 'export'` di `next.config.js`) atau tidak. Ini nentuin pendekatan fix yang paling cepat & aman — jangan langsung ubah konfigurasi apapun sebelum ini jelas.

**Kemungkinan akar masalah:** foto hasil photobooth kemungkinan besar cuma tersimpan sebagai `blob:` URL lokal di browser tablet (device photobooth), dan QR code isinya mengarah ke blob URL itu. Blob URL cuma valid di device & browser session yang membuatnya — begitu di-scan dari HP lain, otomatis gagal. Kalau ini benar, foto **wajib di-upload dulu** ke storage publik supaya QR mengarah ke URL `https://` permanen yang bisa diakses dari device manapun.

**Rekomendasi — mengingat target beli domain & publish 1-2 minggu lagi:**
- Opsi tercepat & paling minim risiko: **upload foto langsung dari client ke layanan storage pihak ketiga** (misal Cloudinary, pakai "unsigned upload preset") begitu foto selesai di-composite — lalu QR diarahkan ke URL publik hasil upload itu.
- Ini **tidak perlu ubah konfigurasi Next.js/Vercel sama sekali** — project boleh tetap static export, tidak perlu bikin API route/serverless function baru. Setup-nya cuma bikin 1 upload preset "unsigned" di dashboard Cloudinary (atau layanan sejenis), lalu 1 fetch call dari client. Free tier-nya cukup buat kebutuhan event/demo ini.
- Opsi "matikan static export, pindah ke Vercel serverless/edge function" tetap valid secara teknis, tapi **untuk deadline sekarang sebaiknya jangan diambil dulu** — ini perubahan arsitektur yang bisa berdampak ke bagian lain web yang mungkin bergantung ke static export, dan risikonya terlalu besar buat dites ulang di sisa waktu 1-2 minggu.
- Kalau nanti setelah publish ada waktu lebih longgar, opsi serverless/edge function bisa dipertimbangkan lagi buat jangka panjang (semua asset & foto tersimpan di infra sendiri, gak gantung pihak ketiga).
- Catatan tambahan: karena ini foto pelanggan, sebaiknya set auto-expire/retensi terbatas (misal beberapa hari) di layanan storage-nya, bukan disimpan permanen tanpa batas waktu.

**Detail lain yang tetap perlu dicek (di luar isu utama di atas):**
1. **CORS/canvas tainting di Safari:** kalau proses compositing foto (canvas) menggambar image dari sumber lain tanpa `crossOrigin="anonymous"` dan header CORS yang benar, `canvas.toDataURL()` / `toBlob()` bisa throw `SecurityError`, khususnya di Safari.
2. **Safari iOS spesifik:** attribute `download` pada tag `<a>` sering tidak jalan di Safari iOS untuk file lintas origin. Kalau QR ujungnya membuka halaman dengan tombol download, siapkan fallback instruksi "tekan & tahan gambar untuk simpan", atau pakai Web Share API sebagai alternatif.

**Acceptance criteria:**
- [ ] Sudah dikonfirmasi ke Antigravity: status static export project saat ini
- [ ] Foto ter-upload ke URL publik (bukan blob URL lokal) sebelum QR digenerate
- [ ] Scan QR dari HP lain (bukan device photobooth) berhasil menampilkan & menyimpan foto
- [ ] Ditest di Safari iOS, Android Chrome, MacBook, tablet
- [ ] Tetap berhasil walau di-scan beberapa menit setelah foto diambil

---

## 6. Detail Jam Operasional per Cabang (Sinkron dengan Google Maps)

**Kondisi saat ini:** Section Cabang (carousel auto-slide, title-only per slide, klik buka modal detail + link maps) belum menampilkan jam operasional lengkap.

**Data resmi dari Google Maps — masukkan persis seperti ini:**

**Optik I See You Cilacap**
- Alamat: Jl. Rinjani Depan Perum GRP No.2 Ruko No.3, Rawagaru, Sidanegara, Kec. Cilacap Tengah, Kabupaten Cilacap, Jawa Tengah 53223
- Telepon: 0851-3593-0533
- Jam: **Setiap hari, 09.00–21.00**

**Optik I See You Wonosobo**
- Alamat: Jl. Jenderal Soedirman, Sumberan Selatan, Wonosobo Bar., Kec. Wonosobo, Kabupaten Wonosobo, Jawa Tengah 56311
- Telepon: 0878-3243-5384
- Jam: **Setiap hari, 09.00–18.00**

**Optik I See You Purbalingga**
- Alamat (data Maps): Jl. Onje No.1, Purbalingga, Purbalingga Lor, Purbalingga, Kabupaten, Kec. Purbalingga, Kabupaten Purbalingga, Jawa Tengah 53311
  *(versi ringkas untuk tampilan UI, kalau string di atas kepanjangan: "Jl. Onje No.1, Purbalingga Lor, Kec. Purbalingga, Kabupaten Purbalingga, Jawa Tengah 53311")*
- Telepon: 0822-3486-2322
- Jam: **Senin–Jumat 11.00–20.00**, **Sabtu–Minggu 09.00–21.00**

**Detail teknis:**
- Data ini masuk ke modal detail cabang yang sudah didesain sebelumnya (bukan bikin komponen baru).
- Kalau semua hari sama (Cilacap & Wonosobo), tampilkan ringkas ("Setiap hari, jam X–Y") — jangan diulang 7 baris. Kalau beda per hari (Purbalingga), tampilkan grouped seperti di atas.
- Sekalian pastikan alamat & no. telepon yang tampil di modal sudah sinkron dengan data di atas.

**Acceptance criteria:**
- [ ] Ketiga cabang menampilkan jam sesuai data Google Maps di atas, tidak ada yang typo/beda
- [ ] Alamat & no. telepon juga sinkron dengan data di atas

---

## 7. Tambah Katalog Softlens

**Perubahan diminta:** Tambahkan section/halaman katalog softlens baru, dengan CS WA khusus: **+62 895-4156-14261** (terpisah dari nomor CS umum di bagian lain web).

**Referensi konten (dari akun IG @iseeyou.soflens):**
- Kategori produk yang perlu diwadahi: lensa warna (contoh varian yang sudah ada: Sheer Brown, Dewy Grey, Petal Grey, Blush Brown, Bebi Light Brown/Grey, Hanni Brown) dengan label spesifikasi umum: Anti Blue Light, Smooth Surface, All Day Comfort, For Sensitive Eyes, UV Protection.
- Topik edukasi (dari highlight IG mereka) yang bisa jadi FAQ/info section terpisah dari grid produk: Minus tinggi (ready stock softlens minus tinggi), Silinder (astigmatism), Cara pakai, Cuci soflen, Tetes mata, Cairan soflen.

**Detail teknis:**
- Untuk konsistensi visual, reuse pattern yang sudah dipakai di `/katalog` kacamata: grouped by category + navbar, klik produk buka modal detail lebih besar, gaya premium/elegan/simple sesuai arahan desain sebelumnya.
- Tombol chat CS di halaman ini pakai nomor **+62 895-4156-14261**, bukan nomor CS umum.

**Acceptance criteria:**
- [ ] Ada halaman/section baru "Katalog Softlens" yang bisa diakses dari navigasi
- [ ] Tombol CS di halaman ini terhubung ke +62 895-4156-14261
- [ ] Produk terkelompok per kategori, tidak numpuk jadi 1 grid tanpa pengelompokan

---

## Catatan / Perlu Dikonfirmasi ke Atasan

- **Poin 4:** pastikan format template pesan WA yang sudah ada, biar Nama & No. WA disisipkan di posisi yang tepat dalam template.
- **Poin 5:** kalau project ternyata masih pure static export, pindah ke serverless/edge function itu perubahan arsitektur — bukan sekadar bugfix kecil. Worth di-flag ke atasan soal potensi tambahan waktu kerja untuk poin ini.
