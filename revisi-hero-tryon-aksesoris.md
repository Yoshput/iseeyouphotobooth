Kerjain revisi berikut di project `isy-photobooth` (Next.js 15 + React 18 + TypeScript + Tailwind, Three.js + GSAP, MediaPipe Vision, live di optikiseeyou.com). Ada 4 bagian: palet warna, hero landing page, try-on frame, dan data harga aksesoris.

## 1. Palet warna
- Background section/page → ivory (estimasi `#FAF6EC` — sesuaikan kalau brand udah punya token resmi).
- Card/rectangle (product card, form, container apapun) → tetap putih murni `#FFFFFF`, JANGAN ikut ivory. Tujuannya biar ada kontras/depth antara background dan container-nya.

## 2. Hero landing page
- Ganti headline dari "Coba Kacamata Tanpa Ribet" jadi **"Selamat datang, di Optik I See You"**.
- Hapus semua framing "gratis":
  - Badge "AR LIVE · GRATIS" → jadi **"AR LIVE"** aja, atau reframe ke arah eksklusif, mis. "AR TRY-ON EKSKLUSIF".
  - Body copy "...secara real-time — gratis, tanpa install apapun." → buang kata gratis-nya, contoh: "Coba langsung koleksi kacamata, softlens, dan aksesoris I See You — try-on real-time di wajah kamu, tanpa install apapun."
  - Alasan: "gratis" bikin kesan murah, padahal target-nya sekarang keliatan resmi & premium.
- Tambahin 1 pill kecil "Softlens" di sebelah pill "Katalog Frame" & "Pricelist Lensa" yang udah ada — biar dari hero langsung kebaca I See You bukan cuma try-on/photobooth, tapi juga ada katalog & softlens. Tombol hijau besar "MULAI TRY-ON / PHOTOBOOTH" tetap paling menonjol, jangan dikecilin — try-on & photobooth tetap fitur andalan.
- Floating glasses di hero (kacamata melayang, sisi kanan) ditambahin gagang (temple arms) penuh, nggak cuma front-frame. Ini asset DEKORATIF khusus hero — terpisah dari asset try-on di bagian 3, yang sengaja tetap front-only. Kemungkinan perlu source art baru karena asset try-on yang ada sekarang nggak punya gagang.

## 3. Try-on frame: urutan baru + asset

Urutan carousel/strip frame, dengan "Tanpa Kacamata" tetap di posisi paling awal sebagai default:

1. Oval plastik (pastel)
2. Bulat
3. Cat-eye plastik (pastel)
4. Cat-eye lebar
5. Kotak plastik hitam
6. Kotak clubmaster
7. Sunglasses hitam

Asset ada/nyusul di `public/glasses/Transparan-Frame Depan/` (pola nama: `{bentuk} {material} {warna}.png`, contoh `cat eye plastik caramel.png`).

**Sunglasses hitam — aturan khusus:** lensa gelap/opaque, jadi tetap bisa dipilih manual di strip, tapi DIKELUARIN dari pool auto-rekomendasi "AI Match" — sama kayak aturan glasses tinted lain yang udah berlaku sebelumnya (AI Match cuma boleh nyaranin frame yang area lensanya transparan).

**Kalibrasi wajah — paling kritis, jangan diskip:** tiap asset baru wajib lewat pola yang sama kayak fix `oval-frame.png` / `clubmaster-frame.png` sebelumnya — hitung `aspectRef` dari bounding box artwork asli, bukan asumsi kanvas seragam (dulu 2 asset itu 1080x1080 dengan padding transparan gede di atas-bawah, hasilnya browline kepush ke alis). Kalau ada asset baru yang juga punya padding gede, crop dulu sebelum di-generate scale ref-nya. Setelah reorder + asset baru masuk, re-test IPD scaling & EMA smoothing yang udah ada (landmarks.ts / useFaceTracking.ts / GlassesRenderer.tsx / FaceTracker.tsx) supaya nggak keulang bug sizing yang sempet kejadian (kekecilan → kegedean 2.3x → kekecilan lagi). Test di Android, iOS Safari, MacBook, dan tablet sebelum dianggap kelar.

## 4. Data harga aksesoris (update ke katalog `/softlens`)

| Produk | Harga |
|---|---|
| Ice Solution 150ml | Rp30.000 |
| Ice Solution 60ml | Rp20.000 |
| X2 Solution 120ml | Rp30.000 |
| X2 Solution 60ml | Rp20.000 |
| X2 Contacts 15ml | Rp25.000 |
| Pure N'Soft 60ml | Rp8.000 |
| Mesin cuci softlens | Rp15.000 |
| Spray cleaner biasa | Rp10.000 |

Cocokkan ke produk yang udah ada di grid `/softlens` (Ice 150ml/60ml dan X2 120ml kelihatannya udah match harganya), lengkapin yang belum punya harga atau belum ada card-nya sama sekali.

## Checklist sebelum selesai
- [ ] Kata "gratis" udah nggak muncul lagi di mana pun di hero.
- [ ] Pill baru "Softlens" ke-link ke `/softlens`.
- [ ] Urutan 7 frame persis kayak di atas, "Tanpa Kacamata" tetap paling depan.
- [ ] Sunglasses hitam muncul di strip try-on tapi absen dari auto-recommendation AI Match.
- [ ] Ivory cuma di background — semua card/rectangle tetap putih murni.
- [ ] Floating glasses hero render lengkap dengan gagang, nggak numpuk/misalign.
- [ ] Semua 7 frame baru udah dites face-fit di Android, iOS Safari, MacBook, tablet.
- [ ] Tabel harga di atas ke-reflect di `/softlens`.
