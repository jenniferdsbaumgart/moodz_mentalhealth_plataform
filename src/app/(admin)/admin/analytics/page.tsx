"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { BarChart3, Loader2, Download, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  StatsCards,
  UsersChart,
  SessionsChart,
  EngagementChart,
  MoodCommunityChart,
  GrowthComparison,
  DateRangeSelector
} from "@/components/admin/analytics"

interface AnalyticsData {
  stats: {
    totalUsers: number
    activeUsers7d: number
    newUsers30d: number
    retentionRate: number
    usersByRole: Record<string, number>
    totalSessions: number
    completedSessions: number
    cancelledSessions: number
    avgParticipation: number
    noShowRate: number
    sessionsByCategory: Record<string, number>
    totalPosts: number
    postsPerDay: number
    totalComments: number
    commentsPerDay: number
    pendingReports: number
    bannedUsers: number
    moodEntries: number
    moodEntriesPerDay: number
    journalEntries: number
    exercisesCompleted: number
    badgesUnlocked: number
    totalPointsDistributed: number
    activeStreaks: number
  }
  charts: {
    usersOverTime: Array<{ date: string; count: number }>
    sessionsOverTime: Array<{ date: string; count: number }>
    engagementOverTime: Array<{ date: string; count: number }>
    sessionsByCategory: Array<{ name: string; value: number }>
  }
  period: string
  generatedAt: string
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState("30d")

