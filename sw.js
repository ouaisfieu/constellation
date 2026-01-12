/**
 * La Constellation - Service Worker
 * Version: 2.0.0
 * 
 * Handles:
 * - Offline caching
 * - Background sync
 * - FHIR endpoint caching
 */

const CACHE_NAME = 'constellation-v2';
const FHIR_CACHE = 'constellation-fhir-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/contacts.json',
  '/manifest.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
];

const FHIR_ENDPOINTS = [
  '/fhir/metadata',
  '/fhir/Organization',
  '/.well-known/fhir.json'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME && name !== FHIR_CACHE)
            .map(name => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip external requests
  if (url.origin !== location.origin) return;
  
  // FHIR endpoints - network first, cache fallback
  if (url.pathname.startsWith('/fhir/') || url.pathname.startsWith('/.well-known/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(FHIR_CACHE).then(cache => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }
  
  // Static assets - cache first, network fallback
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Update cache in background
          event.waitUntil(
            fetch(request)
              .then(response => {
                caches.open(CACHE_NAME).then(cache => cache.put(request, response));
              })
              .catch(() => {})
          );
          return cachedResponse;
        }
        
        return fetch(request)
          .then(response => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
            return response;
          });
      })
  );
});

// Background sync for FHIR data
self.addEventListener('sync', event => {
  if (event.tag === 'sync-fhir') {
    event.waitUntil(
      Promise.all(
        FHIR_ENDPOINTS.map(endpoint =>
          fetch(endpoint)
            .then(response => {
              const responseClone = response.clone();
              caches.open(FHIR_CACHE).then(cache => cache.put(endpoint, responseClone));
              return response;
            })
            .catch(() => {})
        )
      )
    );
  }
});

// Push notifications (future use)
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/assets/icon-192.png',
    badge: '/assets/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'Ouvrir' },
      { action: 'close', title: 'Fermer' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'La Constellation', options)
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'close') return;
  
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        for (const client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

console.log('⬡ Constellation Service Worker v2.0.0 loaded');
