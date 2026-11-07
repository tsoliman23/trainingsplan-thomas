const CACHE = 'mytraining-v37-version-131';

const ASSETS = [
    './',
    './index.html',
    './modern-pdf.js',
    './progress.js',
    './calendar.js',
    './daily.js',
    './daily.css',
    './analytics.js',
    './analytics.css',
    './nutrition.js',
    './nutrition.css',
    './day-sections.js',
    './day-sections.css',
    './experience.js',
    './toast.js',
  './profile-editor.js',
    './theme.css',
    './wizard.css',
    './wizard.js',
    './birth-wheel.js',
    './i18n.js',
    './translations.json',
    './language.css',
    './push-config.js',
    './push-client.js',
    './polish.css',
    './design-v2.css',
    './pdf-preview.js',
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
// Standard Web Push: auch bei geschlossener installierter PWA (iOS 16.4+).
self.addEventListener('push',event=>{
 let data={};try{data=event.data?.json()||{};}catch{}
 const title=data.title||'MyTraining';
 event.waitUntil(self.registration.showNotification(title,{body:data.body||'Dein Training steht an.',icon:'./icons/icon-192.png',badge:'./icons/icon-192.png',tag:'mytraining-reminder',data:{url:'./index.html'}}));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients=>{
  for(const c of clients){if(c.url.startsWith(self.registration.scope)){await c.focus();return;}}
  return self.clients.openWindow('./index.html');
 }));
});
