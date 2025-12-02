import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { NotificationsProvider } from "@/components/providers/notifications-provider";
import { Toaster } from "sonner";
import { SkipLink } from "@/components/accessibility/skip-link";
import { ScreenReaderAnnouncer } from "@/components/accessibility/announcer";
import { CommandPalette } from "@/components/search/command-palette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moodz - Plataforma de Saúde Mental",
  description: "Sua plataforma de bem-estar mental",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SkipLink />
        <ScreenReaderAnnouncer />
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <NotificationsProvider>
                <main id="main-content">
                  {children}
                </main>
                <CommandPalette />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    style: {
                      background: "hsl(var(--background))",
                      color: "hsl(var(--foreground))",
                      border: "1px solid hsl(var(--border))",
                    },
                  }}
                />
              </NotificationsProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
