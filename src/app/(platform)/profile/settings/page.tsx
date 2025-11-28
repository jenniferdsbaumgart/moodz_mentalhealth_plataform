"use client"

import React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateUserPreferencesSchema, type UpdateUserPreferencesInput } from "@/lib/validations/user"
import { PROFILE_VISIBILITY_OPTIONS, LANGUAGE_OPTIONS, THEME_OPTIONS } from "@/lib/constants/user"
import { toast } from "sonner"

interface PreferencesFormData extends UpdateUserPreferencesInput {}

export default function SettingsPage() {

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(updateUserPreferencesSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      sessionReminders: true,
      communityNotifications: true,
      profileVisibility: "private",
      showMoodInCommunity: false,
      theme: "system",
      language: "pt-BR",
    },
  })

  const onSubmit = async (data: PreferencesFormData) => {
    const savePreferences = async () => {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao salvar preferências')
      }

      console.log("Saving preferences:", data)
      return result
    }

    toast.promise(savePreferences(), {
      loading: "Salvando preferências...",
      success: "Preferências salvas com sucesso!",
      error: (error) => error.message || "Erro ao salvar preferências"
    })
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Personalize sua experiência na plataforma
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>
                Configure como você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba atualizações importantes por email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  {...form.register("emailNotifications")}
                  defaultChecked={form.watch("emailNotifications")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações no navegador
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  {...form.register("pushNotifications")}
                  defaultChecked={form.watch("pushNotifications")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="session-reminders">Lembretes de Sessão</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba lembretes antes das sessões
                  </p>
                </div>
                <Switch
                  id="session-reminders"
                  {...form.register("sessionReminders")}
                  defaultChecked={form.watch("sessionReminders")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="community-notifications">Notificações da Comunidade</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações de atividades na comunidade
                  </p>
                </div>
                <Switch
                  id="community-notifications"
                  {...form.register("communityNotifications")}
                  defaultChecked={form.watch("communityNotifications")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacidade</CardTitle>
              <CardDescription>
                Controle quem pode ver suas informações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-visibility">Visibilidade do Perfil</Label>
                <Select
                  value={form.watch("profileVisibility")}
                  onValueChange={(value) => form.setValue("profileVisibility", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a visibilidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFILE_VISIBILITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-mood-community">Mostrar Humor na Comunidade</Label>
                  <p className="text-sm text-muted-foreground">
                    Permita que outros usuários vejam seus registros de humor
                  </p>
                </div>
                <Switch
                  id="show-mood-community"
                  {...form.register("showMoodInCommunity")}
                  defaultChecked={form.watch("showMoodInCommunity")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>
                Personalize a aparência da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Select
                  value={form.watch("theme")}
                  onValueChange={(value) => form.setValue("theme", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tema" />
                  </SelectTrigger>
                  <SelectContent>
                    {THEME_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Select
                  value={form.watch("language")}
                  onValueChange={(value) => form.setValue("language", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

