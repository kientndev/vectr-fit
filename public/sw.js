/**
 * VECTR FIT — Camera-Safe Offline Shell Service Worker
 * Designed for 100% client-side AI pose inference without interfering with
 * camera streams, MediaPipe WASM/TFLite models, or Convex WebSocket telemetry.
 */

const CACHE_NAME = 'vectrfit-shell-v2';
const APP_SHELL = [
  '/',
  '/app',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/maskable-icon-512x512.png',
];

// Install: Cache essential shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL).catch((err) => {
        console.warn('[VECTR-SW] Pre-caching partial shell fallback:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Prune stale caches & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy that NEVER interrupts camera or live streaming APIs
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Bypass non-GET requests immediately
  if (request.method !== 'GET') {
    return;
  }

  // 2. Bypass WebSockets, Convex Realtime, and Next.js internal API routes
  if (
    url.protocol === 'ws:' ||
    url.protocol === 'wss:' ||
    url.hostname.includes('convex.cloud') ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // 3. Bypass MediaPipe AI model streams, WASM, and CDN inference models
  if (
    url.hostname.includes('cdn.jsdelivr.net') ||
    url.hostname.includes('storage.googleapis.com') ||
    url.pathname.endsWith('.wasm') ||
    url.pathname.endsWith('.tflite') ||
    url.pathname.endsWith('.data')
  ) {
    return;
  }

  // 4. HTML Navigation: Network-First with Cache Fallback for instant load
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match('/app');
          if (fallback) return fallback;
          return caches.match('/');
        })
    );
    return;
  }

  // 5. Static Assets (JS, CSS, Images, Fonts): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
