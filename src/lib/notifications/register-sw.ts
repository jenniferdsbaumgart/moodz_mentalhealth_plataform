/**
 * Service Worker Registration Utility
 * Registers the service worker for push notifications
 */

/**
 * Register the service worker
 * @returns The service worker registration or null if not supported
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  // Check if service workers are supported
  if (!("serviceWorker" in navigator)) {
    console.warn("Service Workers are not supported in this browser")
    return null
  }

  // Check if Push API is supported
  if (!("PushManager" in window)) {
    console.warn("Push notifications are not supported in this browser")
    return null
  }

  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/"
    })

    console.log("Service Worker registered successfully:", registration.scope)

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready
    console.log("Service Worker is ready")

    return registration
  } catch (error) {
    console.error("Service Worker registration failed:", error)
    return null
  }
}

/**
 * Unregister all service workers
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) {
    return false
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    
    for (const registration of registrations) {
      await registration.unregister()
    }

    console.log("All Service Workers unregistered")
    return true
  } catch (error) {
    console.error("Failed to unregister Service Workers:", error)
    return false
  }
}

/**
 * Check if service worker is registered
 */
export async function isServiceWorkerRegistered(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    return !!registration
  } catch {
    return false
  }
}

/**
 * Update service worker
 */
export async function updateServiceWorker(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    
    if (registration) {
      await registration.update()
      console.log("Service Worker updated")
      return true
    }

    return false
  } catch (error) {
    console.error("Failed to update Service Worker:", error)
    return false
  }
}

/**
 * Send a message to the service worker
 */
export async function sendMessageToSW(message: any): Promise<void> {
  if (!("serviceWorker" in navigator)) {
    return
  }

  const registration = await navigator.serviceWorker.ready
  
  if (registration.active) {
    registration.active.postMessage(message)
  }
}

/**
 * Request notification permission
 * @returns The permission state
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.warn("Notifications are not supported in this browser")
    return "denied"
  }

  // Check current permission
  if (Notification.permission === "granted") {
    return "granted"
  }

  if (Notification.permission === "denied") {
    console.warn("Notification permission was previously denied")
    return "denied"
  }

  // Request permission
  try {
    const permission = await Notification.requestPermission()
    console.log("Notification permission:", permission)
    return permission
  } catch (error) {
    console.error("Error requesting notification permission:", error)
    return "denied"
  }
}

/**
 * Check if push notifications are supported and permission is granted
 */
export function canReceivePushNotifications(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    Notification.permission === "granted"
  )
}

