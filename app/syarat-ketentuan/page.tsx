import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan | Optik I See You",
  description:
    "Syarat dan ketentuan resmi layanan periksa mata, pembuatan kacamata custom, garansi lensa, dan transaksi di Optik I See You.",
  alternates: {
    canonical: "https://optikiseeyou.com/syarat-ketentuan",
  },
};

export default function SyaratKetentuanPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#212529] font-sans antialiased">
      {/* ── Top Bar Header ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Optik I See You"
              width={100}
              height={38}
              className="h-7 w-auto object-contain"
              priority
            />
            <span className="hidden sm:inline-block border-l border-slate-200 pl-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Syarat &amp; Ketentuan Layanan
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-2xs"
          >
            <span>&larr; Kembali ke Beranda</span>
          </Link>
        </div>
      </header>

      {/* ── Main Document Container (Wrapped in Clean Paper Layout) ────── */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-12 shadow-xs space-y-10">
          {/* Header Title Section */}
          <div className="border-b border-slate-200 pb-6 space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Dokumen Resmi &bull; Ketentuan Transaksi
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
              Syarat &amp; Ketentuan
            </h1>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
              <p>Optik I See You (Purwokerto, Purbalingga, Wonosobo, Cilacap)</p>
              <p>Terakhir diperbarui: 18 Agustus 2026</p>
            </div>
          </div>

          {/* Quick Summary Box */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Ringkasan Layanan &amp; Transaksi
            </h3>
            <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
              Optik I See You menyediakan layanan periksa mata gratis, perakitan kacamata faset presisi mesin CNC, dan penjualan softlens resmi. Seluruh pesanan lensa kustom dan produk diproses dengan standar mutu ketat demi menjamin kejernihan serta kenyamanan penglihatan Anda.
            </p>
          </div>

          {/* Detailed Clauses */}
          <div className="space-y-8 text-xs sm:text-[13.5px] text-slate-700 leading-relaxed">
            {/* Clause 1 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                1. Ketentuan Umum dan Penerimaan Layanan
              </h2>
              <p>
                Syarat dan Ketentuan ini merupakan perjanjian hukum antara Anda (&ldquo;Pelanggan&rdquo;) dan Optik I See You (&ldquo;kami&rdquo;). Dokumen ini mengatur penggunaan situs web <strong>optikiseeyou.com</strong>, reservasi periksa mata digital, pemesanan kacamata melalui WhatsApp resmi, serta transaksi di seluruh gerai cabang fisik kami.
              </p>
              <p>
                Dengan mengakses situs atau melakukan transaksi pemesanan, Anda menyetujui seluruh ketentuan yang tercantum dalam dokumen ini.
              </p>
            </section>

            {/* Clause 2 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                2. Layanan Pemeriksaan Mata dan Konsultasi Refraksi
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>
                  <strong>Cek Mata Gratis:</strong> Pemeriksaan mata menggunakan perangkat <em>Autorefractor</em> digital komputerisasi dan uji kenyamanan <em>Trial Lens Set</em> disediakan tanpa dipungut biaya di seluruh cabang resmi Optik I See You.
                </li>
                <li>
                  <strong>Akurasi Pengukuran:</strong> Pengukuran refraksi dilakukan oleh staf refraksionis berpengalaman untuk menentukan koreksi miopia (minus), astigmatisme (silinder), dan presbiopia (plus). Layanan ini berfokus pada kebutuhan optik korektif; untuk keluhan patologis medis mata, kami menyarankan konsultasi lanjutan dengan dokter spesialis mata.
                </li>
                <li>
                  <strong>Reservasi Daring:</strong> Formulir pemesanan jadwal di situs web berfungsi sebagai permohonan antrean dan akan dikonfirmasi ketersediaan slotnya oleh tim cabang melalui WhatsApp.
                </li>
              </ul>
            </section>

            {/* Clause 3 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                3. Pemesanan Frame, Lensa Kustom, dan Softlens
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>
                  <strong>Lensa Pesanan Khusus (Custom):</strong> Setiap lensa dipotong secara individual mengikuti bentuk frame dan parameter Pupil Distance (PD) pelanggan. Pesanan lensa kustom yang telah masuk proses faset tidak dapat dibatalkan secara sepihak.
                </li>
                <li>
                  <strong>Katalog Produk:</strong> Kami berupaya menampilkan spesifikasi dimensi frame (lebar lensa, lebar jembatan hidung, panjang gagang) dan warna seakurat mungkin. Perbedaan minor dapat terjadi akibat kalibrasi layar monitor perangkat Anda.
                </li>
                <li>
                  <strong>Koleksi Softlens:</strong> Pelanggan bertanggung jawab memastikan ukuran minus, kadar air, dan masa pakai produk softlens yang dipilih sesuai dengan rekomendasi penggunaan harian.
                </li>
              </ul>
            </section>

            {/* Clause 4 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                4. Garansi Kenyamanan Adaptasi dan Presisi Faset
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>
                  <strong>Garansi Adaptasi Resep:</strong> Kami memberikan jaminan adaptasi resep kacamata baru dalam periode masa penyesuaian sejak kacamata diterima, apabila pelanggan mengalami ketidaknyamanan visual setelah pemeriksaan refraksi di gerai kami.
                </li>
                <li>
                  <strong>Kualitas Faset Mesin Otomatis:</strong> Seluruh lensa difaset menggunakan mesin potong otomatis CNC untuk memastikan ketepatan sumbu silinder (axis) dan posisi fokus pupil (optis).
                </li>
                <li>
                  <strong>Batasan Garansi:</strong> Garansi tidak berlaku untuk kerusakan akibat kelalaian fisik pengguna, seperti lensa tergores akibat gesekan kasar, frame patah karena tertindih/benturan keras, atau terkena paparan zat kimia agresif.
                </li>
              </ul>
            </section>

            {/* Clause 5 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                5. Transaksi Pembayaran dan Kanal Toko Resmi
              </h2>
              <p>
                Untuk keamanan bertransaksi, Optik I See You hanya menerima pembayaran melalui:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>Kasir gerai resmi cabang Purwokerto, Purbalingga, Wonosobo, dan Cilacap (Tunai, QRIS, Kartu Debit, Transfer).</li>
                <li>Nomor WhatsApp Pemesanan Resmi (+62 895-4156-14261).</li>
                <li>Shopee Official Store: <strong>shopee.co.id/iseeyou.id</strong></li>
                <li>Tokopedia Official Store: <strong>tokopedia.com/iseeyouglasses</strong></li>
              </ul>
            </section>

            {/* Clause 6 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                6. Hak Kekayaan Intelektual
              </h2>
              <p>
                Merek dagang &ldquo;Optik I See You&rdquo;, logo, grafis antarmuka, aset foto katalog orisinal, serta sistem AR Virtual Try-On dilindungi oleh undang-undang hak kekayaan intelektual Republik Indonesia. Dilarang memanfaatkan aset visual atau merek dagang kami untuk kepentingan komersial tanpa persetujuan tertulis resmi.
              </p>
            </section>

            {/* Clause 7 */}
            <section className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                7. Layanan Bantuan dan Konsultasi Pelanggan
              </h2>
              <p className="text-slate-600">
                Untuk pertanyaan mengenai layanan, klaim garansi, atau pelacakan pesanan, silakan menghubungi tim layanan pelanggan kami:
              </p>
              <div className="pt-1.5 space-y-1 text-xs text-slate-700">
                <p><strong>Layanan Pelanggan Optik I See You</strong></p>
                <p>WhatsApp: +62 895-4156-14261</p>
                <p>Instagram: @iseeyou.glasses</p>
                <p>Gerai Cabang: Purwokerto &bull; Purbalingga &bull; Wonosobo &bull; Cilacap</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-4xl space-y-2">
          <p>&copy; 2019 &ndash; 2026 Optik I See You. All Rights Reserved.</p>
          <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-700">
            <Link href="/" className="hover:text-emerald-700 transition-colors">Beranda</Link>
            <span>&bull;</span>
            <Link href="/kebijakan-privasi" className="hover:text-emerald-700 transition-colors">Kebijakan Privasi</Link>
            <span>&bull;</span>
            <Link href="/syarat-ketentuan" className="font-semibold text-emerald-800 hover:underline">Syarat &amp; Ketentuan</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
