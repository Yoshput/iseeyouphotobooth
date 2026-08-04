# I See You — AR Photobooth (scaffold)

## Cara pakai (drop ke Antigravity)
1. Extract folder ini, buka sebagai project di Antigravity.
2. `npm install`
3. `npm run dev` → buka `/photobooth` (butuh HTTPS atau localhost buat akses kamera; localhost aman)
4. Ganti isi `public/glasses/manifest.json` dan taruh PNG transparan asli dari
   toko + hasil AI-generated di `public/glasses/`.
5. Kalibrasi `fitWidthRatio` tiap kacamata: buka `/photobooth`, coba kacamata
   itu, kalau kelebaran turunin angkanya, kalau kekecilan naikin. Angka mulai
   yang wajar ada di kisaran 1.3–1.7 tergantung model.
6. UI di `app/photobooth/page.tsx` masih scaffold kasar — ganti total begitu
   desain dari Stitch (lihat `design.md`) sudah di-approve pihak toko.

## Tema
**Final: putih/krem minimalist + hijau** (bukan dark/neon dari draft Stitch
awal). Token warna ada di `tailwind.config.ts`, detail lengkap + alasan
kenapa ring gradasi dibuang ada di `design.md`. Logo resmi di
`public/brand-logo-green.png`.

## Yang sudah jalan
- Akses kamera + deteksi wajah real-time (MediaPipe Face Landmarker)
- Kacamata nempel & ikut rotasi kepala (Three.js, pakai eye-distance buat scale, eye-line angle buat roll)
- Ganti-ganti kacamata dari manifest
- Mode solo/duo/group (ganti `numFaces`) — sudah dikodekan tapi belum di-test dengan >1 wajah beneran di depan kamera, cek dulu sebelum production
- **Responsive**: full-bleed di tablet/HP (device utama: tablet Samsung buat event),
  card ter-center dengan aspect ratio tetap di laptop/desktop lebar. Positioning
  kacamata dikoreksi otomatis terhadap perbedaan aspect ratio kamera vs layar
  (`lib/videoCover.ts`) — ini yang bikin akurasinya tetap oke lintas device,
  bukan cuma "keliatannya oke" doang.

## Testing checklist sebelum event
- [ ] Buka di tablet Samsung asli (bukan cuma Chrome DevTools device mode) —
      kamera depan tablet sering beda karakteristik/aspect ratio dari webcam laptop
- [ ] Coba orientasi portrait (asumsi kiosk berdiri portrait, sesuai desain Stitch)
- [ ] Cek di 1 laptop Windows browser Chrome/Edge
- [ ] Cek di HP Android biasa (bukan cuma tablet)
- [ ] Test dengan 2 dan 4 wajah beneran di depan kamera, bukan cuma 1

## Yang belum
- Frame/bingkai overlay (AI-generated + brand asli)
- Capture → download/share flow
- Countdown + transisi GSAP
- UI final sesuai design.md

## Catatan performa
`onFrame` di `useFaceTracking` jalan tiap frame video — jangan taruh `setState`
React di situ langsung, nanti re-render tiap frame dan lag di HP kelas menengah.
Pola yang dipakai sekarang: hasil deteksi langsung didorong ke
`GlassesRenderer` lewat `useImperativeHandle`, Three.js yang urus render-nya
sendiri di luar siklus React.
