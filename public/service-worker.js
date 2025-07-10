
// A unique name for the cache, updated with each new build
const CACHE_NAME = 'readon-cache-v1';

// A list of essential files to be cached for offline access
const urlsToCache = [
  '/',
  '/fallback', // A generic fallback page for offline navigation
  '/manifest.json',
  '/readon-icon.png',
  // You can add more critical assets here like main JS/CSS bundles if needed.
  // Note: Next.js generates hashed filenames, so be cautious with static asset paths.
  // The fetch handler will cache assets dynamically as they are requested.
];

// Install event: triggered when the service worker is first installed.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // waitUntil ensures the SW doesn't proceed until the cache is populated.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache app shell during install', error);
      })
  );
});

// Activate event: triggered when the service worker becomes active.
// This is the perfect time to clean up old, unused caches.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // If a cache's name is not our current CACHE_NAME, it's old. Delete it.
          if (cacheName !== CACHE_NAME) {
            console.log(`Service Worker: Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // This ensures the new service worker takes control of the page immediately.
  return self.clients.claim();
});

// Fetch event: triggered for every network request made by the page.
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests (to a new page), use a network-first strategy.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/fallback')) // Show a fallback page if network fails
    );
    return;
  }

  // For all other requests (CSS, JS, images), use a cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If we found a match in the cache, return it.
        if (response) {
          return response;
        }

        // If not in cache, fetch it from the network.
        return fetch(event.request).then((networkResponse) => {
            // Clone the response because it's a one-time use stream.
            const responseToCache = networkResponse.clone();
            
            // Open our cache and add the new resource to it.
            caches.open(CACHE_NAME).then((cache) => {
                // Don't cache unsuccessful responses
                if (networkResponse.status < 400) {
                    cache.put(event.request, responseToCache);
                }
            });
            
            // Return the network response to the browser.
            return networkResponse;
          }
        ).catch(error => {
            console.warn(`Service Worker: Network request for ${event.request.url} failed.`, error);
            // Optionally, return a placeholder for failed assets like images
        });
      })
  );
});
