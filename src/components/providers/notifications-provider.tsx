"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { useNotificationsRealtime } from "@/hooks/use-notifications-realtime"
import { useSession } from "next-auth/react"

interface NotificationsContextValue {
  /** Whether notifications are enabled */
  enabled: boolean
  /** Enable/disable notification sounds */
  soundEnabled: boolean
  /** Toggle notification sounds */
  toggleSound: () => void
  /** Manually play notification sound */
  playSound: () => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

interface NotificationsProviderProps {
  children: ReactNode
  /** Initial sound enabled state (default: true) */
  defaultSoundEnabled?: boolean
}

/**
 * Provider component for real-time notifications
 * Wrap your app with this provider to enable real-time notification updates
 */
export function NotificationsProvider({
  children,
  defaultSoundEnabled = true,
}: NotificationsProviderProps) {
  const { data: session } = useSession()
  const [soundEnabled, setSoundEnabled] = useState(defaultSoundEnabled)

  // Only enable real-time notifications for authenticated users
  const enabled = !!session?.user?.id

  // Use the real-time notifications hook
  const { playSound } = useNotificationsRealtime({
    showToast: enabled,
    playSound: enabled && soundEnabled,
  })

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev)
  }, [])

  return (
    <NotificationsContext.Provider
      value={{
        enabled,
        soundEnabled,
        toggleSound,
        playSound,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

/**
 * Hook to access notifications context
 */
export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}

/**
 * Hook to check if notifications context is available
 */
export function useNotificationsOptional() {
  return useContext(NotificationsContext)
}

