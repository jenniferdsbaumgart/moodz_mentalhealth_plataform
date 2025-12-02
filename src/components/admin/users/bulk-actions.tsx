"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Ban,
  Bell,
  Download,
  MoreHorizontal,
  Shield,
  Trash2,
  UserCheck,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { generateCSV, downloadCSV, formatDateForCSV } from "@/lib/reports/csv"

interface BulkActionsProps {
  selectedIds: string[]
  selectedUsers: Array<{
    id: string
    name: string | null
    email: string
    role: string
    status: string
    createdAt: string
  }>
  onClearSelection: () => void
}

type DialogType = "ban" | "suspend" | "notify" | "role" | null

export function BulkActions({
  selectedIds,
  selectedUsers,
  onClearSelection
}: BulkActionsProps) {
  const queryClient = useQueryClient()
  const [dialogType, setDialogType] = useState<DialogType>(null)
  const [suspendDays, setSuspendDays] = useState("7")
  const [reason, setReason] = useState("")
  const [notifyTitle, setNotifyTitle] = useState("")
  const [notifyMessage, setNotifyMessage] = useState("")
  const [newRole, setNewRole] = useState("")

  const bulkMutation = useMutation({
    mutationFn: async (params: { action: string; data?: any }) => {
      const response = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: params.action,
          userIds: selectedIds,
          data: params.data
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Falha na operação")
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      toast.success(`Operação concluída: ${data.affected} usuários afetados`)
      onClearSelection()
      closeDialog()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const closeDialog = () => {
    setDialogType(null)
    setReason("")
    setSuspendDays("7")
    setNotifyTitle("")
    setNotifyMessage("")
    setNewRole("")
  }

  const handleBan = () => {
    bulkMutation.mutate({
      action: "ban",
      data: { reason }
    })
  }

  const handleUnban = () => {
    bulkMutation.mutate({ action: "unban" })
  }

  const handleSuspend = () => {
    bulkMutation.mutate({
      action: "suspend",
      data: {
        suspendUntil: new Date(Date.now() + parseInt(suspendDays) * 24 * 60 * 60 * 1000).toISOString(),
        reason
      }
    })
  }

  const handleNotify = () => {
    if (!notifyTitle || !notifyMessage) {
      toast.error("Título e mensagem são obrigatórios")
      return
    }
    bulkMutation.mutate({
      action: "notify",
      data: {
        title: notifyTitle,
        message: notifyMessage
      }
    })
  }

  const handleChangeRole = () => {
    if (!newRole) {
      toast.error("Selecione uma função")
      return
    }
    bulkMutation.mutate({
      action: "changeRole",
      data: { role: newRole }
    })
  }

  const handleExport = () => {
    const csv = generateCSV(selectedUsers, [
      { key: "id", header: "ID" },
      { key: "name", header: "Nome" },
      { key: "email", header: "Email" },
      { key: "role", header: "Função" },
      { key: "status", header: "Status" },
      { key: "createdAt", header: "Criado em", formatter: formatDateForCSV }
    ])
    downloadCSV(csv, `usuarios-selecionados-${new Date().toISOString().split("T")[0]}.csv`)
    toast.success("Exportação concluída")
  }

  if (selectedIds.length === 0) return null

  return (
    <>
      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
        <span className="text-sm font-medium">
          {selectedIds.length} usuário{selectedIds.length !== 1 ? "s" : ""} selecionado{selectedIds.length !== 1 ? "s" : ""}
        </span>

        <div className="flex-1" />

        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" />
          Exportar
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setDialogType("notify")}
        >
          <Bell className="h-4 w-4 mr-1" />
          Notificar
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4 mr-1" />
              Mais Ações
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDialogType("role")}>
              <Shield className="h-4 w-4 mr-2" />
              Alterar Função
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDialogType("suspend")}>
              <UserCheck className="h-4 w-4 mr-2" />
              Suspender
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleUnban}>
              <UserCheck className="h-4 w-4 mr-2" />
              Reativar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDialogType("ban")}
              className="text-red-600"
            >
              <Ban className="h-4 w-4 mr-2" />
              Banir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          Limpar seleção
        </Button>
      </div>

      {/* Ban Dialog */}
      <Dialog open={dialogType === "ban"} onOpenChange={() => closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Banir Usuários</DialogTitle>
            <DialogDescription>
              Você está prestes a banir {selectedIds.length} usuário{selectedIds.length !== 1 ? "s" : ""}.
              Esta ação pode ser revertida.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Motivo (opcional)</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explique o motivo do banimento..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleBan}
              disabled={bulkMutation.isPending}
            >
              {bulkMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Banir Usuários
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={dialogType === "suspend"} onOpenChange={() => closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspender Usuários</DialogTitle>
            <DialogDescription>
              Suspender temporariamente {selectedIds.length} usuário{selectedIds.length !== 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Duração</Label>
              <Select value={suspendDays} onValueChange={setSuspendDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 dia</SelectItem>
                  <SelectItem value="3">3 dias</SelectItem>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="14">14 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Motivo (opcional)</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explique o motivo da suspensão..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleSuspend}
              disabled={bulkMutation.isPending}
            >
              {bulkMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Suspender
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notify Dialog */}
      <Dialog open={dialogType === "notify"} onOpenChange={() => closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Notificação</DialogTitle>
            <DialogDescription>
              Enviar notificação para {selectedIds.length} usuário{selectedIds.length !== 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={notifyTitle}
                onChange={(e) => setNotifyTitle(e.target.value)}
                placeholder="Título da notificação"
              />
            </div>
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                placeholder="Conteúdo da notificação..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleNotify}
              disabled={bulkMutation.isPending || !notifyTitle || !notifyMessage}
            >
              {bulkMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={dialogType === "role"} onOpenChange={() => closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Função</DialogTitle>
            <DialogDescription>
              Alterar a função de {selectedIds.length} usuário{selectedIds.length !== 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nova Função</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PATIENT">Paciente</SelectItem>
                  <SelectItem value="THERAPIST">Terapeuta</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleChangeRole}
              disabled={bulkMutation.isPending || !newRole}
            >
              {bulkMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Alterar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

