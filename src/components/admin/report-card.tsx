"use client"

import { useState } from "react"
import { ReportWithContent } from "@/types/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useResolveReport, useAdminPostActions, useBanUser } from "@/hooks/use-admin"
import { REPORT_REASONS, REPORT_STATUS_CONFIG } from "@/lib/constants/community"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  AlertTriangle,
  MessageCircle,
  FileText,
  User,
  CheckCircle,
  Trash2,
  Ban,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

interface ReportCardProps {
  report: ReportWithContent
}

export function ReportCard({ report }: ReportCardProps) {
  const [resolution, setResolution] = useState("")
  const [showDetails, setShowDetails] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const resolveReport = useResolveReport()
  const adminPostActions = useAdminPostActions()
  const banUser = useBanUser()

  const handleAction = async (action: "DISMISS" | "RESOLVE" | "REMOVE_CONTENT" | "BAN_USER") => {
    setIsProcessing(true)
    try {
      if (action === "REMOVE_CONTENT" && report.post) {
        // First delete the content
        await adminPostActions.mutateAsync({
          postId: report.post.id,
          action: "DELETE",
        })
      } else if (action === "BAN_USER") {
        const contentAuthorId = report.post?.authorId || report.comment?.authorId
        if (contentAuthorId) {
          await banUser.mutateAsync({
            userId: contentAuthorId,
            reason: resolution || `Banimento por denúncia: ${REPORT_REASONS[report.reason].label}`,
          })
        }
      }

      // Then resolve the report
      await resolveReport.mutateAsync({
        reportId: report.id,
        action: action === "REMOVE_CONTENT" ? "RESOLVE" : action,
        resolution: resolution || getDefaultResolution(action),
      })
    } catch {
      // Error handled by mutations
    } finally {
      setIsProcessing(false)
    }
  }

  const getDefaultResolution = (action: string) => {
    const actions = {
      DISMISS: "Relatório dispensado - conteúdo considerado apropriado",
      RESOLVE: "Relatório resolvido",
      REMOVE_CONTENT: "Conteúdo removido conforme denúncia",
      BAN_USER: "Usuário banido devido ao conteúdo denunciado",
    }
    return actions[action as keyof typeof actions] || "Relatório resolvido"
  }

  const contentType = report.post ? "Post" : "Comentário"
  const contentAuthor = report.post?.author || report.comment?.author
  const contentTitle = report.post?.title || report.comment?.content.substring(0, 100) + "..."
  const timeAgo = formatDistanceToNow(new Date(report.createdAt), {
    addSuffix: true,
    locale: ptBR
  })

  const statusConfig = REPORT_STATUS_CONFIG[report.status]

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <div>
              <CardTitle className="text-lg">
                Denúncia de {contentType.toLowerCase()}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {REPORT_REASONS[report.reason].label}
                </Badge>
                <span>•</span>
                <span>{timeAgo}</span>
              </CardDescription>
            </div>
          </div>

          <Badge
            variant="outline"
            className="text-xs"
            style={{ borderColor: statusConfig.color, color: statusConfig.color }}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Reporter Info */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Avatar className="h-8 w-8">
            <AvatarImage src={report.reporter.image || ""} />
            <AvatarFallback className="text-xs">
              {report.reporter.name?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">
              Denunciado por: {report.reporter.name || "Usuário"}
            </p>
            {report.description && (
              <p className="text-xs text-muted-foreground mt-1">
                &quot;{report.description}&quot;
              </p>
            )}
          </div>
        </div>

        {/* Content Preview */}
        <div className="border rounded-lg p-3">
          <div className="flex items-start gap-3">
            {report.post ? (
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            ) : (
              <MessageCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium text-sm">{contentTitle}</p>
              {contentAuthor && (
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Autor: {contentAuthor.name || "Anônimo"}
                  </span>
                </div>
              )}
              {report.comment && report.comment.post && (
                <div className="flex items-center gap-2 mt-1">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Em: {report.comment.post.title}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resolution Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Resolução (opcional)
          </label>
          <Textarea
            placeholder="Descreva a ação tomada..."
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleAction("DISMISS")}
            disabled={isProcessing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Dispensar
          </Button>

          <Button
            onClick={() => handleAction("RESOLVE")}
            disabled={isProcessing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Resolver
          </Button>

          <Button
            onClick={() => handleAction("REMOVE_CONTENT")}
            disabled={isProcessing}
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Remover Conteúdo
          </Button>

          <Button
            onClick={() => handleAction("BAN_USER")}
            disabled={isProcessing}
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Ban className="h-4 w-4" />
            )}
            Banir Usuário
          </Button>
        </div>

        {/* Expand/Collapse Details */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-xs text-muted-foreground hover:text-foreground"
        >
          {showDetails ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Ocultar detalhes
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Mostrar detalhes completos
            </>
          )}
        </Button>

        {showDetails && (
          <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
            <p><strong>ID do relatório:</strong> {report.id}</p>
            <p><strong>Data:</strong> {new Date(report.createdAt).toLocaleString("pt-BR")}</p>
            <p><strong>Motivo:</strong> {REPORT_REASONS[report.reason].description}</p>
            {report.post && (
              <>
                <p><strong>Post ID:</strong> {report.post.id}</p>
                <p><strong>Comentários:</strong> {report.post._count?.comments || 0}</p>
                <p><strong>Votos:</strong> {report.post._count?.votes || 0}</p>
              </>
            )}
            {report.comment && (
              <>
                <p><strong>Comentário ID:</strong> {report.comment.id}</p>
                <p><strong>Votos:</strong> {report.comment._count?.votes || 0}</p>
                <p><strong>Respostas:</strong> {report.comment._count?.replies || 0}</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
