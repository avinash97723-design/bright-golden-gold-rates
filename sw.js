// The name of your cache, you can change it if you update the list of files to cache
const CACHE_NAME = 'static-cache-v1';

// List of all the essential files your PWA needs to run offline
// **IMPORTANT**: You must list all your HTML, CSS, JS, and essential images/fonts here.
const FILES_TO_CACHE = [
  '/', // The root path (usually index.html)
  '/index.html',
  '/style.css', // Example: your main CSS file
  '/app.js',    // Example: your main JavaScript file
  '/icon-512x512.png', // The icon you fixed earlier!
  // Add other files here (like a manifest.json, other images, etc.)
];

// 1. Service Worker Installation: Pre-caching resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install Event: Pre-caching static assets');
  
  // Wait until the promise resolves, meaning all files are cached
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
    // Get all cache names
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        // Delete all caches that don't match the current CACHE_NAME
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Deleting old cache: ', key);
          return caches.delete(key);
        }
      }));
    })
  );
  
  // This line ensures that the new service worker takes over immediately
  return self.clients.claim();
});

// 3. Service Worker Fetch: Serving assets from cache or network
self.addEventListener('fetch', (event) => {
  // We only want to intercept and cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Strategy: Cache-First, then Network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If asset is in cache, return it immediately
      if (cachedResponse) {
        // console.log('[Service Worker] Serving from cache: ', event.request.url);
        return cachedResponse;
      }
      
      // If not in cache, fetch from the network
      // console.log('[Service Worker] Fetching from network: ', event.request.url);
      return fetch(event.request);
    })
  );
});
