# Perbandingan Pendekatan: Gemini 3.8 Flash High vs Claude Sonnet 4.6

---

## Apa yang sudah dikerjakan dengan baik oleh Gemini

Ekskusi sebelumnya solid di:
- Struktur arsitektur dasarnya benar (Provider, Loader, Reveal)
- TypeScript clean, build 0 error
- Logika role-based tour filtering (owner vs admin)
- Watchdog timer 8-9 detik untuk koneksi lambat
- GSAP dengan prefers-reduced-motion

---

## Bug Nyata yang Ditemukan Claude Sonnet 4.6

### BUG #1: `AdminEntryLoader` di Login Page = Double Provider (KRITIS)
Login page membungkus sendiri dengan `AdminNavigationProvider` + `AdminEntryLoader`.
Tapi `AdminLayoutClient` JUGA membungkus konten admin dengan Provider yang BARU.
Ini berarti context LoginForm dan context AdminLayoutClient BERBEDA — `markRedirecting()` 
yang dipanggil di login form tidak akan pernah mempengaruhi `AdminEntryLoader` di 
dalam admin layout. State tidak pernah tersambung!

**Solusi yang benar:** `AdminEntryLoader` di login page harus berada dalam scope 
Provider yang sama dengan LoginForm.

### BUG #2: `markReady()` mengembalikan cleanup function yang tidak digunakan
```ts
const markReady = useCallback(() => {
  // ...
  const timer = setTimeout(...)
  return () => clearTimeout(timer);  // ← return value dari useCallback DIABAIKAN
}, [clearWatchdog]);
```
`markReady()` dipanggil dari useEffect, return value-nya tidak digunakan untuk 
cleanup. Timer akan leak jika komponen unmount sebelum 250ms.

### BUG #3: `AdminPageReveal` memiliki dependency array yang salah
```ts
useEffect(() => {
  // animasi...
}, [pathname]);  // ← pathname adalah prop dari usePathname() DI LUAR useEffect
```
Seharusnya animasi dipicu oleh perubahan `key` prop dari parent, bukan 
pathname internal — karena component sudah di-remount via `key={pathname}` 
dari parent, useEffect dengan dep `[pathname]` akan run 2x (mount + pathname change).

### BUG #4: Tour — `filteredSteps` re-computed setiap render tanpa memoization
```ts
const filteredSteps = TOUR_STEPS.filter(...)  // ← tanpa useMemo
```
Saat positioning/resize update, seluruh step difilter ulang. Minor tapi bisa 
menyebabkan referential instability.

### BUG #5: `onCloseSidebar` tidak dipanggil saat tour selesai di non-sidebar steps
Hanya menutup sidebar saat `handleSkip()` dan `handleFinish()`, tapi tidak saat 
step berpindah dari sidebar step ke non-sidebar step. Drawer bisa tertinggal terbuka.

### BUG #6: `checkingAuth` spinner di AdminLayoutClient tidak terhubung ke AdminEntryLoader
Masih menggunakan spinner custom terpisah, bukan `AdminEntryLoader` yang baru.
Inkonsistensi visual: ada dua loading state berbeda untuk hal yang sama.

---

## Yang TIDAK dilakukan Gemini tapi seharusnya dilakukan

### 1. Verifikasi bahwa `AdminEntryLoader` benar-benar muncul di browser
Model sebelumnya hanya memastikan TypeScript clean dan build success — tapi tidak 
memverifikasi flow runtime: apakah phase `redirecting` benar-benar tersambung dari 
login ke loader di dalam admin layout.

### 2. Tidak ada `useRef` untuk mencegah stale closure di watchdog
Watchdog timer menggunakan closure yang bisa stale.

### 3. Tour tidak punya `aria-describedby` yang benar untuk screen reader

### 4. Loading skeleton tidak punya `aria-label` yang proper pada tiap card

### 5. Tidak ada handling untuk kasus `userId` undefined tapi user sebenarnya logged in
(terjadi jika initialUser tidak punya `id` field yang tersedia ke client)
