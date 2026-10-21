# PLAN.md — Optik I See You CMS Premium Experience

> **Status:** Rencana implementasi untuk coding agent, bukan klaim bahwa perubahan sudah diterapkan.  
> **Target:** `https://optikiseeyou.com/admin`  
> **Repository:** `https://github.com/Yoshput/iseeyouphotobooth` (branch `main`)  
> **Dibuat:** 21 Oktober 2026  
> **Eksekutor:** Antigravity / Gemini 3.8 Flash High (atau model coding yang tersedia)  
> **Fokus:** Login-to-dashboard transition, reliable loading feedback, interactive onboarding, refined CMS UI, accessibility, performance, and production-safe QA.

---

## 0. Mandat produk dan definisi berhasil

Buat pengalaman admin yang **responsif, jelas statusnya, terasa premium, dan tidak pernah tampak macet tanpa umpan balik**. Jangan menyamakan 'animasi lebih banyak' dengan 'UX lebih baik'. Utamakan kecepatan sungguhan, respons cepat terhadap aksi, transisi konsisten, dan aksesibilitas.

### Non-negotiable

- Perubahan terutama pada pengalaman **CMS `/admin`**, bukan redesign website publik, photobooth, AR, atau database bisnis.
- **Jangan** mengubah alur autentikasi, captcha, rate limit, session cookie, audit log, authorization role, maupun endpoint API tanpa alasan yang dibuktikan dan disetujui oleh hasil audit internal implementasi.
- Jangan menampilkan data dashboard terlindungi kepada pengunjung yang belum terautentikasi. Tidak ada overlay, prefetch, cache, ataupun tutorial yang boleh membocorkan data CMS.
- Pertahankan nama route, kemampuan CRUD, validasi form, modal konfirmasi, hak akses, fungsi upload, dan persistence.
- Gunakan branding yang sudah ada: `isy-ivory #F8F5ED`, `isy-emerald #124734`, `isy-green-bright #2FA84F`, `isy-mist #F3F8F4`, `isy-line #E3E7DF`, font Poppins / Playfair sesuai pemakaian aktual. Baca `tailwind.config.ts` dan `design.md` untuk konsistensi. Jangan mengubah proyek menjadi dark/neon.
- Animasi berjalan **hanya jika dibutuhkan dan tetap aman saat gagal**. Semua overlay harus memiliki jalur pelepasan (cleanup) dan fallback.
- Terapkan `prefers-reduced-motion`; dukung keyboard, screen reader, mobile, dan perangkat kelas menengah.
- **Jangan deploy otomatis ke production** atau push langsung ke `main`; implementasikan di working branch, jalankan QA, laporkan hasil, mintakan persetujuan untuk merge/deploy.

### Tujuan UX yang dapat diverifikasi

1. Setiap login valid langsung menghasilkan indikator yang terlihat hingga rute dashboard benar-benar siap tampil.
2. Navigasi antarhalaman CMS menampilkan feedback segera; dashboard shell (sidebar/header) tidak berkedip/ter-reset.
3. Beban data lebih lambat memiliki skeleton yang sesuai, bukan layar kosong atau spinner tak berujung.
4. User pertama kali berhasil masuk mendapat **tur kontekstual yang dapat dilewati**, dengan sorotan elemen CMS yang nyata.
5. Tour bisa diulang kapan saja lewat tombol `? Panduan Dashboard` atau menu bantuan; progress disimpan per user dan versi tur.
6. Aksi simpan, hapus, upload, publikasi, dan kegagalan jaringan punya feedback jelas dan aman.
7. Tidak ada regresi fungsi, authorization, accessibility, dan responsive layout.

---

## 1. Audit awal: fakta teramati dari repo publik (wajib verifikasi ulang di checkout eksekusi)

### 1.1 Stack dan struktur

