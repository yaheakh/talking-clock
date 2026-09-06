// Minimal offline-first service worker. Bumps CACHE_NAME whenever the
// app's files change so old clients pick up the new version instead of
// getting stuck on a stale cache forever.
const CACHE_NAME = 'talking-clock-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './tts.js',
  './spokenTime.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Cache-first for the app's own files, network-first (with cache fallback)
// for everything else (Google Fonts, ElevenLabs API calls, etc.) so the
// clock still works offline and only voice/font niceties need a connection.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const isOwnAsset = url.origin === self.location.origin;

  if (isOwnAsset) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
  } else {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
  }
});
