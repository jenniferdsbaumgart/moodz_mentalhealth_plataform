"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  FileText,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Info,
  Bug,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface SystemLog {
  id: string
  level: "DEBUG" | "INFO" | "WARN" | "ERROR"
  source: string
  message: string
  metadata: Record<string, any> | null
  createdAt: string
}

interface LogsResponse {
  logs: SystemLog[]
  total: number
  page: number
  limit: number
}

const LEVEL_CONFIG = {
  DEBUG: {
    icon: Bug,
    color: "text-gray-500 bg-gray-500/10",
    label: "Debug",
  },
  INFO: {
    icon: Info,
    color: "text-blue-500 bg-blue-500/10",
    label: "Info",
  },
  WARN: {
    icon: AlertTriangle,
    color: "text-yellow-500 bg-yellow-500/10",
    label: "Aviso",
  },
  ERROR: {
    icon: AlertCircle,
    color: "text-red-500 bg-red-500/10",
    label: "Erro",
  },
}

const SOURCES = [
  { value: "all", label: "Todas as fontes" },
  { value: "cron", label: "Cron Jobs" },
  { value: "api", label: "API" },
  { value: "auth", label: "Autenticação" },
  { value: "email", label: "Email" },
  { value: "push", label: "Push Notifications" },
  { value: "session", label: "Sessões" },
]

export function SystemLogs() {
  const [level, setLevel] = useState<string>("all")
  const [source, setSource] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())

  const {
    data,
    isLoading,
    refetch,
    isFetching,
  } = useQuery<LogsResponse>({
    queryKey: ["system-logs", level, source, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (level !== "all") params.set("level", level)
      if (source !== "all") params.set("source", source)
      if (search) params.set("search", search)
      params.set("limit", "50")

      const res = await fetch(`/api/super-admin/system/logs?${params}`)
      if (!res.ok) throw new Error("Failed to fetch logs")
      return res.json()
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const toggleExpanded = (logId: string) => {
    setExpandedLogs((prev) => {
      const next = new Set(prev)
      if (next.has(logId)) {
        next.delete(logId)
      } else {
        next.add(logId)
      }
      return next
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Logs do Sistema
            </CardTitle>
            <CardDescription>
              Erros, jobs executados e eventos do sistema
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar nos logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="DEBUG">Debug</SelectItem>
              <SelectItem value="INFO">Info</SelectItem>
              <SelectItem value="WARN">Aviso</SelectItem>
              <SelectItem value="ERROR">Erro</SelectItem>
            </SelectContent>
          </Select>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Fonte" />
            </SelectTrigger>
            <SelectContent>
              {SOURCES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Logs List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !data || data.logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 opacity-50 mb-4" />
            <p>Nenhum log encontrado</p>
            <p className="text-sm">Ajuste os filtros ou aguarde novos eventos</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {data.logs.map((log) => {
                const config = LEVEL_CONFIG[log.level]
                const Icon = config.icon
                const isExpanded = expandedLogs.has(log.id)

                return (
                  <div
                    key={log.id}
                    className="rounded-lg border overflow-hidden"
                  >
                    <div
                      className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleExpanded(log.id)}
                    >
                      <div className={cn("rounded-full p-1.5 mt-0.5", config.color)}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {log.source}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(log.createdAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <p className={cn(
                          "text-sm",
                          !isExpanded && "line-clamp-1"
                        )}>
                          {log.message}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {isExpanded && log.metadata && (
                      <div className="border-t bg-muted/30 p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Metadados:
                        </p>
                        <pre className="text-xs bg-background rounded p-2 overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}

        {/* Stats */}
        {data && data.total > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Exibindo {data.logs.length} de {data.total} logs
          </p>
        )}
      </CardContent>
    </Card>
  )
}
