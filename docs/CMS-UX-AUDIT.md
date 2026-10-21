# AUDIT UX & TEKNIS — OPTIK I SEE YOU CMS PREMIUM EXPERIENCE

> **Dokumen Audit & Analisis Baseline**  
> **Target:** `https://optikiseeyou.com/admin`  
> **Repository:** `Yoshput/iseeyouphotobooth`  
> **Branch Pekerjaan:** `feat/admin-premium-experience`  
> **Tanggal Audit:** 21 Oktober 2026  
> **Lead Auditor:** Senior Next.js Engineer, GSAP Motion Designer & UI/UX Architect

---

## 1. Stack & Versi Dependensi Aktual (Inspeksi Langsung)

Dari inspeksi file `package.json`, konfigurasi proyek, dan runtime:

| Paket / Dependensi | Versi Terpasang | Peran dalam Ekosistem CMS |
|---|---|---|
| **Next.js** | `^15.1.7` (App Router) | Server Components, Route Handlers, Turbopack/Webpack runtime |
| **React & React DOM** | `^18.3.1` | Client Hooks, Suspense boundaries, Context providers |
| **GSAP (GreenSock)** | `^3.12.5` | High-performance animation engine untuk transisi dashboard |
| **Tailwind CSS** | `^3.4.1` + `tailwindcss-animate` | Utility styling, design tokens, responsive breakpoints |
| **Lucide React** | `^1.31.0` | Ikonografi resmi CMS terpusat |
| **TypeScript** | `^5` | Strict static typing di seluruh route & repository |

---

## 2. Temuan Audit Baseline & Investigasi Kode

### A. Root Cause: Masalah "Stuck / Freeze -> Tiba-tiba Masuk Dashboard"
Pada alur login sebelumnya:
1. **Pelepasan State Terlalu Cepat di Form Login (`app/admin/login/page.tsx`)**:
   Ketika submit API `/api/admin/auth/login` berhasil, kode memanggil:
   ```ts
   router.push("/admin");
   router.refresh();
   ```
   Namun di blok `finally`, `setIsLoading(false)` langsung dieksekusi seketika itu juga. Akibatnya, tombol kembali ke keadaan normal ("Masuk ke Dashboard") selama 500ms - 2000ms sebelum route `/admin` selesai di-render oleh server.
2. **Ketiadaan App Router `loading.tsx` di `/admin`**:
   `app/admin/page.tsx` adalah Server Component bertanda `force-dynamic` yang memanggil `Promise.all` terhadap 5 fungsi database:
   - `getFrames()`
   - `getSoftlens()`
   - `getBlogPosts()`
   - `getMediaFiles()`
   - `getAuditLogs({ limit: 10 })`
   
   Karena file `app/admin/loading.tsx` belum pernah dibuat di repository, Next.js menunggu seluruh `Promise.all` selesai di server sebelum mengirimkan HTML ke browser. Selama jeda ini, browser tampak tidak merespons ("freeze").
3. **Komponen `TopProgressBar.tsx` Diimpor Tapi Tidak Dirender**:
   Di file `app/layout.tsx` baris 7, `TopProgressBar` diimpor (`import TopProgressBar from "@/components/ui/TopProgressBar"`), namun di dalam JSX body baris 440-456 komponen tersebut **sama sekali tidak dipanggil/dirender**. Akibatnya progress bar tidak pernah tampil.
4. **`TopProgressBar` Hanya Mendengarkan Event Klik Anchor (`<a>`)**:
   Bahkan jika dirender, `TopProgressBar` hanya menangkap klik pada elemen `<a>`, sedangkan perpindahan dari login ke dashboard dilakukan secara terprogram (`router.push('/admin')`).
5. **Animasi Transisi `AdminLayoutClient` Hanya Berjalan Pasca-Navigasi**:
   `AdminLayoutClient.tsx` menggunakan `key={pathname}` dengan Tailwind `animate-in fade-in-50 slide-in-from-bottom-2`. Efek ini baru terpicu *setelah* route berubah, bukan saat navigasi sedang diproses (pending state).

