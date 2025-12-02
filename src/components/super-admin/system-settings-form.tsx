"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { SystemSettings } from "@prisma/client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Save, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const settingsSchema = z.object({
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().optional(),
  allowNewRegistrations: z.boolean(),
  maxSessionParticipants: z.number().min(2).max(50),
  maxPostsPerDay: z.number().min(1).max(100),
  defaultSessionDuration: z.number().min(15).max(180),
  maxUploadSizeMB: z.number().min(1).max(100),
  maxSessionsPerTherapist: z.number().min(1).max(100),
})

type SettingsForm = z.infer<typeof settingsSchema>

interface SystemSettingsFormProps {
  settings: SystemSettings
}

export function SystemSettingsForm({ settings }: SystemSettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage || "",
      allowNewRegistrations: settings.allowNewRegistrations,
      maxSessionParticipants: settings.maxSessionParticipants,
      maxPostsPerDay: settings.maxPostsPerDay,
      defaultSessionDuration: settings.defaultSessionDuration,
      maxUploadSizeMB: settings.maxUploadSizeMB,
      maxSessionsPerTherapist: settings.maxSessionsPerTherapist,
    },
  })

  async function onSubmit(data: SettingsForm) {
    setIsLoading(true)
    try {
      const response = await fetch("/api/super-admin/system", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error()
      toast.success("Configurações salvas com sucesso")
      router.refresh()
    } catch {
      toast.error("Erro ao salvar configurações")
    } finally {
      setIsLoading(false)
    }
  }

  const maintenanceMode = form.watch("maintenanceMode")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Gerais</CardTitle>
        <CardDescription>
          Configure os parâmetros globais da plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Modo Manutenção */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="maintenanceMode"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Modo Manutenção
                      </FormLabel>
                      <FormDescription>
                        Quando ativo, apenas Super Admins podem acessar
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {maintenanceMode && (
                <FormField
                  control={form.control}
                  name="maintenanceMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem de Manutenção</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Estamos em manutenção. Voltaremos em breve!"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <Separator />
            {/* Registros */}
            <FormField
              control={form.control}
              name="allowNewRegistrations"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Permitir Novos Registros</FormLabel>
                    <FormDescription>
                      Permitir que novos usuários se cadastrem
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Separator />
            {/* Limites */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="maxSessionParticipants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máx. Participantes por Sessão</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={2}
                        max={50}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Entre 2 e 50</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxPostsPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máx. Posts por Dia</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Por usuário</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="defaultSessionDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração Padrão de Sessão</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={15}
                        max={180}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Em minutos (15-180)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxUploadSizeMB"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamanho Máx. Upload</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Em MB (1-100)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxSessionsPerTherapist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máx. Sessões por Terapeuta</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Por semana (1-100)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                "Salvando..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}


