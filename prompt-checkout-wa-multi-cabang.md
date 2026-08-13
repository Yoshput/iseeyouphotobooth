# Prompt: Checkout WhatsApp Multi-Cabang — Optik I See You Softlens

> Disusun berdasarkan review flow checkout yang berjalan di `localhost:3000/softlens` (cart drawer → modal data pemesan → redirect WhatsApp). Bisa langsung dipakai sebagai prompt ke AI coding assistant (Claude Code, Cursor, dll), atau jadi spec manual buat tim dev.

## Ringkasan Perubahan

| # | Area | Kondisi Sekarang | Target |
|---|------|-------------------|--------|
| 1 | Cart & product card | Interaksi minim, feedback statis | Micro-interaction di setiap aksi (tambah, ubah qty, hapus) |
| 2 | Checkout flow | Langsung kirim ke 1 nomor WA tetap | Tambah step pilih cabang (4 opsi) sebelum pesan terkirim |
| 3 | Template pesan WA | Ada karakter `�` di beberapa titik (emoji korup) | Bersih total, tetap rapi & profesional |

---

## Root Cause: Kenapa Muncul Karakter `�`

Karakter `�` (U+FFFD, *replacement character*) muncul karena emoji di template pesan sempat melewati proses yang salah asumsi encoding-nya — biasanya karena emoji di-copy-paste dari sumber non-UTF-8 (Word, PDF, atau editor lama), atau file source-nya sempat tersimpan bukan sebagai UTF-8.

Ini **bukan** masalah di logic `encodeURIComponent()` atau URL encoding. Begitu karakter aslinya sudah berubah jadi `�` di source code, data emoji aslinya sudah hilang permanen — encoding URL yang benar pun tidak bisa "mengembalikan" ke emoji semula. Perbaikannya harus di level source: hapus atau ketik ulang karakter tersebut langsung di editor, bukan di fungsi generate link-nya.

Konsekuensi untuk keputusan desain: kalau tidak ada cara memverifikasi pipeline encoding-nya aman end-to-end, **paling aman adalah tidak memakai emoji sama sekali** di template otomatis — detail & alternatifnya ada di bagian Template Pesan WhatsApp di bawah.

---

## Alur Baru (End-to-End)

1. User menambah produk ke **Keranjang Softlens** (cart drawer) — lihat spesifikasi interaktivitas di bawah.
2. User klik **"LANJUT ORDER VIA WHATSAPP"** → modal terbuka: **Langkah 1/2 — Isi Data Pemesan** (ringkasan pesanan, Nama Lengkap, No. WhatsApp).
3. User isi nama & nomor, klik **"LANJUTKAN"** — label baru menggantikan "KIRIM PESANAN KE WA" di step ini, karena tombol ini belum benar-benar mengirim apa pun. Labelnya nggak boleh menjanjikan aksi yang belum terjadi.
4. Modal pindah ke **Langkah 2/2 — Pilih Cabang Tujuan**: 4 kartu cabang (nama + nomor WA), user pilih salah satu.
5. Tombol **"KIRIM PESANAN KE WA"** aktif setelah satu cabang dipilih. Klik tombol ini → generate pesan (template bersih) + link `api.whatsapp.com` memakai nomor cabang terpilih → buka tab baru.
6. Tombol **"← Kembali"** di Langkah 2/2 membawa user ke Langkah 1/2 tanpa kehilangan nama/nomor yang sudah diisi.

---

## 1. Cart & Product Card — Lebih Interaktif

Fokus di titik yang diminta: proses menambahkan produk ke keranjang. Prioritas implementasi:

- **Feedback saat add to cart** — tombol tambah beri micro-animation (scale down sesaat saat ditekan), badge jumlah item di ikon cart melakukan count-up, disertai toast singkat ("Ditambahkan ke keranjang") yang hilang otomatis ±2 detik.
- **Quantity stepper** — transisi angka smooth saat +/-, bukan snap instan. Saat qty = 1, ganti ikon "-" jadi ikon hapus (trash) supaya user sadar tap berikutnya = menghapus item, bukan qty jadi 0 yang ambigu.
- **Update total** — animasikan perubahan angka subtotal per item & total pembayaran (count up/down), bukan langsung berganti begitu saja.
- **Empty state** — kalau keranjang kosong, tampilkan pesan + CTA balik ke katalog ("Keranjang masih kosong — yuk pilih softlens favoritmu"), tombol checkout otomatis disabled.
- **Card hover/tap state** — subtle lift (shadow + scale ~1.02) di setiap product card supaya terasa responsif, bukan flat.
- **Sticky footer** — total pembayaran & tombol checkout tetap nempel di bawah cart drawer walau list item panjang & di-scroll.

