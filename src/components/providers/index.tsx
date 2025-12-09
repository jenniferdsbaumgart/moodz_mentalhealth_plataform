"use client"

import { AuthProvider } from "./session-provider"
import { QueryProvider } from "./query-provider"
import { ThemeProvider } from "./theme-provider"
import { NotificationsProvider } from "./notifications-provider"
import { ServiceWorkerProvider } from "./service-worker-provider"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <QueryProvider>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <NotificationsProvider>
                        <ServiceWorkerProvider>
                            {children}
                        </ServiceWorkerProvider>
                    </NotificationsProvider>
                </ThemeProvider>
            </QueryProvider>
        </AuthProvider>
    )
}
