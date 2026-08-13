# PROMPT — Redesign Katalog Softlens "Optik I See You" (untuk Antigravity / Gemini 3.6 Flash High)

## 0. KONTEKS PROYEK
Ini adalah proyek Next.js (folder `isy-photobooth`) milik website Optik I See You. Saat ini sudah ada halaman `/softlens` yang menampilkan katalog softlens, tapi tampilannya masih terlalu **plain/basic** (kartu putih polos, lingkaran warna generik dengan ikon mata). Tugasmu adalah **mendesain ulang UI katalog Softlens agar terasa mewah (luxury), elegan, simple, dan interaktif**, sambil tetap konsisten dengan identitas brand yang sudah ada (hijau tua `#1a3d2e`-ish + hijau terang + emas/cream sebagai aksen, font serif untuk judul seperti pada logo "OPTIK I SEE YOU" dan heading "Katalog Softlens Cantik & Nyaman Seharian").

Struktur asset foto produk sudah tersedia di folder:
```
D:\PROJECT WEB\isy-photobooth\public\Katalog Soflens\
├── Aksesoris\        (IMG_7509 – IMG_7535, berisi foto cairan/perawatan softlens)
└── Assets Soflens\   (IMG_7494 – IMG_7508+, berisi foto produk softlens/lensa)
```
Nama file di dalam kedua folder tersebut **masih generic** (IMG_XXXX.JPG), belum dikelompokkan per nama produk.

## 1. TUGAS UTAMA
1. **Redesain UI/UX halaman `/softlens`** menjadi lebih premium: gunakan card dengan shadow lembut, hover animation (scale + glow tipis warna emas), glassmorphism ringan di bagian filter/tab, transisi halus (framer-motion kalau sudah ada dependency-nya, atau CSS transition kalau belum), dan foto produk asli (bukan lagi lingkaran ikon mata generik) sebagai thumbnail card.
2. **Petakan (mapping) foto di folder `Assets Soflens` dan `Aksesoris`** ke produk yang sesuai berdasarkan isi visual foto (warna lensa / jenis kemasan cairan), lalu buat sebuah file konfigurasi data produk (misal `data/softlens-products.ts` atau `.json`) yang menyimpan: `nama`, `kategori`, `harga`, `path gambar`, `deskripsi singkat`.
   - Karena nama file tidak deskriptif, **buka & preview tiap file gambar satu per satu**, cocokkan secara visual dengan warna/nama produk di daftar poin 3, lalu **rename file menjadi nama slug produk** (contoh: `sheer-brown.jpg`, `ice-no5.jpg`, `x2-120ml.jpg`) supaya mapping-nya jelas dan mudah dimaintain ke depannya. Jangan generate ulang gambar — pakai foto asli yang sudah ada di folder tersebut.
   - Jika ada foto yang jumlahnya lebih banyak dari jumlah produk (kemungkinan ada foto detail/varian angle berbeda), pakai foto terbaik/paling jelas sebagai thumbnail utama, sisanya bisa dipakai sebagai gambar sekunder (untuk hover-swap image atau lightbox saat card diklik).

## 2. DATA PRODUK & HARGA (WAJIB SESUAI, JANGAN DIUBAH ANGKANYA)

### A. Kategori "Warna Natural" (harga Rp 85.000 / pasang — sudah ada di kode saat ini, pertahankan)
| Nama | Harga |
|---|---|
| Sheer Brown | Rp 85.000 |
| Dewy Grey | Rp 85.000 |
| Petal Grey | Rp 85.000 |
| Blush Brown | Rp 85.000 |
| Bebi Light Brown | Rp 85.000 |
| Bebi Light Grey | Rp 85.000 |

### B. Kategori "Koleksi Premium" (dari foto pricelist ke-5)
| Nama | Harga |
|---|---|
| Ice N°5 | Rp 55.000 |
| Baby Ice N°5 *(varian ICE N°5 kedua di foto, beda motif box — beri nama pembeda, misal "Ice N°5 Bloom" atau sesuaikan dengan tulisan di box)* | Rp 55.000 |
| Miracle | Rp 35.000 |
| Russian Velvet | Rp 35.000 |
| Dubai | Rp 35.000 |
| Exo Clear | Rp 45.000 |
| Twilight | Rp 35.000 |
| Moxie | Rp 35.000 |

### C. Kategori "Aksesoris & Perawatan" (cairan softlens, dari foto pricelist ke-4)
| Nama | Ukuran | Harga |
|---|---|---|
| Ice | 150ML | Rp 30.000 |
| Ice | 60ML | Rp 20.000 |
| X2 | 120ML | Rp 30.000 |
| X2 Comfort | 60ML | Rp 20.000 |
| X2 Contacts | 15ML | Rp 25.000 |
| Pure N'Soft | 60ML | Rp 8.000 |

