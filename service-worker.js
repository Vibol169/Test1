// Change this version number (v1, v2, etc.) whenever you update your app files
const CACHE_NAME = 'echo-demo-v17';

// These are the files the app needs to load instantly
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './gas-api.js', 
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. INSTALL: Save the files to the device cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// 2. ACTIVATE: Clean up old caches if you update the CACHE_NAME version
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. FETCH: Serve files from the cache first, then the network
self.addEventListener('fetch', (event) => {
  // Only intercept standard GET requests (ignore POST requests to your Worker)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If the file is in the cache, return it instantly (Offline mode)
      if (cachedResponse) {
        return cachedResponse;
      }
      // Otherwise, download it from the network
      return fetch(event.request);
    })
  );
});

// 🚀 PUSH EVENT LISTENER
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [100, 50, 100],
      data: { dateOfArrival: Date.now(), primaryKey: data.url || './' }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// 🚀 NOTIFICATION CLICK LISTENER
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(event.notification.data.primaryKey);
    })
  );
});
