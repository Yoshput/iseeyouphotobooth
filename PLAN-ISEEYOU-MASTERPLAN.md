# MASTERPLAN — Optik I See You: AR Photobooth + Website Utuh
*Disusun 6 Agustus 2026. Target showcase: booth Rita Super Mall Purwokerto.*
*Repo AR Photobooth: Yoshput/iseeyouphotobooth (branch main) · Live: optikiseeyou-glasses.vercel.app*

---

## 0. Review Kondisi Sekarang (jujur, biar planning-nya akurat)

Dari semua screenshot yang direview — landing page, AR try-on live, hasil try-on, mode-select, photobooth multi-foto (1/2/3/4/6 foto), hasil photobooth dengan filter+frame, katalog frame, lokasi cabang, dan feed Instagram @iseeyou.glasses (227K followers) — kesimpulannya:

**Yang sudah kuat:**
- Alur produk sudah lengkap: landing → pilih mode (Try On / Photobooth) → AR live try-on → hasil → CTA ke CS/download. Ini alur e-commerce/marketing yang solid, jarang UMKM lokal punya ini.
- Layout katalog frame, card lokasi cabang, filter warna hasil foto (Original/B&W/Vintage/Soft Film) — semua sudah rapi dan on-brand (hijau + putih minimalist).
- AR try-on real-time sudah berfungsi (setelah fix kemarin) — ini fitur utama yang paling sulit secara teknis, dan itu sudah beres.

**Yang masih perlu dirapikan (sebelum nambah fitur baru):**
- Footer masih ada masalah spacing/ukuran font tumpang tindih — perlu dites lagi setelah fix terakhir.
- Space kosong di hero (bekas placeholder 3D model) harus diisi atau dihapus bersih — ini yang akan diselesaikan lewat rencana section 2 di bawah.
- Warning WebGL texImage3D masih muncul di console — tidak mengganggu fungsi tapi sebaiknya dibersihkan sebelum hari-H (device tablet/HP low-end lebih sensitif ke warning semacam ini).

**Prioritas: STABILKAN dulu apa yang sudah ada sebelum menambah animasi baru.** Godaan besar buat nambah fitur keren itu wajar, tapi kalau fondasinya (AR live, capture, footer, hero) belum benar-benar solid di berbagai device, animasi baru cuma nambah risiko crash pas demo di depan calon pelanggan booth.

---

## 1. Roadmap Fitur — Prioritized

### TIER 1 — Wajib beres sebelum booth (deadline keras)
1. **Stabilkan AR try-on live overlay** di berbagai device (laptop, tablet Samsung, HP Android) — bukan cuma localhost kamu.
2. **Minimal 5-8 kacamata per kategori wajah** yang fit sempurna (bukan cuma 5 total) — supaya rekomendasi AI-match kelihatan meyakinkan di depan pengunjung booth.
3. **Footer & hero fixed clean** — tidak ada elemen tumpang tindih atau kosong yang keliatan pas demo langsung.
4. **Testing checklist dari README kamu sendiri** (sudah bagus, tinggal dijalanin): tablet Samsung asli, portrait mode, Chrome/Edge laptop, HP Android biasa, test 2-4 wajah sekaligus.
5. **Mode offline-safe / fallback**: kalau internet booth lemot, pastikan asset (glasses PNG, model 3D) sudah ter-cache atau load cepat — jangan sampai macet pas ada calon pelanggan nunggu di depan booth.

### TIER 2 — Nice-to-have, kerjain kalau Tier 1 sudah settle
6. **Floating animated glasses di hero** (lihat detail section 3) — ini yang kamu minta, tapi taruh di sini karena secara bisnis dampaknya kurang penting dibanding stabilitas AR try-on.
7. **GSAP scroll animation yang di-refine** (bukan yang berat kemarin) — subtle fade/slide per section, bukan efek besar-besaran.
8. **Sound/haptic feedback** pas capture foto (kamu sudah minta shutter sound — pastikan ini jalan across device, HP Android kadang block autoplay audio).
9. **Analytics sederhana**: hitung berapa kali try-on dipakai, kacamata mana paling sering dicoba — data ini berharga banget buat toko untuk restock/promosi.

### TIER 3 — Setelah booth, buat versi produksi jangka panjang
10. **Full parent website "I See You"** (lihat section 4) — AR photobooth jadi salah satu section/subpage di dalamnya, bukan berdiri sendiri.
11. **CMS ringan untuk update katalog frame** tanpa perlu deploy ulang tiap ganti stok (misal pakai Sanity/Contentful gratis tier, atau simpel: JSON di public/glasses/manifest.json yang sudah ada — cukup itu dulu, jangan over-engineer).
12. **Sistem leaderboard/gallery event** — kalau di booth banyak orang coba, tampilkan mini-gallery hasil foto (dengan izin) di layar besar booth sebagai social proof.

