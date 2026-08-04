# Design Brief — I See You AR Photobooth (FINAL — Light Theme)
*Untuk Antigravity. Source visual: feed @iseeyou.glasses (post content asli) + logo resmi.*

## 0. Koreksi dari draft sebelumnya
Draft pertama design.md salah ambil kesimpulan: ring gradasi pink-oranye-ungu
yang kelihatan di sekitar foto profil Instagram itu **bukan elemen brand I
See You** — itu ring bawaan Instagram yang otomatis muncul di foto profil
manapun kalau ada story aktif yang belum ditonton, sama untuk semua akun.
Itu salah dijadiin signature element. Dicabut.

Yang benar-benar brand asset: **logo wordmark hijau tua serif** ("OPTIK / I
SEE YOU", arched text) dan **konten post asli** — mayoritas background
**putih/krem terang**, bukan hitam. Versi dark yang di-generate Stitch
kemarin itu keluar dari brand asli, ini dikoreksi total jadi tema terang.

## 1. Yang kelihatan dari asset asli (logo + feed)
- Logo: wordmark serif hijau tua, "OPTIK" melengkung di atas, "I SEE YOU"
  besar di bawah, background transparan — elegan, klasik, bukan playful.
- Post promo (Promo Weekend Sale, Payday Sale): background **putih**, badge
  diskon bentuk **pita/ribbon hijau** dengan angka besar, tipografi tebal
  kapital sedikit dinamis — energik tapi tetap di atas kanvas putih, bukan hitam.
- Post premium (Titanium Edition, Cat Eye Edition): background putih/krem,
  foto model natural, nama produk pakai **tipografi script/cursive hijau
  tua**, elegan dan lega jaraknya.
- Tone caption: santai, akrab, bahasa gaul ringan. Tagline: "Jadi Sahabat
  Mata Kamu".

**Kesimpulan:** brand ini **simple, minimalist, terang** — hijau tua +
putih sebagai identitas utama, dengan hijau terang sebagai aksen energik di
badge/CTA. Bukan neon-on-black seperti draft Stitch pertama.

## 2. Token Desain (FINAL)

### Warna
| Token | Hex (perkiraan, sesuaikan ke logo asli saat implementasi) | Pemakaian |
|---|---|---|
| `isy-white` | `#FFFFFF` | Base background |
| `isy-mist` | `#F3F8F4` | Warna kedua untuk gradasi lembut di background (radial/linear, dari putih ke ini) — ini "gradasi" yang diminta |
| `isy-green-deep` | `#1B4332` | Warna logo/wordmark, teks judul, ikon aktif |
| `isy-green-bright` | `#2FA84F` | Aksen CTA, badge, ring scan-indicator, tombol utama |
| `isy-ink` | `#16241C` | Teks body di atas putih (bukan hitam pekat — sedikit kehijauan biar nyatu) |
| `isy-line` | `#E3ECE6` | Border/divider tipis, bukan garis hitam |

### Tipografi
- **Display/judul mode & CTA besar**: sans tebal, kapital — mis. **Archivo
  Black** / **Anton** — tapi dipakai warna `isy-green-deep` di atas putih,
  bukan putih di atas hitam.
- **Aksen premium** (nama kacamata aktif): script/cursive — mis. **Playfair
  Display Italic**, warna `isy-green-deep`, dipakai kecil sama seperti "Titanium Edition" di post asli.
- **UI/body**: sans netral — **Inter** / **Plus Jakarta Sans**, warna `isy-ink`.

### Layout
- Background utama: gradasi lembut putih → `isy-mist`, arah radial dari
  tengah-atas (bukan gradasi mencolok, harus tetap kebaca "putih bersih"
  dari kejauhan).
- Viewport kamera: card rounded besar (24-32px), border tipis `isy-line`,
  shadow lembut — bukan neon border seperti draft dark sebelumnya.
- Chip mode & pilihan kacamata: outline hijau tipis saat non-aktif, isi
  penuh `isy-green-bright` saat aktif — kontras jelas di atas putih.
- Logo wordmark (`brand-logo-green.png`) muncul kecil di header, bukan
  logo besar menutupi layar.

## 3. Wireframe (ASCII, light theme)

```
┌──────────────────────────────────────┐
│         OPTIK · I SEE YOU  (logo kecil, tengah atas) │
│                                        │
│  [Sendiri] [Berdua] [Grup]  <- chip outline hijau     │
│                                        │
│     ┌────────────────────────────┐    │
│     │                            │    │
│     │      [ viewport kamera ]   │    │  <- card putih, border tipis,
│     │      wajah + kacamata AR   │    │     ring hijau saat wajah kedeteksi
│     │                            │    │
│     └────────────────────────────┘    │
│                                        │
│    Titanium Edition  (script, hijau tua, kecil)        │
│                                        │
│   ○ ○ ● ○ ○   <- pilihan kacamata (outline hijau)      │
│                                        │
│         [ AMBIL FOTO ]  <- tombol isi hijau terang     │
└──────────────────────────────────────┘
```

Hasil foto: preview full, tombol "Simpan"/"Ulangi" gaya chip sama,
watermark logo kecil `isy-green-deep` di pojok bawah foto.

## 4. Signature Element (revisi)
**Bukan ring gradasi** (itu Instagram, sudah dicabut di §0). Signature
element yang benar: **ring `isy-green-bright` tunggal**, muncul melingkari
area wajah sesaat (0.3-0.4 detik, fade out) saat wajah baru kedeteksi —
warna solid brand hijau, bukan gradasi pinjaman dari UI orang lain. Ini
tetap fungsional (feedback "wajah kedeteksi") sekaligus konsisten sama
identitas warna brand.

## 5. Animasi & Microcopy
Sama seperti draft sebelumnya (GSAP kalem, bukan flashy), tone copy santai
— hanya warnanya yang berubah total ke tema terang. Lihat AGENT.md untuk
instruksi teknis ke Antigravity.

## 6. Yang harus DIHINDARI (update)
- **Jangan pakai tema gelap/neon** — itu draft lama, sudah dibatalkan.
- Jangan pakai ring gradasi pink-oranye-ungu di mana pun — itu bukan aset brand.
- Jangan bikin gradasi background terlalu mencolok/berwarna — harus tetap
  terasa "putih bersih", gradasinya subtle banget, bukan hero gradient ala app musik.
- Jangan pakai hitam pekat buat teks body — pakai `isy-ink` yang sedikit kehijauan.
