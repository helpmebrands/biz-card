const CACHE = 'card-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './images/front.svg',
  './images/back.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // A card link is a path -- /card/<name>/<email> -- that exists only because
  // Pages falls back to 404.html. It matches no cache entry and no real file,
  // so serve the shell for every navigation and let the page read its own
  // path. This also spares returning visitors the 404 status the fallback
  // carries.
  if (e.request.mode === 'navigate') {
    e.respondWith(caches.match('./index.html').then((r) => r || fetch(e.request)));
    return;
  }

  // ignoreSearch so ?debug, and the older ?name=... links, still match the
  // cached entry: cache keys include the query string and would otherwise miss
  // and only work while online.
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request))
  );
});
