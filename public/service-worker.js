
'use strict';

const CACHE_VERSION = 1;
const CACHE_NAME = `readon-cache-v${CACHE_VERSION}`;

// The list of files to be cached on install
const PRECACHE_ASSETS = [
    '/',
    '/feed',
    '/offline.html',
    '/readon-icon-192.png',
    '/readon-icon-512.png',
    '/readon-cover.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        await cache.addAll(PRECACHE_ASSETS);
        console.log('Service Worker: Pre-caching complete.');
      } catch (error) {
        console.error('Service Worker: Pre-caching failed:', error);
      }
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
      console.log('Service Worker: Activated and old caches cleaned.');
    })()
  );
  // This line is important to ensure the new service worker takes control immediately.
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // We only want to intercept navigation requests.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            (async () => {
                try {
                    // First, try to fetch from the network.
                    const networkResponse = await fetch(event.request);
                    return networkResponse;
                } catch (error) {
                    // If the network fails, it means we are offline.
                    console.log('Service Worker: Fetch failed, returning offline page.', error);

                    // Try to get the offline page from the cache.
                    const cache = await caches.open(CACHE_NAME);
                    const cachedResponse = await cache.match('/offline.html');
                    return cachedResponse;
                }
            })()
        );
    }
});
