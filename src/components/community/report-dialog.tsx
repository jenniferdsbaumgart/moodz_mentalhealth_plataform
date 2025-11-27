"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { REPORT_REASONS } from "@/lib/constants/community"
import { createReportSchema, type CreateReportInput } from "@/lib/validations/community"
import { useCreateReport } from "@/hooks/use-reports"
import { Loader2, AlertTriangle } from "lucide-react"

interface ReportDialogProps {
  isOpen: boolean
  onClose: () => void
  postId?: string
  commentId?: string
  contentTitle?: string
}

export function ReportDialog({
  isOpen,
  onClose,
  postId,
  commentId,
  contentTitle
}: ReportDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createReport = useCreateReport()

  const form = useForm<CreateReportInput>({
    resolver: zodResolver(createReportSchema),
    defaultValues: {
      reason: undefined,
      description: "",
      postId,
      commentId,
    },
  })

  const onSubmit = async (data: CreateReportInput) => {
    setIsSubmitting(true)
    try {
      await createReport.mutateAsync({
        ...data,
        postId,
        commentId,
      })
      onClose()
      form.reset()
    } catch {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      form.reset()
    }
  }

  const contentType = postId ? "post" : "comentário"

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Denunciar {contentType}
          </DialogTitle>
          <DialogDescription>
            Ajude-nos a manter a comunidade segura. Por que você está denunciando
            {contentTitle ? ` "${contentTitle}"` : ` este ${contentType}`}?
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Motivo da denúncia *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-2"
                    >
                      {Object.entries(REPORT_REASONS).map(([key, config]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <RadioGroupItem value={key} id={key} />
                          <Label
                            htmlFor={key}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            <div>
                              <div className="font-medium">{config.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {config.description}
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição adicional (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Forneça mais detalhes sobre a denúncia..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    Sobre denúncias
                  </p>
                  <ul className="text-blue-700 dark:text-blue-300 text-xs mt-1 space-y-1">
                    <li>• Todas as denúncias são analisadas por nossa equipe</li>
                    <li>• Denúncias falsas podem resultar em restrições</li>
                    <li>• Você não será identificado para o autor do conteúdo</li>
                  </ul>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !form.watch("reason")}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Denúncia"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
