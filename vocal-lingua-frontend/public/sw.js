/**
 * Gabsther — Service Worker
 * Provides offline support for lessons and basic navigation.
 *
 * Strategy:
 * - Static shell (HTML, CSS, JS): Cache-first
 * - API calls to /api/lessons: Network-first, fallback to cache
 * - Everything else: Network-first, fallback to /offline
 */

const CACHE_NAME = 'gabsther-v1';
const LESSON_CACHE = 'gabsther-lessons-v1';

// Resources to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/lessons',
  '/offline',
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Don't fail install if pre-cache URLs don't exist yet
      });
    })
  );
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== LESSON_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Always returns a Response — never undefined */
function offlineFallback() {
  return caches.match('/offline').then(
    (cached) => cached || new Response('Offline', { status: 503 })
  );
}

async function networkFirstWithCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache lesson API responses for offline access
  if (url.pathname.startsWith('/api/lessons') && request.method === 'GET') {
    event.respondWith(networkFirstWithCache(request, LESSON_CACHE));
    return;
  }

  // Navigation requests: network-first, fall back to cached page or /offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        return offlineFallback();
      })
    );
    return;
  }

  // Default: network-first, fall back to cache, then undefined → skip (let browser handle)
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      return cached || new Response('', { status: 503 });
    })
  );
});
