"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export interface PushSubscriptionState {
  permission: NotificationPermission
  isSubscribed: boolean
  isSupported: boolean
  isLoading: boolean
  error: string | null
}

export function usePushNotifications() {
  const { data: session } = useSession()
  const [state, setState] = useState<PushSubscriptionState>({
    permission: 'default',
    isSubscribed: false,
    isSupported: false,
    isLoading: false,
    error: null
  })

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const isSupported = (
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
      )

      setState(prev => ({
        ...prev,
        isSupported
      }))

      if (isSupported) {
        setState(prev => ({
          ...prev,
          permission: Notification.permission
        }))
      }
    }

    checkSupport()
  }, [])

  // Check subscription status when session changes
  useEffect(() => {
    if (session?.user && state.isSupported) {
      checkSubscriptionStatus()
    }
  }, [session?.user, state.isSupported])

  const checkSubscriptionStatus = useCallback(async () => {
    if (!state.isSupported || !session?.user) return

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      // Check if we have an existing subscription
      const registration = await navigator.serviceWorker.ready
      const existingSubscription = await registration.pushManager.getSubscription()

      if (existingSubscription) {
        // Verify with our backend
        const response = await fetch('/api/notifications/push/status')
        if (response.ok) {
          const data = await response.json()
          setState(prev => ({
            ...prev,
            isSubscribed: data.subscribed,
            isLoading: false
          }))
        } else {
          setState(prev => ({
            ...prev,
            isSubscribed: false,
            isLoading: false
          }))
        }
      } else {
        setState(prev => ({
          ...prev,
          isSubscribed: false,
          isLoading: false
        }))
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
        error: 'Failed to check subscription status'
      }))
    }
  }, [state.isSupported, session?.user])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Push notifications are not supported in this browser'
      }))
      return false
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      const permission = await Notification.requestPermission()

      setState(prev => ({
        ...prev,
        permission,
        isLoading: false
      }))

      return permission === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to request notification permission'
      }))
      return false
    }
  }, [state.isSupported])

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported || !session?.user) {
      setState(prev => ({
        ...prev,
        error: 'Push notifications not supported or user not logged in'
      }))
      return false
    }

    if (state.permission !== 'granted') {
      const granted = await requestPermission()
      if (!granted) return false
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      // Register service worker if not already registered
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported')
      }

      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        )
      })

      // Send subscription to backend
      const response = await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
              auth: arrayBufferToBase64(subscription.getKey('auth')!)
            },
            userAgent: navigator.userAgent
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to subscribe to notifications')
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false
      }))

      return true
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to subscribe'
      }))
      return false
    }
  }, [state.isSupported, state.permission, session?.user, requestPermission])

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) return false

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      // Get current subscription
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe()

        // Remove from backend
        await fetch('/api/notifications/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint
          })
        })
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false
      }))

      return true
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to unsubscribe'
      }))
      return false
    }
  }, [state.isSupported])

  const testNotification = useCallback(async (): Promise<boolean> => {
    if (!state.isSubscribed) return false

    try {
      const response = await fetch('/api/notifications/push/test', {
        method: 'POST'
      })

      return response.ok
    } catch (error) {
      console.error('Error sending test notification:', error)
      return false
    }
  }, [state.isSubscribed])

  return {
    ...state,
    subscribe,
    unsubscribe,
    requestPermission,
    checkSubscriptionStatus,
    testNotification
  }
}

// Utility functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}
