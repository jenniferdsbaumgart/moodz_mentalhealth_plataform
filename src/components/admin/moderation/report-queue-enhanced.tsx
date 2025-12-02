"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  AlertTriangle,
  AlertOctagon,
  MessageSquare,
  FileText,
  User,
  Clock,
  ChevronRight,
  Loader2,
  Filter
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
    title?: string
    content?: string
    author?: {
      id: string
      name: string | null
      image: string | null
    }
  }
}

interface ReportQueueEnhancedProps {
  onSelectReport: (report: Report) => void
  selectedReportId: string | null
}

const priorityOrder: Record<string, number> = {
  SELF_HARM: 1,
  SUICIDE: 1,
  VIOLENCE: 2,
  HATE_SPEECH: 2,
  HARASSMENT: 3,
  INAPPROPRIATE: 4,
  SPAM: 5,
  OTHER: 6
}

const reasonLabels: Record<string, string> = {
  SELF_HARM: "Autolesão",
  SUICIDE: "Suicídio",
  VIOLENCE: "Violência",
  HATE_SPEECH: "Discurso de Ódio",
  HARASSMENT: "Assédio",
  INAPPROPRIATE: "Inapropriado",
  SPAM: "Spam",
  OTHER: "Outro"
}

const getPriorityBadge = (reason: string) => {
  const priority = priorityOrder[reason] || 6
  if (priority <= 1) {
    return <Badge variant="destructive">Crítico</Badge>
  }
  if (priority <= 2) {
    return <Badge className="bg-orange-500">Alto</Badge>
  }
  if (priority <= 4) {
    return <Badge className="bg-yellow-500">Médio</Badge>
  }
  return <Badge variant="secondary">Baixo</Badge>
}

export function ReportQueueEnhanced({ onSelectReport, selectedReportId }: ReportQueueEnhancedProps) {
  const [statusFilter, setStatusFilter] = useState<string>("PENDING")
  const [reasonFilter, setReasonFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports", statusFilter, reasonFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set("page", page.toString())
      params.set("limit", "20")
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (reasonFilter !== "all") params.set("reason", reasonFilter)
      
      const response = await fetch(`/api/admin/reports?${params}`)
      if (!response.ok) throw new Error("Failed to fetch reports")
      return response.json()
    }
  })

  // Claim report for review
  const claimMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await fetch(`/api/admin/reports/${reportId}/claim`, {
        method: "POST"
      })
      if (!response.ok) throw new Error("Failed to claim report")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] })
    }
  })

  // Sort reports by priority
  const sortedReports = [...(data?.reports || [])].sort((a, b) => {
    const priorityA = priorityOrder[a.reason] || 6
    const priorityB = priorityOrder[b.reason] || 6
    if (priorityA !== priorityB) return priorityA - priorityB
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Fila de Reports
        </CardTitle>
        <CardDescription>
          {data?.total || 0} reports {statusFilter !== "all" && `(${statusFilter})`}
        </CardDescription>
      </CardHeader>

      {/* Filters */}
      <div className="px-6 pb-3 flex gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="PENDING">Pendentes</SelectItem>
            <SelectItem value="IN_REVIEW">Em Análise</SelectItem>
            <SelectItem value="RESOLVED">Resolvidos</SelectItem>
            <SelectItem value="DISMISSED">Descartados</SelectItem>
          </SelectContent>
        </Select>

        <Select value={reasonFilter} onValueChange={setReasonFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="SELF_HARM">Autolesão</SelectItem>
            <SelectItem value="SUICIDE">Suicídio</SelectItem>
            <SelectItem value="VIOLENCE">Violência</SelectItem>
            <SelectItem value="HATE_SPEECH">Ódio</SelectItem>
            <SelectItem value="HARASSMENT">Assédio</SelectItem>
            <SelectItem value="INAPPROPRIATE">Inapropriado</SelectItem>
            <SelectItem value="SPAM">Spam</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <CardContent className="flex-1 overflow-hidden p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : sortedReports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum report encontrado
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="divide-y">
              {sortedReports.map((report: Report) => (
                <div
                  key={report.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedReportId === report.id ? "bg-muted" : ""
                  }`}
                  onClick={() => onSelectReport(report)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {report.contentType === "POST" ? (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getPriorityBadge(report.reason)}
                        <Badge variant="outline" className="text-xs">
                          {reasonLabels[report.reason] || report.reason}
                        </Badge>
                      </div>

                      <p className="text-sm font-medium truncate">
                        {report.content?.title || report.content?.content?.slice(0, 50) || "Conteúdo"}
                      </p>

                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>Reportado por {report.reporter.name || "Anônimo"}</span>
                        <span>•</span>
                        <span>{format(new Date(report.createdAt), "dd/MM HH:mm", { locale: ptBR })}</span>
                      </div>

                      {report.status === "PENDING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            claimMutation.mutate(report.id)
                          }}
                          disabled={claimMutation.isPending}
                        >
                          {claimMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : null}
                          Assumir
                        </Button>
                      )}
                    </div>

                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* Pagination */}
      {data?.totalPages > 1 && (
        <div className="p-4 border-t flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="text-sm">
            Página {page} de {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            Próxima
          </Button>
        </div>
      )}
    </Card>
  )
}

