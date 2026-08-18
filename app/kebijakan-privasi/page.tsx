import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | Optik I See You",
  description:
    "Kebijakan privasi resmi Optik I See You. Informasi transparan mengenai pemrosesan data kamera AR Try-On, penyimpanan foto, dan perlindungan privasi konsumen.",
  alternates: {
    canonical: "https://optikiseeyou.com/kebijakan-privasi",
  },
};

export default function KebijakanPrivasiPage() {
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
              Pusat Privasi &amp; Keamanan
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
              Dokumen Resmi &bull; Perlindungan Data
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
              Kebijakan Privasi
            </h1>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
              <p>Optik I See You (Purwokerto, Purbalingga, Wonosobo, Cilacap)</p>
              <p>Terakhir diperbarui: 18 Agustus 2026</p>
            </div>
          </div>

          {/* Quick Summary Box */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Ringkasan Penting bagi Pengguna
            </h3>
            <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
              Optik I See You menghormati dan melindungi privasi Anda. Fitur Augmented Reality (AR) Try-On kacamata kami diproses <strong>100% secara lokal di perangkat Anda</strong> tanpa merekam atau mentransmisikan data wajah ke server. Kami tidak pernah menjual data pribadi Anda kepada pihak mana pun.
            </p>
          </div>

          {/* Detailed Clauses */}
          <div className="space-y-8 text-xs sm:text-[13.5px] text-slate-700 leading-relaxed">
            {/* Clause 1 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                1. Pendahuluan dan Ruang Lingkup
              </h2>
              <p>
                Kebijakan Privasi ini mengatur bagaimana Optik I See You (&ldquo;kami&rdquo;), unit usaha yang melayani kebutuhan optik dan kesehatan mata sejak tahun 2019 di 4 cabang resmi Jawa Tengah, mengelola informasi yang diperoleh melalui situs web resmi <strong>optikiseeyou.com</strong> (&ldquo;Situs&rdquo;).
              </p>
              <p>
                Dengan mengakses Situs dan menggunakan layanan interaktif kami, Anda menyatakan telah membaca dan memahami ketentuan perlindungan data yang diuraikan dalam dokumen ini.
              </p>
            </section>

            {/* Clause 2 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                2. Pemrosesan Kamera dan Teknologi AR Try-On
              </h2>
              <p>
                Situs kami menyediakan fitur uji coba kacamata virtual (AR Try-On) dan AR Photobooth yang memerlukan akses sementara ke kamera perangkat Anda. Ketentuan teknis pemrosesan meliputi:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>
                  <strong>Pemrosesan Lokal di Perangkat (On-Device):</strong> Analisis titik kontur wajah (<em>facial landmarks</em>) dijalankan secara langsung di peramban web (browser) Anda menggunakan pustaka Google MediaPipe. Tidak ada transmisi video langsung (<em>live stream</em>) atau tangkapan wajah mentah yang dikirim ke server kami.
                </li>
                <li>
                  <strong>Tanpa Penyimpanan Data Biometrik:</strong> Titik koordinat geometri wajah hanya diproses secara dinamis saat sesi kamera aktif untuk menempatkan frame kacamata secara proporsional. Data biometrik pengenal wajah tidak direkam maupun disimpan.
                </li>
                <li>
                  <strong>Kendali Izin Akses:</strong> Kamera hanya aktif setelah pengguna memberikan izin peramban (<em>Camera Permission</em>). Anda dapat mematikan akses kamera kapan saja melalui pengaturan browser Anda.
                </li>
              </ul>
            </section>

            {/* Clause 3 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                3. Penyimpanan Foto Hasil Photobooth dan Kode QR
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>
                  <strong>Pembuatan Lembar Foto:</strong> Foto strip dan animasi GIF yang Anda buat melalui fitur photobooth hanya disimpan di penyimpanan cloud terenkripsi apabila Anda memilih opsi <em>Simpan / Unduh via Kode QR</em>, agar Anda dapat mengunduh hasilnya ke galeri ponsel pribadi.
                </li>
                <li>
                  <strong>Hak Kepemilikan:</strong> Hak cipta dan kepemilikan atas foto diri hasil pemotretan sepenuhnya adalah milik pengguna. Optik I See You tidak mempublikasikan foto pelanggan untuk materi komersial tanpa izin tertulis.
                </li>
              </ul>
            </section>

            {/* Clause 4 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                4. Data Reservasi Cek Mata dan Layanan WhatsApp
              </h2>
              <p>
                Ketika Anda melakukan reservasi pemeriksaan mata gratis atau menghubungi layanan konsultasi melalui WhatsApp:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>
                  <strong>Jenis Informasi:</strong> Nama, nomor kontak telepon/WhatsApp, cabang yang dituju, serta jadwal kunjungan yang Anda masukkan secara sukarela.
                </li>
                <li>
                  <strong>Tujuan Penggunaan:</strong> Data tersebut digunakan semata-mata oleh tim cabang terkait untuk konfirmasi jadwal reservasi, konsultasi resep kacamata, dan informasi ketersediaan produk di toko.
                </li>
                <li>
                  <strong>Kerahasiaan Kontak:</strong> Nomor kontak pelanggan dijaga kerahasiaannya dan tidak dipindahtangankan kepada pihak ketiga untuk tujuan telemarketing atau periklanan tidak resmi.
                </li>
              </ul>
            </section>

            {/* Clause 5 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                5. Penyimpanan Preferensi Lokal (Local Storage)
              </h2>
              <p>
                Situs kami memanfaatkan mekanisme penyimpanan lokal peramban (<em>LocalStorage</em>) semata-mata untuk menyimpan preferensi teknis pengguna, seperti daftar item keranjang softlens sementara dan pengaturan suara kamera, agar navigasi Anda tetap lancar saat membuka halaman berikutnya.
              </p>
            </section>

            {/* Clause 6 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                6. Kepatuhan Undang-Undang Perlindungan Data Pribadi
              </h2>
              <p>
                Optik I See You tunduk pada prinsip pelindungan data pribadi yang berlaku di Indonesia, termasuk Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP). Pengguna berhak meminta konfirmasi atau penghapusan data kontak yang pernah dikirimkan melalui layanan pelanggan kami.
              </p>
            </section>

            {/* Clause 7 */}
            <section className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                7. Saluran Kontak dan Layanan Resmi
              </h2>
              <p className="text-slate-600">
                Apabila terdapat pertanyaan mengenai Kebijakan Privasi ini atau pengelolaan data di Optik I See You, silakan menghubungi:
              </p>
              <div className="pt-1.5 space-y-1 text-xs text-slate-700">
                <p><strong>Layanan Pelanggan Optik I See You</strong></p>
                <p>WhatsApp: +62 895-4156-14261</p>
                <p>Instagram: @iseeyou.glasses</p>
                <p>Alamat Pusat: Jl. Sunan Ampel No.5, Sidamulya, Kedungmalang, Kec. Sumbang, Kab. Banyumas, Jawa Tengah 53124</p>
                <p>Cabang Resmi: Purwokerto &bull; Purbalingga &bull; Wonosobo &bull; Cilacap</p>
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
            <Link href="/kebijakan-privasi" className="font-semibold text-emerald-800 hover:underline">Kebijakan Privasi</Link>
            <span>&bull;</span>
            <Link href="/syarat-ketentuan" className="hover:text-emerald-700 transition-colors">Syarat &amp; Ketentuan</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