- `package.json`: **Next.js 15.1.7** (rentang `^`), React 18, TypeScript, Tailwind CSS 3, Lucide, **GSAP `^3.12.5` sudah terpasang**. Jadi jangan menambahkan package GSAP kedua atau mengganti seluruh animation stack.
- `app/admin/layout.tsx`: Server Component membaca `getServerAdminSession()` lalu me-render `AdminLayoutClient`.
- `app/admin/AdminLayoutClient.tsx`: shell CMS berupa `AdminSidebar`, `AdminHeader`, `main`; auth verification fallback sudah punya spinner dasar; page container memakai `key={pathname}` dengan kelas Tailwind `animate-in fade-in-50 slide-in-from-bottom-2 duration-300`. Animasi ini terjadi **setelah** perubahan pathname, bukan indikator pending yang kuat.
- `app/admin/page.tsx`: Server Component `force-dynamic`, mengambil frame, softlens, blog, media, audit log lewat `Promise.all`. Lambatnya salah satu sumber bisa menahan overview; perlu loading fallback terukur dan profiling, bukan sekadar menutupinya.
- `app/admin/login/page.tsx`: setelah login API sukses, menjalankan `router.push('/admin')` disusul `router.refresh()`. Indikator tombol `isLoading` ada selama request, tetapi belum ada orchestration kuat untuk jeda navigasi setelah respons login.
- `components/ui/TopProgressBar.tsx`: ada komponen progress yang menangkap klik anchor dan memperbarui progress ketika pathname berubah; tetapi `app/layout.tsx` **mengimpor komponen tanpa me-render `<TopProgressBar />` dalam JSX yang terlihat**. Jadi tidak cukup menganggap progress bar sudah aktif. Jangan cukup menempelkan komponen ini tanpa merapikan logika pemicu, cleanup timer, dan programmatic navigation.
- `app/admin/loading.tsx`: pada pemeriksaan URL raw source, **belum ditemukan**. Buat loading strategy sesuai perilaku App Router setelah audit.
- `middleware.ts`: memaksa pengunjung tanpa cookie sesi dari `/admin` menuju `/admin/login?notice=unauthorized`; proses login dan server session verification tetap menjadi sumber otoritas akses.
- Root layout mengandung `PWASplashScreen`, namun itu khusus mode PWA standalone pertama kali, **bukan solusi navigasi CMS**.
- `components/admin/AdminSidebar.tsx`: navigasi nyata adalah Dashboard, Katalog Frame, Katalog Softlens, Blog & Artikel, Media Library, Konten Website, Pengaturan Global, Proposal Sponsor, serta Pengguna & Audit khusus role `owner`.
- `AdminLayoutClient` membiarkan `/admin/login` dan `/admin/sponsor...` tampil sebagai halaman standalone. Jangan memaksa sidebar/onboarding shell pada dua kondisi ini.
- Modul katalog frame dan softlens sudah memiliki CRUD modal, loading, konfirmasi, serta toast lokal masing-masing. Integrasi UI harus mempertahankan fungsinya.

### 1.2 Diagnosis UX yang harus diuji

**Hipotesis yang didukung kode:** ada gap antara status `login success -> router.push -> server render -> hydrated CMS`, terutama karena loading hanya dipicu request login dan transisi page content baru jalan ketika rute berubah. Progress global yang tidak di-mount membuat rasa 'freeze lalu tiba-tiba masuk' semakin mungkin. **Ini diagnosis kode, bukan hasil performance trace user yang sudah login.**

Eksekutor wajib memvalidasi via Chrome Performance/Network throttling, bukan menganggap satu akar masalah tanpa bukti.

### 1.3 Entry points yang wajib dibaca sebelum coding

```text
package.json
app/layout.tsx
app/admin/layout.tsx
app/admin/AdminLayoutClient.tsx
app/admin/page.tsx
app/admin/login/page.tsx
app/admin/**/page.tsx
components/admin/AdminSidebar.tsx
components/admin/AdminHeader.tsx
components/ui/TopProgressBar.tsx
components/pwa/PWASplashScreen.tsx
middleware.ts
lib/auth/session.ts
lib/auth/guard.ts
lib/db/repository.ts
tailwind.config.ts
app/globals.css
```

Audit juga endpoint auth (`/api/admin/auth/login`, `/me`, `/logout`), redirects, current loading fallback, PWA behavior, modal z-index, scroll containers, and route semantics.

---

## 2. Target interaction design: satu bahasa motion

