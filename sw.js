self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open('tareas-cache').then(cache => cache.addAll([
      './',
      './index.html',
      './style.css',
      './app.js',
      './icon.png'
    ]))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});