> Catatan: total produk saat ini di web menunjukkan "18 Produk Tersedia" — silakan sesuaikan/cross-check ulang jumlah final setelah semua kategori di atas dimasukkan (18 kemungkinan angka lama sebelum kategori premium & aksesoris lengkap ditambahkan, jadi update juga counter/badge jumlah produknya secara dinamis dari panjang array data, bukan hardcode angka).

## 3. GAYA VISUAL / DESIGN SYSTEM ("MEWAH, SIMPLE, ELEGAN")
- **Warna dasar:** putih/cream sebagai background utama, hijau tua (`#1a3d2e` atau senada dengan logo) sebagai warna teks judul & aksen, tambahkan **emas/gold (`#c9a869` atau sejenis)** sebagai aksen mewah baru (border tipis saat hover, badge kategori premium, garis pemisah harga).
- **Tipografi:** heading pakai font serif elegan (sesuai heading existing "Katalog Softlens"), body/harga pakai sans-serif bersih.
- **Card produk:**
  - Foto produk asli dengan rasio persegi/rounded-corner besar, bukan lagi lingkaran ikon.
  - Badge kategori (Warna Natural / Koleksi Premium / Aksesoris) tetap ada, tapi buat versi lebih halus — misal pill kecil semi-transparan di pojok foto.
  - Nama produk bold, harga dengan warna hijau/emas yang menonjol.
  - Tombol "Tambah ke Keranjang" full-width tapi dengan micro-interaction (icon keranjang animasi kecil saat hover/klik, warna transisi smooth).
  - Efek hover keseluruhan card: sedikit `scale-105`, shadow lebih dalam, foto sedikit zoom-in (`object-cover` + `scale` di image saja), durasi transisi 300ms ease-out agar terasa premium, bukan kaku.
- **Filter/tab kategori** (Semua Produk, Warna Natural, Koleksi Premium, Aksesoris & Perawatan): pertahankan struktur pill button yang sudah ada, tapi beri efek active state lebih hidup (background gradient hijau tua → hijau muda, atau solid dengan sedikit shadow glow).
- **Grid layout:** tetap 3 kolom di desktop, responsive ke 1 kolom di mobile, dengan gap yang cukup lega agar tidak sesak (kesan mewah = banyak white space).
- **Micro-interactions tambahan (opsional tapi disarankan):**
  - Saat card diklik/hover, tampilkan quick preview (lightbox/modal kecil) foto produk lebih besar.
  - Animasi fade-in + slide-up saat card pertama kali muncul di viewport (scroll reveal).
  - Loading skeleton shimmer saat data produk sedang dimuat (kalau data diambil dari file JSON/DB, bukan hardcode langsung di komponen).

## 4. TEKNIS
- Gunakan struktur project yang sudah ada (Next.js 14, App Router, Tailwind CSS — cek `tailwind.config` dan komponen existing untuk konsistensi warna/spacing token).
- Simpan data produk di file terpisah (`data/softlens-products.ts`) supaya mudah diedit manual ke depannya tanpa harus utak-atik komponen UI.
- Pastikan gambar dioptimasi pakai `next/image` (bukan `<img>` biasa) agar loading cepat dan tidak merusak performa (foto asli dari HP biasanya resolusi besar).
- Setelah rename & mapping selesai, **tampilkan daftar mapping akhir (nama file lama → nama produk → path baru)** di akhir sebagai laporan, supaya bisa dicek manual kalau ada yang salah pasang foto.

## 5. YANG TIDAK BOLEH DILAKUKAN
- Jangan generate ulang/AI-generate foto produk baru — semua foto WAJIB pakai file asli dari folder `Assets Soflens` dan `Aksesoris` yang sudah diupload.
- Jangan ubah harga di luar tabel pada poin 2.
- Jangan hapus fitur yang sudah ada (Try On AR, Keranjang, tombol Follow Instagram, dsb) — fokus hanya pada redesain tampilan card produk + data mapping.

---
**Ringkasan singkat untuk dipaste kalau butuh versi pendek:**
"Redesain UI katalog `/softlens` jadi lebih mewah & elegan (card dengan foto produk asli dari folder `Assets Soflens`/`Aksesoris`, hover animation halus, aksen emas, tipografi serif+sans elegan). Petakan foto di kedua folder tsb ke data produk berikut lalu rename filenya sesuai nama produk: [tempel tabel produk di atas]. Simpan sebagai data terpisah, pakai next/image, jangan generate foto baru, jangan ubah harga."
