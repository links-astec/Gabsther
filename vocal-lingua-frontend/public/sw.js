/**
 * Gabsther — Service Worker
 *
 * Cache strategies:
 * - Next.js static bundles (/_next/static/): cache-first (immutable hashes)
 * - Lesson API (/api/lessons*):              network-first, cache fallback
 * - Navigation (HTML pages):                 network-first, cache fallback
 * - Everything else:                         network-first, cache fallback
 */

const SHELL_CACHE  = 'gabsther-shell-v2';
const STATIC_CACHE = 'gabsther-static-v2';
const LESSON_CACHE = 'gabsther-lessons-v2';

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

function offlineFallback() {
  return caches.match('/offline').then(
    (cached) => cached || new Response('Offline', { status: 503 })
  );
}

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

/** Network-first: try network, fall back to cache. */
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

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ── Next.js immutable static assets: cache-first (/_next/static/) ──────────
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // ── Lesson API responses (same-origin /api/ or cross-origin Render) ─────────
  if (url.pathname.startsWith('/api/lessons') && request.method === 'GET') {
    event.respondWith(networkFirst(request, LESSON_CACHE, null));
    return;
  }

  // ── Navigation (HTML pages): network-first, fall back to shell or /offline ──
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, SHELL_CACHE, offlineFallback));
    return;
  }

  // ── Default: network-first with cache fallback ───────────────────────────────
  event.respondWith(networkFirst(request, SHELL_CACHE, null));
});