---

## 2. Step Baru: Pilih Cabang Tujuan

4 cabang resmi ditampilkan sebagai list card yang bisa dipilih (radio-style), bukan dropdown — supaya nomor kontak langsung kelihatan tanpa klik tambahan.

```
Langkah 2/2 — Pilih Cabang Tujuan                     ✕
Pesanan akan diteruskan ke cabang ini

○ Purwokerto          0895-4156-14261
○ Wonosobo             0897-7129-039
○ Cilacap              0851-3593-0533
● Purbalingga          0822-3486-2322   ← dipilih

[ ← Kembali ]          [ KIRIM PESANAN KE WA ]
```

Ketentuan:
- Kartu terpilih diberi highlight border + background sesuai warna hijau brand yang sudah dipakai di tombol lain.
- Tombol "KIRIM PESANAN KE WA" disabled sampai satu cabang dipilih.
- Bisa dinavigasi via keyboard (radio group + aria-label nama cabang) untuk accessibility.

### Data Cabang

| Cabang | Nomor Tampilan | Format `phone` untuk wa.me |
|---|---|---|
| Purwokerto | 0895-4156-14261 | `62895415614261` |
| Wonosobo | 0897-7129-039 | `628977129039` |
| Cilacap | 0851-3593-0533 | `6285135930533` |
| Purbalingga | 0822-3486-2322 | `6282234862322` |

Aturan konversi: hapus angka `0` di depan, tambahkan `62`, tanpa spasi/strip/tanda `+`.

```js
const BRANCHES = [
  { id: "purwokerto", name: "Purwokerto", phoneDisplay: "0895-4156-14261", phoneWa: "62895415614261" },
  { id: "wonosobo", name: "Wonosobo", phoneDisplay: "0897-7129-039", phoneWa: "628977129039" },
  { id: "cilacap", name: "Cilacap", phoneDisplay: "0851-3593-0533", phoneWa: "6285135930533" },
  { id: "purbalingga", name: "Purbalingga", phoneDisplay: "0822-3486-2322", phoneWa: "6282234862322" },
];
```

---

## 3. Template Pesan WhatsApp

### Sebelum (bermasalah)

Karakter `�` muncul di 4 titik: sebelum sapaan, sebelum "DATA PEMESAN", sebelum "DAFTAR PESANAN", dan sebelum "TOTAL PEMBAYARAN". Struktur teksnya sendiri sudah bagus — jadi nggak perlu ditulis ulang total, cukup 4 emoji yang korup itu yang dibersihkan.

### Opsi A — Tanpa emoji (rekomendasi)

Paling aman, nggak bergantung sama rendering emoji lintas device, dan tetap keliatan rapi karena format bold (`*teks*`) dan bullet (`•`) bawaan WhatsApp aja udah cukup kasih struktur visual.

```
Halo CS Optik I See You – Cabang {cabang}
Saya mau pesan Softlens dari website.

*DATA PEMESAN*
• Nama: {nama}
• No. WhatsApp: {no_wa}

*DAFTAR PESANAN*
{daftar_item}

*TOTAL PEMBAYARAN:* Rp {total}

Mohon info ketersediaan stok & cara pembayarannya ya kak. Terima kasih!
```

### Opsi B — Emoji minimal (kalau tetap ingin pakai ikon)

Hanya dipakai kalau pipeline encoding-nya sudah diverifikasi aman end-to-end (lihat catatan implementasi di bawah). Emoji harus diketik langsung di editor — jangan copy-paste dari sumber lain — dan pakai emoji tunggal yang sederhana:

```
Halo CS Optik I See You 👋 – Cabang {cabang}
Saya mau pesan Softlens dari website.

📝 *DATA PEMESAN*
• Nama: {nama}
• No. WhatsApp: {no_wa}

🛒 *DAFTAR PESANAN*
{daftar_item}

💰 *TOTAL PEMBAYARAN:* Rp {total}

Mohon info ketersediaan stok & cara pembayarannya ya kak. Terima kasih!
```

