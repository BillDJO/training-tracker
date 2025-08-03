/*
 * Simple service worker for offline support.
 * Caches static assets and API responses. When offline, the cached API
 * responses will be served if available. This service worker is not
 * aggressively tuned for all edge cases but provides basic offline support.
 */

const CACHE_NAME = 'training-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  // Try network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and store API GET responses in cache for offline use
        if (event.request.url.includes('/api/')) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});