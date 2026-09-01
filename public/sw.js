/**
 * Service Worker — Optik I See You PWA
 *
 * Strategy:
 * - App Shell (HTML/CSS/JS/icons) → Cache First (fast load after first visit)
 * - API / dynamic content → Network First (always fresh, falls back to cache)
 * - Offline → Shows /offline.html for navigation requests
 *
 * This SW is intentionally lightweight — it makes the app INSTALLABLE
 * and loads the shell instantly, but all real content still needs internet.
 */

const CACHE_NAME = "isy-pwa-v1";
const OFFLINE_URL = "/offline.html";

// Resources to pre-cache on install (app shell)
const PRECACHE_URLS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-180.png",
  "/logo.png",
  "/favicon.ico",
];

// ── Install: pre-cache app shell ────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean up old caches ───────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: Network First with offline fallback ───────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only handle GET requests and same-origin requests (ignore POST/PUT/DELETE)
  if (request.method !== "GET" || url.origin !== location.origin) return;

  // 2. Bypass Service Worker cache completely for API routes and video media
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.endsWith(".mp4") ||
    url.pathname.endsWith(".webm")
  ) {
    return;
  }

  // Navigation requests (page loads): Network First → Offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && response.status !== 206) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Static assets (images, fonts, icons): Cache First → Network fallback
  if (
    request.destination === "image" ||
    request.destination === "font" ||
    url.pathname.startsWith("/logo") ||
    url.pathname.startsWith("/icon") ||
    url.pathname.startsWith("/public")
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok && response.status !== 206) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
      )
    );
    return;
  }

  // Everything else: Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.status !== 206) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
