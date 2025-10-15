const CACHE_NAME = 'tareas-app-v2.0';
const urlsToCache = [
  '/app-tareas/',
  '/app-tareas/index.html',
  '/app-tareas/style.css',
  '/app-tareas/app.js',
  '/app-tareas/manifest.json'
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
  if (event.request.url.includes('favicon.ico')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
