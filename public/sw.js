// Service Worker for Web Push Notifications
// Handles push events and notification clicks

const CACHE_NAME = 'moodz-v1'

// Install event - cache resources if needed
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.')
  // Skip waiting to activate immediately
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.')
  event.waitUntil(
    clients.claim().then(() => {
      console.log('Service Worker activated and claimed all clients.')
    })
  )
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
        body: event.data.text() || 'You have a new notification'
      }
    }
  }

  const options = {
    body: data.body || data.message || 'You have a new notification',
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    image: data.image,
    data: {
      url: data.data?.url || data.link || '/notifications',
      ...data.data
    },
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    tag: data.tag, // Group similar notifications
    actions: [
      {
        action: 'open',
        title: 'Open'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Moodz', options)
  )
})

// Notification click event - handle user interaction with notifications
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event)

  event.notification.close()

  // Handle different actions
  if (event.action === 'dismiss') {
    // Just close the notification, no navigation
    return
  }

  // Default action or 'open' action
  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Check if there's already a window/tab open with this URL
      for (const client of clients) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }

      // If no suitable window is found, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
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

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Implement background sync logic here if needed
  console.log('Performing background sync...')
}
