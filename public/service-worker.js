// A simple, offline-first service worker
const CACHE_NAME = 'readon-cache-v2';
const urlsToCache = [
  '/',
  '/feed',
  '/bookmarks',
  '/account',
  '/login',
  '/signup',
  '/fallback.html', // A fallback page for when offline and page not cached
  // Add other critical assets like CSS, JS, and main images
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json'
];

// Install a service worker
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch(err => {
            console.error('Failed to cache URLs:', err);
        });
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
    // We only want to cache GET requests.
    if (event.request.method !== 'GET') {
        return;
    }

    // For navigation requests, use a network-first strategy.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match('/fallback.html')) // Fallback for navigation errors
        );
        return;
    }
    
    // For all other requests (CSS, JS, images), use a cache-first strategy.
    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
            // Cache hit - return response
            if (response) {
            return response;
            }

            // IMPORTANT: Clone the request. A request is a stream and
            // can only be consumed once. Since we are consuming this
            // once by cache and once by the browser for fetch, we need
            // to clone the response.
            const fetchRequest = event.request.clone();

            return fetch(fetchRequest).then(
            function(response) {
                // Check if we received a valid response
                if(!response || response.status !== 200 || response.type !== 'basic') {
                    // Don't cache third-party scripts or invalid responses
                    return response;
                }
                
                // IMPORTANT: Clone the response. A response is a stream
                // and because we want the browser to consume the response
                // as well as the cache consuming the response, we need
                // to clone it so we have two streams.
                const responseToCache = response.clone();

                caches.open(CACHE_NAME)
                .then(function(cache) {
                    // We don't cache Firestore or Google API requests
                    if (!event.request.url.includes('firestore') && !event.request.url.includes('googleapis')) {
                        cache.put(event.request, responseToCache);
                    }
                });

                return response;
            }
            );
        })
    );
});


// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
