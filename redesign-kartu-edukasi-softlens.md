# Redesign card edukasi softlens — brief implementasi

## Konteks
Halaman `/softlens`, section "Seputar Perawatan & Resep Softlens" (6 card edukasi) + CTA banner hijau di bawahnya.

Masalah sekarang: 6 card pakai icon emoji default (mata, panah muter, tangan, botol, tetes, koper) dengan warna lingkaran acak (pink/biru/oranye/merah) yang nggak nyambung ke brand hijau tua + gold I See You. Target: simple, elegan, mewah — setara section produk & feed IG yang udah editorial.

**Sebelum eksekusi:** ganti hex `#1c3829` (hijau) dan `#c9a227` (gold) di bawah ke token warna resmi brand — cek `tailwind.config.js`, kemungkinan besar udah didefinisikan. Dua hex ini cuma estimasi dari screenshot.

## Kenapa bukan angka 01–06
Saran awal gue numbering per card, tapi itu pola generic yang sama kayak masalah awal — numbered marker cuma pantes kalau kontennya beneran proses berurutan. 6 topik ini bukan urutan langkah, dan judul section-nya sendiri udah kasih petunjuk: "**Perawatan** & **Resep**". Jadi dipecah jadi 2 grup berlabel, bukan diberi nomor:

- **Resep & ukuran** — Minus Tinggi & Resep Presisi, Silinder (Astigmatism)
- **Perawatan harian** — Cara Pakai & Higienitas, Cairan Pembersih Steril, Tetes Mata Pelembab, Perawatan Lens Case

Label grup ini yang jadi "keterangan" pengganti nomor atau kalimat tambahan.

## Konten & icon (lucide-react)

| Grup | Title | Icon | Copy (dipersingkat) |
|---|---|---|---|
| Resep & ukuran | Minus Tinggi & Resep Presisi | `Eye` | Ready stok hingga -10.00, tim CS bantu cocokkan resep. |
| Resep & ukuran | Silinder (Astigmatism) | `RefreshCw` | Axis presisi, fokus tetap nyaman buat mata silinder. |
| Perawatan harian | Cara Pakai & Higienitas | `Hand` | Cuci tangan, rendam minimal 4 jam sebelum pemakaian awal. |
| Perawatan harian | Cairan Pembersih Steril | `FlaskConical` | ICE / X2 / Pure N'Soft buat lepas endapan protein. |
| Perawatan harian | Tetes Mata Pelembab | `Droplet` | Pakai saat mata kering di ruangan ber-AC. |
| Perawatan harian | Perawatan Lens Case | `Box` | Ganti wadah perendam tiap 1-2 bulan sekali. |

Semua icon: `strokeWidth={1.5}`, satu warna gold, dalam ring tipis — bukan lingkaran solid warna-warni kayak sekarang.

## Kode

```tsx
import { Eye, RefreshCw, Hand, FlaskConical, Droplet, Box, type LucideIcon } from "lucide-react";

function GuideCard({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-[#1c3829]/10 bg-white p-6">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#c9a227]">
        <Icon size={18} strokeWidth={1.5} className="text-[#c9a227]" aria-hidden="true" />
      </div>
      <h3 className="mb-2 font-serif text-lg text-[#1c3829]">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-500">{desc}</p>
    </div>
  );
}

export function PanduanSoftlens() {
  return (
    <>
      <p className="mb-4 text-xs uppercase tracking-widest text-[#c9a227]">Resep & ukuran</p>
      <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <GuideCard icon={Eye} title="Minus Tinggi & Resep Presisi" desc="Ready stok hingga -10.00, tim CS bantu cocokkan resep." />
        <GuideCard icon={RefreshCw} title="Silinder (Astigmatism)" desc="Axis presisi, fokus tetap nyaman buat mata silinder." />
      </div>

      <p className="mb-4 text-xs uppercase tracking-widest text-[#c9a227]">Perawatan harian</p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <GuideCard icon={Hand} title="Cara Pakai & Higienitas" desc="Cuci tangan, rendam minimal 4 jam sebelum pemakaian awal." />
        <GuideCard icon={FlaskConical} title="Cairan Pembersih Steril" desc="ICE / X2 / Pure N'Soft buat lepas endapan protein." />
        <GuideCard icon={Droplet} title="Tetes Mata Pelembab" desc="Pakai saat mata kering di ruangan ber-AC." />
        <GuideCard icon={Box} title="Perawatan Lens Case" desc="Ganti wadah perendam tiap 1-2 bulan sekali." />
      </div>
    </>
  );
}
```

`font-serif` di atas harus resolve ke font yang sama dengan headline "Seputar Perawatan & Resep Softlens" yang udah jalan sekarang — jangan introduce font baru, tinggal pastiin sudah di-alias di `tailwind.config.js` (`theme.fontFamily.serif`).

## CTA banner hijau (di bawah card)
Isinya sendiri udah oke, nggak perlu dirombak struktur/copy-nya — cukup:
- Samain max-width & padding horizontal container-nya sama section card di atas, biar transisi antar-section nggak "loncat" lebar.
- Sesuaikan jarak vertikal ke rhythm baru (card sekarang lebih ringkas, gap ke banner bisa dikecilin dikit biar nggak berasa nge-gap kosong).

## Quality bar
- Cek di lebar mobile: 1 kolom di bawah 640px, `sm:grid-cols-2` di atasnya — pastiin 6 card nggak numpuk aneh, terutama transisi antar 2 grup.
- Icon dikasih `aria-hidden="true"` karena murni dekoratif; title di `<h3>` udah cukup buat screen reader.

## Catatan tambahan (di luar scope redesign ini, tapi worth di-fix bareng)
- Tab filter produk nulis "Semua Produk (21)" tapi heading "Koleksi Lengkap Softlens & Aksesoris" di bawahnya nulis "28 Produk" — cek ulang data count-nya.
- Card produk "Exoticon Miss ICE — Selena..." nama-nya kepotong — pastiin ini truncate disengaja (kasih `title` attribute/tooltip) atau memang overflow bug yang perlu diperbaiki.