**Mood:** clean optical studio, understated luxury, emerald/ivory, crisp and tactile, quick not theatrical. Fokus pada legibility. Hindari blur berat, parallax besar, page wipe berkepanjangan, bouncing terus-menerus, serta motion berulang pada tabel data.

### Motion specification (starting points; refine against browser profiling)

| Interaction | Motion | Target duration | Easing |
|---|---|---:|---|
| Header/sidebar existing CMS | Tetap stabil selama route switch | 0 ms replace | - |
| Navigation progress | Top bar muncul segera, progress non-linear, complete saat route+content ready | Immediate + actual load | `power2.out` |
| First authenticated entry | Overlay branded singkat yang **menunggu readiness**; logo subtle scale/fade, teks status | 250–500 ms exit | `power2.out` |
| Page content enters | Opacity 0->1, translateY 8–12px->0 | 240–340 ms | `power2.out` |
| Metric cards | Stagger hanya setelah data siap, sekali per mount | 200–280 ms / 35–55 ms stagger | `power2.out` |
| Menu hover | Background / active rail / icon micro-response | 130–190 ms | CSS or GSAP |
| Drawer mobile | TranslateX+backdrop opacity; no layout shift | 220–280 ms | `power3.out` |
| Modal / confirmation | Opacity + translateY 10px, focus managed | 180–240 ms | `power2.out` |
| Toast | Fade + 6px translate, auto dismiss optional | 180–220 ms | `power2.out` |
| Onboarding popover | Short fade+scale 0.98->1, reposition without jump | 160–240 ms | `power2.out` |
| Skeleton | Static preferred; subtle shimmer only when appropriate | not blocking | CSS |

**Reduced motion:** zero spatial movement/stagger, nearly instant opacity/visibility changes. Respect `matchMedia('(prefers-reduced-motion: reduce)')`, including system changes when feasible.

**GSAP hygiene:** client-only usage, scope animations to refs (`gsap.context` or `@gsap/react` if added deliberately), kill/revert on unmount and fast route changes, prevent double timelines from Strict Mode, animate `transform` and `opacity` instead of `top/left/width` in continuous sequences. Do not animate route loading using fake percentages that imply actual server progress.

---

## 3. Phase P0: repair the 'stuck -> tiba-tiba dashboard' problem

### P0.1 Navigation state model

Implement a **single source of truth** for navigational feedback, e.g. `AdminNavigationProvider` / `useAdminNavigation`, isolated from public routes.

Suggested states:

```ts
type NavigationPhase = 'idle' | 'authenticating' | 'redirecting' | 'loading-route' | 'revealing' | 'error';
```

Public API may expose `start(destination, kind?)`, `markReady(routeKey)`, `fail(message?)`, `reset()` and optional `isNavigating`, but never override Next/router state with made-up success. Ensure timeouts and abort/cleanup are explicitly handled.

**Triggers:**

- Login button: `authenticating` during actual API validation.
- Success API: keep visual state in `redirecting` while awaiting destination readiness. `router.push('/admin')` still occurs only on successful authenticated response.
- CMS `Link` navigations: feedback as soon as user activates the link, using a reusable `AdminNavLink` or safe `onClick`/`onNavigate` pattern compatible with installed Next version.
- Programmatic `router.push/replace`: use a wrapper / explicit progress start, never rely solely on DOM anchor interception.
- Back/forward/history and direct URL refresh: server-rendered skeleton/loading route handles route readiness; avoid assuming all navigations emit custom click events.
- Same-route click, modified click, external link, download: no false overlay.
- Logout: handle pending state, failure, and session invalidation while preserving security; do not show protected content after logout.

**Important:** If login occurs inside `/admin/login`, shared layout can change authentication state across navigation. Test session consistency and `router.refresh` ordering. Avoid passing private credentials to navigation context.

### P0.2 Branded admin entry loader (actual loading, not fake ceremony)

Create compact, elegant `AdminEntryLoader`:

