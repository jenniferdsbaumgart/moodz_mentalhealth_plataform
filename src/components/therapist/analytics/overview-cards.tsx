"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  Award,
  DollarSign,
  UserCheck,
  Clock
} from "lucide-react"

interface OverviewCardsProps {
  data?: {
    stats?: {
      totalSessions: number
      sessionsThisMonth: number
      sessionsLastMonth: number
      uniquePatients: number
      patientsThisMonth: number
      patientsLastMonth: number
      attendanceRate: number
      averageRating?: number
      growthRate: number
      estimatedRevenue: number
    }
  }
}

export function OverviewCards({ data }: OverviewCardsProps) {
  const stats = data?.stats

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const growthColor = stats.growthRate >= 0 ? "text-green-600" : "text-red-600"
  const growthIcon = stats.growthRate >= 0 ? TrendingUp : TrendingDown

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total de Sessões */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSessions}</div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-muted-foreground">
              {stats.sessionsThisMonth} este mês
            </span>
            {stats.sessionsLastMonth > 0 && (
              <Badge
                variant={stats.sessionsThisMonth > stats.sessionsLastMonth ? "default" : "secondary"}
                className="text-xs"
              >
                {stats.sessionsThisMonth > stats.sessionsLastMonth ? "+" : ""}
                {((stats.sessionsThisMonth - stats.sessionsLastMonth) / stats.sessionsLastMonth * 100).toFixed(1)}%
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pacientes Únicos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pacientes Únicos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.uniquePatients}</div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-muted-foreground">
              {stats.patientsThisMonth} novos este mês
            </span>
            {stats.patientsLastMonth > 0 && (
              <Badge
                variant={stats.patientsThisMonth > stats.patientsLastMonth ? "default" : "secondary"}
                className="text-xs"
              >
                {stats.patientsThisMonth > stats.patientsLastMonth ? "+" : ""}
                {((stats.patientsThisMonth - stats.patientsLastMonth) / stats.patientsLastMonth * 100).toFixed(1)}%
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Taxa de Crescimento */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${growthColor}`}>
            {stats.growthRate > 0 ? "+" : ""}{stats.growthRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Comparado ao mês anterior
          </p>
        </CardContent>
      </Card>

      {/* Receita Estimada */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Receita Estimada</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            R$ {stats.estimatedRevenue.toLocaleString('pt-BR')}
          </div>
          <p className="text-xs text-muted-foreground">
            Baseado em sessões realizadas
          </p>
        </CardContent>
      </Card>

      {/* Taxa de Comparecimento */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Comparecimento</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
          <p className="text-xs text-muted-foreground">
            Taxa média de participação
          </p>
        </CardContent>
      </Card>

      {/* Avaliação Média */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.averageRating ? stats.averageRating.toFixed(1) : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            Baseado em avaliações dos pacientes
          </p>
        </CardContent>
      </Card>

      {/* Pacientes Ativos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">--</div>
          <p className="text-xs text-muted-foreground">
            Sessões nos últimos 30 dias
          </p>
        </CardContent>
      </Card>

      {/* Duração Média */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">-- min</div>
          <p className="text-xs text-muted-foreground">
            Tempo médio das sessões
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
