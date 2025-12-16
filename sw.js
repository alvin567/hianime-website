// sw.js - Service Worker for Offline-First
const CACHE_NAME = 'hianime-support-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/styles/dark-mode.css',
    '/styles/loading.css',
    '/js/main.js',
    // add common assets you want offline-cached (optional)
    '/assets/logo.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request).catch(() => {
                    // Return offline fallback for HTML requests
                    if (event.request.destination === 'document' || event.request.headers.get('accept')?.includes('text/html')) {
                        return caches.match('/index.html');
                    }
                    // For other requests, return a placeholder response
                    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
                });
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});