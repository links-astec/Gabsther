import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Service Worker logic tests.
 * We extract and test the pure functions from sw.js in isolation.
 * The SW itself cannot be imported directly (it uses self/clients globals),
 * so we replicate the logic under test here.
 */

// ── Replicate sw.js helpers ───────────────────────────────────────────────────

type CacheEntry = { request: Request; response: Response };

function toUrl(req: string | Request): string {
  // Normalise both absolute and relative URLs for comparison.
  if (typeof req === 'string') {
    return req.startsWith('http') ? req : `http://localhost${req}`;
  }
  return req.url;
}

function makeMockCache(entries: CacheEntry[] = []) {
  return {
    entries,
    async match(req: string | Request) {
      const url = toUrl(req);
      return this.entries.find((e) => e.request.url === url)?.response ?? undefined;
    },
    async put(req: Request, res: Response) {
      this.entries.push({ request: req, response: res });
    },
  };
}

type MockCacheStore = Record<string, ReturnType<typeof makeMockCache>>;

function makeMockCaches(store: MockCacheStore) {
  return {
    store,
    async open(name: string) {
      if (!this.store[name]) this.store[name] = makeMockCache();
      return this.store[name];
    },
    async match(req: string | Request) {
      const url = toUrl(req);
      for (const cache of Object.values(this.store)) {
        const entry = cache.entries.find((e) => e.request.url === url);
        if (entry) return entry.response;
      }
      return undefined;
    },
    async keys() {
      return Object.keys(this.store);
    },
    async delete(name: string) {
      delete this.store[name];
    },
  };
}

// Inline the shellFallback logic from sw.js
async function shellFallback(
  requestUrl: URL | null,
  caches: ReturnType<typeof makeMockCaches>
) {
  if (requestUrl?.pathname.startsWith('/lessons/')) {
    const lessonsShell = await caches.match('/lessons');
    if (lessonsShell) return lessonsShell;
  }
  const appShell = await caches.match('/');
  if (appShell) return appShell;
  const offlinePage = await caches.match('/offline');
  return offlinePage ?? new Response('Offline', { status: 503 });
}

// Inline networkFirst logic
async function networkFirst(
  request: Request,
  cacheName: string,
  fallback: (() => Promise<Response>) | null,
  caches: ReturnType<typeof makeMockCaches>,
  fetchImpl: typeof fetch
) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetchImpl(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return fallback ? fallback() : new Response('', { status: 503 });
  }
}

// ── shellFallback tests ───────────────────────────────────────────────────────

describe('shellFallback', () => {
  const makeRes = (body: string) => new Response(body, { status: 200 });

  it('serves /lessons shell for /lessons/[id] routes', async () => {
    const store: MockCacheStore = {
      shell: makeMockCache([
        { request: new Request('http://localhost/lessons'), response: makeRes('lessons-html') },
        { request: new Request('http://localhost/'), response: makeRes('home-html') },
      ]),
    };
    const caches = makeMockCaches(store);
    const url = new URL('http://localhost/lessons/42');
    const res = await shellFallback(url, caches);
    expect(await res.text()).toBe('lessons-html');
  });

  it('falls back to / shell when /lessons is not cached', async () => {
    const store: MockCacheStore = {
      shell: makeMockCache([
        { request: new Request('http://localhost/'), response: makeRes('home-html') },
      ]),
    };
    const caches = makeMockCaches(store);
    const url = new URL('http://localhost/lessons/42');
    const res = await shellFallback(url, caches);
    expect(await res.text()).toBe('home-html');
  });

  it('serves / shell for non-lesson routes', async () => {
    const store: MockCacheStore = {
      shell: makeMockCache([
        { request: new Request('http://localhost/'), response: makeRes('home-html') },
      ]),
    };
    const caches = makeMockCaches(store);
    const url = new URL('http://localhost/dashboard');
    const res = await shellFallback(url, caches);
    expect(await res.text()).toBe('home-html');
  });

  it('returns /offline as last resort', async () => {
    const store: MockCacheStore = {
      shell: makeMockCache([
        { request: new Request('http://localhost/offline'), response: makeRes('offline-html') },
      ]),
    };
    const caches = makeMockCaches(store);
    const url = new URL('http://localhost/lessons/99');
    const res = await shellFallback(url, caches);
    expect(await res.text()).toBe('offline-html');
  });

  it('returns 503 plain text when nothing is cached at all', async () => {
    const caches = makeMockCaches({});
    const res = await shellFallback(new URL('http://localhost/lessons/1'), caches);
    expect(res.status).toBe(503);
  });
});

// ── networkFirst tests ────────────────────────────────────────────────────────

describe('networkFirst', () => {
  it('returns and caches network response when online', async () => {
    const store: MockCacheStore = {};
    const caches = makeMockCaches(store);
    const networkResponse = new Response('fresh', { status: 200 });
    const fetchMock = vi.fn().mockResolvedValue(networkResponse);
    const req = new Request('http://localhost/api/lessons/1/');

    const res = await networkFirst(req, 'lesson-cache', null, caches, fetchMock);
    expect(await res.text()).toBe('fresh');
    // Should be stored in cache
    const cached = await store['lesson-cache']?.match(req);
    expect(cached).toBeDefined();
  });

  it('returns cached response when offline', async () => {
    const cachedResponse = new Response('cached', { status: 200 });
    const store: MockCacheStore = {
      'lesson-cache': makeMockCache([
        { request: new Request('http://localhost/api/lessons/1/'), response: cachedResponse },
      ]),
    };
    const caches = makeMockCaches(store);
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Network error'));
    const req = new Request('http://localhost/api/lessons/1/');

    const res = await networkFirst(req, 'lesson-cache', null, caches, fetchMock);
    expect(await res.text()).toBe('cached');
  });

  it('calls fallback when offline and nothing cached', async () => {
    const caches = makeMockCaches({});
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('offline'));
    const fallback = vi.fn().mockResolvedValue(new Response('fallback', { status: 200 }));
    const req = new Request('http://localhost/lessons/1/');

    const res = await networkFirst(req, 'shell', fallback, caches, fetchMock);
    expect(fallback).toHaveBeenCalledTimes(1);
    expect(await res.text()).toBe('fallback');
  });

  it('returns 503 when offline, nothing cached, and no fallback', async () => {
    const caches = makeMockCaches({});
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('offline'));
    const req = new Request('http://localhost/something');

    const res = await networkFirst(req, 'shell', null, caches, fetchMock);
    expect(res.status).toBe(503);
  });
});

// ── URL routing logic ─────────────────────────────────────────────────────────

describe('SW URL routing decisions', () => {
  it('identifies /_next/static/ as immutable static asset', () => {
    const url = new URL('http://localhost/_next/static/chunks/app.js');
    expect(url.pathname.startsWith('/_next/static/')).toBe(true);
  });

  it('identifies /api/lessons/1/ as a lesson API request', () => {
    const url = new URL('http://localhost/api/lessons/1/');
    expect(url.pathname.startsWith('/api/lessons')).toBe(true);
  });

  it('identifies /api/voice/chat/ as a non-lesson API request', () => {
    const url = new URL('http://localhost/api/voice/chat/');
    expect(url.pathname.startsWith('/api/lessons')).toBe(false);
    expect(url.pathname.startsWith('/api/')).toBe(true);
  });

  it('identifies /lessons/1/ as a lesson detail route for shellFallback', () => {
    const url = new URL('http://localhost/lessons/1/');
    expect(url.pathname.startsWith('/lessons/')).toBe(true);
  });
});
