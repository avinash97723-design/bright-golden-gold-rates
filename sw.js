// A new cache name (v2) ensures that old (possibly corrupted) cache is cleared.
// **IMPORTANT**: If you update your files, change this version number (e.g., v3, v4).
const CACHE_NAME = 'static-cache-v2';

// List of all the essential files your PWA needs to run offline.
// *** Kripya yahan apni CSS aur JS files ka sahi naam jaroor check karein! ***
const FILES_TO_CACHE = [
  '/', 
  '/index.html',
  '/style.css',     // Assuming your main design file is style.css
  '/app.js',        // If you have a main JavaScript file
  '/manifest.json', // Your manifest file
  '/Icon-512x512.png', // The main icon (Capital 'I' as per your GitHub screenshot)
  '/Icon-192x192.png', // Your 192x192 icon (Capital 'I' as per your GitHub screenshot)
  // Agar koi aur font ya photo ho to yahan add karein
];

// 1. Service Worker Installation: Pre-caching resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install Event: Pre-caching static assets');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// 2. Service Worker Activation: Cleaning up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate Event: Cleaning up old caches');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        // Delete all caches that don't match the current CACHE_NAME (v2)
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Deleting old cache: ', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// 3. Service Worker Fetch: Serving assets from cache or network (Cache-First Strategy)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If asset is in cache, return it immediately
      if (cachedResponse) {
        return cachedResponse;
      }
      // If not in cache, fetch from the network
      return fetch(event.request);
    })
  );
});