---

## 2. Kenapa Space Kosong di Hero Terus Muncul — Root Cause Sebenarnya

Dari histori bug kemarin (hero 3D model kosong, texImage3D error, akhirnya balik ke versi Vercel), pola yang kelihatan: **terlalu banyak perubahan sekaligus dalam satu sesi Antigravity, tanpa commit checkpoint di antaranya.** Begitu satu bagian gagal, susah tau bagian mana yang rusak.

**Aturan baru untuk semua kerjaan selanjutnya (termasuk fitur di masterplan ini):**
- 1 prompt = 1 perubahan spesifik dan kecil.
- Setelah tiap perubahan berhasil dites di localhost DAN keliatan bagus → `git commit` langsung, jangan tunggu banyak perubahan menumpuk.
- Kalau mau eksperimen sesuatu yang berisiko (animasi 3D baru, ganti library), buat branch terpisah dulu: `git checkout -b experiment/nama-fitur`, baru merge ke main kalau sudah pasti bagus.

---

## 3. Rencana Animasi Kacamata Mengisi Hero (Tier 2)

Untuk vibe "simple elegant, mewah, eksklusif" — ini rekomendasi konkret, bukan sekadar "kacamata muter-muter":

**Konsep: "Floating Glasses Showcase"**
- Satu kacamata (pilih 1 model paling ikonik/best-seller dari katalog, misal Titanium Pure) ditampilkan sebagai elemen 3D ringan (bisa pakai model GLTF low-poly, tidak perlu full realistic render).
- Animasi: idle float naik-turun pelan (amplitude kecil, ~10px, durasi 4-6 detik per siklus) + rotasi Y sangat pelan (bukan spin cepat — spin cepat kesannya murah, bukan mewah).
- Saat mouse mendekat (desktop) atau device tilt (mobile via gyroscope, opsional): parallax halus, maksimal pergeseran kecil, jangan berlebihan.
- Shadow/reflection halus di bawah kacamata (bisa CSS gradient blur, tidak perlu real-time raytracing) — ini yang bikin kesan "premium product shot" tanpa berat di GPU.
- **PENTING untuk performa**: render dengan `devicePixelRatio` dibatasi max 1.5 (bukan native tinggi), pakai `MeshBasicMaterial` atau `MeshLambertMaterial` (bukan `MeshStandardMaterial` yang lebih berat), dan pastikan canvas berhenti render (`cancelAnimationFrame`) saat section hero di luar viewport (pakai IntersectionObserver).

**Alternatif lebih ringan (kalau 3D masih rewel setelah dicoba)**: animasi kacamata pakai SVG/PNG 2D dengan CSS animation (transform: translateY + rotate), jauh lebih ringan dan tetap elegant kalau asetnya bagus. Untuk booth dengan device yang belum tentu spek tinggi, opsi ini lebih aman.

---

## 4. Arsitektur Website "I See You" Full (Tier 3, jangka panjang)

Berdasarkan yang kamu jelaskan: web AR photobooth ini jadi SATU bagian dari web besar Optik I See You, bukan produk berdiri sendiri.

**Struktur yang disarankan:**

```
iseeyou.id (atau domain utama toko)
├── / (Homepage utama toko — profil, produk kacamata reguler, lensa, promo)
├── /try-on          → mengarah/embed ke app AR photobooth ini (subdomain atau subpath)
├── /photobooth      → mode photobooth non-AR (yang sudah ada)
├── /katalog         → katalog frame lengkap (yang sudah ada, reusable)
├── /cabang          → lokasi 4 cabang (yang sudah ada, reusable)
├── /price-list      → daftar harga lensa
└── /booth (opsional, khusus event) → landing page khusus untuk QR code di booth Rita Super Mall
```

**Rekomendasi teknis:** JANGAN gabung jadi satu codebase raksasa dari awal. Cara paling aman dan cepat:
1. App AR photobooth ini (`iseeyouphotobooth` repo) tetap berdiri sendiri, di-deploy di subdomain: `try-on.iseeyou.id` atau tetap `optikiseeyou-glasses.vercel.app` untuk sementara.
2. Bikin website utama toko (landing page profil lengkap) sebagai project terpisah, dan cukup taruh tombol/CTA besar "Coba AR Try-On" yang link ke app ini.
3. Setelah kedua-duanya matang dan domain resmi (`iseeyouglassess.id`) sudah aktif, baru pertimbangkan reverse-proxy/rewrite supaya kelihatan seamless (`iseeyouglassess.id/try-on` padahal backend-nya app terpisah) — Next.js `rewrites()` di `next.config.ts` bisa handle ini tanpa perlu merge codebase.

