"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Bell, Mail, Smartphone, Monitor, TestTube, Loader2, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// Notification type definitions with descriptions
export const notificationTypes = [
  {
    type: "SESSION_REMINDER",
    label: "Lembretes de sessão",
    description: "Receba avisos 1 hora antes das suas sessões de terapia",
    category: "sessions",
    icon: "📅",
    defaultChannels: { email: true, push: true, inApp: true }
  },
  {
    type: "SESSION_STARTING",
    label: "Sessão começando",
    description: "Alerta quando sua sessão está prestes a começar (5 minutos)",
    category: "sessions",
    icon: "🚨",
    defaultChannels: { email: false, push: true, inApp: true }
  },
  {
    type: "SESSION_CANCELLED",
    label: "Sessão cancelada",
    description: "Aviso quando uma sessão é cancelada pelo terapeuta",
    category: "sessions",
    icon: "❌",
    defaultChannels: { email: true, push: true, inApp: true }
  },
  {
    type: "NEW_MESSAGE",
    label: "Novas mensagens",
    description: "Notificação quando você recebe uma nova mensagem",
    category: "messages",
    icon: "💬",
    defaultChannels: { email: false, push: true, inApp: true }
  },
  {
    type: "NEW_POST_REPLY",
    label: "Respostas em posts",
    description: "Quando alguém responde ao seu post na comunidade",
    category: "messages",
    icon: "💭",
    defaultChannels: { email: false, push: true, inApp: true }
  },
  {
    type: "POST_UPVOTED",
    label: "Upvotes recebidos",
    description: "Quando seu post ou comentário recebe um upvote",
    category: "messages",
    icon: "👍",
    defaultChannels: { email: false, push: false, inApp: true }
  },
  {
    type: "NEW_BADGE",
    label: "Conquistas e badges",
    description: "Seja notificado quando conquistar um novo badge",
    category: "achievements",
    icon: "🏆",
    defaultChannels: { email: false, push: true, inApp: true }
  },
  {
    type: "STREAK_RISK",
    label: "Streak em risco",
    description: "Lembrete quando seu streak estiver prestes a zerar",
    category: "achievements",
    icon: "🔥",
    defaultChannels: { email: true, push: true, inApp: true }
  },
  {
    type: "STREAK_ACHIEVED",
    label: "Streak alcançado",
    description: "Comemoração quando você mantém sua streak",
    category: "achievements",
    icon: "🎉",
    defaultChannels: { email: false, push: true, inApp: true }
  },
  {
    type: "THERAPIST_APPROVED",
    label: "Aprovação de terapeuta",
    description: "Status da sua aprovação como terapeuta na plataforma",
    category: "system",
    icon: "✅",
    defaultChannels: { email: true, push: true, inApp: true }
  },
  {
    type: "NEW_REVIEW",
    label: "Novas avaliações",
    description: "Quando um paciente deixa uma avaliação (para terapeutas)",
    category: "system",
    icon: "⭐",
    defaultChannels: { email: true, push: true, inApp: true }
  },
  {
    type: "SYSTEM_ANNOUNCEMENT",
    label: "Anúncios do sistema",
    description: "Comunicados importantes da plataforma Moodz",
    category: "system",
    icon: "📢",
    defaultChannels: { email: true, push: false, inApp: true }
  },
  {
    type: "WEEKLY_SUMMARY",
    label: "Resumo semanal",
    description: "Seu resumo semanal de atividades e progresso",
    category: "system",
    icon: "📊",
    defaultChannels: { email: true, push: false, inApp: false }
  },
]

const categories = [
  { id: "sessions", label: "Sessões", icon: "📅" },
  { id: "messages", label: "Mensagens", icon: "💬" },
  { id: "achievements", label: "Conquistas", icon: "🏆" },
  { id: "system", label: "Sistema", icon: "⚙️" },
]

interface Preferences {
  [key: string]: {
    email: boolean
    push: boolean
    inApp: boolean
  }
}

interface PreferencesFormProps {
  preferences: Preferences
  pushEnabled: boolean
}

export function PreferencesForm({ preferences, pushEnabled }: PreferencesFormProps) {
  const queryClient = useQueryClient()
  const [testingType, setTestingType] = useState<string | null>(null)

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
      toast.error("Erro ao atualizar preferência")
    },
    onSuccess: () => {
      toast.success("Preferência atualizada")
    }
  })

  // Test notification mutation
  const testMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await fetch("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      })
      if (!response.ok) throw new Error("Failed to send test notification")
      return response.json()
    },
    onSuccess: (data, type) => {
      const notifType = notificationTypes.find(n => n.type === type)
      toast.success(`Notificação de teste enviada: ${notifType?.label}`)
    },
    onError: () => {
      toast.error("Erro ao enviar notificação de teste")
    }
  })

  const handleToggle = (type: string, channel: string, enabled: boolean) => {
    updateMutation.mutate({ type, channel, enabled })
  }

  const handleTest = async (type: string) => {
    setTestingType(type)
    try {
      await testMutation.mutateAsync(type)
    } finally {
      setTestingType(null)
    }
  }

  const getPref = (type: string) => {
    return preferences[type] || { email: true, push: true, inApp: true }
  }

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryTypes = notificationTypes.filter(t => t.category === category.id)

        return (
          <div key={category.id}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>{category.icon}</span>
              {category.label}
            </h3>

            <div className="space-y-4">
              {categoryTypes.map((notifType) => {
                const pref = getPref(notifType.type)

                return (
                  <Card key={notifType.type} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{notifType.icon}</span>
                          <div>
                            <CardTitle className="text-base">{notifType.label}</CardTitle>
                            <CardDescription className="mt-1">
                              {notifType.description}
                            </CardDescription>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTest(notifType.type)}
                          disabled={testingType === notifType.type || testMutation.isPending}
                          className="flex-shrink-0"
                        >
                          {testingType === notifType.type ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <TestTube className="h-4 w-4 mr-1" />
                              Testar
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-6">
                        {/* In-App */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <Monitor className="h-4 w-4 text-muted-foreground" />
                            <Label
                              htmlFor={`${notifType.type}-inApp`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              In-App
                            </Label>
                          </div>
                          <Switch
                            id={`${notifType.type}-inApp`}
                            checked={pref.inApp}
                            onCheckedChange={(checked) => handleToggle(notifType.type, "inApp", checked)}
                            disabled={updateMutation.isPending}
                          />
                        </div>

                        {/* Push */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                            <Label
                              htmlFor={`${notifType.type}-push`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              Push
                            </Label>
                          </div>
                          <Switch
                            id={`${notifType.type}-push`}
                            checked={pref.push}
                            onCheckedChange={(checked) => handleToggle(notifType.type, "push", checked)}
                            disabled={updateMutation.isPending || !pushEnabled}
                          />
                          {!pushEnabled && (
                            <Badge variant="outline" className="text-xs">
                              Desativado
                            </Badge>
                          )}
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <Label
                              htmlFor={`${notifType.type}-email`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              Email
                            </Label>
                          </div>
                          <Switch
                            id={`${notifType.type}-email`}
                            checked={pref.email}
                            onCheckedChange={(checked) => handleToggle(notifType.type, "email", checked)}
                            disabled={updateMutation.isPending}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
