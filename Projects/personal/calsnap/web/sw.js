const CACHE = 'calsnap-v41';
const ASSETS = ['/', '/index.html', '/assets/foodmind-logo.png', '/css/style.css?v=20260703-12', '/js/utils/config.js?v=20260630-12', '/js/utils/format.js', '/js/utils/db.js', '/js/utils/body-composition.js?v=20260701-6', '/js/utils/food-portion.js?v=20260702-9', '/js/api.js?v=20260701-3', '/js/components/tabbar.js?v=20260703-1', '/js/components/food-card.js', '/js/components/chart.js?v=20260703-9', '/js/components/loader.js?v=20260701-3', '/js/components/empty.js', '/js/pages/dashboard.js?v=20260703-2', '/js/pages/camera.js?v=20260703-12', '/js/pages/barcode.js', '/js/pages/history.js?v=20260701-2', '/js/pages/exercise.js?v=20260630-12', '/js/pages/trends.js?v=20260702-3', '/js/pages/settings.js?v=20260703-1', '/js/app.js?v=20260701-2'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => {})
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (new URL(e.request.url).pathname.startsWith('/api/')) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => r))
  );
});
