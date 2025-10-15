const CACHE_NAME = 'tareas-app-v1.4';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

// Instalación - con manejo robusto de errores
self.addEventListener('install', event => {
  console.log('Service Worker instalándose...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        
        // Cachear archivos críticos primero, luego los opcionales
        return cache.addAll(urlsToCache)
          .then(() => {
            console.log('Archivos críticos cacheados');
            // Intentar cachear íconos, pero no fallar si no existen
            return Promise.all([
              cache.add('./icon-192.png').catch(err => console.log('icon-192.png no encontrado:', err)),
              cache.add('./icon-512.png').catch(err => console.log('icon-512.png no encontrado:', err))
            ]);
          })
          .catch(error => {
            console.log('Error cacheando algunos recursos:', error);
            // No re-lanzar el error - el SW se instala igual
          });
      })
      .then(() => self.skipWaiting())
  );
});

// Activación
self.addEventListener('activate', event => {
  console.log('Service Worker activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Estrategia Cache First con fallback a red
self.addEventListener('fetch', event => {
  // No cachear peticiones a otros dominios
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Ignorar favicon.ico y otros recursos no esenciales
  if (event.request.url.includes('favicon.ico')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si está en cache, devolverlo
        if (response) {
          return response;
        }
        
        // Si no está en cache, buscar en red
        return fetch(event.request)
          .then(response => {
            // Verificar si la respuesta es válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clonar la respuesta para guardar en cache
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.log('Fetch failed:', error);
            // Para páginas HTML, podrías devolver una página offline
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
          });
      })
  );
});