---

## 3. Rencana Implementasi & Solusi Arsitektur

### Fase P0: Perbaikan Hand-Off Navigasi & Loading Real-Time
1. **`AdminNavigationProvider` & `useAdminNavigation`**:
   - Single source of truth untuk fase navigasi (`idle`, `authenticating`, `redirecting`, `loading-route`, `revealing`, `error`).
   - Menyediakan fungsi programmatic `navigate(url)`, `startLoading()`, `finishLoading()`.
2. **`AdminEntryLoader` (Branded, Cepat, Tanpa Jeda Buatan)**:
   - Tampil saat verifikasi login dan hand-off navigasi awal.
   - Logo resmi Optik I See You dengan hairline progress emerald elegan.
   - Teks status transparan: *"Memverifikasi akses..."* -> *"Mempersiapkan dashboard..."*.
   - **Prinsip Utama:** Tidak ada `setTimeout` 2-3 detik buatan; exit langsung terpicu seketika route siap (`power2.out`, 200-300ms).
   - Dilengkapi *watchdog safety timer* (8 detik) yang memunculkan opsi pemulihan (*Muat Ulang* / *Coba Lagi*) jika jaringan bermasalah.
3. **Mounting & Penyempurnaan `TopProgressBar`**:
   - Me-render `<TopProgressBar />` di root layout dan menghubungkannya dengan event navigasi terprogram maupun anchor link.
4. **App Router `app/admin/loading.tsx` & Dashboard Skeleton**:
   - Menyediakan skeleton instan yang mencerminkan struktur grid metrik, aksi cepat, dan tabel ringkasan sehingga tidak ada pergeseran tata letak (CLS = 0).
5. **GSAP Content Transition & Accessibility**:
   - Transisi kehalusan konten menggunakan GSAP dengan scoped context dan cleanup otomatis.
   - Dukungan penuh `prefers-reduced-motion` (langsung instan tanpa animasi translasi bagi pengguna yang sensitif terhadap gerakan).

---

### Fase P1: Interactive Product Tour (Onboarding Staf & Owner)
1. **Semantic `data-tour` Anchors**:
   - `dashboard-overview`
   - `dashboard-stats`
   - `dashboard-quick-actions`
   - `sidebar-frame`
   - `sidebar-softlens`
   - `sidebar-blog`
   - `sidebar-media`
   - `sidebar-content`
   - `sidebar-settings`
   - `sidebar-sponsor`
   - `sidebar-users` (eksklusif untuk role `owner`)
   - `header-user`
   - `admin-help`
2. **Role-Aware Filtering**:
   - Role `admin` tidak akan pernah melihat langkah untuk `sidebar-users` (Pengguna & Audit).
3. **Persistensi Bersih Per-User**:
   - Menggunakan key `isy_cms_tour_v1:<userId>` di `localStorage`.
   - Menangani kasus private browsing / quota storage dengan aman via `try/catch`.
4. **Mobile Drawer Support**:
   - Pada layar HP/tablet (< 1024px), sidebar otomatis dibuka saat langkah tur menyorot menu sidebar, dan ditutup kembali dengan transisi rapi.
5. **Tombol Bantuan Replay**:
   - Tombol `? Panduan Dashboard` di header admin untuk mengulang tur kapan saja.

---

### Fase P2: Polish Interaksi & Responsivitas Tingkat Industri
1. **Hierarchy & Status Konsisten**:
   - Memastikan metrik, kartu ringkasan, dan status badge tampil proporsional di resolusi 320px hingga 4K.
2. **Pembersihan Indefinite Pulse**:
   - Mengganti animasi denyut tak berujung dengan indikator status statis yang elegan, kecuali pada elemen yang benar-benar aktif merepresentasikan tugas latar belakang.
3. **Feedback Aksi CRUD**:
   - Proteksi double-submit pada tombol simpan/tambah/edit.
   - Indikator loading nyata pada dialog konfirmasi.