- Full viewport ivory background with existing logo (`/logo.webp`), hairline emerald loader, status text: **`Mempersiapkan dashboard...`**.
- During verification show **`Memverifikasi akses...`**; during navigation show **`Memuat ringkasan...`**. Never display false stages like '100% data loaded' before readiness.
- If loading is brief, avoid jarring flash: use a short delayed visual threshold (e.g. ~120 ms) on intra-CMS navigation. For login handoff, retain immediate indication from button and transition seamlessly to overlay.
- Overlay must close after route content mounts/ready indication and a small exit motion. A watchdog after ~8–10 seconds must switch to an **actionable error/slow loading notice** (`Coba lagi`, `Muat ulang`) rather than silently hiding a broken dashboard. Keep accessible status announcement.
- In same-site client navigation, prefer stable sidebar/header + skeleton content, not repeated full-screen brand splash.
- Render loader safely on server-first load via App Router fallback where appropriate, with `role='status'`, `aria-live='polite'`, and accessible text. No permanent invisible backdrop.
- Avoid forcing a minimum 1–2-second splash for a fast route.

### P0.3 Next.js App Router loading boundaries

- Create **meaningful `loading.tsx`** and/or granular Suspense boundaries around expensive dynamic dashboard sections. Select routes carefully; `app/admin/loading.tsx` can affect nested admin login, so audit placement before creating it. Neutral fallback for auth page; branded data-skeleton for protected routes.
- `app/admin/page.tsx` currently waits `Promise.all([...])`. Measure each repository call. Preserve real data; where safe split into sections with independent Suspense/streaming or reasonable caching policy **without making admin data public**.
- Per-module client data fetches (Frame, Softlens, etc.) retain specific skeleton/empty/error states. Distinguish skeleton (loading), zero results (empty), and server error.
- Do not use a page-wide GSAP overlay as substitute for actual `loading.tsx` and fetch state management.
- Consolidate or fix global `TopProgressBar`. If reused, **actually mount it** and ensure no duplicate progress bars between root and CMS. Integrate programmatic navigation and proper timer cleanup; don't have conflicting two progress indicators.

### P0.4 Page reveal

Within authenticated `AdminLayoutClient`, keep `AdminSidebar` and `AdminHeader` mounted. Reanimate **content pane only** when content is ready. Use optional `data-admin-page` and ref; separate `loading -> exit -> ready enter` lifecycles. Avoid remounting the whole CMS on every navigation or breaking forms, scroll, table state. Avoid animation on overlay-controlled auth routes and sponsor standalone.

### P0 acceptance tests

- Fresh browser at `/admin` without a session ends at authorized login with no protected flash.
- Correct login with fast and 3G-slow network: visible progress, no dead-feeling gap, no double overlay, no false completion.
- Incorrect credentials/CAPTCHA/rate limit: no dashboard reveal; errors remain visible and actionable.
- Nav routes back/forth, browser back/forward, refresh on deep `/admin/...`, same-route clicks, rapid multi-click: no stuck loader, duplicate animation, or race-condition stale overlay.
- 8+ second delayed response / simulated 500: user sees recovery UI.

---

## 4. Phase P1: first-login interactive product tour

### P1.1 Behavior

After a verified admin session and the main dashboard is fully visible, show a **one-time welcome dialog**:

> **Selamat datang di I See You CMS**  
> Kelola katalog, artikel, dan tampilan website dari satu panel. Ikuti tur singkat untuk mengenali fitur penting.
> `[Mulai Panduan]` `[Nanti Saja]`

Then guide users in-place, with dimmed backdrop, spotlight around the correct element, connecting contextual popover with short title/description, progress fraction, and `Kembali`, `Lanjut`, `Lewati`, `Selesai` controls. Provide Escape to close, responsive placement, scroll-to-element, and focus management.

Suggested implementation: **`driver.js`** loaded client-only (only if dependency/security/accessibility review passes), OR a custom accessible SpotlightTour if this is more robust with existing modal system. Do not mix multiple competing onboarding libraries. GSAP is for entrance details, **not** a replacement for spotlight placement/focus logic. Lock down z-index relationships with sidebar, header, overlay, dialogs.

### P1.2 Actual step map (dynamic and role-aware)

