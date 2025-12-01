"use client"

import { useEffect } from "react"
import { registerServiceWorker } from "@/lib/notifications/register-sw"

interface ServiceWorkerProviderProps {
  children: React.ReactNode
}

/**
 * Provider component that registers the service worker on mount
 * Wrap your app with this provider to enable push notifications
 */
export function ServiceWorkerProvider({ children }: ServiceWorkerProviderProps) {
  useEffect(() => {
    // Only register in production or if explicitly enabled
    const shouldRegister = 
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_ENABLE_SW === "true"

    if (shouldRegister) {
      registerServiceWorker()
        .then((registration) => {
          if (registration) {
            console.log("Service Worker registered in provider")
          }
        })
        .catch((error) => {
          console.error("Service Worker registration failed in provider:", error)
        })
    }
  }, [])

  return <>{children}</>
}
