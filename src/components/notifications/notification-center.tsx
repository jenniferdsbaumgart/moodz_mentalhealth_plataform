"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/lib/utils/date"
import { cn } from "@/lib/utils"

interface Notification {
    id: string
    title: string
    message: string
    type: string
    read: boolean
    createdAt: string
    link?: string
}

export function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()

    const { data: notifications = [], isLoading } = useQuery<Notification[]>({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await fetch('/api/notifications')
            if (!res.ok) throw new Error('Failed to fetch notifications')
            return res.json()
        },
        // Refetch every 30 seconds
        refetchInterval: 30000
    })

    const { mutate: markAsRead } = useMutation({
        mutationFn: async (id: string) => {
            await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
    })

    const { mutate: markAllAsRead } = useMutation({
        mutationFn: async () => {
            await fetch('/api/notifications/read-all', { method: 'POST' })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
    })

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 border border-background" />
                    )}
                    <span className="sr-only">Notificações</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
                <DropdownMenuLabel className="flex justify-between items-center font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Notificações</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            Você tem {unreadCount} mensagens não lidas
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 text-xs"
                            onClick={() => markAllAsRead()}
                        >
                            Marcar todas como lidas
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Carregando...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Nenhuma notificação encontrada
                        </div>
                    ) : (
                        <DropdownMenuGroup>
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={cn(
                                        "flex flex-col items-start gap-1 p-3 cursor-pointer",
                                        !notification.read && "bg-muted/50"
                                    )}
                                    onClick={() => {
                                        if (!notification.read) markAsRead(notification.id)
                                        // If link exists, we navigate later or let Link handle it inside item
                                    }}
                                >
                                    <div className="flex w-full justify-between items-start">
                                        <span className="font-medium text-sm">{notification.title}</span>
                                        {!notification.read && (
                                            <span className="h-2 w-2 rounded-full bg-blue-600 mt-1" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatRelativeTime(notification.createdAt)}
                                    </span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