| Step | Spotlight target (stable `data-tour`) | Description |
|---|---|---|
| 0 | Welcome modal (not attached) | Perkenalan singkat, user can opt out |
| 1 | `dashboard-overview` | Pusat ringkasan aktivitas dan data website |
| 2 | `dashboard-stats` | Pantau jumlah konten dan status publikasinya |
| 3 | `dashboard-quick-actions` | Pintasan cepat menambah frame, softlens, dan artikel |
| 4 | `sidebar-frame` | Mengelola katalog kacamata, foto, detail produk |
| 5 | `sidebar-softlens` | Mengelola produk, variasi, dan status softlens |
| 6 | `sidebar-blog` | Menulis dan menerbitkan artikel edukasi |
| 7 | `sidebar-media` | Mengunggah dan memakai media bersama |
| 8 | `sidebar-content` | Mengatur konten halaman website |
| 9 | `sidebar-settings` | Pengaturan global situs |
| 10 | `sidebar-sponsor` | Fitur proposal sponsor, bila route dan role tersedia |
| 11 | `sidebar-users` (owner only) | Hak akses pengguna dan catatan audit |
| 12 | `header-user` | Identitas user aktif dan hak akses |
| 13 | `admin-help` | Panduan bisa dibuka lagi dari sini |

Implementation requirements:

1. Add **semantic `data-tour="..."` attributes**, not brittle `.class > div:nth-child(3)` selectors. Reuse these in desktop and mobile carefully (unique active target; avoid same selector on hidden duplicates).
2. Construct step list from real rendered DOM + authorized role. No hidden/forbidden steps. Role `admin` must never see `Pengguna & Audit`.
3. On mobile, auto-open sidebar before sidebar step, wait for transition/target visibility, then position tooltip. Re-open/close as needed; don't leave drawer covering the tooltip.
4. If target missing or offscreen, skip gracefully and preserve progress. Use `ResizeObserver`/reposition strategy or tour library API; avoid layout-breaking manual coordinates.
5. For page-specific learning (e.g. adding a frame), add **optional mini-guides** triggered from module Help buttons, not a huge all-routes tour that navigates through unsaved forms.
6. Any navigation across routes in a tour must await route-ready signal. Prefer single-dashboard anchored navigation tour initially to reduce complexity.
7. Guide is informational by default: no live data mutation and no triggering irreversible buttons.
8. Localization: Bahasa Indonesia consistent with UI. Copy empat-enam belas kata per step where possible.

### P1.3 Persistence and repeatability

- `localStorage` key (first iteration): `isy_cms_tour_v1:<stableUserId>` if a non-sensitive, stable ID is available; fallback to safe account ID based on internal session user identity, never expose password/token. Do **not** use a shared global key or guest-only key for multiple admins on a device.
- Distinguish `never_started`, `started`, `completed`, `skipped` and version. Only auto-prompt when **never_started**; if `skipped`, allow manual replay. If user intentionally defers via `Nanti Saja`, do not nag on every route visit.
- Respect unavailable storage (`try/catch`), private mode, stale state, and `owner`/`admin` role changes.
- If product requirement later becomes “first time across all devices”, use profile DB field / new migration after explicit architecture review, not in this visual upgrade by default.
- Do not show onboarding when login fails, session expires, user is on `/admin/login`, or standalone sponsor page.

### P1.4 Help entry point

Visible top-right `? Panduan` or Lucide `CircleHelp` icon with **accessible label** `Buka panduan dashboard`; desktop text + icon, icon-only on small screen with tooltip. A contextual help link per module is a nice follow-up.

### P1 acceptance tests

- Owner new user sees role-appropriate introduction after ready; admin new user never sees owner-only step.
- Skip/dismiss persists after reload; manual replay works; tour version bump can introduce the new tour intentionally.
- Focus never disappears behind overlay, Escape/keyboard navigation work, tooltip visible on mobile 320px and 375px widths.
- Layout resize, sidebar collapse, route change, and missing element do not leave dark backdrop or frozen UI.
- Same browser with two different admins keeps separate progress.

---

## 5. Phase P2: premium CMS polish and interaction consistency

### 5.1 Dashboard information hierarchy

Keep core elements but improve readability:

