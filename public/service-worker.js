/**
 * Service Worker for Medical Calculator PWA
 * Provides offline functionality and caching
 */

const CACHE_NAME = 'medical-calculator-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/main.js',
  '/styles.css',
  '/config/drug-config.js',
  '/services/calculation-engine.js',
  '/services/state-manager.js',
  '/components/modals.js',
  '/manifest.json',
  // External resources
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=sarabun:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(error => {
        console.error('Fetch failed:', error);
        
        // Return offline fallback for HTML requests
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
        
        throw error;
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for data updates
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      console.log('Background sync triggered')
    );
  }
});

// Push notification handler
self.addEventListener('push', event => {
  if (event.data) {
    const notificationData = event.data.json();
    
    const options = {
      body: notificationData.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'medical-calculator-notification',
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Open Calculator',
          icon: '/icons/icon-96x96.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/icon-96x96.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(notificationData.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Error handler
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

// Unhandled rejection handler
self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

// Utility function to update cache
function updateCache(request, response) {
  return caches.open(CACHE_NAME)
    .then(cache => {
      return cache.put(request, response);
    });
}

// Utility function to clear old caches
function clearOldCaches() {
  return caches.keys()
    .then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    });
}

// Periodic cache cleanup
setInterval(() => {
  clearOldCaches().then(() => {
    console.log('Cache cleanup completed');
  });
}, 24 * 60 * 60 * 1000); // Run daily