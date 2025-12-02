"use client"

import { useEffect, useCallback, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { usePusher } from "./use-pusher"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface NotificationData {
  id: string
  type: string
  title: string
  message: string
  data?: {
    link?: string
    [key: string]: any
  }
  createdAt: string
}

interface UseNotificationsRealtimeOptions {
  /** Whether to show toast notifications (default: true) */
  showToast?: boolean
  /** Whether to play notification sound (default: true) */
  playSound?: boolean
  /** Sound volume (0-1, default: 0.3) */
  soundVolume?: number
  /** Custom sound URL (default: /sounds/notification.mp3) */
  soundUrl?: string
}

/**
 * Hook for real-time notification updates via Pusher
 * Automatically invalidates notification queries and shows toasts
 */
export function useNotificationsRealtime(options: UseNotificationsRealtimeOptions = {}) {
  const {
    showToast = true,
    playSound = true,
    soundVolume = 0.3,
    soundUrl = "/sounds/notification.mp3",
  } = options

  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Preload audio
  useEffect(() => {
    if (typeof Audio !== "undefined" && playSound) {
      audioRef.current = new Audio(soundUrl)
      audioRef.current.volume = soundVolume
      // Preload the audio
      audioRef.current.load()
    }

    return () => {
      audioRef.current = null
    }
  }, [playSound, soundUrl, soundVolume])

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (audioRef.current && playSound) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {
        // Ignore errors (e.g., user hasn't interacted with page yet)
      })
    }
  }, [playSound])

  // Handle incoming notification
  const handleNotification = useCallback(
    (data: NotificationData) => {
      // Invalidate notification queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] })

      // Update cache optimistically
      queryClient.setQueryData(["notifications"], (old: any) => {
        if (!old) return old
        return {
          ...old,
          notifications: [data, ...(old.notifications || [])],
          unreadCount: (old.unreadCount || 0) + 1,
        }
      })

      // Show toast notification
      if (showToast) {
        toast(data.title, {
          description: data.message,
          action: data.data?.link
            ? {
                label: "Ver",
                onClick: () => {
                  window.location.href = data.data!.link!
                },
              }
            : undefined,
        })
      }

      // Play sound
      playNotificationSound()
    },
    [queryClient, showToast, playNotificationSound]
  )

  // Subscribe to user's notification channel
  usePusher(
    session?.user?.id ? `user-${session.user.id}` : "",
    "notification",
    handleNotification
  )

  return {
    /** Manually play the notification sound */
    playSound: playNotificationSound,
  }
}

/**
 * Hook to get unread notification count with real-time updates
 */
export function useUnreadNotificationCount() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  // Listen for notification events to update count
  usePusher(
    session?.user?.id ? `user-${session.user.id}` : "",
    "notification",
    () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] })
    }
  )

  // Also listen for read events
  usePusher(
    session?.user?.id ? `user-${session.user.id}` : "",
    "notification-read",
    () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] })
    }
  )
}

