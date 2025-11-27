"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { MoodChart } from "@/components/wellness/mood-chart"
import { MoodHeatmap } from "@/components/wellness/mood-heatmap"
import { MoodStats } from "@/components/wellness/mood-stats"
import { MoodInsights } from "@/components/wellness/mood-insights"
import { ExportMood } from "@/components/wellness/export-mood"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BarChart3, Calendar, Lightbulb, Download } from "lucide-react"
import Link from "next/link"
import { useMoodStats } from "@/hooks/use-wellness"

export default function MoodStatsPage() {
  const { data: statsData, isLoading, error } = useMoodStats()

  if (isLoading) {
    return (
      <MainLayout>
        <div className="py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error || !statsData?.data) {
    return (
      <MainLayout>
        <div className="py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Erro ao carregar estatísticas</h1>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar os dados de humor. Tente novamente mais tarde.
            </p>
            <Button asChild>
              <Link href="/wellness">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Bem-estar
              </Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  const { statistics, insights, chartData, heatmapData } = statsData.data

  return (
    <MainLayout>
      <div className="py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/wellness">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Bem-estar
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Estatísticas de Humor</h1>
            <p className="text-muted-foreground">
              Analise tendências e padrões do seu bem-estar emocional
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <MoodStats statistics={statistics} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="charts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Gráficos
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="mt-6">
            <MoodChart data={chartData} />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <MoodHeatmap data={heatmapData} />
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <MoodInsights insights={insights} />
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <ExportMood />
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/wellness/mood">
              Registrar Humor Hoje
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/wellness">
              Ver Todas as Funcionalidades
            </Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}
