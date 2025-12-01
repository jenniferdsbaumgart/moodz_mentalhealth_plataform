"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  AlertTriangle,
  User,
  FileText,
  MessageSquare,
  Clock,
  History,
  Flag,
  ExternalLink,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModerationActions } from "./moderation-actions"
import { UserHistoryCard } from "./user-history-card"

interface Report {
  id: string
  contentType: "POST" | "COMMENT"
  contentId: string
  reason: string
  description: string | null
  status: string
  createdAt: string
  reporter: {
    id: string
    name: string | null
    image: string | null
  }
  content?: {
    id: string
    title?: string
    content?: string
    createdAt?: string
    author?: {
      id: string
      name: string | null
      image: string | null
      email: string
    }
  }
}

interface ReportDetailPanelProps {
  report: Report | null
  onActionComplete: () => void
}

const reasonLabels: Record<string, string> = {
  SELF_HARM: "Autolesão",
  SUICIDE: "Suicídio",
  VIOLENCE: "Violência",
  HATE_SPEECH: "Discurso de Ódio",
  HARASSMENT: "Assédio",
  INAPPROPRIATE: "Conteúdo Inapropriado",
  SPAM: "Spam",
  OTHER: "Outro"
}

export function ReportDetailPanel({ report, onActionComplete }: ReportDetailPanelProps) {
  const [activeTab, setActiveTab] = useState("content")

  // Fetch full content details
  const { data: contentDetails, isLoading: loadingContent } = useQuery({
    queryKey: ["report-content", report?.id],
    queryFn: async () => {
      if (!report) return null
      const response = await fetch(`/api/admin/reports/${report.id}/content`)
      if (!response.ok) throw new Error("Failed to fetch content")
      return response.json()
    },
    enabled: !!report
  })

  // Fetch author history
  const { data: authorHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ["user-moderation-history", report?.content?.author?.id],
    queryFn: async () => {
      if (!report?.content?.author?.id) return null
      const response = await fetch(`/api/admin/users/${report.content.author.id}/activity`)
      if (!response.ok) throw new Error("Failed to fetch history")
      return response.json()
    },
    enabled: !!report?.content?.author?.id
  })

  if (!report) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Selecione um report para ver os detalhes</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Report #{report.id.slice(0, 8)}
            </CardTitle>
            <CardDescription>
              {reasonLabels[report.reason] || report.reason}
            </CardDescription>
          </div>
          <Badge
            variant={
              report.status === "PENDING" ? "destructive" :
              report.status === "IN_REVIEW" ? "outline" :
              report.status === "RESOLVED" ? "default" : "secondary"
            }
          >
            {report.status}
          </Badge>
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-6">
          <TabsList className="w-full">
            <TabsTrigger value="content" className="flex-1">Conteúdo</TabsTrigger>
            <TabsTrigger value="author" className="flex-1">Autor</TabsTrigger>
            <TabsTrigger value="context" className="flex-1">Contexto</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="flex-1 overflow-hidden pt-4">
          <ScrollArea className="h-[400px]">
            {/* Content Tab */}
            <TabsContent value="content" className="m-0">
              <div className="space-y-4">
                {/* Reported Content */}
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    {report.contentType === "POST" ? (
                      <FileText className="h-4 w-4" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {report.contentType === "POST" ? "Post" : "Comentário"} Reportado
                    </span>
                  </div>
                  
                  {report.content?.title && (
                    <h4 className="font-semibold mb-2">{report.content.title}</h4>
                  )}
                  
                  <p className="text-sm whitespace-pre-wrap">
                    {contentDetails?.content || report.content?.content || "Carregando conteúdo..."}
                  </p>

                  {report.content?.createdAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Publicado em {format(new Date(report.content.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  )}
                </div>

                {/* Report Description */}
                {report.description && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Descrição do Report</h4>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                )}

                {/* Reporter Info */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Reportado por</h4>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={report.reporter.image || ""} />
                      <AvatarFallback>{report.reporter.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{report.reporter.name || "Anônimo"}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(report.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Author Tab */}
            <TabsContent value="author" className="m-0">
              {report.content?.author ? (
                <UserHistoryCard
                  user={report.content.author}
                  history={authorHistory}
                  isLoading={loadingHistory}
                />
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Informações do autor não disponíveis
                </div>
              )}
            </TabsContent>

            {/* Context Tab */}
            <TabsContent value="context" className="m-0">
              <div className="space-y-4">
                {loadingContent ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : contentDetails?.context ? (
                  <>
                    {/* Parent post if comment */}
                    {contentDetails.parentPost && (
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Post Original</h4>
                        <p className="font-semibold">{contentDetails.parentPost.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {contentDetails.parentPost.content?.slice(0, 200)}...
                        </p>
                      </div>
                    )}

                    {/* Related comments */}
                    {contentDetails.relatedComments?.length > 0 && (
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Comentários Relacionados</h4>
                        <div className="space-y-2">
                          {contentDetails.relatedComments.map((comment: any) => (
                            <div key={comment.id} className="p-2 bg-muted rounded text-sm">
                              <p className="font-medium text-xs">{comment.author?.name}</p>
                              <p>{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhum contexto adicional disponível
                  </div>
                )}

                {/* Other reports on same content */}
                {contentDetails?.otherReports?.length > 0 && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Flag className="h-4 w-4" />
                      Outros Reports ({contentDetails.otherReports.length})
                    </h4>
                    <div className="space-y-2">
                      {contentDetails.otherReports.map((r: any) => (
                        <div key={r.id} className="flex items-center justify-between text-sm">
                          <span>{reasonLabels[r.reason] || r.reason}</span>
                          <Badge variant="outline">{r.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </CardContent>
      </Tabs>

      {/* Actions */}
      {report.status === "PENDING" || report.status === "IN_REVIEW" ? (
        <div className="p-4 border-t">
          <ModerationActions
            report={report}
            onActionComplete={onActionComplete}
          />
        </div>
      ) : null}
    </Card>
  )
}
