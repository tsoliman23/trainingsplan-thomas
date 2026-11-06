const CACHE = 'mytraining-v15';

const ASSETS = [
    './',
    './index.html',
    './modern-pdf.js',
    './progress.js',
    './calendar.js',
    './experience.js',
    './theme.css',
    './manifest.webmanifest',
    './icons/icon-180.png',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

// App-Dateien für die Offline-Nutzung speichern
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Alte Cache-Versionen entfernen
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(names => Promise.all(
                names
                    .filter(name => name !== CACHE)
                    .map(name => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

// HTML immer zuerst vom Server laden
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    if (url.origin !== self.location.origin) return;

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response.ok) {
                        const copy = response.clone();

                        caches.open(CACHE).then(cache => {
                            cache.put('./index.html', copy);
                        });
                    }

                    return response;
                })
                .catch(() => caches.match('./index.html'))
        );

        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cached => cached || fetch(event.request))
    );
});