- Welcome zone: concise greeting + current module, not exaggerated hero animation.
- Stats cards: consistent height and typographic hierarchy, labels legible, status badges meaningful; ease-in only once and only with real data ready.
- Recent content / audit: timestamp readable, responsive truncation, robust empty/error states; do not show raw IP publicly or leak audit data to wrong roles.
- Quick actions: visually distinct primary action with predictable hover/focus; maintain routes.
- Status indicators must show genuine app state; never fake “real-time” if data is simply fetched on page load. Review existing claim in dashboard copy.
- Preserve keyboard-focus indicators; no icon-only action without `aria-label`.

### 5.2 Global feedback system

Create shared `<AdminToast />` or adapter gradually, avoiding wholesale refactors if risk is high.

- Success: `Perubahan berhasil disimpan` only after API acknowledges success.
- Upload: real upload percentage if available; otherwise indeterminate but honest.
- Save: button pending + disable duplicate submit; retain form values on error.
- Delete/publish: clear confirmation, contextual item name, loading in confirmation modal; cannot be triggered by tour.
- Empty state: meaningful next action; never confuse empty state with error.
- Retry: for recoverable network failures.
- Inline validation / field errors for forms; show error summary where complex forms.
- Toast positions consistent and non-obstructive; screen-reader `role=status` for success and appropriate alert semantics for errors.

### 5.3 Sidebar/header/mobile

- Desktop fixed shell; active route marker simple, green color not perpetual pulsing.
- Mobile drawer: safe-area aware, sufficient tap sizes (prefer >=44x44 CSS px), focus trap + restore, proper backdrop close, Escape close, body-scroll behavior considered. No GSAP/tailwind double-transition conflict.
- On small widths protect table action controls from clipping; horizontal scroll confined to table only when necessary. Support 320/360/390/768/1024/1440 viewport tests.
- Modal stacking: global precedence `header < sidebar/backdrop < dialog < toast/tour` with active top modal handling.
- No custom pointer/cursor effects inside the admin if they harm keyboard/touch usability; check public root `CustomCursor` mount before changing anything.

### 5.4 Optional features **after** core phases, not blockers

1. Compact `Command Palette` / quick search (`Ctrl/Cmd+K`) for modules and common actions, gated by role.
2. Breadcrumbs/active page descriptor; keep route headers understandable.
3. Unsaved changes guard for complex frame/softlens/blog editors (using confirmed dirty state, not false positives).
4. Persistent filter/search URL state only if compatible with current forms and back button.
5. Module-level micro-tours for Frame, Softlens, Blog, and Media when requested by the user.
6. Contextual empty-state learning cards (e.g. "Belum ada frame. Tambahkan frame pertama").

---

## 6. Engineering architecture recommendation

Proposed files (agent can adapt names to actual project patterns; **do not create unnecessary abstraction**):

```text
components/admin/motion/
  AdminEntryLoader.tsx
  AdminRouteProgress.tsx
  AdminPageReveal.tsx
  AdminSkeletons.tsx
components/admin/onboarding/
  AdminOnboardingProvider.tsx
  AdminOnboardingTour.tsx
  tourSteps.ts
  tourStorage.ts
  AdminHelpButton.tsx
components/admin/navigation/
  AdminNavigationProvider.tsx
  AdminNavLink.tsx
hooks/
  useReducedMotion.ts                # only if existing hook is insufficient
  useAdminNavigation.ts
app/admin/
  AdminLayoutClient.tsx             # integrate providers / shell / role
  loading.tsx                       # only after evaluating nested auth behavior
  page.tsx                          # stable tour anchors / stats skeletons
  login/page.tsx                    # preserve progress during handoff
components/admin/
  AdminSidebar.tsx                  # data-tour markers + nav state
  AdminHeader.tsx                   # help trigger + header anchor
```

**Prefer minimal changes** to avoid sprawling architecture. Reuse existing `TopProgressBar` if it can be fixed safely instead of creating a second global implementation. Only import `driver.js` dynamically on first tour use if selected. Keep GSAP code client-side. Avoid large rewrite of `app/admin/page.tsx` while implementing P0.

Possible hooks:

