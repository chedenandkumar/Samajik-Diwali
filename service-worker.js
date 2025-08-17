const CACHE_VERSION = 'v3-safe';
const CACHE_NAME = `donor-app-cache-${CACHE_VERSION}`;
const URLS_TO_CACHE = [
  '/', // for navigation fallback (if hosted at root)
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/script.js',
  '/service-worker.js',
  '/logo.png',
  '/logo-512.png',
  '/favicon.ico'
];

// Install - cache essential files with safe caching
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        URLS_TO_CACHE.map(url => 
          cache.add(url).catch(err => {
            console.warn('[SW] Cache fail:', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(oldKey => caches.delete(oldKey))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch - handle requests
self.addEventListener('fetch', event => {
  const req = event.request;
  const isSameOrigin = new URL(req.url).origin === self.location.origin;

  // Navigation requests
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(networkResponse => {
          caches.open(CACHE_NAME).then(cache => {
            cache.put('/index.html', networkResponse.clone()).catch(()=>{});
          });
          return networkResponse;
        })
        .catch(() =>
          caches.match('/index.html').then(match => match || caches.match('/offline.html'))
        )
    );
    return;
  }

  // Non-GET requests go to network
  if (req.method !== 'GET') {
    event.respondWith(fetch(req));
    return;
  }

  // Same-origin static assets
  if (isSameOrigin) {
    event.respondWith(
      caches.match(req).then(cachedResp => {
        if (cachedResp) {
          // Try updating in background
          fetch(req).then(networkResp => {
            if (networkResp && networkResp.ok) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(req, networkResp.clone()).catch(()=>{});
              });
            }
          }).catch(()=>{});
          return cachedResp;
        }
        return fetch(req)
          .then(networkResp => {
            if (networkResp && networkResp.ok) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(req, networkResp.clone()).catch(()=>{});
              });
            }
            return networkResp;
          })
          .catch(() => {
            if (req.destination === 'image') {
              return caches.match('/logo.png');
            }
            return caches.match('/offline.html');
          });
      })
    );
    return;
  }

  // Cross-origin GET requests
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

// Listen for skipWaiting message
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
