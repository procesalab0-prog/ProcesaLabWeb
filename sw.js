// Minimal service worker — just enough to satisfy PWA installability
// criteria. No offline caching strategy; every request goes to the network.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
