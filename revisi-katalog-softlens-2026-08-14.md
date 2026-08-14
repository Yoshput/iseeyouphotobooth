# Prompt Revisi — Katalog Softlens Optik I See You (Selaraskan ke Brand: Hijau-Putih, Minimalis, Mewah)

**Project:** Optik I See You (`optikiseeyou-glasses.vercel.app`, repo `Yoshput/iseeyouphotobooth`)
**Stack:** Next.js 15.1 (static export) + React 18 + TypeScript + Tailwind, GSAP, `lucide-react`
**Scope:** Halaman `/softlens` (`app/softlens/page.tsx`) — dibandingkan langsung ke `/katalog` (`app/katalog/page.tsx`) sebagai referensi "yang sudah benar"
**File yang disentuh:** `app/softlens/page.tsx` (utama), opsional `components/katalog/SoftlensCartDrawer.tsx` / `SoftlensDetailModal.tsx` / `SoftlensOrderModal.tsx` (lihat Poin B), 1 file baru `components/katalog/FloatingSoftlensAccent.tsx`
**Tanggal:** 14 Agustus 2026

> Semua "Kondisi saat ini" di bawah sudah dicek langsung ke source code repo (`Yoshput/iseeyouphotobooth`, branch `main`) — termasuk nama file, baris, dan riwayat prompt sebelumnya (`prompt-katalog-softlens.md`) — bukan tebakan. Kerjakan **Poin A dulu**, cek Acceptance Criteria, baru lanjut Poin B kalau disetujui.

---

## Kenapa `/softlens` Terasa "Rame" & Beda Vibe — Analisis

Bukan cuma perasaan — ini 5 penyebab konkret, sudah dicek ke kode:

1. **Palet warna beda sendiri.** `/softlens` pakai hex hardcode: hijau `#1a3d2e`, gold `#c9a869`/`#8c6520`, cream `#FAF9F6`/`#FAF9F5`, abu `slate-*` (total ±130 titik sepanjang file). Sementara SELURUH web lain (termasuk `/katalog` yang jadi pembanding kamu) pakai token resmi di `tailwind.config.ts`: `isy-white`, `isy-mist`, `isy-green-deep` (`#1B4332`), `isy-green-bright` (`#2FA84F`), `isy-ink`, `isy-line` — didefinisikan sebagai **"FINAL"** di `design.md` §2. Gold ini BUKAN kesalahan ngasal — dicek di `prompt-katalog-softlens.md` (baris 57), memang sengaja ditambahkan sebagai "aksen mewah baru" waktu itu. Masalahnya, itu prompt lama, dibuat **sebelum** `design.md`/`AGENT.md` versi final ada — sekarang jadinya ada 2 sistem warna berjalan sendiri-sendiri dalam 1 web, dan begitu dibuka bersebelahan sama `/katalog`, langsung kerasa nggak senada.
2. **Background flat, bukan gradasi.** `/softlens` pakai `bg-[#FAF9F6]` (baris 462) — solid. `/katalog` pakai `bg-isy-gradient` (radial putih → `isy-mist`, baris 295 `app/katalog/page.tsx`) — inilah "gradasi lembut" yang bikin `/katalog` kerasa lebih ringan/airy. Ini juga persis "gradasi" yang kamu maksud di pesan.
3. **Hero numpuk kebanyakan blok sebelum sampai konten.** Urutan vertikal `/softlens` sekarang: badge+judul+deskripsi → **2 tombol CTA** (Instagram, Keranjang) → search bar → **2 baris filter** (kategori + varian warna) — 4 blok padat sebelum grid produk. `/katalog` cuma: badge+judul+deskripsi → search + 1 baris quick-tag; filter kategori dipindah ke section konten TERPISAH di bawah, bukan numpuk di hero. Ini akar dari kesan "rame"/"kurang center" yang kamu rasain — bukan soal 1 elemen tertentu, tapi terlalu banyak hal berebut perhatian sekaligus di atas.
4. **Masih pakai emoji mentah** (`📷` `🛒` `🔍` di hero, plus `💬` `✨` di bagian lain halaman). Project ini sebenarnya sudah punya aturan tegas — `AGENT.md` baris 108: *"Semua emoji dihapus dari seluruh project (bukan cuma landing) untuk tampilan lebih simple/elegant"* — `/softlens` ketinggalan aturan ini. `/katalog` sudah konsisten pakai icon asli (`<Image src="/logo/Logo-Whatsapp.png">`, bukan emoji 💬).
5. **Nol elemen dekoratif ambient.** `/katalog` punya `<FloatingSunglasses />` — siluet kacamata SVG melayang halus (opacity ~15-18%, animasi GSAP idle-float, `components/katalog/FloatingSunglasses.tsx`) yang bikin halaman kerasa "hidup" & premium tanpa berisik. `/softlens` tidak punya versi ini sama sekali — salah satu sebab kenapa `/katalog` kerasa lebih "jadi"/mewah walau sama-sama minimalis.