Alasan pendekatan ini: kamu masih solo developer mengerjakan project client dengan deadline ketat. Menggabungkan 2 project besar sekaligus sebelum salah satunya stabil = risiko besar gagal keduanya. Pisah dulu, integrasi belakangan.

---

## 5. Struktur Asset Kacamata (sesuai rencana kategori kamu)

```
public/glasses/
├── manifest.json          ← index semua kacamata + metadata
├── oval/
│   ├── oval-01-front.png  (transparent bg, FRONT ONLY, no temple/gagang)
│   └── oval-02-front.png
├── round/
│   └── round-01-front.png
├── aviator/
│   └── aviator-01-front.png
├── cat-eye/
│   └── cat-eye-01-front.png
├── square/
│   └── square-01-front.png
└── titanium/
    └── titanium-01-front.png
```

**Kenapa front-only tanpa gagang itu keputusan tepat**: secara teknis, MediaPipe face landmark paling akurat mendeteksi titik mata dan lebar wajah dari depan — menempelkan gagang butuh tracking sudut kepala 3D yang jauh lebih rumit dan gampang meleset (gagang "menembus" pipi kalau kepala miring). Fokus ke front-only itu keputusan yang benar untuk akurasi maupun kecepatan development.

**Spesifikasi tiap PNG (kasih ke fotografer/desainer produk toko):**
- Background transparent (PNG-24 dengan alpha channel)
- Resolusi minimal 800x400px, rasio proporsional ke lebar-tinggi asli kacamata
- Foto/render tegak lurus dari depan (tidak miring)
- Titik referensi: pusat kacamata harus di tengah horizontal gambar (memudahkan kalibrasi `fitWidthRatio` yang sudah ada di README kamu)

---

## 6. Cara Kerja dengan Antigravity/Claude Code Selanjutnya (biar gak muter-muter debug lagi)

1. **Update `AGENT.md`** di repo dengan ringkasan masterplan ini + aturan "1 prompt = 1 perubahan + commit tiap sukses" (section 2 di atas). Ini bikin Claude/Antigravity di sesi berikutnya otomatis paham konteks tanpa kamu jelasin ulang dari nol tiap kali buka conversation baru.
2. **Urutan kerja yang disarankan mulai sekarang:**
   - Fix footer + hero (selesaikan dulu yang kemarin, verify bersih)
   - Tambah kacamata per kategori (Tier 1 no. 2) — ini kerja aset, bukan kode, bisa paralel
   - Testing device checklist (Tier 1 no. 4)
   - Baru setelah itu semua solid → animasi hero glasses (Tier 2)
3. Tiap mulai sesi baru di Antigravity, kasih dia file masterplan ini sebagai konteks awal ("baca PLAN-ISEEYOU-MASTERPLAN.md dulu sebelum mulai") supaya dia tidak mengusulkan perubahan besar-besaran yang bertabrakan dengan prioritas asli.

---

## 7. Prompt Siap Pakai — Langkah Selanjutnya

Setelah kamu commit versi footer yang sudah fix, ini prompt untuk mulai Tier 2 (animasi hero):

```
Baca dulu isi PLAN-ISEEYOU-MASTERPLAN.md section 3 (Rencana Animasi Kacamata Mengisi Hero) sebagai acuan.

Implementasikan floating glasses showcase di section Hero (app/page.tsx) sesuai spesifikasi section 3:
1. Satu model kacamata (gunakan asset PNG yang ada dulu, tidak perlu GLTF 3D baru) ditampilkan dengan animasi CSS: float naik-turun pelan (amplitude ~10px, durasi 4-6 detik, ease-in-out, infinite loop) + rotate sangat halus
2. Tambahkan shadow blur halus di bawah elemen kacamata untuk kesan premium product shot
3. Parallax halus mengikuti posisi mouse di desktop (pergeseran maksimal 15px), nonaktifkan di mobile
4. Pastikan elemen ini di-pause (stop animasi) ketika section hero di luar viewport, pakai IntersectionObserver, supaya tidak boros CPU/battery saat user sudah scroll jauh
5. JANGAN pakai Three.js/WebGL untuk ini dulu — cukup CSS transform + framer-motion atau GSAP yang sudah ada di project, supaya ringan dan stabil di device tablet/HP low-end

Setelah selesai, test dan laporkan hasilnya sebelum saya commit.
```

---

*Catatan: file ini adalah dokumen hidup. Update tiap kali ada keputusan besar baru (fitur ditambah/dibuang, deadline berubah, dll) supaya tetap jadi sumber kebenaran tunggal buat kamu dan AI agent yang bantu ngerjain.*
