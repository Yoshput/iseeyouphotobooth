# PROMPT UNTUK ANTIGRAVITY — Optik I See You (optikiseeyou.com)

Konteks project: Next.js 15, website optikiseeyou.com, 4 cabang (Purwokerto, Purbalingga, Wonosobo, Cilacap), sudah ada sistem katalog frame + softlens, AR try-on, dan photobooth GIF. Semua gambar sudah dioptimasi ke WebP 3-tier.

Ada 2 task besar di bawah ini. Kerjakan satu per satu, jangan digabung dalam 1 commit besar biar gampang di-review dan di-rollback kalau ada bug.

---

## TASK 1 — Perbaikan Struktur & Rendering Halaman `/katalog`

### Masalah saat ini
1. Halaman `/katalog` saat ini di-render penuh di client-side (muncul "Loading..." sebelum konten frame muncul). Ini bikin Googlebot berpotensi meng-index halaman ini sebagai kosong, padahal ini halaman paling penting untuk SEO produk.
2. Struktur menu di `/katalog` belum jelas memisahkan antara katalog frame dan katalog softlens — dua kategori ini punya kebutuhan tampilan yang beda (frame tanpa harga, softlens dengan harga).

### Yang harus dikerjakan

**1.1 — Ubah `/katalog` jadi hub dengan 2 sub-tab/menu:**
- Tab 1: **"Katalog Frame"** (default aktif)
- Tab 2: **"Katalog Softlens"**
- Gunakan query param untuk masing-masing tab, contoh: `/katalog?tab=frame` dan `/katalog?tab=softlens` (ini sudah konsisten dengan link yang dipakai di landing page saat ini — jangan ubah pola URL-nya, cukup pastikan kedua tab render dengan benar dan bisa langsung di-deep-link).
- Tab switcher harus keyboard-accessible dan pakai `aria-selected` yang benar (biar konsisten sama kerjaan aksesibilitas kemarin).

**1.2 — Frame: TIDAK ditampilkan harga (ini disengaja, bukan bug).**
- Card produk frame tetap tampilkan: nama koleksi, nama varian, thumbnail, dan CTA "Coba AR Try-On" + "Tanya CS 4 Cabang" (pakai modal CS yang sudah dibuat kemarin).
- Jangan tambahkan field harga di card frame maupun di detail produk frame.
- Kalau ada state kosong untuk field harga di komponen produk (misal placeholder `Rp -`), hapus, jangan cuma disembunyikan pakai CSS `display:none` (biar nggak kebaca di DOM/SEO snippet).

**1.3 — Softlens: DITAMPILKAN harga.**
- Card produk softlens harus tampilkan: nama brand/varian, diameter, warna (kalau ada), dan **harga per pasang/box**.
- Format harga: `Rp XX.XXX` konsisten, pakai `Intl.NumberFormat('id-ID')` biar format ribuan benar otomatis, jangan hardcode string.
- Kalau softlens ada varian warna, harga bisa sama across varian — cukup tampilkan sekali di level produk, bukan diulang per warna.

**1.4 — Perbaiki rendering supaya SEO-friendly:**
- Pindahkan fetching data katalog (baik frame maupun softlens) ke **Server Component** / gunakan `generateStaticParams` + ISR (revalidate berkala, misal tiap 1 jam) — bukan full client-side fetch dengan `useEffect`.
- Tujuannya: begitu HTML pertama kali dikirim ke browser (dan ke Googlebot), grid produk sudah terisi — bukan skeleton "Loading...".
- Kalau memang butuh interaktivitas client (filter, tag pencarian "The Onyx Enigma" dkk yang sudah ada), boleh tetap pakai client component untuk bagian filter-nya saja, tapi initial data grid harus sudah datang dari server render.
- Pastikan tab default (`tab=frame`) yang paling sering diakses tetap fully server-rendered tanpa perlu klik apapun dulu.

**1.5 — Testing sebelum selesai:**
- Jalankan `npm run build` dan cek exit code 0 seperti biasa.
- Cek dengan `curl` atau "view source" (bukan inspect element) di `/katalog`, `/katalog?tab=frame`, dan `/katalog?tab=softlens` — pastikan nama produk & (khusus softlens) harga sudah ada di HTML mentah, bukan cuma setelah JS jalan.
- Cek juga tidak ada layout shift baru waktu switch tab.

---

## TASK 2 — Halaman Baru `/blog` (Artikel Edukasi & Tren)

### Tujuan
Bikin section konten edukasi/tren seputar kacamata, softlens, dan kesehatan mata untuk menangkap traffic pencarian long-tail (misal "cara pilih kacamata sesuai bentuk wajah", "beda lensa minus dan silinder", "tren kacamata 2026") yang belum ter-cover oleh landing page maupun katalog.

### Struktur yang diminta