---

## Implementasi: Generate Pesan & Link WA

**Sebelum** (dugaan implementasi saat ini — nomor tetap, belum ada pilihan cabang):

```js
const CS_PHONE = "62895415614261"; // hardcoded ke satu cabang

function handleSendOrder() {
  const message = `Halo CS Optik I See You 👋\n...`; // emoji korup di source
  window.open(`https://api.whatsapp.com/send/?phone=${CS_PHONE}&text=${encodeURIComponent(message)}`);
}
```

**Sesudah:**

```js
function buildOrderMessage({ branchName, customerName, phone, items, total }) {
  const daftarItem = items
    .map((item, i) => `${i + 1}. ${item.name} (x${item.qty}) — Rp ${item.price.toLocaleString("id-ID")}`)
    .join("\n");

  return [
    `Halo CS Optik I See You – Cabang ${branchName}`,
    `Saya mau pesan Softlens dari website.`,
    ``,
    `*DATA PEMESAN*`,
    `• Nama: ${customerName}`,
    `• No. WhatsApp: ${phone}`,
    ``,
    `*DAFTAR PESANAN*`,
    daftarItem,
    ``,
    `*TOTAL PEMBAYARAN:* Rp ${total.toLocaleString("id-ID")}`,
    ``,
    `Mohon info ketersediaan stok & cara pembayarannya ya kak. Terima kasih!`,
  ].join("\n");
}

function buildWaLink(phoneWa, message) {
  return `https://api.whatsapp.com/send/?phone=${phoneWa}&text=${encodeURIComponent(message)}`;
}

function handleSendOrder(selectedBranch) {
  if (!selectedBranch) return; // guard — tombol harusnya sudah disabled sebelum ini kepanggil

  const message = buildOrderMessage({
    branchName: selectedBranch.name,
    customerName: nama,
    phone: noWa,
    items: cartItems,
    total: cartTotal,
  });

  window.open(buildWaLink(selectedBranch.phoneWa, message), "_blank");
}
```

Poin penting: string pesan dibangun murni dari karakter yang diketik langsung di source (bukan hasil copy-paste), baru di-encode sekali lewat `encodeURIComponent()`. Ini yang menutup celah penyebab bug sebelumnya.

---

## Acceptance Criteria

- [ ] Setiap aksi di cart (tambah, ubah qty, hapus) punya feedback visual — nggak ada perubahan yang terjadi "diam-diam"
- [ ] Cart kosong menampilkan empty state, tombol checkout disabled
- [ ] Tombol "LANJUTKAN" di Langkah 1/2 disabled sampai nama & no. WhatsApp valid
- [ ] Langkah 2/2 menampilkan 4 cabang dengan nama & nomor sesuai tabel data cabang
- [ ] Balik ke Langkah 1/2 nggak menghapus data yang sudah diisi
- [ ] Tombol "KIRIM PESANAN KE WA" disabled sampai satu cabang dipilih
- [ ] Link yang terbuka memakai nomor cabang yang benar-benar dipilih user (bukan hardcoded)
- [ ] Pesan yang muncul di WhatsApp tidak mengandung karakter `�` atau simbol rusak apa pun
- [ ] Format bold (`*teks*`) dan bullet (`•`) tampil normal di WhatsApp
- [ ] Sudah dites minimal di Chrome desktop + WhatsApp mobile (Android/iOS) untuk pastikan hasil generate link konsisten

---

## Catatan Teknis

- Spesifikasi ini disusun dari review tampilan (screenshot), bukan source code asli — sesuaikan nama file, komponen, dan struktur state dengan codebase sebenarnya (terlihat pakai React + Tailwind, kemungkinan Next.js berdasarkan port `3000`).
- Simpan pilihan cabang di state modal/checkout (`selectedBranch`), reset saat modal ditutup penuh (tombol "Batal" / ikon ✕), tapi dipertahankan saat pindah antar Langkah 1 ⇄ 2 dalam satu sesi checkout.
- Pastikan file yang menyimpan template pesan tersimpan sebagai UTF-8 tanpa BOM, supaya bug karakter rusak nggak muncul lagi di kemudian hari.
