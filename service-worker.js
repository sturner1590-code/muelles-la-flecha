const CACHE_NAME = 'flecha-v1';

// Archivos que se cachean al instalar
const PRECACHE_URLS = [
  '/muelles-la-flecha/',
  '/muelles-la-flecha/index.html',
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

  // Llamadas a APIs externas: siempre red, nunca caché
  if (NETWORK_ONLY.some(domain => url.hostname.includes(domain))) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Para todo lo demás: caché primero, red como fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Solo cachear respuestas válidas de mismo origen
        if (response.ok && url.origin === self.location.origin) {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
        }
        return response;
      });
    }).catch(() => {
      // Si no hay red ni caché, devolver index.html para navegación
      if (event.request.mode === 'navigate') {
        return caches.match('/muelles-la-flecha/index.html');
      }
    })
  );
});
