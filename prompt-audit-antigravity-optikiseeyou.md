# Prompt Audit Total — Website Optik I See You (buat Antigravity)

Copy-paste blok di bawah ini ke Antigravity — idealnya dibuka di project/repo Next.js optikiseeyou.com yang aktif, biar dia bisa **browser-subagent langsung ke situs live** SEKALIGUS baca kodenya.

---

Tolong audit & kerjain beberapa hal di website production kami https://optikiseeyou.com (repo/project ini). Tujuan: bikin situsnya makin profesional, lengkap, dan siap bersaing sebagai website optik modern. Kerjain berurutan:

**1. Live check pakai browser subagent**

Buka tiap halaman produksi — `/`, `/katalog`, `/softlens`, `/photobooth?mode=ar`, `/photobooth?mode=photobooth`, section `#lokasi` — di viewport desktop DAN mobile. Screenshot tiap halaman, cek console buat error JS, cek broken image/link. Uji interaksi utama:
- Search box & filter "Cari cepat" di /katalog (dulu ada bug: search "Titanium" malah nampilin "Cat Eye Edition" — pastikan udah kefix)
- Tab ganti cabang di section lokasi — jam operasional tiap cabang harus persis: Purwokerto & Cilacap 09.00-21.00, Wonosobo 09.00-18.00, Purbalingga Senin-Jumat 11.00-20.00 & Sabtu-Minggu 09.00-21.00
- Alur AR try-on & photobooth end-to-end (kalau bisa test di kamera HP asli)
- Semua tombol WA & Shopee ngarah ke link yang benar

> Catatan: katalog frame kacamata & katalog softlens memang **SENGAJA** nggak pakai harga (frame karena stok nggak selalu ready per cabang jadi alurnya emang tanya WA) — ini bukan bug, jangan diubah/ditambahin harga.

**2. Kurasi ulang Photobooth**

Sisain frame cuma **1 per koleksi**: gelap (Emerald & Vintage Film B&W), cerah (Classic), koran, plus 1 frame lagi yang paling "I See You banget". Layout foto yang disisain cuma **4**: 1 foto, 3 foto kebawah, 3 polaroid, 4 polaroid. Frame lain & layout lain di luar itu dihapus aja biar pilihan nggak kebanyakan/bikin bingung user.

**3. Perbaiki temuan teknis**
- Meta viewport pakai `user-scalable=no, maximum-scale=1` di semua halaman — ini blokir pinch-zoom, masalah accessibility. Longgarin/hapus.
- Cek apakah udah ada structured data JSON-LD (schema.org): `LocalBusiness`/`Optician` per cabang (geo coordinates, jam, rating), `Product` per frame, `FAQPage` buat section FAQ yang udah ada di homepage. Kalau belum, tambahin — penting buat local SEO, apalagi Google Business Profile kita rating 5.0 ribuan review yang belum kesambung ke web.
- Cek robots.txt & sitemap.xml masih valid dan semua URL production ke-cover.

**4. Fitur baru yang mau digarap**

Prioritas (critical / important / nice-to-have), tiap item + estimasi effort:
- Section testimoni/review asli di homepage (dari Google Business Profile, rating 5.0 ribuan review)
- Section "Tentang Kami" — jelasin layanan **cek mata gratis**: pakai alat refractometer buat cek minus mata & kasih rekomendasi lensa yang cocok (ini BUKAN "periksa mata" ala dokter/medis, jangan salah framing)
- Blog/artikel edukasi pendek (cara pilih frame sesuai bentuk wajah, tips rawat softlens, dll) — recycle konten IG yang udah ada
- Booking/reservasi jadwal cek mata gratis online per cabang, auto-forward ke WA cabang terkait
- Tombol share hasil AR try-on langsung ke IG Story (Web Share API), bukan cuma QR download
- Info metode pembayaran (QRIS/cicilan) kalau tersedia
- Opt-in WA buat reminder cek mata tahunan / info promo cabang
- Halaman kebijakan privasi & S&K dasar (apalagi kalau nanti nambah form booking/newsletter)

**5. Audit performa & stabilitas**

Lighthouse/Core Web Vitals buat halaman utama & /photobooth (banyak animasi 3D/GSAP + video hero, ini udah beberapa kali jadi concern). Test khusus di Android, iOS Safari, dan tablet.

Kasih laporan akhir berupa checklist per kategori (Photobooth Curation, UX, Trust/Konten, SEO Teknis, Fitur Baru, Performa), urutkan dari yang paling berdampak. Untuk temuan yang low-risk (viewport meta, robots/sitemap, kurasi frame/layout photobooth), langsung eksekusi perbaikannya sekalian.
