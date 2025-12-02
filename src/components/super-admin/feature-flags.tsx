"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Flag,
  Plus,
  Settings2,
  Users,
  FlaskConical,
  Percent,
  Loader2,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string | null
  enabled: boolean
  enabledFor: string[]
  betaOnly: boolean
  rolloutPercentage: number
  createdAt: string
  updatedAt: string
}

const ROLES = [
  { value: "PATIENT", label: "Pacientes" },
  { value: "THERAPIST", label: "Terapeutas" },
  { value: "ADMIN", label: "Administradores" },
  { value: "SUPER_ADMIN", label: "Super Admins" },
]

export function FeatureFlags() {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null)

  const { data: flags, isLoading } = useQuery<FeatureFlag[]>({
    queryKey: ["feature-flags"],
    queryFn: async () => {
      const res = await fetch("/api/super-admin/system/features")
      if (!res.ok) throw new Error("Failed to fetch flags")
      return res.json()
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const res = await fetch(`/api/super-admin/system/features/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      })
      if (!res.ok) throw new Error("Failed to toggle flag")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] })
      toast.success("Feature flag atualizada")
    },
    onError: () => {
      toast.error("Erro ao atualizar feature flag")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/super-admin/system/features/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete flag")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] })
      toast.success("Feature flag removida")
    },
    onError: () => {
      toast.error("Erro ao remover feature flag")
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Feature Flags
            </CardTitle>
            <CardDescription>
              Controle de funcionalidades e rollout gradual
            </CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nova Flag
              </Button>
            </DialogTrigger>
            <CreateFlagDialog
              onClose={() => setIsCreateOpen(false)}
              onSuccess={() => {
                setIsCreateOpen(false)
                queryClient.invalidateQueries({ queryKey: ["feature-flags"] })
              }}
            />
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!flags || flags.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Flag className="mx-auto h-12 w-12 opacity-50 mb-4" />
            <p>Nenhuma feature flag configurada</p>
            <p className="text-sm">Crie uma nova flag para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {flags.map((flag) => (
              <div
                key={flag.id}
                className="flex items-start justify-between rounded-lg border p-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{flag.name}</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {flag.key}
                    </Badge>
                    {flag.betaOnly && (
                      <Badge variant="secondary" className="gap-1">
                        <FlaskConical className="h-3 w-3" />
                        Beta
                      </Badge>
                    )}
                  </div>
                  {flag.description && (
                    <p className="text-sm text-muted-foreground">
                      {flag.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {flag.enabledFor.length > 0
                        ? flag.enabledFor
                            .map((r) => ROLES.find((role) => role.value === r)?.label)
                            .join(", ")
                        : "Todos"}
                    </div>
                    {flag.rolloutPercentage < 100 && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Percent className="h-3 w-3" />
                        {flag.rolloutPercentage}% rollout
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingFlag(flag)}
                      >
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    {editingFlag?.id === flag.id && (
                      <EditFlagDialog
                        flag={flag}
                        onClose={() => setEditingFlag(null)}
                        onSuccess={() => {
                          setEditingFlag(null)
                          queryClient.invalidateQueries({ queryKey: ["feature-flags"] })
                        }}
                      />
                    )}
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Tem certeza que deseja remover esta flag?")) {
                        deleteMutation.mutate(flag.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <Switch
                    checked={flag.enabled}
                    onCheckedChange={(enabled) =>
                      toggleMutation.mutate({ id: flag.id, enabled })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CreateFlagDialog({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    key: "",
    name: "",
    description: "",
    enabled: false,
    enabledFor: [] as string[],
    betaOnly: false,
    rolloutPercentage: 100,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/super-admin/system/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to create flag")

      toast.success("Feature flag criada com sucesso")
      onSuccess()
    } catch {
      toast.error("Erro ao criar feature flag")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DialogContent>
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Nova Feature Flag</DialogTitle>
          <DialogDescription>
            Crie uma nova feature flag para controlar funcionalidades
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="key">Chave (identificador)</Label>
            <Input
              id="key"
              placeholder="nova_funcionalidade"
              value={formData.key}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  key: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Nova Funcionalidade"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição da funcionalidade..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Habilitado para (deixe vazio para todos)</Label>
            <div className="flex flex-wrap gap-4">
              {ROLES.map((role) => (
                <div key={role.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role.value}`}
                    checked={formData.enabledFor.includes(role.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          enabledFor: [...formData.enabledFor, role.value],
                        })
                      } else {
                        setFormData({
                          ...formData,
                          enabledFor: formData.enabledFor.filter(
                            (r) => r !== role.value
                          ),
                        })
                      }
                    }}
                  />
                  <Label htmlFor={`role-${role.value}`} className="text-sm">
                    {role.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="betaOnly"
              checked={formData.betaOnly}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, betaOnly: checked as boolean })
              }
            />
            <Label htmlFor="betaOnly">Apenas usuários beta</Label>
          </div>
          <div className="space-y-2">
            <Label>Rollout Gradual: {formData.rolloutPercentage}%</Label>
            <Slider
              value={[formData.rolloutPercentage]}
              onValueChange={([value]) =>
                setFormData({ ...formData, rolloutPercentage: value })
              }
              max={100}
              step={5}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, enabled: checked as boolean })
              }
            />
            <Label htmlFor="enabled">Ativar imediatamente</Label>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar Flag"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

function EditFlagDialog({
  flag,
  onClose,
  onSuccess,
}: {
  flag: FeatureFlag
  onClose: () => void
  onSuccess: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: flag.name,
    description: flag.description || "",
    enabled: flag.enabled,
    enabledFor: flag.enabledFor,
    betaOnly: flag.betaOnly,
    rolloutPercentage: flag.rolloutPercentage,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch(`/api/super-admin/system/features/${flag.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to update flag")

      toast.success("Feature flag atualizada com sucesso")
      onSuccess()
    } catch {
      toast.error("Erro ao atualizar feature flag")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DialogContent>
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Editar Feature Flag</DialogTitle>
          <DialogDescription>
            <Badge variant="outline" className="font-mono">
              {flag.key}
            </Badge>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Habilitado para</Label>
            <div className="flex flex-wrap gap-4">
              {ROLES.map((role) => (
                <div key={role.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-role-${role.value}`}
                    checked={formData.enabledFor.includes(role.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          enabledFor: [...formData.enabledFor, role.value],
                        })
                      } else {
                        setFormData({
                          ...formData,
                          enabledFor: formData.enabledFor.filter(
                            (r) => r !== role.value
                          ),
                        })
                      }
                    }}
                  />
                  <Label htmlFor={`edit-role-${role.value}`} className="text-sm">
                    {role.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-betaOnly"
              checked={formData.betaOnly}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, betaOnly: checked as boolean })
              }
            />
            <Label htmlFor="edit-betaOnly">Apenas usuários beta</Label>
          </div>
          <div className="space-y-2">
            <Label>Rollout Gradual: {formData.rolloutPercentage}%</Label>
            <Slider
              value={[formData.rolloutPercentage]}
              onValueChange={([value]) =>
                setFormData({ ...formData, rolloutPercentage: value })
              }
              max={100}
              step={5}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, enabled: checked as boolean })
              }
            />
            <Label htmlFor="edit-enabled">Ativo</Label>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
