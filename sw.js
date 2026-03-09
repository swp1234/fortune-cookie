const CACHE_NAME = 'fortune-cookie-v1';
const ASSETS = [
  '/fortune-cookie/',
  '/fortune-cookie/index.html',
  '/fortune-cookie/css/style.css',
  '/fortune-cookie/js/app.js',
  '/fortune-cookie/js/i18n.js',
  '/fortune-cookie/js/locales/ko.json',
  '/fortune-cookie/js/locales/en.json',
  '/fortune-cookie/js/locales/ja.json',
  '/fortune-cookie/js/locales/zh.json',
  '/fortune-cookie/js/locales/hi.json',
  '/fortune-cookie/js/locales/ru.json',
  '/fortune-cookie/js/locales/es.json',
  '/fortune-cookie/js/locales/pt.json',
  '/fortune-cookie/js/locales/id.json',
  '/fortune-cookie/js/locales/tr.json',
  '/fortune-cookie/js/locales/de.json',
  '/fortune-cookie/js/locales/fr.json',
  '/fortune-cookie/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetched = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
