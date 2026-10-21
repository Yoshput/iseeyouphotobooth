# ANTIGRAVITY EXECUTOR PROMPT — CMS OPTIK I SEE YOU PREMIUM UX

**Role:** Senior Frontend Architect, Next.js App Router Engineer, Motion Designer (GSAP), UX Engineer, Accessibility & QA Lead.

**Target:** `https://github.com/Yoshput/iseeyouphotobooth`, branch `main` as baseline. Local working tree opened in Antigravity. Production target after approval: `https://optikiseeyou.com/admin`.

**Master spec:** Read the attached file `PLAN-CMS-ISEEYOU-PREMIUM-UX.md` in full first. Treat it as the definitive implementation requirements. You are the **executor**, not just a planning assistant.

## EXECUTION ORDER

1. Inspect real repository and actual installed versions. Read at minimum `package.json`, `app/layout.tsx`, `app/admin/layout.tsx`, `app/admin/AdminLayoutClient.tsx`, `app/admin/login/page.tsx`, `app/admin/page.tsx`, all relevant admin modules, `AdminSidebar.tsx`, `AdminHeader.tsx`, `TopProgressBar.tsx`, auth/session guard, `middleware.ts`, `globals.css`, `tailwind.config.ts`. Read `design.md` and existing repo agent instructions. Do not blindly trust filenames or the plan if repo has changed.
2. Record baseline with exact before screenshots and reproduction of slow login -> dashboard transition using authorized test session. Examine actual network/React behavior and identify root cause before coding. If credentials unavailable, do not bypass login; implement from code and explicitly label runtime scenarios unverified.
3. Create a new feature branch (e.g. `feat/admin-premium-experience`), preserve current worktree and all existing features. Do **not** overwrite developer changes, secrets or DB data.
4. Implement **P0 first**: reliable navigation/loading feedback with actual route readiness; login handoff; context-appropriate skeletons; refined GSAP content transition; stable CMS shell. Stop and test P0 before P1.
5. Implement **P1 second**: first-run guided CMS walkthrough using semantic `data-tour` anchors, user-scoped/versioned persistence, skip/replay, responsive spotlight, role-aware owner/admin steps, accessibility. Stop and test P1.
6. Implement **P2 third**: refine dashboard responsiveness, consistent hover/focus and toasts, mobile sidebar/modal experience, safe CRUD pending/error states. No feature removal or unsolicited redesign.
7. Test, fix regressions, run production build/type checks, inspect motion with reduced-motion and slow devices, record before/after screenshots. Output a final change report with pass/fail evidence and exact manual QA instructions.

## IMPORTANT SOURCE-BASED FINDINGS TO VERIFY

- Existing GSAP already installed (`gsap ^3.12.5`); prefer reuse.
- `components/ui/TopProgressBar.tsx` exists, but in inspected `app/layout.tsx` it is imported and **not rendered**. It also chiefly starts on anchor clicks; after successful login `router.push('/admin')` is programmatic.
- Current `AdminLayoutClient` animates content with keyed pathname CSS only after navigation, so pending transitions may feel frozen.
- `app/admin/page.tsx` is dynamic and waits for multiple repository calls in `Promise.all`.
- `app/admin/loading.tsx` was not found in inspected `main`; confirm and add suitable real loading boundaries.
- Login route shares `/admin` layout; preserve standalone login and sponsor behavior.
- Role `owner` exclusively sees `Pengguna & Audit`; never show this in tour for ordinary `admin`.
- Brand is ivory/emerald green + Poppins/Playfair per current config; not dark mode or heavy neon.

## EXPERIENCE TO DELIVER

### A. Entry transition

When authorized staff successfully submit login, preserve immediate feedback from the login button and transition to a small branded loader while the dashboard genuinely loads. No blank screen, no 2-second fake splash, no success shown before ready. Example copy: `Memverifikasi akses...` -> `Mempersiapkan dashboard...` -> content reveal. Reuse official logo asset. Use motion 200–350 ms, restrained scale/fade, emerald hairline progress. When loading is slow, show honest status plus recovery action. A fixed timeout may trigger a helpful error state, NEVER simply unblock unverified admin content.

