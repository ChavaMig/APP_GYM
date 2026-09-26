// Service worker: la app abre sin conexión.
// Cada vez que cambies archivos, sube este numero (v6, v7...).
const VERSION = 'iron-v6';
const APP_FILES = [
  './', './index.html', './style.css', './app.js', './ui.js', './store.js', './firebase-config.js',
  './db.js', './anim.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
];
const RUNTIME_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'www.gstatic.com'];
const NET_TIMEOUT = 2500;   // con cobertura mala, tiramos de caché en vez de esperar

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION)
    .then(c => Promise.allSettled(APP_FILES.map(f => c.add(f))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Guarda en caché solo respuestas correctas (nada de 404 ni errores)
function save(req, res) {
  if (res && res.ok && res.type !== 'opaqueredirect') {
    const copy = res.clone();
    caches.open(VERSION).then(c => c.put(req, copy)).catch(() => {});
  }
  return res;
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Archivos de la app: intenta la red, pero si tarda o falla, sirve la caché.
  if (url.origin === location.origin) {
    const cached = caches.match(e.request, { ignoreSearch: true });
    // Si el servidor responde mal (404 porque el alojamiento se cayó o cambió,
    // 500, etc.) preferimos la copia guardada antes que enseñar un error.
    const net = fetch(e.request).then(async res => {
      if (res.ok) return save(e.request, res);
      return (await cached) || res;
    });
    const fallback = () => cached
      .then(r => r || caches.match('./index.html'))
      .then(r => r || net)
      .then(r => r || Response.error());
    e.respondWith(
      Promise.race([
        net.catch(fallback),
        new Promise(resolve => setTimeout(() => resolve(cached.then(c => c || net.catch(fallback))), NET_TIMEOUT)),
      ]).catch(fallback)
    );
    return;
  }

  // Tipografías y librerías de Firebase (versión fija): caché primero.
  if (RUNTIME_HOSTS.includes(url.hostname)) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(res => save(e.request, res)).catch(() => r))
    );
  }
  // El resto (Firestore, login de Google) va directo a la red.
});
