"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  History,
  User,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Trash2,
  AlertTriangle,
  Ban,
  Shield
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"

interface ModerationLogEntry {
  id: string
  action: string
  entityType: string
  entityId: string
  details: string
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
    email: string
  }
}

const actionLabels: Record<string, { label: string; icon: any; color: string }> = {
  RESOLVE_REPORT: { label: "Report Resolvido", icon: CheckCircle, color: "text-green-500" },
  DISMISS_REPORT: { label: "Report Descartado", icon: XCircle, color: "text-gray-500" },
  DELETE_POST: { label: "Post Deletado", icon: Trash2, color: "text-red-500" },
  DELETE_COMMENT: { label: "Comentário Deletado", icon: Trash2, color: "text-red-500" },
  BAN: { label: "Usuário Banido", icon: Ban, color: "text-red-600" },
  SUSPEND: { label: "Usuário Suspenso", icon: AlertTriangle, color: "text-orange-500" },
  UNBAN: { label: "Usuário Reativado", icon: CheckCircle, color: "text-green-500" },
  WARN: { label: "Aviso Enviado", icon: AlertTriangle, color: "text-yellow-500" },
  CHANGE_ROLE: { label: "Função Alterada", icon: Shield, color: "text-purple-500" },
  BULK_BAN: { label: "Ban em Massa", icon: Ban, color: "text-red-600" },
  BULK_SUSPEND: { label: "Suspensão em Massa", icon: AlertTriangle, color: "text-orange-500" }
}

export function ModerationLog() {
  const [page, setPage] = useState(1)
  const [moderatorFilter, setModeratorFilter] = useState<string>("all")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const { data, isLoading } = useQuery({
    queryKey: ["moderation-log", page, moderatorFilter, actionFilter, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set("page", page.toString())
      params.set("limit", "20")
      if (moderatorFilter !== "all") params.set("moderatorId", moderatorFilter)
      if (actionFilter !== "all") params.set("action", actionFilter)
      if (dateRange?.from) params.set("startDate", dateRange.from.toISOString())
      if (dateRange?.to) params.set("endDate", dateRange.to.toISOString())
      
      const response = await fetch(`/api/admin/moderation/log?${params}`)
      if (!response.ok) throw new Error("Failed to fetch logs")
      return response.json()
    }
  })

  const logs = data?.logs || []
  const moderators = data?.moderators || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Log de Moderação
        </CardTitle>
        <CardDescription>
          Histórico de todas as ações de moderação
        </CardDescription>
      </CardHeader>

      {/* Filters */}
      <div className="px-6 pb-4 flex flex-wrap gap-3">
        <Select value={moderatorFilter} onValueChange={setModeratorFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Moderador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos moderadores</SelectItem>
            {moderators.map((mod: any) => (
              <SelectItem key={mod.id} value={mod.id}>
                {mod.name || mod.id.slice(0, 8)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas ações</SelectItem>
            <SelectItem value="RESOLVE_REPORT">Reports Resolvidos</SelectItem>
            <SelectItem value="DISMISS_REPORT">Reports Descartados</SelectItem>
            <SelectItem value="DELETE_POST">Posts Deletados</SelectItem>
            <SelectItem value="DELETE_COMMENT">Comentários Deletados</SelectItem>
            <SelectItem value="BAN">Banimentos</SelectItem>
            <SelectItem value="SUSPEND">Suspensões</SelectItem>
            <SelectItem value="WARN">Avisos</SelectItem>
          </SelectContent>
        </Select>

        <DatePickerWithRange
          date={dateRange}
          onDateChange={setDateRange}
          className="w-[280px]"
        />
      </div>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma ação registrada
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log: ModerationLogEntry) => {
              const actionConfig = actionLabels[log.action] || {
                label: log.action,
                icon: History,
                color: "text-gray-500"
              }
              const Icon = actionConfig.icon
              let details: any = {}
              try {
                details = JSON.parse(log.details || "{}")
              } catch {}

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <div className={`mt-1 ${actionConfig.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{actionConfig.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {log.entityType}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={log.user.image || ""} />
                        <AvatarFallback className="text-xs">
                          {log.user.name?.charAt(0) || "M"}
                        </AvatarFallback>
                      </Avatar>
                      <span>{log.user.name || "Moderador"}</span>
                      <span>•</span>
                      <span>
                        {format(new Date(log.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>

                    {details.reason && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Motivo: {details.reason}
                      </p>
                    )}
                    {details.note && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Nota: {details.note}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page} de {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

