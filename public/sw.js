// Service Worker for Web Push Notifications
// Handles push events and notification clicks

const CACHE_NAME = 'moodz-v1'

// Install event - activate immediately
self.addEventListener('install', (event) => {
  console.log('Service Worker installed')
  self.skipWaiting()
})

// Activate event - claim all clients
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated')
  event.waitUntil(clients.claim())
})

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push message received:', event)

  let data = {}

  if (event.data) {
    try {
      data = event.data.json()
    } catch (error) {
      console.error('Error parsing push data:', error)
      data = {
        title: 'Moodz',
        body: event.data.text() || 'Nova notificação'
      }
    }
  }

  const options = {
    body: data.body || data.message || 'Nova notificação do Moodz',
    icon: data.icon || '/icons/notification-icon.svg',
    badge: data.badge || '/icons/badge-icon.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.data?.url || data.link || '/notifications',
      ...data.data
    },
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'dismiss', title: 'Dispensar' }
    ],
    tag: data.tag || 'moodz-notification',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Moodz', options)
  )
})

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event)

  event.notification.close()

  // Handle dismiss action
  if (event.action === 'dismiss') {
    return
  }

  // Get URL from notification data
  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If there's already a window open, focus it and navigate
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus()
            client.navigate(url)
            return
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})

// Notification close event - track dismissals
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag)
})

// Message event - handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker message received:', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Background sync (optional) - retry failed requests
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)

  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications())
  }
})

async function syncNotifications() {
  // Implement background sync logic for offline notification queuing
  console.log('Syncing notifications...')
}