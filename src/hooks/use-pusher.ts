"use client"

import { useEffect, useRef, useCallback } from "react"
import PusherClient from "pusher-js"

// Singleton Pusher client instance
let pusherInstance: PusherClient | null = null

function getPusherClient(): PusherClient | null {
  if (typeof window === "undefined") return null

  if (!pusherInstance) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

    if (!key || !cluster) {
      console.warn("Pusher credentials not configured")
      return null
    }

    pusherInstance = new PusherClient(key, {
      cluster,
      forceTLS: true,
    })
  }

  return pusherInstance
}

/**
 * Hook to subscribe to a Pusher channel and event
 * @param channel - Channel name to subscribe to
 * @param event - Event name to listen for
 * @param callback - Callback function when event is received
 */
export function usePusher(
  channel: string,
  event: string,
  callback: (data: any) => void
) {
  const callbackRef = useRef(callback)

  // Update callback ref on each render
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const pusher = getPusherClient()
    if (!pusher || !channel) return

    // Subscribe to channel
    const channelInstance = pusher.subscribe(channel)

    // Handler that uses the ref
    const handler = (data: any) => {
      callbackRef.current(data)
    }

    // Bind to event
    channelInstance.bind(event, handler)

    // Cleanup function
    return () => {
      channelInstance.unbind(event, handler)
      pusher.unsubscribe(channel)
    }
  }, [channel, event])
}

/**
 * Hook to get the Pusher client instance
 * Useful for manual channel management
 */
export function usePusherClient(): PusherClient | null {
  const clientRef = useRef<PusherClient | null>(null)

  useEffect(() => {
    clientRef.current = getPusherClient()
  }, [])

  return clientRef.current
}

/**
 * Hook to subscribe to multiple events on a channel
 */
export function usePusherChannel(
  channel: string,
  events: Record<string, (data: any) => void>
) {
  const eventsRef = useRef(events)

  useEffect(() => {
    eventsRef.current = events
  }, [events])

  useEffect(() => {
    const pusher = getPusherClient()
    if (!pusher || !channel) return

    const channelInstance = pusher.subscribe(channel)

    // Bind all events
    const handlers: Record<string, (data: any) => void> = {}
    Object.keys(eventsRef.current).forEach((event) => {
      handlers[event] = (data: any) => {
        eventsRef.current[event]?.(data)
      }
      channelInstance.bind(event, handlers[event])
    })

    return () => {
      // Unbind all events
      Object.keys(handlers).forEach((event) => {
        channelInstance.unbind(event, handlers[event])
      })
      pusher.unsubscribe(channel)
    }
  }, [channel])
}
