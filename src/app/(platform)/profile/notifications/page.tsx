"use client"

import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import {
  Bell,
  Smartphone,
  Loader2,
  ChevronLeft,
  Info,
  CheckCircle2,
  XCircle,
  Settings
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { PreferencesForm } from "@/components/notifications/preferences-form"
import { usePushNotifications } from "@/hooks/use-push-notifications"

interface Preferences {
  [key: string]: {
    email: boolean
    push: boolean
    inApp: boolean
  }
}

export default function ProfileNotificationsPage() {
  const { data: session } = useSession()
  const {
    permission,
    isSubscribed,
    subscribe,
    unsubscribe,
    isLoading: pushLoading
  } = usePushNotifications()

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

  const handlePushToggle = async () => {
    if (isSubscribed) {
      await unsubscribe()
    } else {
      await subscribe()
    }
  }

  const preferences = data?.preferences || {}

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/profile" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar para perfil
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bell className="h-8 w-8" />
              Centro de Preferências
            </h1>
            <p className="text-muted-foreground mt-1">
              Controle como e quando você recebe notificações
            </p>
          </div>

          <Link href="/notifications">
            <Button variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Ver Notificações
            </Button>
          </Link>
        </div>
      </div>

      {/* Push Notifications Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Notificações Push
          </CardTitle>
          <CardDescription>
            Receba notificações no seu dispositivo mesmo quando não estiver usando o site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                {permission === "denied" ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : isSubscribed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Info className="h-5 w-5 text-yellow-500" />
                )}

                <div>
                  <p className="font-medium">
                    {permission === "denied"
                      ? "Notificações bloqueadas"
                      : isSubscribed
                        ? "Notificações push ativadas"
                        : "Notificações push desativadas"
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {permission === "denied"
                      ? "Você bloqueou as notificações no navegador"
                      : isSubscribed
                        ? "Você receberá notificações neste dispositivo"
                        : "Ative para receber alertas importantes"
                    }
                  </p>
                </div>
              </div>

              <Button
                onClick={handlePushToggle}
                disabled={pushLoading || permission === "denied"}
                variant={isSubscribed ? "outline" : "default"}
                size="lg"
              >
                {pushLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isSubscribed ? "Desativar Push" : "Ativar Push"}
              </Button>
            </div>

            {/* Permission denied alert */}
            {permission === "denied" && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Notificações bloqueadas</AlertTitle>
                <AlertDescription>
                  Você bloqueou as notificações push no seu navegador. Para ativá-las:
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Clique no ícone de cadeado na barra de endereços</li>
                    <li>Encontre "Notificações" nas configurações do site</li>
                    <li>Altere para "Permitir"</li>
                    <li>Recarregue a página</li>
                  </ol>
                </AlertDescription>
              </Alert>
            )}

            {/* Permission prompt info */}
            {permission === "default" && !isSubscribed && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Como funciona</AlertTitle>
                <AlertDescription>
                  Ao clicar em "Ativar Push", seu navegador pedirá permissão para enviar notificações.
                  Você pode desativar a qualquer momento.
                </AlertDescription>
              </Alert>
            )}

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl mb-2">📅</div>
                <h4 className="font-medium">Lembretes de Sessão</h4>
                <p className="text-sm text-muted-foreground">
                  Nunca perca uma sessão com alertas antecipados
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl mb-2">🔥</div>
                <h4 className="font-medium">Proteção de Streak</h4>
                <p className="text-sm text-muted-foreground">
                  Receba lembretes para manter sua streak
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl mb-2">💬</div>
                <h4 className="font-medium">Mensagens Instantâneas</h4>
                <p className="text-sm text-muted-foreground">
                  Saiba imediatamente quando receber mensagens
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Preferences Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Preferências por Tipo</h2>
        <p className="text-muted-foreground">
          Escolha quais notificações deseja receber e por qual canal. 
          Use o botão "Testar" para ver como cada notificação aparece.
        </p>
      </div>

      {/* Channel Legend */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span><strong>In-App:</strong> Notificações dentro da plataforma</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span><strong>Push:</strong> Alertas no navegador/dispositivo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span><strong>Email:</strong> Notificações por email</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Form */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <PreferencesForm
          preferences={preferences}
          pushEnabled={isSubscribed}
        />
      )}

      {/* Footer Tips */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Dicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong>Lembretes de sessão</strong> são essenciais - recomendamos manter ativados</li>
            <li>• <strong>Streak em risco</strong> ajuda a manter sua consistência</li>
            <li>• <strong>Resumo semanal</strong> é enviado apenas por email aos domingos</li>
            <li>• Você pode testar cada tipo de notificação para ver como ela aparece</li>
            <li>• Alterações são salvas automaticamente</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

