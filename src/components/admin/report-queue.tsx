"use client"

import { useState } from "react"
import { ReportStatus } from "@prisma/client"
import { ReportCard } from "./report-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useReports } from "@/hooks/use-admin"
import { REPORT_STATUS_CONFIG } from "@/lib/constants/community"
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react"

interface ReportQueueProps {
  initialStatus?: ReportStatus
}

export function ReportQueue({ initialStatus = "PENDING" }: ReportQueueProps) {
  const [status, setStatus] = useState<ReportStatus>(initialStatus)
  const [page, setPage] = useState(1)

  const { data, isLoading, error, refetch } = useReports(status, page, 20)
  const reports = data?.data || []
  const pagination = data?.pagination

  const handleStatusChange = (newStatus: ReportStatus) => {
    setStatus(newStatus)
    setPage(1) // Reset to first page
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Carregando relatórios...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Erro ao carregar relatórios</h3>
        <p className="text-muted-foreground mb-4">
          {error.message || "Tente novamente mais tarde"}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    )
  }

  const statusConfig = REPORT_STATUS_CONFIG[status]

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fila de Moderação</h2>
          <p className="text-muted-foreground">
            Gerencie denúncias e mantenha a comunidade segura
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(REPORT_STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(REPORT_STATUS_CONFIG).map(([key, config]) => (
          <div
            key={key}
            className={`p-4 rounded-lg border ${status === key
                ? "border-primary bg-primary/5"
                : "border-border bg-card"
              }`}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-sm font-medium">{config.label}</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {/* TODO: Get actual counts from API */}
              {key === "PENDING" ? "12" : key === "REVIEWING" ? "3" : key === "RESOLVED" ? "45" : "8"}
            </p>
          </div>
        ))}
      </div>

      {/* Reports list */}
      {reports.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Nenhum relatório {statusConfig.label.toLowerCase()}
          </h3>
          <p className="text-muted-foreground">
            {status === "PENDING"
              ? "Todos os relatórios foram processados!"
              : `Não há relatórios com status ${statusConfig.label.toLowerCase()}`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report: any) => (
            <ReportCard key={report.id} report={report} />
          ))}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={!pagination.hasPrev}
              >
                Anterior
              </Button>

              <span className="text-sm text-muted-foreground">
                Página {page} de {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={!pagination.hasNext}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}



