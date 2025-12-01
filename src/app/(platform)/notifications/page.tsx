"use client"

import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Settings
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NotificationItem } from "@/components/notifications/notification-item"
import { usePusher } from "@/hooks/use-pusher"

// Notification types for filter
const NOTIFICATION_TYPES = [
  { value: "all", label: "Todas" },
  { value: "SESSION_REMINDER", label: "Lembretes de Sessão" },
  { value: "SESSION_STARTING", label: "Sessão Começando" },
  { value: "SESSION_CANCELLED", label: "Sessão Cancelada" },
  { value: "NEW_MESSAGE", label: "Novas Mensagens" },
  { value: "NEW_BADGE", label: "Badges" },
  { value: "STREAK_RISK", label: "Risco de Streak" },
  { value: "STREAK_ACHIEVED", label: "Streak Alcançado" },
  { value: "NEW_POST_REPLY", label: "Respostas em Posts" },
  { value: "POST_UPVOTED", label: "Upvotes" },
  { value: "THERAPIST_APPROVED", label: "Aprovação de Terapeuta" },
  { value: "NEW_REVIEW", label: "Avaliações" },
  { value: "SYSTEM_ANNOUNCEMENT", label: "Anúncios" },
  { value: "WEEKLY_SUMMARY", label: "Resumo Semanal" },
]

const READ_FILTERS = [
  { value: "all", label: "Todas" },
  { value: "unread", label: "Não lidas" },
  { value: "read", label: "Lidas" },
]

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  data?: Record<string, any>
}

interface NotificationsResponse {
  notifications: Notification[]
  unreadCount: number
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

  // Filters state
  const [typeFilter, setTypeFilter] = useState("all")
  const [readFilter, setReadFilter] = useState("all")
  const [page, setPage] = useState(1)
  const limit = 20

  // Build query params
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams()
    params.set("page", page.toString())
    params.set("limit", limit.toString())
    if (typeFilter !== "all") params.set("type", typeFilter)
    if (readFilter !== "all") params.set("read", readFilter === "read" ? "true" : "false")
    return params.toString()
  }, [page, typeFilter, readFilter])

  // Fetch notifications
  const { data, isLoading, refetch } = useQuery<NotificationsResponse>({
    queryKey: ["notifications", page, typeFilter, readFilter],
    queryFn: async () => {
      const response = await fetch(`/api/notifications?${buildQueryParams()}`)
      if (!response.ok) throw new Error("Failed to fetch notifications")
      return response.json()
    },
    enabled: !!session?.user
  })

  // Real-time updates via Pusher
  usePusher(
    `user-${session?.user?.id}`,
    "notification",
    useCallback((newNotification: Notification) => {
      queryClient.setQueryData<NotificationsResponse>(
        ["notifications", page, typeFilter, readFilter],
        (old) => {
          if (!old) return old
          return {
            ...old,
            notifications: [newNotification, ...old.notifications],
            unreadCount: old.unreadCount + 1
          }
        }
      )
    }, [queryClient, page, typeFilter, readFilter])
  )

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true })
      })
      if (!response.ok) throw new Error("Failed to mark as read")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    }
  })

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

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE"
      })
      if (!response.ok) throw new Error("Failed to delete notification")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    }
  })

  // Delete all notifications mutation
  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/notifications", {
        method: "DELETE"
      })
      if (!response.ok) throw new Error("Failed to delete all notifications")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    }
  })

  const notifications = data?.notifications || []
  const unreadCount = data?.unreadCount || 0
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 }

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
              ? `${unreadCount} notificação${unreadCount !== 1 ? 's' : ''} não lida${unreadCount !== 1 ? 's' : ''}`
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

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={typeFilter} onValueChange={(value) => { setTypeFilter(value); setPage(1) }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTIFICATION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Select value={readFilter} onValueChange={(value) => { setReadFilter(value); setPage(1) }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {READ_FILTERS.map(filter => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                >
                  {markAllReadMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCheck className="h-4 w-4 mr-2" />
                  )}
                  Marcar todas como lidas
                </Button>
              )}

              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm("Tem certeza que deseja excluir todas as notificações?")) {
                      deleteAllMutation.mutate()
                    }
                  }}
                  disabled={deleteAllMutation.isPending}
                  className="text-red-600 hover:text-red-700"
                >
                  {deleteAllMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Excluir todas
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {pagination.total} notificação{pagination.total !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhuma notificação</h3>
              <p className="text-muted-foreground">
                {typeFilter !== "all" || readFilter !== "all"
                  ? "Nenhuma notificação corresponde aos filtros selecionados."
                  : "Você não tem notificações no momento."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  showMarkAsRead={true}
                  showDelete={true}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