```ts
interface AdminTourStep {
  id: string;
  target?: string; // semantic selector, e.g. [data-tour='sidebar-frame']
  title: string;
  description: string;
  roles?: Array<'owner'|'admin'>;
}
```

**Route readiness contract:** a navigation can be 'ready' after router pathname changes **and** relevant content/suspense fallback has resolved (or an explicit ready event when rendering main area). Do not equate `router.push()` being called with a finished navigation. Avoid tying readiness only to effects that run after a stale component mount. Timeouts should surface fallback UI, never incorrectly announce success.

---

## 7. Reliability, security, accessibility, performance

### Security and privacy

- No client-only check can replace backend auth. Middleware cookie check alone is not authorization; current server session verification and route guards must remain operative.
- No `/admin` data in guest loading skeleton or tour descriptions beyond generic public labels.
- No credential, session cookie, IP, or user email logged in new analytics/debug statements; avoid logging entire API error objects if they include sensitive values.
- No new third-party tracking service to implement onboarding, progress, or animation.
- Avoid injecting HTML in tour descriptions; escape user-controlled text.
- Check third-party dependency size, maintainer health, license, SSR compatibility, and CSP before adding it. Avoid external CDN script loading for tour runtime.

### Accessibility

- Support `prefers-reduced-motion` and high zoom, 200% text, focus-visible, keyboard traversal and Escape behavior.
- Loading announced politely (`role=status`); errors use `role=alert` only as needed, avoid repetitive announcements.
- Tour overlays use robust focus management and reachable buttons; don't trap users with no close.
- Sufficient text contrast and semantic headings; ensure overlay/tooltip remains within viewport.

### Performance budget and profiling

Treat these as **targets to evaluate, not promises without measurement**:

- Motion should typically sustain 60 fps on representative desktop and mid-tier Android; no frame drops induced by layout-heavy animation.
- Additional animations should not materially degrade INP or LCP. Aim Core Web Vitals in good range when measured, but do not claim lab-perfect scores without data.
- Only load tour library when first-time onboarding starts or user clicks help.
- Avoid re-fetches from decorative animation state, duplicate navigation listeners, runaway timers, and RSC waterfall expansions.
- Use Performance panel with CPU slowdown and network throttling. Record before/after navigation readiness and JS bundle impact.
- Skeleton should resemble final layout to avoid CLS. Preload only sensible critical assets; don't prefetch protected data to guests.

---

## 8. Implementation sequence and checkpoints

### PR / Commit A: audited loading foundation (P0)

- [ ] Create `docs/CMS-UX-AUDIT.md` recording baseline, exact versions, existing auth flow, nav scenarios, and screenshots.
- [ ] Reproduce stalled-feeling navigation with throttling and note observed timings.
- [ ] Fix/replace unused `TopProgressBar` path without duplication.
- [ ] Add real route/loading skeleton states and coherent post-login handoff.
- [ ] Add route content reveal; preserve stable shell and existing CRUD.
- [ ] Verify 10+ P0 acceptance scenarios and run typecheck/build.

### PR / Commit B: first-run onboarding (P1)

- [ ] Add stable `data-tour` markers.
- [ ] Add owner/admin-aware steps and storage.
- [ ] Add welcome dialog, guided spotlights, help replay, skip, progress.
- [ ] Add keyboard, mobile drawer, focus management, and missing-target handling.
- [ ] Test role-specific and persistent behavior.

### PR / Commit C: interaction polish (P2)

- [ ] Consolidate busy/success/error feedback in pilot modules (Frame, Softlens) without breaking save/delete/upload.
- [ ] Improve mobile navbar, modal, dashboard hierarchy, empty states.
- [ ] Audit/clean animation consistency; remove distracting indefinite pulses where not representing true activity.
- [ ] Run performance/accessibility and regression checks.

**Stop after each checkpoint to fix defects; do not stack unverified changes.**

---

## 9. QA matrix

