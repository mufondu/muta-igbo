/* Mụta Igbo service worker. BUILD is stamped by scripts/pwa-postbuild.js on every deploy,
   so each release gets fresh caches and old ones are deleted. */
const BUILD = '__BUILD__';
const SHELL = 'muta-shell-' + BUILD;
const RUNTIME = 'muta-runtime-' + BUILD;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL).then((c) => c.addAll(['/', '/manifest.webmanifest', '/icons/icon-192.png'])).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL && k !== RUNTIME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Safari asks for audio in byte ranges; answer from a cached full copy when we have one.
async function rangeFromCache(request) {
  const cached = await caches.match(request.url);
  if (!cached) return null;
  const buf = await cached.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(request.headers.get('range') || '');
  const start = m && m[1] ? parseInt(m[1], 10) : 0;
  const end = m && m[2] ? Math.min(parseInt(m[2], 10), buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': cached.headers.get('Content-Type') || 'audio/mp4',
      'Content-Range': 'bytes ' + start + '-' + end + '/' + buf.byteLength,
      'Content-Length': String(end - start + 1),
    },
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never touch Supabase or other APIs
  if (url.pathname === '/sw.js') return;

  // Pages: network first so a new deploy shows up immediately; cached shell when offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put('/', copy));
          return res;
        })
        .catch(() => caches.match('/').then((r) => r || Response.error()))
    );
    return;
  }

  // Audio ranges
  if (req.headers.get('range')) {
    event.respondWith(rangeFromCache(req).then((r) => r || fetch(req)).catch(() => fetch(req)));
    return;
  }

  // Everything else (bundles, images, audio): cache first, then network, remember successes.
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(RUNTIME).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
