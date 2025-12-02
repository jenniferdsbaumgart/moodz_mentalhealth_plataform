"use client"

import {
  Users,
  Calendar,
  MessageSquare,
  Heart,
  Trophy,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  UserCheck,
  UserX
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardsProps {
  stats: {
    totalUsers: number
    activeUsers7d: number
    newUsers30d: number
    retentionRate: number
    totalSessions: number
    completedSessions: number
    avgParticipation: number
    noShowRate: number
    totalPosts: number
    postsPerDay: number
    pendingReports: number
    bannedUsers: number
    moodEntries: number
    journalEntries: number
    badgesUnlocked: number
    totalPointsDistributed: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total de Usuários",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      description: `${stats.newUsers30d} novos nos últimos 30 dias`,
      trend: stats.newUsers30d > 0 ? "up" : "neutral",
      color: "text-blue-600"
    },
    {
      title: "Usuários Ativos (7d)",
      value: stats.activeUsers7d.toLocaleString(),
      icon: UserCheck,
      description: `${stats.retentionRate}% taxa de retenção`,
      trend: stats.retentionRate > 50 ? "up" : "down",
      color: "text-green-600"
    },
    {
      title: "Sessões Realizadas",
      value: stats.completedSessions.toLocaleString(),
      icon: Calendar,
      description: `${stats.avgParticipation} participantes em média`,
      trend: "neutral",
      color: "text-purple-600"
    },
    {
      title: "Taxa de No-Show",
      value: `${stats.noShowRate}%`,
      icon: stats.noShowRate > 20 ? TrendingDown : TrendingUp,
      description: `${stats.totalSessions - stats.completedSessions} sessões não completadas`,
      trend: stats.noShowRate > 20 ? "down" : "up",
      color: stats.noShowRate > 20 ? "text-red-600" : "text-green-600"
    },
    {
      title: "Posts na Comunidade",
      value: stats.totalPosts.toLocaleString(),
      icon: MessageSquare,
      description: `${stats.postsPerDay} posts por dia`,
      trend: stats.postsPerDay > 1 ? "up" : "neutral",
      color: "text-indigo-600"
    },
    {
      title: "Reports Pendentes",
      value: stats.pendingReports.toLocaleString(),
      icon: AlertTriangle,
      description: `${stats.bannedUsers} usuários banidos`,
      trend: stats.pendingReports > 10 ? "down" : "up",
      color: stats.pendingReports > 10 ? "text-red-600" : "text-yellow-600"
    },
    {
      title: "Registros de Humor",
      value: stats.moodEntries.toLocaleString(),
      icon: Heart,
      description: `${stats.journalEntries} entradas de diário`,
      trend: "neutral",
      color: "text-pink-600"
    },
    {
      title: "Badges Desbloqueados",
      value: stats.badgesUnlocked.toLocaleString(),
      icon: Trophy,
      description: `${stats.totalPointsDistributed.toLocaleString()} pontos distribuídos`,
      trend: "up",
      color: "text-amber-600"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {card.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
              {card.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