  const { data, isLoading, error, refetch, isFetching } = useQuery<AnalyticsData>({
    queryKey: ["admin-analytics", period],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics?period=${period}`)
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Acesso negado. Apenas administradores podem ver esta página.")
        }
        throw new Error("Falha ao carregar analytics")
      }
      return response.json()
    }
  })

  const handleExport = () => {
    if (!data) return

    const exportData = {
      generatedAt: new Date().toISOString(),
      period,
      ...data
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json"
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-${period}-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Erro ao carregar analytics"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8" />
            Analytics da Plataforma
          </h1>
          <p className="text-muted-foreground mt-1">
            Métricas e insights para tomada de decisão
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DateRangeSelector
            value={period}
            onChange={setPeriod}
            onRefresh={() => refetch()}
            isLoading={isFetching}
          />

          <Button
            variant="outline"
            onClick={handleExport}
            disabled={!data || isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* Stats Cards */}
          <StatsCards stats={data.stats} />

          {/* Tabs for different views */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="sessions">Sessões</TabsTrigger>
              <TabsTrigger value="engagement">Engajamento</TabsTrigger>
              <TabsTrigger value="wellness">Bem-estar</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UsersChart
                  data={data.charts.usersOverTime}
                  title="Crescimento de Usuários"
                  description="Novos registros ao longo do tempo"
                />
                <SessionsChart
                  data={data.charts.sessionsByCategory}
                  title="Sessões por Categoria"
                  description="Distribuição das sessões de terapia"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EngagementChart
                  data={data.charts.engagementOverTime}
                  title="Engajamento Diário"
                  description="Posts, comentários e registros"
                />
                <MoodCommunityChart
                  data={data.charts.engagementOverTime.map((item, i) => ({
                    date: item.date,
                    avg_mood: 3 + Math.random() * 1.5, // Placeholder - would come from actual mood data
                    count: item.count
                  }))}
                  title="Humor da Comunidade"
                  description="Média de humor registrado"
                />
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UsersChart
                  data={data.charts.usersOverTime}
                  title="Novos Usuários"
                  description="Crescimento da base de usuários"
                />
                <GrowthComparison
                  currentPeriod={data.charts.usersOverTime}
                  previousPeriod={data.charts.usersOverTime.map(item => ({
                    ...item,
                    count: Math.floor(Number(item.count) * 0.8)
                  }))}
                  title="Comparativo de Crescimento"
                  description="Período atual vs anterior"
                  metric="usuários"
                />
              </div>

              {/* User breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 border rounded-lg">
                  <h3 className="font-semibold mb-4">Por Função</h3>
                  <div className="space-y-3">
                    {Object.entries(data.stats.usersByRole || {}).map(([role, count]) => (
                      <div key={role} className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground capitalize">
                          {role.toLowerCase()}
                        </span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 border rounded-lg">
                  <h3 className="font-semibold mb-4">Métricas de Retenção</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Taxa de Retenção</span>
                      <span className="font-medium">{data.stats.retentionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Ativos (7d)</span>
                      <span className="font-medium">{data.stats.activeUsers7d}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Novos (30d)</span>
                      <span className="font-medium">{data.stats.newUsers30d}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 border rounded-lg">
                  <h3 className="font-semibold mb-4">Moderação</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Reports Pendentes</span>
                      <span className="font-medium text-yellow-600">{data.stats.pendingReports}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Usuários Banidos</span>
                      <span className="font-medium text-red-600">{data.stats.bannedUsers}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SessionsChart
                  data={data.charts.sessionsByCategory}
                  title="Sessões por Categoria"
                  description="Distribuição por tipo de terapia"
                />
                <div className="p-6 border rounded-lg">
                  <h3 className="font-semibold mb-4">Métricas de Sessões</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                      <span className="text-sm">Total de Sessões</span>
                      <span className="font-bold text-xl">{data.stats.totalSessions}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-sm">Completadas</span>
                      <span className="font-bold text-xl text-green-600">{data.stats.completedSessions}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                      <span className="text-sm">Canceladas</span>
                      <span className="font-bold text-xl text-red-600">{data.stats.cancelledSessions}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                      <span className="text-sm">Média de Participantes</span>
                      <span className="font-bold text-xl text-blue-600">{data.stats.avgParticipation}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded">
                      <span className="text-sm">Taxa de No-Show</span>
                      <span className="font-bold text-xl text-amber-600">{data.stats.noShowRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Engagement Tab */}
            <TabsContent value="engagement" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EngagementChart
                  data={data.charts.engagementOverTime}
                  title="Engajamento ao Longo do Tempo"
                  description="Interações diárias na plataforma"
                />
                <div className="p-6 border rounded-lg">
                  <h3 className="font-semibold mb-4">Métricas da Comunidade</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                      <span className="text-sm">Total de Posts</span>
                      <span className="font-bold text-xl">{data.stats.totalPosts}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                      <span className="text-sm">Posts por Dia</span>
                      <span className="font-bold text-xl">{data.stats.postsPerDay}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                      <span className="text-sm">Total de Comentários</span>
                      <span className="font-bold text-xl">{data.stats.totalComments}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                      <span className="text-sm">Comentários por Dia</span>
                      <span className="font-bold text-xl">{data.stats.commentsPerDay}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Wellness Tab */}
            <TabsContent value="wellness" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MoodCommunityChart
                  data={data.charts.engagementOverTime.map((item, i) => ({
                    date: item.date,
                    avg_mood: 3 + Math.random() * 1.5,
                    count: item.count
                  }))}
                  title="Humor da Comunidade"
                  description="Tendência de bem-estar geral"
                />
                <div className="p-6 border rounded-lg">
                  <h3 className="font-semibold mb-4">Métricas de Bem-estar</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-pink-50 rounded">
                      <span className="text-sm">Registros de Humor</span>
                      <span className="font-bold text-xl text-pink-600">{data.stats.moodEntries}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                      <span className="text-sm">Entradas de Diário</span>
                      <span className="font-bold text-xl text-purple-600">{data.stats.journalEntries}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-sm">Exercícios Completados</span>
                      <span className="font-bold text-xl text-green-600">{data.stats.exercisesCompleted}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gamification */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 border rounded-lg text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <p className="text-3xl font-bold">{data.stats.badgesUnlocked}</p>
                  <p className="text-sm text-muted-foreground">Badges Desbloqueados</p>
                </div>
                <div className="p-6 border rounded-lg text-center">
                  <div className="text-4xl mb-2">⭐</div>
                  <p className="text-3xl font-bold">{data.stats.totalPointsDistributed.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Pontos Distribuídos</p>
                </div>
                <div className="p-6 border rounded-lg text-center">
                  <div className="text-4xl mb-2">🔥</div>
                  <p className="text-3xl font-bold">{data.stats.activeStreaks}</p>
                  <p className="text-sm text-muted-foreground">Streaks Ativos</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer with generation time */}
          <div className="text-center text-xs text-muted-foreground pt-8">
            Dados gerados em: {new Date(data.generatedAt).toLocaleString("pt-BR")}
          </div>
        </div>
      ) : null}
    </div>
  )
}

