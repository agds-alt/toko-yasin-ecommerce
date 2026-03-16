// Service Worker - Network Only (No Offline Caching)
const CACHE_NAME = 'toko-buku-abdul-v2';
const OFFLINE_URL = '/offline.html';

// Install event - only cache the offline page
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching offline page only');
      return cache.add(OFFLINE_URL);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - always network first, show offline page only when network fails
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Only show offline page for navigation requests (HTML pages)
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        // For other requests (images, scripts, etc), just fail
        return new Response('Network error', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' },
        });
      })
  );
});
