/* Affaan's World service worker — offline-first.
   App shell is precached; same-origin GETs are served cache-first and refreshed in
   the background. Supabase (cross-origin) is never cached. Bump VERSION on deploys. */
const VERSION = 'affaan-v5.1.0';
const SHELL = [
    './',
    './config.js',
    './css/app.css',
    './fonts/baloo-2-latin-600-normal.woff2',
    './fonts/baloo-2-latin-800-normal.woff2',
    './fonts/baloo-da-2-bengali-600-normal.woff2',
    './fonts/baloo-da-2-bengali-800-normal.woff2',
    './fonts/fraunces-latin-wght-italic.woff2',
    './fonts/fraunces-latin-wght-normal.woff2',
    './fonts/hind-siliguri-bengali-400-normal.woff2',
    './fonts/hind-siliguri-bengali-600-normal.woff2',
    './fonts/outfit-latin-400-normal.woff2',
    './fonts/outfit-latin-500-normal.woff2',
    './fonts/outfit-latin-600-normal.woff2',
    './fonts/outfit-latin-700-normal.woff2',
    './fonts/spline-sans-mono-latin-500-normal.woff2',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './img/bg-affaan.jpg',
    './img/diet-guide.jpg',
    './img/diet-plan.jpg',
    './img/hero-affaan.jpg',
    './index.html',
    './js/app.js',
    './js/content/activities.js',
    './js/content/data-diet.js',
    './js/content/health-data.js',
    './js/content/learn.js',
    './js/core/backup.js',
    './js/core/db.js',
    './js/core/lock.js',
    './js/core/media.js',
    './js/core/sfx.js',
    './js/core/speech.js',
    './js/core/sync.js',
    './js/core/util.js',
    './js/core/zip.js',
    './js/views/dev.js',
    './js/views/gallery.js',
    './js/views/health.js',
    './js/views/play.js',
    './js/views/reports.js',
    './manifest.webmanifest',
    './vendor/supabase.js',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;   // Supabase etc. go straight to network
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put('./', cp)); return r; })
      .catch(() => caches.match('./', { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(cached => {
    const net = fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); } return r; }).catch(() => cached);
    return cached || net;
  }));
});
