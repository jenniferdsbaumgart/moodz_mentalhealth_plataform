"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import {
  Bell,
  Mail,
  Smartphone,
  Monitor,
  Loader2,
  ChevronLeft,
  Info
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { usePushNotifications } from "@/hooks/use-push-notifications"

// Notification type categories
const NOTIFICATION_CATEGORIES = [
  {
    title: "Sessões",
    description: "Notificações relacionadas às suas sessões de terapia",
    types: [
      { type: "SESSION_REMINDER", label: "Lembretes de sessão", description: "Receba lembretes antes das sessões" },
      { type: "SESSION_STARTING", label: "Sessão começando", description: "Alerta quando a sessão está prestes a começar" },
      { type: "SESSION_CANCELLED", label: "Sessão cancelada", description: "Aviso quando uma sessão é cancelada" },
    ]
  },
  {
    title: "Mensagens",
    description: "Notificações de mensagens e interações",
    types: [
      { type: "NEW_MESSAGE", label: "Novas mensagens", description: "Quando você recebe uma nova mensagem" },
      { type: "NEW_POST_REPLY", label: "Respostas em posts", description: "Quando alguém responde seu post" },
      { type: "POST_UPVOTED", label: "Upvotes", description: "Quando seu post recebe um upvote" },
    ]
  },
  {
    title: "Conquistas",
    description: "Notificações sobre seu progresso e conquistas",
    types: [
      { type: "NEW_BADGE", label: "Novos badges", description: "Quando você conquista um novo badge" },
      { type: "STREAK_RISK", label: "Risco de streak", description: "Alerta quando sua streak está em risco" },
      { type: "STREAK_ACHIEVED", label: "Streak alcançado", description: "Quando você mantém sua streak" },
    ]
  },
  {
    title: "Sistema",
    description: "Notificações administrativas e do sistema",
    types: [
      { type: "THERAPIST_APPROVED", label: "Aprovação de terapeuta", description: "Status da aprovação como terapeuta" },
      { type: "NEW_REVIEW", label: "Novas avaliações", description: "Quando você recebe uma avaliação" },
      { type: "SYSTEM_ANNOUNCEMENT", label: "Anúncios do sistema", description: "Comunicados importantes da plataforma" },
      { type: "WEEKLY_SUMMARY", label: "Resumo semanal", description: "Seu resumo semanal de atividades" },
    ]
  },
]

interface Preferences {
  [key: string]: {
    email: boolean
    push: boolean
    inApp: boolean
  }
}

export default function NotificationPreferencesPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const { permission, isSubscribed, subscribe, unsubscribe, isLoading: pushLoading } = usePushNotifications()

  // Fetch preferences
  const { data, isLoading } = useQuery<{ preferences: Preferences }>({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const response = await fetch("/api/notifications/preferences")
      if (!response.ok) throw new Error("Failed to fetch preferences")
      return response.json()
    },
    enabled: !!session?.user
  })

  // Update preference mutation
  const updateMutation = useMutation({
    mutationFn: async ({ type, channel, enabled }: { type: string; channel: string; enabled: boolean }) => {
      const response = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, channel, enabled })
      })
      if (!response.ok) throw new Error("Failed to update preference")
      return response.json()
    },
    onMutate: async ({ type, channel, enabled }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["notification-preferences"] })
      const previous = queryClient.getQueryData<{ preferences: Preferences }>(["notification-preferences"])

      queryClient.setQueryData<{ preferences: Preferences }>(["notification-preferences"], (old) => {
        if (!old) return old
        return {
          ...old,
          preferences: {
            ...old.preferences,
            [type]: {
              ...old.preferences[type],
              [channel]: enabled
            }
          }
        }
      })

      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notification-preferences"], context.previous)
      }
    }
  })

  const preferences = data?.preferences || {}

  const handleToggle = (type: string, channel: string, enabled: boolean) => {
    updateMutation.mutate({ type, channel, enabled })
  }

  const handlePushToggle = async () => {
    if (isSubscribed) {
      await unsubscribe()
    } else {
      await subscribe()
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/notifications" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar para notificações
        </Link>

        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bell className="h-8 w-8" />
          Preferências de Notificação
        </h1>
        <p className="text-muted-foreground mt-1">
          Personalize como e quando você recebe notificações
        </p>
      </div>

      {/* Push Notifications Setup */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Notificações Push
          </CardTitle>
          <CardDescription>
            Receba notificações mesmo quando não estiver usando o site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {permission === "denied"
                  ? "Notificações bloqueadas"
                  : isSubscribed
                    ? "Notificações push ativadas"
                    : "Notificações push desativadas"
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {permission === "denied"
                  ? "Você bloqueou as notificações. Altere nas configurações do navegador."
                  : isSubscribed
                    ? "Você receberá notificações push neste dispositivo."
                    : "Ative para receber notificações push neste dispositivo."
                }
              </p>
            </div>

            <Button
              onClick={handlePushToggle}
              disabled={pushLoading || permission === "denied"}
              variant={isSubscribed ? "outline" : "default"}
            >
              {pushLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSubscribed ? (
                "Desativar"
              ) : (
                "Ativar"
              )}
            </Button>
          </div>

          {permission === "default" && !isSubscribed && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                Ao ativar, seu navegador pedirá permissão para enviar notificações.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Channel Legend */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <span>In-App</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <span>Push</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>Email</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences by Category */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {NOTIFICATION_CATEGORIES.map((category) => (
            <Card key={category.title}>
              <CardHeader>
                <CardTitle>{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.types.map((notifType, index) => {
                    const pref = preferences[notifType.type] || { email: true, push: true, inApp: true }

                    return (
                      <div key={notifType.type}>
                        {index > 0 && <Separator className="my-4" />}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <Label className="text-base font-medium">
                              {notifType.label}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {notifType.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            {/* In-App */}
                            <div className="flex items-center gap-2">
                              <Monitor className="h-4 w-4 text-muted-foreground" />
                              <Switch
                                checked={pref.inApp}
                                onCheckedChange={(checked) => handleToggle(notifType.type, "inApp", checked)}
                                disabled={updateMutation.isPending}
                              />
                            </div>

                            {/* Push */}
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-4 w-4 text-muted-foreground" />
                              <Switch
                                checked={pref.push}
                                onCheckedChange={(checked) => handleToggle(notifType.type, "push", checked)}
                                disabled={updateMutation.isPending || !isSubscribed}
                              />
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <Switch
                                checked={pref.email}
                                onCheckedChange={(checked) => handleToggle(notifType.type, "email", checked)}
                                disabled={updateMutation.isPending}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

