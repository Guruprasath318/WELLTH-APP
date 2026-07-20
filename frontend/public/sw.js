/**
 * Service Worker for WELLTH APP
 * Enables offline functionality and PWA capabilities
 */

const CACHE_NAME = 'wellth-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/Wellth.jpg',
  '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✓ Service Worker: Cache opened');
        return cache.addAll(urlsToCache).catch(err => {
          console.log('Note: Some assets may not be available offline:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('✓ Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', event => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Network first strategy for API calls
  if (request.url.includes('/api')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          return caches.match(request).then(response => {
            return response || new Response('Offline - API unavailable', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
        })
    );
  } else {
    // Cache first strategy for static assets
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(request).then(response => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, responseToCache);
              });
            return response;
          });
        })
        .catch(() => {
          return new Response('Offline - Resource unavailable', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        })
    );
  }
});

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('✓ Service Worker loaded');
