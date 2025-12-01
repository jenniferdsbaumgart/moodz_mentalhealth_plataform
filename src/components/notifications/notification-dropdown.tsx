"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Bell, Check, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePusher } from "@/hooks/use-pusher"
import { useSession } from "next-auth/react"
import { NotificationItem } from "./notification-item"

export function NotificationDropdown() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  // Fetch notifications
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await fetch("/api/notifications")
      if (!response.ok) throw new Error("Failed to fetch notifications")
      return response.json()
    },
    enabled: !!session?.user
  })

  // Real-time updates via Pusher
  usePusher(
    `user-${session?.user?.id}`,
    "notification",
    (newNotification) => {
      queryClient.setQueryData(["notifications"], (old: any) => ({
        ...old,
        notifications: [newNotification, ...(old?.notifications || [])],
        unreadCount: (old?.unreadCount || 0) + 1
      }))
    }
  )

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST"
      })
      if (!response.ok) throw new Error("Failed to mark all as read")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    }
  })

  const notifications = data?.notifications || []
  const unreadCount = data?.unreadCount || 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Carregando...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Nenhuma notificação
            </div>
          ) : (
            notifications.slice(0, 10).map((notification: any) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                showMarkAsRead={false}
                showDelete={false}
              />
            ))
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-2 border-t">
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/notifications">
              Ver todas as notificações
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
