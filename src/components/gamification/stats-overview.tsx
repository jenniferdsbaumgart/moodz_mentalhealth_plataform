"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LevelBadge } from "./level-badge"
import { PointsDisplay } from "./points-display"
import { Star, Trophy, Flame, Award } from "lucide-react"
import { useGamificationStats } from "@/hooks/use-wellness"
import { useDailyCheckIn } from "@/hooks/use-wellness"

export function StatsOverview() {
  const { data: gamificationData } = useGamificationStats()
  const { data: checkInData } = useDailyCheckIn()

  const stats = gamificationData?.data
  const checkInStats = checkInData?.data

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const {
    totalPoints,
    currentLevel,
    levelName,
    unlockedBadgesCount,
    moodStreak,
    exerciseStreak,
    totalMoodEntries,
    totalJournalEntries,
    totalExercisesCompleted,
  } = stats

  const currentStreak = checkInStats?.currentStreak || 0

  const statCards = [
    {
      title: "Pontos Totais",
      value: totalPoints.toLocaleString(),
      icon: Star,
      description: "Pontos acumulados",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Nível Atual",
      value: (
        <div className="flex items-center gap-2">
          <LevelBadge level={currentLevel} size="sm" />
          <span className="font-bold">{currentLevel}</span>
        </div>
      ),
      icon: Trophy,
      description: levelName,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Sequência Atual",
      value: currentStreak,
      icon: Flame,
      description: `${currentStreak} dias consecutivos`,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Badges Desbloqueados",
      value: unlockedBadgesCount,
      icon: Award,
      description: "Conquistas especiais",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {stat.title}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Estatísticas Detalhadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalMoodEntries}</div>
              <div className="text-sm text-muted-foreground">Registros de Humor</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalJournalEntries}</div>
              <div className="text-sm text-muted-foreground">Entradas no Diário</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalExercisesCompleted}</div>
              <div className="text-sm text-muted-foreground">Exercícios Completados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {moodStreak}/{exerciseStreak}
              </div>
              <div className="text-sm text-muted-foreground">Streaks (Humor/Exercício)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Continue sua jornada!</h3>
              <p className="text-sm text-muted-foreground">
                Registre seu humor, escreva no diário ou complete exercícios para ganhar mais pontos.
              </p>
            </div>
            <PointsDisplay compact />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
