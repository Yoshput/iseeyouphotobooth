# Analisis & Master Plan SEO — Optik I See You
*(optikiseeyou.com — 4 cabang: Purwokerto, Purbalingga, Wonosobo, Cilacap)*

---

## 1. Apa yang sebenarnya terjadi sekarang (dari screenshot kamu)

**Kabar baiknya:** websitenya **sudah terindeks** dan **sudah muncul** di hasil pencarian "optik i see you" (lihat screenshot #2 — posisi ke-2, di bawah Instagram, di atas Glints). Jadi ini bukan kasus "web belum kelihatan sama sekali." Ini kasus **"web kelihatan, tapi kalah dominan dari Google Maps/Business Profile, dan belum dapat sitelinks."**

Yang jadi bottleneck, saya rinci satu-satu:

### a. Local Pack (Maps) menang duluan — itu memang desain Google, bukan bug
Screenshot #1 & #2 nunjukin: begitu ada kata kunci nama toko + intent lokal ("optik", "kacamata"), Google otomatis menaruh **3 hasil Maps (Local Pack)** di atas hasil organik. Ini **selalu** terjadi untuk bisnis fisik dengan kategori "Toko Optik" — Optik Melawai pun kena hal yang sama untuk query lokal, cuma di screenshot #5 kamu search **"optik melawai"** murni (brand-only, tanpa kata "purwokerto"/dsb), jadi yang muncul itu **Knowledge Panel** bukan Local Pack. Beda mekanisme. Saya jelaskan di bagian 2.

### b. GSC nunjukin masalah indexing yang nyata (screenshot #4)
Dari tabel "Penyebab halaman tidak diindeks":
- **Halaman dengan pengalihan**: 5 halaman
- **Kesalahan pengalihan**: 2 halaman
- **Ditemukan – saat ini tidak diindeks**: 2 halaman
- **Di-crawl – saat ini tidak diindeks**: 1 halaman

Dan grafik indexing di atasnya cuma nunjukin angka kecil (3, 1) — artinya **dari 8 URL di sitemap, kemungkinan cuma 1-3 yang benar-benar terindeks penuh.** Ini masalah teknis nyata yang harus dibenerin duluan, karena Google nggak bisa kasih sitelinks ke halaman yang nggak terindeks.

Kemungkinan penyebab "Halaman dengan pengalihan": domain redirect dari `optikiseeyou.com` → `www.optikiseeyou.com` (kamu sempat cerita SSL cert `www` sempat gagal, lalu Vercel juga sempat saranin ganti target CNAME) — ini bisa bikin Google bingung nentuin canonical version, atau nge-crawl URL lama/duplikat.

### c. Belum ada Structured Data (Schema.org) sama sekali yang kelihatan
Sitelinks, Knowledge Panel, dan rich result (bintang, breadcrumb, FAQ, dsb) itu **sangat bergantung** pada JSON-LD schema markup. Tanpa `Organization`, `LocalBusiness`/`Optician`, `WebSite` (dengan `SearchAction`), `BreadcrumbList`, dsb — Google harus **menebak sendiri** struktur situs kamu, dan itu jauh lebih lambat dan nggak reliable.

### d. Cabang-cabang belum punya "identitas digital" yang lengkap & konsisten
- Google Business Profile baru kelihatan solid untuk **Purwokerto** (5.0★, 7.579 ulasan) dan ada listing terpisah untuk **Wonosobo** (5.0★, 152 ulasan). Purbalingga & Cilacap **belum kelihatan** di hasil screenshot kamu — perlu dicek apakah GBP-nya ada, terverifikasi, dan kategorinya benar.
- Di website, kemungkinan belum ada **halaman khusus per cabang** (`/cabang/purwokerto`, `/cabang/purbalingga`, dst.) dengan NAP (Name, Address, Phone) masing-masing + schema `LocalBusiness` sendiri-sendiri. Tanpa ini, Google nggak punya "jangkar" untuk mengasosiasikan query "optik i see you purbalingga" ke halaman spesifik di web kamu — dia cuma akan andalkan GBP Purbalingga (kalau ada).

### e. Sinyal otoritas brand (backlink, sameAs, konsistensi nama) masih tipis
Sitelinks besar kayak Optik Melawai itu fungsi dari: **volume pencarian brand yang tinggi + struktur navigasi situs yang jelas + umur domain & backlink**. Domain `optikiseeyou.com` masih sangat baru (baru live ~Agustus 2026), jadi realistisnya sitelinks otomatis butuh waktu (biasanya berbulan-bulan setelah indexing sehat + traffic brand search konsisten). Tapi kita bisa **mempercepat** prosesnya secara signifikan dengan langkah-langkah di bawah.

---

## 2. Soal "mengalahkan Google Maps" — realistis vs tidak

Perlu saya luruskan supaya ekspektasi & plan-nya tepat sasaran:

- **Local Pack (3 pin Maps)** akan **selalu** muncul duluan untuk query yang punya intent lokal eksplisit ("optik i see you wonosobo", "optik terdekat", dll). Ini kebijakan inti Google Local Search, bukan sesuatu yang bisa dikalahkan lewat SEO website — bahkan Melawai pun tunduk pada aturan ini untuk query semacam itu.
- **Yang BISA kamu menangkan** dan **realistis jadi target**:
  1. Website kamu jadi **hasil organik #1** (mengalahkan Instagram, Glints, dan direktori pihak ketiga) — ini sudah dekat, tinggal dorong sedikit lagi.
  2. Website dapat **sitelinks** (menu kecil di bawah hasil, seperti "Katalog", "Try-On", "Lokasi", "Softlens") — ini yang bikin hasil kelihatan "besar dan dominan" walau bukan di posisi Maps.
  3. Untuk query **brand-only** ("optik i see you" tanpa embel-embel kota), berpeluang dapat **Knowledge Panel** di kanan (seperti Melawai) kalau entity signal-nya kuat (GBP + Wikidata + sameAs + konsistensi NAP semua platform).
  4. Untuk tiap query cabang ("optik i see you purbalingga" dst.), targetnya: **GBP cabang itu + halaman cabang di web kamu** sama-sama muncul di page 1, saling menguatkan satu sama lain.

Jadi target akhirnya bukan "ngalahin Maps", tapi **"Maps DAN website sama-sama nongol dominan, saling dukung, ngalahin kompetitor pihak ketiga (Instagram-nya orang lain, direktori, dsb)."** Itu yang bikin brand kamu keliatan paling establish di SERP.

---

## 3. Master Checklist (urutan prioritas)

### 🔴 PRIORITAS 1 — Fix teknis dasar (minggu ini)
- [ ] Benerin isu redirect di GSC (5 halaman "dengan pengalihan", 2 "kesalahan pengalihan") — pastikan **satu** versi kanonik: `https://optikiseeyou.com` **atau** `https://www.optikiseeyou.com`, redirect 301 satu arah yang konsisten, dan **semua** internal link, sitemap, canonical tag, dan Open Graph tag pakai domain yang sama persis.
- [ ] Tambahkan `<link rel="canonical">` di setiap halaman.
- [ ] Cek & benerin `robots.txt` — pastikan tidak ada `Disallow` yang nge-block halaman penting.
- [ ] Submit ulang sitemap.xml di GSC (Peta Situs → Tambahkan peta situs baru), lalu pakai fitur **"Inspeksi URL" → "Minta pengindeksan"** untuk tiap URL utama satu-satu (home, /try-on, /katalog, /softlens, /photobooth).
- [ ] Perbaiki 2 halaman "Ditemukan - saat ini tidak diindeks" dan 1 halaman "Di-crawl - saat ini tidak diindeks" — biasanya karena thin content, duplicate content, atau load terlalu lambat. Perkuat kontennya (teks unik, minimal 300+ kata per halaman, bukan cuma gambar/JS-heavy).

### 🟠 PRIORITAS 2 — Structured Data (Schema.org) — minggu ini/depan
Implementasi JSON-LD (detail lengkap + kode ada di file `2-agent-prompt-antigravity.md`):
- [ ] `Organization` schema di homepage (nama, logo, sameAs ke semua sosmed)
- [ ] `WebSite` schema + `SearchAction` (syarat wajib buat Sitelinks Search Box)
- [ ] `LocalBusiness`/`Optician` schema **terpisah untuk tiap 4 cabang**, ditaruh di halaman cabang masing-masing
- [ ] `BreadcrumbList` schema di semua halaman
- [ ] `FAQPage` schema di halaman FAQ/Pertanyaan
- [ ] `Product`/`ItemList` schema opsional untuk katalog frame & softlens (bantu muncul di Google Shopping/Images)

### 🟡 PRIORITAS 3 — Struktur konten cabang (bikin "jangkar" per kota)
- [ ] Buat halaman khusus per cabang: `/cabang/purwokerto`, `/cabang/purbalingga`, `/cabang/wonosobo`, `/cabang/cilacap` — masing-masing isi: alamat lengkap, jam buka, nomor WA cabang, embed Google Maps, foto toko, testimoni lokal, tombol "Rute ke sini".
- [ ] Link semua halaman cabang dari navbar/footer & dari halaman "Lokasi" utama supaya internal linking kuat.
- [ ] Judul halaman (`<title>`) & meta description tiap cabang harus eksplisit sebut nama kota: contoh `Optik I See You Purbalingga — Kacamata & Softlens | Jl. Onje No.1`.

### 🟢 PRIORITAS 4 — Google Business Profile (semua cabang)
- [ ] Cek/klaim/verifikasi GBP untuk **Purbalingga** dan **Cilacap** (kalau belum ada, buat baru dengan kategori "Optician"/"Toko Kacamata").
- [ ] Pastikan NAP (Name, Address, Phone) di GBP **identik persis** dengan yang di website (termasuk format nomor WA, penulisan jalan, dll).
- [ ] Isi field "Website" di tiap GBP cabang dengan link ke halaman cabang masing-masing di web (bukan cuma homepage) — ini nge-link-kan entitas GBP ke halaman spesifik.
- [ ] Upload foto rutin, aktifkan Google Posts (promo, produk baru), dan jawab semua ulasan.
- [ ] Tambahkan atribut bisnis (WiFi, area parkir, dsb) & jam operasional yang sudah kamu konfirmasi sebelumnya (Cilacap 09.00-21.00 harian, Wonosobo 09.00-18.00 harian, Purbalingga Senin-Jumat 11.00-20.00 & Sabtu-Minggu 09.00-21.00).

### 🔵 PRIORITAS 5 — Entity & backlink building (untuk Knowledge Panel & Sitelinks)
- [ ] Update bio Instagram (`@iseeyou.glasses`) supaya link-nya langsung ke `optikiseeyou.com` (bukan linktree generik), dan pastikan nama bisnis di bio **sama persis** dengan nama di website & GBP.
- [ ] Tambahkan `sameAs` di schema Organization mengarah ke: Instagram, TikTok, Facebook (kalau ada), GBP URL, dan direktori bisnis lain.
- [ ] Daftarkan bisnis ke direktori lokal Indonesia yang kredibel (mis. dianummerik seperti Yellow Pages ID, direktori kota Purwokerto/Purbalingga, dsb) — makin banyak citation NAP yang konsisten, makin kuat entity-nya.
- [ ] Minta artikel/liputan singkat dari media lokal (radar banyumas, media kampus, dsb) yang link ke website — 1-2 backlink berkualitas lebih berharga dari 50 backlink direktori sampah.
- [ ] (Opsional, jangka panjang) Ajukan entity ke Wikidata kalau bisnis makin besar — ini yang biasanya jadi salah satu sinyal kuat Knowledge Panel kelas "Melawai".

### ⚪ PRIORITAS 6 — Monitoring
- [ ] Cek GSC → Performa tiap minggu: pantau query "optik i see you*" — impresi, posisi rata-rata, CTR.
- [ ] Cek GSC → Pengindeksan setiap minggu sampai semua 8+ halaman (nanti lebih setelah tambah halaman cabang) berstatus "Diindeks".
- [ ] Setelah 4-8 minggu sinyal sehat, cek apakah Sitelinks mulai muncul (nggak bisa di-*force*, ini keputusan algoritma Google berdasar semua sinyal di atas).

---

## 4. Kenapa Optik Melawai bisa punya tampilan seperti di screenshot #5

Supaya jelas apa yang kita kejar & kenapa itu butuh proses:
- Melawai berdiri sejak **1981**, jaringan nasional, ribuan-puluhan ribu pencarian brand per bulan → volume brand search tinggi = salah satu sinyal terkuat untuk sitelinks & Knowledge Panel.
- Domain `optikmelawai.com` sudah berumur belasan tahun → domain authority & backlink historis jauh lebih tebal.
- Kemungkinan besar sudah punya entity Wikipedia/Wikidata (kelihatan dari deskripsi otomatis "adalah perusahaan optikal di Indonesia yang didirikan pada tahun 1981..." — itu ciri khas data yang ditarik dari Wikipedia/Wikidata Knowledge Graph, bukan dari website sendiri).
- Struktur situsnya sudah matang selama bertahun-tahun, jadi Google percaya diri menyusun sitelinks otomatis (Shop, Kacamata Wanita, Kacamata Pria, halaman toko spesifik, Promo).

**Kabar baiknya:** semua fondasi teknis (schema, struktur, GBP, backlink) yang bikin Melawai sampai di titik itu **bisa mulai kamu bangun dari sekarang**, dan biasanya efeknya mulai kelihatan (indexing sehat, hasil organik naik, mungkin sitelinks kecil 2-4 item) dalam **1-3 bulan** kalau dikerjakan konsisten — bukan instan, tapi jauh lebih cepat daripada nunggu tanpa strategi.

---

*Lanjut ke file `2-agent-prompt-antigravity.md` untuk prompt siap-pakai + kode schema yang tinggal disuruh ke Antigravity.*
