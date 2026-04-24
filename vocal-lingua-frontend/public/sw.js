/**
 * Gabsther — Service Worker v3
 *
 * Cache strategies:
 * - Next.js static bundles (/_next/static/): cache-first (immutable hashes)
 * - Lesson API (/api/lessons*):              network-first, cache fallback
 * - Navigation (HTML pages):                 network-first, shell fallback
 * - Everything else:                         network-first, cache fallback
 *
 * Offline navigation fix:
 *   When a lesson page (/lessons/123/) isn't cached — which happens when the
 *   user navigated there via a client-side Link (no full navigate request was
 *   ever made) — we serve the cached /lessons shell instead of /offline.
 *   Next.js boots from the shell, detects the real URL, renders the lesson
 *   component, and reads lesson data from LESSON_CACHE. Result: offline lesson
 *   works even if the specific URL was never a navigate-cache hit.
 */

const SHELL_CACHE  = 'gabsther-shell-v3';
const STATIC_CACHE = 'gabsther-static-v3';
const LESSON_CACHE = 'gabsther-lessons-v3';

const PRECACHE_URLS = ['/', '/dashboard', '/lessons', '/offline'];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => {})
    )
  );
  self.skipWaiting();
});

// ─── Activate — purge old caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const KEEP = new Set([SHELL_CACHE, STATIC_CACHE, LESSON_CACHE]);
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => !KEEP.has(n)).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Cache-first: serve from cache, fetch+store on miss. For immutable assets. */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

/** Network-first: try network, fall back to cache, then call fallback(). */
async function networkFirst(request, cacheName, fallback) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return fallback ? fallback() : new Response('', { status: 503 });
  }
}

/**
 * Shell fallback for navigate requests that aren't in the cache.
 *
 * Priority order:
 * 1. /lessons shell  — for /lessons/[id] routes (closest semantic match)
 * 2. /              — generic app shell (always pre-cached on install)
 * 3. /offline        — last resort
 *
 * Any cached shell lets Next.js boot offline, read the URL from the browser,
 * and route to the correct component. Data comes from LESSON_CACHE.
 */
async function shellFallback(requestUrl) {
  if (requestUrl && requestUrl.pathname.startsWith('/lessons/')) {
    const lessonsShell = await caches.match('/lessons');
    if (lessonsShell) return lessonsShell;
  }
  const appShell = await caches.match('/');
  if (appShell) return appShell;
  const offlinePage = await caches.match('/offline');
  return offlinePage || new Response('Offline', { status: 503 });
}

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle http(s)
  if (!url.protocol.startsWith('http')) return;

  // ── Next.js immutable static assets: cache-first ────────────────────────────
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // ── Lesson API (GET only): network-first with lesson cache ──────────────────
  if (url.pathname.startsWith('/api/lessons') && request.method === 'GET') {
    event.respondWith(networkFirst(request, LESSON_CACHE, null));
    return;
  }

  // ── Other API calls: network-first, no offline cache ────────────────────────
  if (url.pathname.startsWith('/api/') && request.method === 'GET') {
    event.respondWith(networkFirst(request, SHELL_CACHE, null));
    return;
  }

  // ── Navigation: network-first, shell fallback (NOT /offline) ────────────────
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, SHELL_CACHE, () => shellFallback(url)));
    return;
  }

  // ── Everything else: network-first ──────────────────────────────────────────
  if (request.method === 'GET') {
    event.respondWith(networkFirst(request, SHELL_CACHE, null));
  }
});

// ─── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Gabsther', {
      body: data.body || "Don't forget your French lesson today!",
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: 'streak-reminder',
      renotify: true,
      data: { url: data.url || '/dashboard' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/dashboard')
  );
});
