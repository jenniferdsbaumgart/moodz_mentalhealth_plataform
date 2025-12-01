"use client"

import { useEffect } from 'react'
import { pusher } from '@/lib/pusher'

export function usePusher(channel: string, event: string, callback: (data: any) => void) {
  useEffect(() => {
    // Subscribe to channel
    const channelInstance = pusher.subscribe(channel)

    // Bind to event
    channelInstance.bind(event, callback)

    // Cleanup function
    return () => {
      channelInstance.unbind(event, callback)
      pusher.unsubscribe(channel)
    }
  }, [channel, event, callback])
}