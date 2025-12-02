"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useInView } from "react-intersection-observer"
import { isToday, isYesterday, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Bell,
  CheckCheck,
  Trash2,
  Loader2,
  Settings,
  Calendar,
  Award,
  MessageSquare,
  Megaphone,
  Filter,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { NotificationItem } from "@/components/notifications/notification-item"
import { toast } from "sonner"

// Notification type categories
const NOTIFICATION_CATEGORIES = {
  all: { 
    label: "Todas", 
    icon: Bell,
    types: null // null means all types
  },
  sessions: { 
    label: "Sessões", 
    icon: Calendar,
    types: ["SESSION_REMINDER", "SESSION_STARTING", "SESSION_CANCELLED"]
  },
  achievements: { 
    label: "Conquistas", 
    icon: Award,
    types: ["NEW_BADGE", "STREAK_ACHIEVED", "STREAK_RISK"]
  },
  community: { 
    label: "Comunidade", 
    icon: MessageSquare,
    types: ["NEW_POST_REPLY", "POST_UPVOTED", "NEW_MESSAGE"]
  },
  system: { 
    label: "Sistema", 
    icon: Megaphone,
    types: ["SYSTEM_ANNOUNCEMENT", "THERAPIST_APPROVED", "WEEKLY_SUMMARY", "NEW_REVIEW"]
  }
} as const

type CategoryKey = keyof typeof NOTIFICATION_CATEGORIES

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  data?: Record<string, any>
}

interface NotificationsPage {
  notifications: Notification[]
  unreadCount: number
  hasMore: boolean
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function NotificationsPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const { ref, inView } = useInView()

  // Filter state
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all")
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  // Build query params
  const buildQueryParams = useCallback((page: number) => {
    const params = new URLSearchParams()
    params.set("page", page.toString())
    params.set("limit", "20")
    
    const category = NOTIFICATION_CATEGORIES[activeCategory]
    if (category.types) {
      params.set("types", category.types.join(","))
    }
    
    if (showUnreadOnly) {
      params.set("read", "false")
    }
    
    return params.toString()
  }, [activeCategory, showUnreadOnly])

  // Infinite query for notifications
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteQuery<NotificationsPage>({
    queryKey: ["notifications", "infinite", activeCategory, showUnreadOnly],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/notifications?${buildQueryParams(pageParam as number)}`)
      if (!response.ok) throw new Error("Failed to fetch notifications")
      const data = await response.json()
      return {
        ...data,
        hasMore: data.pagination.page < data.pagination.totalPages
      }
    },
    getNextPageParam: (lastPage) => 
      lastPage.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!session?.user
  })

  // Load more when scrolling to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/notifications/read-all", { method: "POST" })
      if (!response.ok) throw new Error("Failed to mark all as read")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast.success("Todas as notificações marcadas como lidas")
    },
    onError: () => {
      toast.error("Erro ao marcar notificações como lidas")
    }
  })

  // Delete read notifications mutation
  const deleteReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/notifications?read=true", { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast.success("Notificações lidas removidas")
    },
    onError: () => {
      toast.error("Erro ao remover notificações")
    }
  })

  // Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/notifications/${id}/read`, { method: "POST" })
      if (!response.ok) throw new Error("Failed to mark as read")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    }
  })

  // Delete single notification
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/notifications/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast.success("Notificação removida")
    }
  })

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const allNotifications = data?.pages.flatMap(p => p.notifications) || []
    const groups: Record<string, Notification[]> = {}

    allNotifications.forEach(notification => {
      const date = new Date(notification.createdAt)
      let key: string

      if (isToday(date)) {
        key = "Hoje"
      } else if (isYesterday(date)) {
        key = "Ontem"
      } else {
        key = format(date, "d 'de' MMMM", { locale: ptBR })
      }

      if (!groups[key]) groups[key] = []
      groups[key].push(notification)
    })

    return groups
  }, [data])

  const unreadCount = data?.pages[0]?.unreadCount || 0
  const totalCount = data?.pages[0]?.pagination.total || 0

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="h-8 w-8" />
            Notificações
          </h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0
              ? `${unreadCount} notificação${unreadCount !== 1 ? "s" : ""} não lida${unreadCount !== 1 ? "s" : ""}`
              : "Todas as notificações foram lidas"
            }
          </p>
        </div>

        <Link href="/settings/notifications">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Preferências
          </Button>
        </Link>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {totalCount} total
          </Badge>
          {unreadCount > 0 && (
            <Badge variant="default" className="text-sm">
              {unreadCount} não lidas
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending || unreadCount === 0}
          >
            {markAllReadMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="mr-2 h-4 w-4" />
            )}
            Marcar todas como lidas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Tem certeza que deseja remover todas as notificações lidas?")) {
                deleteReadMutation.mutate()
              }
            }}
            disabled={deleteReadMutation.isPending}
          >
            {deleteReadMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Limpar lidas
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs 
        value={activeCategory} 
        onValueChange={(value) => setActiveCategory(value as CategoryKey)}
        className="mb-6"
      >
        <TabsList className="flex-wrap h-auto gap-1 p-1">
          {Object.entries(NOTIFICATION_CATEGORIES).map(([key, { label, icon: Icon }]) => (
            <TabsTrigger 
              key={key} 
              value={key} 
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Unread Filter Toggle */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Button
          variant={showUnreadOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
        >
          {showUnreadOnly ? "Mostrar todas" : "Apenas não lidas"}
        </Button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : Object.keys(groupedNotifications).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bell className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma notificação</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {activeCategory !== "all" || showUnreadOnly
                ? "Nenhuma notificação corresponde aos filtros selecionados."
                : "Você está em dia com tudo! Novas notificações aparecerão aqui."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedNotifications).map(([date, notifications]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                {date}
              </h3>
              <Card>
                <CardContent className="p-0 divide-y">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
                      onDelete={(id) => deleteMutation.mutate(id)}
                      showMarkAsRead
                      showDelete
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}

          {/* Infinite scroll trigger */}
          <div ref={ref} className="flex justify-center py-4">
            {isFetchingNextPage && (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            )}
            {!hasNextPage && totalCount > 0 && (
              <p className="text-sm text-muted-foreground">
                Fim das notificações
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