**Kesimpulan (sebagai rekomendasi desain):** base warna & struktur hero **harus** disamakan ke sistem `isy-*`/`design.md` biar 1 keluarga sama sisa web — gold TIDAK perlu dihapus total (masuk akal sebagai penanda "koleksi premium"), tapi porsinya dikecilin jadi aksen tipis aja (1-2 titik kecil), bukan warna dominan tombol/background/judul besar seperti sekarang.

---

## Poin A — Redesain Hero & Filter Block (`/softlens`)

**Kondisi saat ini:** Section hero (`app/softlens/page.tsx`, baris ~470–502) berisi badge gold, judul 2 baris (baris kedua italic gold besar), deskripsi, dan 2 tombol CTA (Instagram + Keranjang, pakai emoji, baris ~486–500). Langsung disusul section filter (baris ~505–567): search bar (baris ~507–531), baris kategori (baris ~534–548), baris varian warna (baris ~551–566) — semua tumpuk vertikal sebelum grid produk. Tidak ada elemen dekoratif ambient.

**Perubahan diminta:** Redesain hero + filter block biar simple, center, elegan, dan senada `/katalog` — background gradasi, warna balik ke token `isy-*`, struktur dirampingkan, tambah 2 elemen dekoratif ambient (aksen kacamata + softlens melayang).

**Detail teknis:**
1. **Background:** ganti `bg-[#FAF9F6]` (baris 462) → `bg-isy-gradient`, sama seperti `app/katalog/page.tsx` baris 295.
2. **Warna:** ganti semua hardcode di hero+filter (baris ~470–567) ke token:
   - `#1a3d2e` → `isy-green-deep`
   - `slate-300/400/600/700` (border/teks) → turunan `isy-line` / `isy-ink` (mis. `text-isy-ink/60`, `border-isy-line`)
   - `#c9a869`/`#8c6520` (gold) → **dikecilin jadi aksen tipis aja**, lihat poin 3
3. **Gold jadi aksen sekunder, bukan warna utama** (rekomendasi desain, ⚠️ ini keputusan paling besar di brief ini — worth dikonfirmasi): badge, background tombol, dan judul besar balik ke `isy-green-deep`/`isy-green-bright`/`isy-mist` sesuai `design.md` §2. Gold cuma dipertahankan di 1-2 titik kecil yang memang menandakan "premium" — misal border/underline tipis di badge kategori "Koleksi Premium Softlens", atau warna aksen di harga produk premium (di luar scope hero ini, lihat Poin B). **Bukan** lagi warna badge hero, bukan warna tombol besar, bukan warna judul.
4. **Rampingkan struktur** — samakan pola ke `/katalog`:
   - Hero cuma: badge + judul (boleh tetap 2 baris, tapi baris kedua pakai `isy-green-deep` bukan gold besar-besar) + deskripsi singkat + search bar + (opsional) 1 baris quick-tag.
   - **Filter kategori** (Semua Produk / Koleksi Premium / Aksesoris) **dipindah keluar dari hero**, taruh di section konten terpisah di bawahnya — pola persis `/katalog` (filter baris ~374-388 `app/katalog/page.tsx`, ada di "Main Content Area", bukan di section hero).
   - **Filter varian warna** ikut turun bareng filter kategori, satu section yang sama, bukan numpuk lagi di hero.
   - ⚠️ **Tombol Instagram & Lihat Keranjang** (baris ~486–500) — rekomendasi: kurangi jadi cuma 1 CTA paling penting di hero (kemungkinan besar "Lihat Keranjang" nggak perlu dobel karena tombol cart mengambang sudah ada di pojok, baris ~715 — jadi 2 CTA berebut perhatian buat fungsi yang sama). Instagram bisa jadi link kecil/sekunder (mis. dipindah ke footer/navbar), bukan tombol besar sejajar CTA utama. Worth dikonfirmasi kalau maunya tetap dipertahankan keduanya.
5. **Hilangkan emoji mentah di hero** (`📷` baris ~492, `🛒` baris ~499, `🔍` baris ~515-521 kalau masih icon svg custom itu boleh tetap tapi cek dulu). Ganti icon Instagram & Keranjang pakai `lucide-react` (sudah diimport di file ini, baris 9 — tinggal tambah `Instagram`, `ShoppingBag`) — konsisten sama pola `/katalog` yang pakai icon asli, bukan emoji.
6. **Tambah 2 elemen dekoratif ambient:**
   - **Aksen kacamata** — reuse langsung `<FloatingSunglasses />` yang **sudah ada** (`components/katalog/FloatingSunglasses.tsx`), tinggal di-import & ditaruh persis seperti dipakai di `/katalog` baris 299. **Tidak perlu bikin komponen baru** untuk ini.
   - **Softlens melayang** — bikin komponen baru `components/katalog/FloatingSoftlensAccent.tsx`, niru pola & animasi GSAP idle-float yang identik dengan `FloatingSunglasses.tsx` (baca dulu file itu sebagai referensi struktur), tapi bentuknya 2-3 lingkaran SVG bergaya lensa kontak (radial-gradient warna lembut — cokelat/abu-abu/hijau muda, ambil referensi dari `COLOR_FILTERS` di `lib/softlens.ts` biar nyambung sama produk asli), opacity rendah (~15-20%, sama seperti referensi), posisi `fixed`, `hidden lg:block` (ambient buat desktop/tablet, tidak numpuk di mobile).
