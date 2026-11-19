# DEPLOYMENT CHECKLIST: Advanced Virtual Try-On Engine & Subdomain DNS
**Project:** Optik I See You
**Branch:** `feat/advanced-virtual-try-on-engine`
**Date:** 19 November 2026

---

## 1. Cloudflare / Hostinger DNS Setup for Subdomain `promo.optikiseeyou.com`

Berdasarkan screenshot Vercel dashboard pengguna (`promo.optikiseeyou.com` Invalid Configuration):

1. **Buka Cloudflare Dashboard** (atau Hostinger DNS Management jika NS ada di Hostinger):
   - Masuk ke domain: `optikiseeyou.com`
   - Buka menu: **DNS** -> **Records**.
2. **Tambahkan CNAME Record Baru**:
   - **Type:** `CNAME`
   - **Name:** `promo`
   - **Target / Value:** `d94ebbf19ceb1456.vercel-dns-017.com` (atau `cname.vercel-dns.com`)
   - **Proxy status:** **DNS Only** (Awan Abu-abu / Grey Cloud, BUKAN Orange Cloud / Proxied selama verifikasi awal)
   - **TTL:** Auto
3. **Verifikasi di Vercel:**
   - Kembali ke Vercel: Project `optikiseeyou-glasses` -> **Settings** -> **Domains**.
   - Klik tombol **Refresh** di sebelah `promo.optikiseeyou.com`.
   - Status akan berubah menjadi hijau: **Valid Configuration**.

---

## 2. Pre-Deployment Verification Checklist

- [x] **Git Branch Isolation:** Bekerja pada feature branch `feat/advanced-virtual-try-on-engine`.
- [x] **TypeScript Validation:** `npx tsc --noEmit` lulus dengan 0 error.
- [x] **Automated Tests:** 14/14 unit tests di `tests/*.test.mjs` lulus 100%.
- [x] **Production Build:** `npm run build` berhasil menghasilkan 69 static & dynamic routes.
- [x] **WebGL Safety:** Shared texture disposal diperbaiki dan context lost listener aktif.
- [x] **CV Calibration:** `Y_OFFSET_FACTOR` disesuaikan ke `-0.090` dan scale disesuaikan ke `1.48–1.50` x IPD.
- [x] **Hybrid 2D/3D:** Tersedia toggle 2D Real vs 3D AR untuk frame dengan GLB.
- [x] **Face Shape AI:** 6 bentuk wajah dengan multi-criteria scoring dan temporal stabilizer.
- [x] **WhatsApp Branch Routing:** Terhubung ke nomor resmi 4 cabang (Purwokerto, Purbalingga, Wonosobo, Cilacap).
- [x] **Photobooth Safety:** Photobooth 4-Grid tetap berjalan 100% tanpa regresi.

---

## 3. Post-Deployment Verification Steps
Setelah branch dimerge ke `main`:
1. Buka `https://optikiseeyou.com/try-on`:
   - Uji deteksi wajah di kamera depan.
   - Periksa posisi kacamata (browline pas di bawah alis, nose bridge pas di nasion).
   - Coba ganti ke tab "Unggah Foto" dan pastikan kamera berhenti (LED kamera mati).
   - Buka "Bandingkan Frame" dan uji coba perbandingan Frame A vs Frame B.
   - Buka pilihan Cabang WhatsApp dan periksa nomor tujuan WA sesuai cabang yang dipilih.
2. Buka `https://promo.optikiseeyou.com/`:
   - Pastikan DNS CNAME sudah terpropagasi dan halaman promo tampil bersih dengan 3 poster editorial tanpa banner teks AI slop.
