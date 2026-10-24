const CACHE_NAME = 'tareas-app-v2.1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', event => {
  console.log('🛠️ Service Worker instalándose...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('💾 Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Archivos principales cacheados');
        return self.skipWaiting();
      })
      .catch(error => {
        console.log('⚠️ Error cacheando:', error);
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🧹 Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Ignorar favicon.ico y otros recursos no esenciales
  if (event.request.method !== 'GET' || event.request.url.includes('favicon.ico')) {
    return;
  }

  // ignoreSearch: style.css?v=3 y app.js?v=3 coinciden con su versión cacheada
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then(response => {
        return response || fetch(event.request).catch(() => {
          // Sin conexión: las navegaciones caen en la página principal
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
