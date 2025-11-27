"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, Loader2 } from "lucide-react"

interface CancelSessionDialogProps {
  sessionTitle: string
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
}

export function CancelSessionDialog({
  sessionTitle,
  isOpen,
  onClose,
  onConfirm
}: CancelSessionDialogProps) {
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm(reason)
      onClose()
      setReason("")
    } catch (error) {
      console.error("Error canceling session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
      setReason("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Cancelar Sessão
          </DialogTitle>
            <DialogDescription>
            Tem certeza que deseja cancelar a sessão &quot;{sessionTitle}&quot;?
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Motivo do cancelamento (opcional)
            </Label>
            <Textarea
              id="reason"
              placeholder="Explique o motivo do cancelamento para os participantes..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-800 dark:text-red-200 mb-1">
                  Impactos do cancelamento:
                </p>
                <ul className="text-red-700 dark:text-red-300 space-y-1">
                  <li>• Todos os participantes serão notificados</li>
                  <li>• A sala virtual será removida</li>
                  <li>• Participantes poderão solicitar reembolso</li>
                  <li>• A sessão não poderá ser reagendada automaticamente</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Manter Sessão
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cancelando...
              </>
            ) : (
              "Cancelar Sessão"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
