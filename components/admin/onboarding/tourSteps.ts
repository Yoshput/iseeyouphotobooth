export interface TourStep {
  id: string;
  target: string; // CSS selector, e.g. [data-tour='sidebar-frame']
  title: string;
  description: string;
  roles?: ("owner" | "admin")[];
  placement?: "top" | "bottom" | "left" | "right" | "auto";
  requiresSidebarOpen?: boolean;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "dashboard-overview",
    target: "[data-tour='dashboard-overview']",
    title: "Pusat Ringkasan Website",
    description:
      "Pantau status operasional CMS, ringkasan data terkini, dan akses cepat pengelolaan toko.",
    placement: "bottom",
  },
  {
    id: "dashboard-quick-actions",
    target: "[data-tour='dashboard-quick-actions']",
    title: "Aksi Cepat Admin",
    description:
      "Pintasan praktis untuk langsung menambahkan frame baru, produk softlens, atau artikel edukasi.",
    placement: "bottom",
  },
  {
    id: "dashboard-stats",
    target: "[data-tour='dashboard-stats']",
    title: "Statistik Konten Nyata",
    description:
      "Angka jumlah frame, softlens, artikel terbit, dan media yang terhubung langsung ke basis data permanen.",
    placement: "bottom",
  },
  {
    id: "sidebar-frame",
    target: "[data-tour='sidebar-frame']",
    title: "Katalog Frame Kacamata",
    description:
      "Kelola koleksi frame fisik, material, dimensi, harga, dan foto produk kacamata.",
    placement: "right",
    requiresSidebarOpen: true,
  },
  {
    id: "sidebar-softlens",
    target: "[data-tour='sidebar-softlens']",
    title: "Katalog Softlens",
    description:
      "Kelola produk lensa kontak original Kemenkes, varian warna, kadar air, dan ketersediaan stok.",
    placement: "right",
    requiresSidebarOpen: true,
  },
  {
    id: "sidebar-blog",
    target: "[data-tour='sidebar-blog']",
    title: "Blog & Artikel Edukasi",
    description:
      "Tulis dan terbitkan artikel kesehatan mata, tips kacamata, dan panduan perawatan lensa.",
    placement: "right",
    requiresSidebarOpen: true,
  },
  {
    id: "sidebar-media",
    target: "[data-tour='sidebar-media']",
    title: "Media Library Terpusat",
    description:
      "Unggah dan kelola aset gambar, banner promosi, dan foto produk yang dipakai di seluruh website.",
    placement: "right",
    requiresSidebarOpen: true,
  },
  {
    id: "sidebar-content",
    target: "[data-tour='sidebar-content']",
    title: "Konten Halaman Website",
    description:
      "Ubah teks hero, informasi cabang (Purwokerto, Purbalingga, Wonosobo, Cilacap), dan promo.",
    placement: "right",
    requiresSidebarOpen: true,
  },
  {
    id: "sidebar-settings",
    target: "[data-tour='sidebar-settings']",
    title: "Pengaturan Global",
    description:
      "Kelola konfigurasi kontak WhatsApp, alamat cabang, media sosial, dan meta SEO situs.",
    placement: "right",
    requiresSidebarOpen: true,
  },
  {
    id: "sidebar-sponsor",
    target: "[data-tour='sidebar-sponsor']",
    title: "Proposal Sponsor",
    description:
      "Akses formulir dan pengajuan kerjasama sponsor atau kemitraan acara.",
    placement: "right",
    requiresSidebarOpen: true,
  },
  {
    id: "sidebar-users",
    target: "[data-tour='sidebar-users']",
    title: "Pengguna & Audit Keamanan",
    description:
      "Fitur eksklusif Owner untuk mengelola akun admin, hak akses, dan memantau rekaman audit log login & perubahan data.",
    roles: ["owner"],
    placement: "right",
    requiresSidebarOpen: true,
  },
  {
    id: "header-user",
    target: "[data-tour='header-user']",
    title: "Profil & Hak Akses Anda",
    description:
      "Informasi nama staf aktif, alamat email, serta tingkatan peran otorisasi sistem.",
    placement: "bottom",
  },
  {
    id: "admin-help",
    target: "[data-tour='admin-help']",
    title: "Pusat Bantuan & Panduan",
    description:
      "Klik tombol ini kapan saja jika Anda ingin mengulang kembali tur panduan fitur dashboard ini.",
    placement: "bottom",
  },
];