| Test scenario | Expected |
|---|---|
| Guest visits `/admin` directly | Redirect to login; never protected content |
| Guest hard-refreshes nested admin route | Login flow, no unauthorized flash |
| Login valid, fast network | Feedback -> dashboard ready -> brief enter animation |
| Login valid, slow network | Continuous honest loading/status, then dashboard |
| Login invalid / CAPTCHA fails / lockout | Error shown, no access or false loading success |
| Session expired while navigating | Secure redirect/login, loader cleanup |
| Owner first run | Intro + authorized owner steps |
| Admin first run | Intro, no owner-only steps |
| Existing user repeat visit | No unsolicited tour; help replay available |
| Tour skipped and reloaded | Does not nag; replay works |
| Mobile 320px/375px | Spotlight and controls fit; sidebar opens when needed |
| Sidebar / modal opened during tour | Proper stacking, focus, no offscreen popup |
| Rapid route clicks / browser back / refresh | One loader, no stuck overlay, no memory leak |
| API 500 and offline during navigation | Recoverable error and retry, no data loss |
| Reduced motion / keyboard / screen reader | Usable, accessible, no forced spatial motion |
| Save draft, publish, upload, delete | Existing CRUD behavior preserved, reliable feedback |
| Lighthouse/DevTools after additions | Measured overhead documented, no major regressions |

### Required commands (adapt after reading repo scripts)

```bash
npm ci
npx tsc --noEmit
npm run build
# check lint script compatibility with installed Next.js;
# if `next lint` unsupported, use direct ESLint command after inspecting config.
```

Add automated test frameworks only if existing setup supports them or new dependency overhead is justified; otherwise supply reproducible manual QA with screenshots and measurements. **Never report passed tests you did not run.**

---

## 10. Definition of Done (release gate)

Implementation can be called complete only when:

1. Admin login-to-dashboard navigation feels responsive even when server data is slow.
2. Status reflects actual actions; no indefinite spinner, stale backdrop, or false progress completion.
3. Auth, role, audit, CAPTCHA, protected routes and all existing CRUD survive regression tests.
4. Onboarding is anchored to actual elements, role-aware, skippable, replayable, persisted per user (on the chosen storage scope).
5. Desktop/tablet/mobile responsive, keyboard accessible, reduced motion respected.
6. No console errors, excessive animation loops or leaks in repeated navigations.
7. `npx tsc --noEmit` and production build succeed, or blockers are documented honestly.
8. Before/after screenshots, changed file list, test evidence, known limitations and deployment instructions are in a final report.
9. Production changes have **not** been deployed without explicit approval.

---

## 11. References inspected and implementation documentation

Repository entry points (public `main`, inspected 21 October 2026):

- https://github.com/Yoshput/iseeyouphotobooth
- https://raw.githubusercontent.com/Yoshput/iseeyouphotobooth/main/package.json
- https://raw.githubusercontent.com/Yoshput/iseeyouphotobooth/main/app/layout.tsx
- https://raw.githubusercontent.com/Yoshput/iseeyouphotobooth/main/app/admin/layout.tsx
- https://raw.githubusercontent.com/Yoshput/iseeyouphotobooth/main/app/admin/AdminLayoutClient.tsx
- https://raw.githubusercontent.com/Yoshput/iseeyouphotobooth/main/app/admin/login/page.tsx
- https://raw.githubusercontent.com/Yoshput/iseeyouphotobooth/main/app/admin/page.tsx
- https://raw.githubusercontent.com/Yoshput/iseeyouphotobooth/main/components/admin/AdminSidebar.tsx
- https://raw.githubusercontent.com/Yoshput/iseeyouphotobooth/main/components/admin/AdminHeader.tsx
- https://raw.githubusercontent.com/Yoshput/iseeyouphotobooth/main/components/ui/TopProgressBar.tsx
- https://raw.githubusercontent.com/Yoshput/iseeyouphotobooth/main/middleware.ts
- https://raw.githubusercontent.com/Yoshput/iseeyouphotobooth/main/tailwind.config.ts

Framework/library docs:

- https://nextjs.org/docs/app/api-reference/file-conventions/loading
- https://nextjs.org/docs/app/api-reference/components/link
- https://gsap.com/resources/React/
- https://driverjs.com/docs/installation

**Unverified scope:** Dashboard authenticated runtime and actual network timings were not accessible without legitimate admin credentials. The executor must verify in a local authorized environment and distinguish source observations from runtime measurements.
