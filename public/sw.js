// TeachingLabs Service Worker v2
// Push notifications only — NO page/asset caching during development

const CACHE_NAME = 'teachinglabs-v2';

// Install — skip waiting immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Activate — delete ALL old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Fetch — always go to network, never cache pages or JS
self.addEventListener('fetch', () => {
  // Do nothing — let the browser handle all requests normally
  return;
});

// Push — show notification
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const { title, body, url, icon } = data;

  event.waitUntil(
    self.registration.showNotification(title || 'Teaching Labs', {
      body: body || '',
      icon: icon || '/images/icon-192.png',
      badge: '/images/icon-192.png',
      data: { url: url || '/' },
      vibrate: [200, 100, 200],
    })
  );
});

// Notification click — open the target URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
