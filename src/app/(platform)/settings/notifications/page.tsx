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
  Info,
  PlayCircle,
  Calendar,
  MessageSquare,
  Trophy,
  Megaphone,
  AlertTriangle,
  Check,
  Star,
  ThumbsUp,
  Clock,
  Zap,
  Users,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Enhanced notification preferences with icons and previews
const NOTIFICATION_PREFERENCES = [
  {
    category: "Sessões",
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    types: [
      {
        type: "SESSION_REMINDER",
        label: "Lembretes de sessão",
        description: "Receba avisos 1 hora e 5 minutos antes das sessões",
        icon: Clock,
        preview: "Sua sessão de terapia começa em 1 hora. Prepare-se!",
        defaultChannels: { email: true, push: true, inApp: true }
      },
      {
        type: "SESSION_STARTING",
        label: "Sessão iniciando",
        description: "Aviso quando a sessão está prestes a começar",
        icon: Zap,
        preview: "A sessão está começando agora! Clique para entrar.",
        defaultChannels: { email: false, push: true, inApp: true }
      },
      {
        type: "SESSION_CANCELLED",
        label: "Sessão cancelada",
        description: "Notificação quando uma sessão é cancelada",
        icon: AlertTriangle,
        preview: "Infelizmente, sua sessão foi cancelada. Veja outras opções.",
        defaultChannels: { email: true, push: true, inApp: true }
      }
    ]
  },
  {
    category: "Conquistas",
    icon: Trophy,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    types: [
      {
        type: "NEW_BADGE",
        label: "Novos badges",
        description: "Quando você conquista um novo badge",
        icon: Trophy,
        preview: "🏆 Parabéns! Você conquistou o badge 'Primeira Sessão'!",
        defaultChannels: { email: false, push: true, inApp: true }
      },
      {
        type: "STREAK_RISK",
        label: "Streak em risco",
        description: "Lembrete quando seu streak está prestes a zerar",
        icon: AlertTriangle,
        preview: "🔥 Seu streak de 7 dias está em risco! Complete uma atividade hoje.",
        defaultChannels: { email: true, push: true, inApp: true }
      },
      {
        type: "STREAK_ACHIEVED",
        label: "Streak mantido",
        description: "Parabéns por manter seu streak",
        icon: Check,
        preview: "🎉 Incrível! Você manteve seu streak por mais um dia!",
        defaultChannels: { email: false, push: false, inApp: true }
      }
    ]
  },
  {
    category: "Comunidade",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-50",
    types: [
      {
        type: "NEW_POST_REPLY",
        label: "Respostas nos posts",
        description: "Quando alguém responde seu post",
        icon: MessageSquare,
        preview: "Alguém respondeu ao seu post: 'Obrigado por compartilhar!'",
        defaultChannels: { email: true, push: true, inApp: true }
      },
      {
        type: "POST_UPVOTED",
        label: "Upvotes",
        description: "Quando seu post recebe upvotes",
        icon: ThumbsUp,
        preview: "Seu post recebeu 5 novos upvotes!",
        defaultChannels: { email: false, push: false, inApp: true }
      },
      {
        type: "NEW_MESSAGE",
        label: "Novas mensagens",
        description: "Mensagens no chat de sessão",
        icon: MessageSquare,
        preview: "Dr. Silva enviou uma mensagem: 'Olá, como você está?'",
        defaultChannels: { email: false, push: true, inApp: true }
      }
    ]
  },
  {
    category: "Sistema",
    icon: Megaphone,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    types: [
      {
        type: "WEEKLY_SUMMARY",
        label: "Resumo semanal",
        description: "Relatório semanal de atividades",
        icon: Calendar,
        preview: "📊 Sua semana: 3 sessões, 2 badges conquistados, 15 pontos!",
        defaultChannels: { email: true, push: false, inApp: false }
      },
      {
        type: "SYSTEM_ANNOUNCEMENT",
        label: "Anúncios do sistema",
        description: "Novidades e atualizações da plataforma",
        icon: Megaphone,
        preview: "📢 Nova funcionalidade: Agora você pode agendar sessões recorrentes!",
        defaultChannels: { email: true, push: true, inApp: true }
      },
      {
        type: "THERAPIST_APPROVED",
        label: "Aprovação de terapeuta",
        description: "Status da aprovação como terapeuta",
        icon: Check,
        preview: "✅ Seu perfil de terapeuta foi aprovado! Comece a atender.",
        defaultChannels: { email: true, push: true, inApp: true }
      },
      {
        type: "NEW_REVIEW",
        label: "Novas avaliações",
        description: "Quando você recebe uma avaliação",
        icon: Star,
        preview: "⭐ Você recebeu uma avaliação de 5 estrelas!",
        defaultChannels: { email: true, push: true, inApp: true }
      }
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
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    NOTIFICATION_PREFERENCES.map(c => c.category)
  )
  const [testingType, setTestingType] = useState<string | null>(null)

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
    }
  })

  // Test notification mutation
  const testMutation = useMutation({
    mutationFn: async (type: string) => {
      setTestingType(type)
      const response = await fetch("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      })
      if (!response.ok) throw new Error("Failed to send test notification")
      return response.json()
    },
    onSuccess: (data) => {
      const channels = []
      if (data.channels?.inApp) channels.push("In-App")
      if (data.channels?.push) channels.push("Push")
      if (data.channels?.email) channels.push("Email")
      
      toast.success(`Notificação de teste enviada`, {
        description: channels.length > 0 
          ? `Canais: ${channels.join(", ")}`
          : "Nenhum canal ativo para este tipo"
      })
    },
    onError: () => {
      toast.error("Erro ao enviar notificação de teste")
    },
    onSettled: () => {
      setTestingType(null)
    }
  })

  const preferences = data?.preferences || {}

  const handleToggle = (type: string, channel: string, enabled: boolean) => {
    updateMutation.mutate({ type, channel, enabled })
  }

  const handlePushToggle = async () => {
    if (isSubscribed) {
      await unsubscribe()
      toast.success("Notificações push desativadas")
    } else {
      await subscribe()
      toast.success("Notificações push ativadas")
    }
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleTestNotification = (type: string) => {
    testMutation.mutate(type)
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
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Ao ativar, seu navegador pedirá permissão para enviar notificações.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Channel Legend */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <span>In-App</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span>Push</span>
                {!isSubscribed && (
                  <Badge variant="secondary" className="text-xs">Desativado</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>Email</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <PlayCircle className="h-4 w-4" />
              <span>Clique no botão de teste para experimentar</span>
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
        <div className="space-y-4">
          {NOTIFICATION_PREFERENCES.map((category) => {
            const CategoryIcon = category.icon
            const isExpanded = expandedCategories.includes(category.category)

            return (
              <Card key={category.category}>
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleCategory(category.category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", category.bgColor)}>
                        <CategoryIcon className={cn("h-5 w-5", category.color)} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.category}</CardTitle>
                        <CardDescription className="text-sm">
                          {category.types.length} tipos de notificação
                        </CardDescription>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-6">
                      {category.types.map((notifType, index) => {
                        const pref = preferences[notifType.type] || { email: true, push: true, inApp: true }
                        const TypeIcon = notifType.icon
                        const isTesting = testingType === notifType.type

                        return (
                          <div key={notifType.type}>
                            {index > 0 && <Separator className="my-6" />}
                            
                            <div className="space-y-4">
                              {/* Header with label and test button */}
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                  <div className={cn("p-1.5 rounded", category.bgColor)}>
                                    <TypeIcon className={cn("h-4 w-4", category.color)} />
                                  </div>
                                  <div>
                                    <Label className="text-base font-medium">
                                      {notifType.label}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                      {notifType.description}
                                    </p>
                                  </div>
                                </div>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTestNotification(notifType.type)}
                                  disabled={isTesting}
                                  className="flex-shrink-0"
                                >
                                  {isTesting ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <PlayCircle className="h-4 w-4 mr-2" />
                                  )}
                                  Testar
                                </Button>
                              </div>

                              {/* Preview */}
                              <div className={cn(
                                "p-3 rounded-lg border text-sm",
                                category.bgColor,
                                "border-transparent"
                              )}>
                                <p className="text-muted-foreground italic">
                                  Preview: "{notifType.preview}"
                                </p>
                              </div>

                              {/* Channel toggles */}
                              <div className="flex flex-wrap items-center gap-6 pl-9">
                                {/* In-App */}
                                <div className="flex items-center gap-2">
                                  <Switch
                                    id={`${notifType.type}-inApp`}
                                    checked={pref.inApp}
                                    onCheckedChange={(checked) => handleToggle(notifType.type, "inApp", checked)}
                                    disabled={updateMutation.isPending}
                                  />
                                  <Label 
                                    htmlFor={`${notifType.type}-inApp`}
                                    className="flex items-center gap-1.5 text-sm cursor-pointer"
                                  >
                                    <Monitor className="h-4 w-4 text-muted-foreground" />
                                    In-App
                                  </Label>
                                </div>

                                {/* Push */}
                                <div className="flex items-center gap-2">
                                  <Switch
                                    id={`${notifType.type}-push`}
                                    checked={pref.push}
                                    onCheckedChange={(checked) => handleToggle(notifType.type, "push", checked)}
                                    disabled={updateMutation.isPending || !isSubscribed}
                                  />
                                  <Label 
                                    htmlFor={`${notifType.type}-push`}
                                    className={cn(
                                      "flex items-center gap-1.5 text-sm cursor-pointer",
                                      !isSubscribed && "opacity-50"
                                    )}
                                  >
                                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                                    Push
                                    {!isSubscribed && (
                                      <span className="text-xs text-muted-foreground">(desativado)</span>
                                    )}
                                  </Label>
                                </div>

                                {/* Email */}
                                <div className="flex items-center gap-2">
                                  <Switch
                                    id={`${notifType.type}-email`}
                                    checked={pref.email}
                                    onCheckedChange={(checked) => handleToggle(notifType.type, "email", checked)}
                                    disabled={updateMutation.isPending}
                                  />
                                  <Label 
                                    htmlFor={`${notifType.type}-email`}
                                    className="flex items-center gap-1.5 text-sm cursor-pointer"
                                  >
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    Email
                                  </Label>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Footer info */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Sobre as notificações</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>In-App:</strong> Aparecem no sino de notificações dentro da plataforma</li>
              <li><strong>Push:</strong> Aparecem no seu dispositivo mesmo quando não está no site</li>
              <li><strong>Email:</strong> Enviadas para o email cadastrado na sua conta</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