**2.1 — Routing**
- `/blog` — halaman index, list semua artikel (card: thumbnail, judul, kategori, tanggal, excerpt singkat).
- `/blog/[slug]` — halaman detail artikel.
- `/blog?kategori=nama-kategori` — filter berdasarkan kategori (opsional tapi bagus kalau sempat).

**2.2 — Kategori artikel (buat sebagai enum/taxonomy, biar konsisten)**
- **Edukasi Mata** — misal: cara baca resep kacamata, beda miopia/astigmatisme/presbiopia, kapan harus cek mata ulang.
- **Tips Pilih Frame** — cara pilih kacamata sesuai bentuk wajah, warna kulit, gaya berpakaian.
- **Perawatan Softlens** — cara pakai, simpan, dan rawat softlens yang benar, tanda-tanda softlens harus diganti.
- **Tren & Gaya** — tren frame terkini, spotlight koleksi baru (misal nanti bisa nyambung promosi "The Onyx Enigma").
- **Info Cabang & Promo** — pengumuman promo, event, pembukaan cabang baru.

**2.3 — Data model artikel (per post)**
Field yang dibutuhkan:
- `slug` (unique, dari judul)
- `title`
- `category` (dari taxonomy di atas)
- `excerpt` (ringkasan 1-2 kalimat, dipakai di card & meta description)
- `coverImage` (WebP, pakai pola optimasi 3-tier yang sama seperti katalog foto — thumb/medium/full)
- `content` (rich text / MDX, biar bisa sisipkan gambar & heading di tengah artikel)
- `author` (opsional, default "Tim Optik I See You")
- `publishedAt`
- `updatedAt`
- `readingTime` (auto-calculate dari jumlah kata, jangan input manual)
- `relatedCabang` (opsional — kalau artikel spesifik promo cabang tertentu, bisa di-tag)

**2.4 — SEO per artikel (WAJIB, ikuti pola yang sudah dipakai di `/katalog`, `/softlens`, `/photobooth`, `/try-on`)**
- Metadata dinamis per artikel: `title`, `description` (dari excerpt), OpenGraph image (dari coverImage), canonical URL.
- Tambahkan schema.org `Article` (bukan `BlogPosting` generic kosongan — isi `headline`, `image`, `datePublished`, `dateModified`, `author`, `publisher` dengan data Organization yang sudah ada di schema global).
- Internal link: tiap artikel yang relevan sebaiknya ada CTA/link balik ke `/katalog` atau `/photobooth` (misal artikel "cara pilih frame sesuai bentuk wajah" harus ada CTA ke AR Try-On) — ini bagus buat SEO internal linking dan juga funnel konversi, bukan cuma page yang berdiri sendiri.

**2.5 — UI/UX**
- Desain menyesuaikan tone visual yang sudah ada (warna hijau `#116B3C`, font serif untuk heading kayak di landing page, cream background `#FAF6EC`).
- Card di index page: rasio gambar konsisten, ada badge kategori dengan warna berbeda tipis per kategori (tapi tetap dalam palet brand, jangan warna asing).
- Reading progress bar atau estimasi waktu baca di halaman detail (nice to have, bukan wajib).
- Related articles di akhir halaman detail (3 artikel dari kategori sama).
- Pastikan mobile-first — mayoritas traffic dari HP.

**2.6 — Aksesibilitas & performa (ikuti standar yang sudah diterapkan di project ini)**
- `alt text` deskriptif untuk semua cover image (bukan generic "Blog Optik I See You").
- Lazy load gambar di index list, `priority` hanya untuk artikel pertama/featured.
- Touch target tombol kategori & pagination minimal 44x44px.

**2.7 — Konten awal**
- Buatkan minimal 4 artikel dummy/starter (1 per kategori edukasi/tips/perawatan/tren) sebagai contoh struktur, bukan artikel promo — biar gampang di-review dulu strukturnya sebelum isi konten asli ditambahkan manual nanti.

**2.8 — Testing sebelum selesai**
- `npm run build` sukses exit code 0.
- Cek `/blog` dan minimal 1 halaman `/blog/[slug]` ter-render server-side (view source ada judul & isi artikel, bukan skeleton loading).
- Cek sitemap.xml otomatis ter-update include semua slug artikel baru (kalau sitemap generation sudah dynamic).

---

## Catatan tambahan untuk Antigravity
- Jangan ubah struktur data/komponen katalog frame & softlens yang sudah ada lebih dari yang diminta di Task 1 — fokus ke rendering strategy dan penambahan field harga khusus softlens.
- Ikuti pola optimasi gambar WebP 3-tier yang sudah dipakai di seluruh project untuk semua gambar baru (cover blog, dsb).
- Setelah selesai, siapkan ringkasan perubahan file untuk masuk ke laporan kerja harian berikutnya.
