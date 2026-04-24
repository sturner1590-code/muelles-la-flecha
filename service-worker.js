const CACHE_NAME = 'flecha-v2';

// Solo se cachean assets estáticos que NO cambian frecuentemente
const PRECACHE_URLS = [
  '/muelles-la-flecha/catalogo-vehiculos.json',
  '/muelles-la-flecha/Logo Muelles y Mofles.png',
  '/muelles-la-flecha/manifest.json',
];

// Dominios que NUNCA se cachean (siempre van a la red)
const NETWORK_ONLY = [
  'supabase.co',
  'jsdelivr.net',
  'vpic.nhtsa.dot.gov',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // APIs externas: siempre red
  if (NETWORK_ONLY.some(domain => url.hostname.includes(domain))) {
    event.respondWith(fetch(event.request));
    return;
  }

  // HTML (navegación): red primero, caché como fallback offline
  // Esto garantiza que siempre se cargue el código más reciente
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Actualizar caché con la versión más reciente
          if (response.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(event.request)
          .then(cached => cached || caches.match('/muelles-la-flecha/index.html'))
        )
    );
    return;
  }

  // Assets estáticos (imágenes, JSON del catálogo): caché primero, red como fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && url.origin === self.location.origin) {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
        }
        return response;
      });
    }).catch(() => null)
  );
});
