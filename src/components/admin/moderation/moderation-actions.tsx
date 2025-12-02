"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  CheckCircle,
  XCircle,
  Trash2,
  AlertTriangle,
  Ban,
  Clock,
  MessageSquare,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Report {
  id: string
  contentType: "POST" | "COMMENT"
  contentId: string
  reason: string
  status: string
  content?: {
    author?: {
      id: string
      name: string | null
    }
  }
}

interface ModerationActionsProps {
  report: Report
  onActionComplete: () => void
}

type ActionType = "approve" | "dismiss" | "delete" | "warn" | "suspend" | "ban" | null

export function ModerationActions({ report, onActionComplete }: ModerationActionsProps) {
  const queryClient = useQueryClient()
  const [actionType, setActionType] = useState<ActionType>(null)
  const [note, setNote] = useState("")
  const [suspendDays, setSuspendDays] = useState("7")

  // Resolve report (approve = take action, dismiss = no action needed)
  const resolveMutation = useMutation({
    mutationFn: async (params: { action: string; note?: string }) => {
      const response = await fetch(`/api/admin/reports/${report.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      })
      if (!response.ok) throw new Error("Failed to resolve report")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] })
      queryClient.invalidateQueries({ queryKey: ["moderation-stats"] })
      toast.success("Report resolvido com sucesso")
      onActionComplete()
      closeDialog()
    },
    onError: () => toast.error("Erro ao resolver report")
  })

  // Delete content
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const endpoint = report.contentType === "POST"
        ? `/api/admin/posts/${report.contentId}`
        : `/api/admin/comments/${report.contentId}`
      
      const response = await fetch(endpoint, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete content")
      
      // Also resolve the report
      await fetch(`/api/admin/reports/${report.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", note })
      })
      
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] })
      queryClient.invalidateQueries({ queryKey: ["moderation-stats"] })
      toast.success("Conteúdo deletado e report resolvido")
      onActionComplete()
      closeDialog()
    },
    onError: () => toast.error("Erro ao deletar conteúdo")
  })

  // Warn user
  const warnMutation = useMutation({
    mutationFn: async () => {
      if (!report.content?.author?.id) throw new Error("Author not found")
      
      const response = await fetch(`/api/admin/users/${report.content.author.id}/warn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: report.reason,
          message: note,
          reportId: report.id
        })
      })
      if (!response.ok) throw new Error("Failed to warn user")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] })
      queryClient.invalidateQueries({ queryKey: ["moderation-stats"] })
      toast.success("Aviso enviado ao usuário")
      onActionComplete()
      closeDialog()
    },
    onError: () => toast.error("Erro ao enviar aviso")
  })

  // Suspend/Ban user
  const suspendMutation = useMutation({
    mutationFn: async (type: "suspend" | "ban") => {
      if (!report.content?.author?.id) throw new Error("Author not found")
      
      const response = await fetch(`/api/admin/users/${report.content.author.id}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          duration: type === "suspend" ? parseInt(suspendDays) : undefined,
          reason: note || report.reason
        })
      })
      if (!response.ok) throw new Error("Failed to suspend user")
      
      // Also resolve the report
      await fetch(`/api/admin/reports/${report.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: type, note })
      })
      
      return response.json()
    },
    onSuccess: (_, type) => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] })
      queryClient.invalidateQueries({ queryKey: ["moderation-stats"] })
      toast.success(type === "ban" ? "Usuário banido" : "Usuário suspenso")
      onActionComplete()
      closeDialog()
    },
    onError: () => toast.error("Erro na operação")
  })

  const closeDialog = () => {
    setActionType(null)
    setNote("")
    setSuspendDays("7")
  }

  const handleAction = () => {
    switch (actionType) {
      case "approve":
        resolveMutation.mutate({ action: "approve", note })
        break
      case "dismiss":
        resolveMutation.mutate({ action: "dismiss", note })
        break
      case "delete":
        deleteMutation.mutate()
        break
      case "warn":
        warnMutation.mutate()
        break
      case "suspend":
        suspendMutation.mutate("suspend")
        break
      case "ban":
        suspendMutation.mutate("ban")
        break
    }
  }

  const isLoading = resolveMutation.isPending || deleteMutation.isPending || 
                    warnMutation.isPending || suspendMutation.isPending

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActionType("dismiss")}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Descartar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActionType("delete")}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Deletar Conteúdo
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setActionType("warn")}
            disabled={!report.content?.author?.id}
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            Avisar Usuário
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActionType("suspend")}
            disabled={!report.content?.author?.id}
          >
            <Clock className="h-4 w-4 mr-1" />
            Suspender
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setActionType("ban")}
            disabled={!report.content?.author?.id}
          >
            <Ban className="h-4 w-4 mr-1" />
            Banir
          </Button>
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionType !== null} onOpenChange={() => closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "dismiss" && "Descartar Report"}
              {actionType === "delete" && "Deletar Conteúdo"}
              {actionType === "warn" && "Enviar Aviso"}
              {actionType === "suspend" && "Suspender Usuário"}
              {actionType === "ban" && "Banir Usuário"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "dismiss" && "O report será marcado como descartado sem ação."}
              {actionType === "delete" && "O conteúdo será permanentemente removido."}
              {actionType === "warn" && `Um aviso será enviado para ${report.content?.author?.name || "o usuário"}.`}
              {actionType === "suspend" && `${report.content?.author?.name || "O usuário"} será suspenso temporariamente.`}
              {actionType === "ban" && `${report.content?.author?.name || "O usuário"} será banido permanentemente.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionType === "suspend" && (
              <div className="space-y-2">
                <Label>Duração da Suspensão</Label>
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
            )}

            <div className="space-y-2">
              <Label>Nota Interna (opcional)</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Adicione uma nota sobre esta ação..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button
              variant={actionType === "ban" ? "destructive" : "default"}
              onClick={handleAction}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