7. `CatalogConfetti` (baris 464) dipertahankan apa adanya — sudah konsisten dipakai di `/katalog` juga.

**Acceptance criteria:**
- [ ] Background hero pakai `bg-isy-gradient`, bukan flat cream
- [ ] Tidak ada lagi hex `#c9a869`/`#1a3d2e`/`#FAF9F6`/`#FAF9F5` atau class `slate-*` tersisa di area hero+filter (baris ~470–567) — kecuali maksimal 1-2 titik aksen gold kecil sesuai poin 3, kalau disetujui
- [ ] Hero cuma berisi badge+judul+deskripsi+search(+quick-tag) — filter kategori & filter warna sudah pindah ke section terpisah di bawah, tidak numpuk lagi di hero
- [ ] Nol emoji mentah di hero (badge, tombol) — diganti icon `lucide-react`
- [ ] Aksen kacamata (`FloatingSunglasses`, reused) DAN aksen softlens melayang (baru, `FloatingSoftlensAccent`) muncul halus di layar lebar, animasinya jalan begitu halaman dibuka pertama kali, tidak mengganggu keterbacaan konten
- [ ] Dicek tampilan mobile — elemen dekoratif ambient default `hidden lg:block`, pastikan tidak berantakan di layar kecil
- [ ] Dibuka sebelah-sebelahan sama `/katalog` — first impression-nya harus terasa 1 keluarga brand, bukan kayak 2 web beda

---

## Poin B — Selaraskan Sisa Halaman (Card Produk, Tombol Keranjang Mengambang, dst) — Susulan Setelah Poin A Disetujui

**Kondisi saat ini:** Warna hardcode yang sama (`#c9a869`, `#1a3d2e`, `#FAF9F6`/`#FAF9F5`, `slate-*`) juga dipakai di **±130 titik lain** sepanjang `app/softlens/page.tsx` di luar hero — card produk, tombol Keranjang mengambang (baris ~715), badge promo kiri-atas (baris ~236), modal preview, dst. Kalau cuma hero yang dibenerin (Poin A) dan sisanya dibiarkan, begitu discroll ke bawah areanya balik lagi ke gold/cream — malah kelihatan nyambung-nyambungnya aneh (hero hijau-putih, badan halaman gold-cream).

**Perubahan diminta:** Lanjutkan swap warna yang sama (hex/slate → token `isy-*`, gold dikecilin jadi aksen) ke SISA halaman ini, supaya konsisten dari atas sampai bawah.

**Detail teknis:**
- Sifatnya mostly mekanis (cari-ganti token warna), tidak perlu restrukturisasi layout besar seperti Poin A.
- Lokasi utama: card produk di grid koleksi, tombol Keranjang mengambang (baris ~715, saat ini `bg-[#1a3d2e]` + `border-[#c9a869]/40`), badge promo (baris ~236).
- `SoftlensCartDrawer.tsx`, `SoftlensDetailModal.tsx`, `SoftlensOrderModal.tsx` cuma punya 1-2 nilai hardcode nyasar masing-masing — sudah hampir netral, cek sekalian tapi effort-nya kecil.
- Emoji lain di luar hero (baris 64, 87, 172, 187, 197, 391, 528, 582, 719 di `app/softlens/page.tsx`) sekalian dibereskan kalau poin ini dikerjakan, ngikutin aturan yang sama di `AGENT.md`.

**Acceptance criteria:**
- [ ] Tidak ada lagi hex `#c9a869`/`#1a3d2e`/`#FAF9F6`/`#FAF9F5` atau class `slate-*` tersisa di `app/softlens/page.tsx` maupun 3 komponen terkait (kecuali aksen gold kecil yang disepakati)
- [ ] Seluruh halaman `/softlens` — bukan cuma hero — terasa 1 keluarga sama `/katalog` & sisa web

---

## Catatan / Perlu Dikonfirmasi

- **Poin A #3 (paling penting):** setuju gold dikecilin jadi aksen sekunder tipis aja (rekomendasi di brief ini), atau ada alasan tertentu mau gold tetap jadi warna dominan biar softlens kerasa "sub-brand" yang beda dikit dari kacamata?
- **Poin A #4:** tombol Instagram & Lihat Keranjang di hero — dikecilin jadi 1 CTA aja, atau tetap dipertahankan keduanya seperti sekarang?
- **Poin B:** dikerjakan sekalian di round ini, atau Poin A dulu aja, sisanya menyusul round berikutnya?