### B. CMS navigation

Keep sidebar/header mounted; when clicking Frame, Softlens, Blog, Media, Konten Website, Pengaturan, or switching back to Dashboard, show response immediately and skeletons during actual asynchronous work. On ready, apply elegant GSAP content fade/translate. Ensure redirects, `router.push()`, browser back/forward, reload on deep link and failed requests all release pending state. Fix or consolidate global progress without duplicate bars and false percentages.

### C. First-run interactive onboarding

After first successful dashboard load for each staff user, show welcome card `Selamat datang di I See You CMS` with `Mulai Panduan` / `Nanti Saja`. Tour then highlights actual overview, stats, quick actions, relevant sidebar modules, current user profile and help button. UI should dim background subtly and emphasize target with correct positioning, short step copy, progress `3 dari 12`, Back, Next, Skip, Finish. On mobile auto-open sidebar for sidebar steps, then restore focus. Staff role never sees owner-only steps. Tour must be manually replayable using `? Panduan Dashboard` in header. Persist per user + version and handle storage errors. No data mutation as a side effect of reading the guide.

### D. Premium polish

Make module cards, panels, active nav, toasts, dialogs and save/update/upload buttons consistent with existing brand. Prioritize readability over decoration, modern mobile responsive design, and real states (loading / empty / error / saved). Preserve existing CRUD, search, filters, page features, routes, media upload, role permissions, and validation. Suggest optional improvements in final report; do not mix them with core scope until core QA passes.

## IMPLEMENTATION GUARDRAILS

- Use real React/Next lifecycle, not CSS-only fake loading. Inspect `loading.tsx`, Suspense, client fetch lifecycle, and server rendering semantics before choosing final design.
- Motion should be purposeful. Use GSAP scoped refs, cleanup on unmount and path changes, `prefers-reduced-motion`, transform/opacity, no layout thrash or unbounded animations.
- SSR-safe onboarding: driver.js (if judged appropriate) dynamically imported client-side, or robust accessible custom tour; avoid brittle selectors and overlay stacking conflicts.
- Protected data must never be prefetched or exposed before backend session verification. Do not weaken cookie, server session, CAPTCHA, authorization, rate limiting, audit trails, CSP/security headers.
- Do not modify public photobooth / AR tracking / storefront scope except minimal app shell integration if essential and tested.
- Avoid installing unnecessary packages, duplicating providers, replacing routing stack, major folder restructuring, speculative database migrations, or rewriting all CMS forms without evidence.
- Do not make imaginary benchmark claims, hide failures, or mark acceptance tests as passed without execution evidence.
- Do not push to `main`, deploy, or modify production database without explicit authorization.

## REQUIRED DELIVERABLES

- Actual working code edits in branch, not just explanation or pseudocode.
- `docs/CMS-UX-AUDIT.md`: current behavior, root causes, proposed/actual file changes, evidence.
- `docs/CMS-UX-QA.md`: checklists, screenshots, routes tested, device sizes, network/reduced-motion tests, build output and unresolved issues.
- Feature implementation for P0 + P1 + P2 described in master plan.
- One final report: `IMPLEMENTED`, `NOT IMPLEMENTED`, `CHANGED FILES`, `TESTS RUN + RESULTS`, `KNOWN RISKS`, `PREVIEW INSTRUCTIONS`, and optional proposals.

## RELEASE ACCEPTANCE GATE

Before calling it done verify at least: login valid/invalid/CAPTCHA; guest redirect; fast/slow/offline; sidebar navigation and browser history; same route/rapid click; session expired; skeleton and error recovery; owner/admin tour differences; one-time persistence + help replay; mobile 320px to desktop; keyboard/Escape/focus; reduced motion; CRUD frame/softlens/blog/media smoke tests; `npx tsc --noEmit`; `npm run build`; no unexpected console errors. If any test can't run, state `NOT TESTED` with exact reason.

**Execution instruction:** Start with repository inspection and diagnosis, then immediately implement in small working commits. Do not stop at a high-level proposal. When facing uncertainty, make the most conservative non-breaking choice, document it, and test. Quality means fast, secure, elegant, and reliable, not maximum animation quantity.
