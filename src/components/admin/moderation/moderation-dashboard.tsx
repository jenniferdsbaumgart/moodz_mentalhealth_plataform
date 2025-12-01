"use client"

import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban,
  Shield,
  TrendingUp,
  Users,
  FileText,
  MessageSquare,
  Loader2,
  AlertOctagon
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface ModerationStats {
  overview: {
    pendingReports: number
    inReviewReports: number
    resolvedReports: number
    dismissedReports: number
    totalReports: number
    bannedUsers: number
    suspendedUsers: number
    totalPosts: number
    totalComments: number
  }
  performance: {
    resolvedToday: number
    resolvedThisWeek: number
    avgResolutionTimeHours: number
    resolutionRate: number
  }
  reportsByReason: Array<{ reason: string; count: number }>
  priorityBreakdown: {
    critical: number
    high: number
    medium: number
    low: number
  }
  topModerators: Array<{
    id: string
    name: string
    image: string | null
    actionsCount: number
  }>
}

export function ModerationDashboard() {
  const { data: stats, isLoading, error } = useQuery<ModerationStats>({
    queryKey: ["moderation-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/moderation/stats")
      if (!response.ok) throw new Error("Failed to fetch stats")
      return response.json()
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12 text-red-500">
        Erro ao carregar estatísticas
      </div>
    )
  }

  const priorityTotal = stats.priorityBreakdown.critical + stats.priorityBreakdown.high + 
                        stats.priorityBreakdown.medium + stats.priorityBreakdown.low

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

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {stats.overview.pendingReports}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats.overview.inReviewReports} em análise
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos Hoje</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {stats.performance.resolvedToday}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.performance.resolvedThisWeek} esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {stats.performance.avgResolutionTimeHours}h
            </div>
            <p className="text-xs text-muted-foreground">
              Para resolução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Banidos</CardTitle>
            <Ban className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {stats.overview.bannedUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats.overview.suspendedUsers} suspensos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Priority Queue & Reports by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertOctagon className="h-5 w-5" />
              Fila por Prioridade
            </CardTitle>
            <CardDescription>
              Reports pendentes organizados por severidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600" />
                  <span className="text-sm">Crítico (Autolesão/Suicídio)</span>
                </div>
                <Badge variant="destructive">{stats.priorityBreakdown.critical}</Badge>
              </div>
              {priorityTotal > 0 && (
                <Progress 
                  value={(stats.priorityBreakdown.critical / priorityTotal) * 100} 
                  className="h-2 bg-red-100"
                />
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-sm">Alto (Violência/Ódio)</span>
                </div>
                <Badge className="bg-orange-500">{stats.priorityBreakdown.high}</Badge>
              </div>
              {priorityTotal > 0 && (
                <Progress 
                  value={(stats.priorityBreakdown.high / priorityTotal) * 100} 
                  className="h-2 bg-orange-100"
                />
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Médio (Assédio/Inapropriado)</span>
                </div>
                <Badge className="bg-yellow-500">{stats.priorityBreakdown.medium}</Badge>
              </div>
              {priorityTotal > 0 && (
                <Progress 
                  value={(stats.priorityBreakdown.medium / priorityTotal) * 100} 
                  className="h-2 bg-yellow-100"
                />
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-sm">Baixo (Spam/Outro)</span>
                </div>
                <Badge variant="secondary">{stats.priorityBreakdown.low}</Badge>
              </div>
              {priorityTotal > 0 && (
                <Progress 
                  value={(stats.priorityBreakdown.low / priorityTotal) * 100} 
                  className="h-2 bg-gray-100"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reports by Reason */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Reports por Tipo
            </CardTitle>
            <CardDescription>
              Distribuição de reports pendentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.reportsByReason.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum report pendente
                </p>
              ) : (
                stats.reportsByReason.map((item) => (
                  <div key={item.reason} className="flex items-center justify-between">
                    <span className="text-sm">{reasonLabels[item.reason] || item.reason}</span>
                    <Badge variant="outline">{item.count}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance & Top Moderators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Métricas de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {stats.performance.resolutionRate}%
                </div>
                <p className="text-sm text-muted-foreground">Taxa de Resolução</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {stats.overview.totalReports}
                </div>
                <p className="text-sm text-muted-foreground">Total de Reports</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold">
                  {stats.overview.totalPosts}
                </div>
                <p className="text-sm text-muted-foreground">Posts Ativos</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold">
                  {stats.overview.totalComments}
                </div>
                <p className="text-sm text-muted-foreground">Comentários</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Moderators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Moderadores Mais Ativos
            </CardTitle>
            <CardDescription>
              Últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topModerators.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma ação de moderação registrada
              </p>
            ) : (
              <div className="space-y-3">
                {stats.topModerators.map((mod, index) => (
                  <div key={mod.id} className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={mod.image || ""} />
                      <AvatarFallback>{mod.name?.charAt(0) || "M"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{mod.name}</p>
                    </div>
                    <Badge variant="secondary">{mod.actionsCount} ações</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
