const CACHE_NAME = 'wealthos-v5';
const ASSETS = [
  './',
  './index.html',
  './manifestNew.json'
];

// Install
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Activate
self.addEventListener('activate', e => {
  self.clients.claim();
});

// Fetch (network first, fallback to cache)
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(res => res || caches.match('./index.html')))
  );
});