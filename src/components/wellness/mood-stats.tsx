"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Heart,
  Zap,
  Brain,
  Moon,
  Flame,
  Calendar,
  Target
} from "lucide-react"

interface MoodStatsProps {
  statistics: {
    totalEntries: number
    averageMood: number
    averageEnergy: number
    averageAnxiety: number
    averageSleep: number
    currentStreak: number
    mostCommonEmotions: Array<{
      emotion: string
      count: number
      percentage: number
    }>
    mostCommonActivities: Array<{
      activity: string
      count: number
      percentage: number
    }>
  }
  className?: string
}

export function MoodStats({ statistics, className }: MoodStatsProps) {
  const getMoodEmoji = (mood: number) => {
    if (mood >= 9) return "🥳"
    if (mood >= 7) return "😊"
    if (mood >= 5) return "🙂"
    if (mood >= 3) return "😐"
    if (mood >= 1) return "😞"
    return "😢"
  }

  const getEnergyEmoji = (energy: number) => {
    if (energy >= 9) return "⚡"
    if (energy >= 7) return "🔋"
    if (energy >= 5) return "🪫"
    if (energy >= 3) return "😴"
    return "🥱"
  }

  const getAnxietyEmoji = (anxiety: number) => {
    if (anxiety >= 9) return "😱"
    if (anxiety >= 7) return "😰"
    if (anxiety >= 5) return "😟"
    if (anxiety >= 3) return "🤔"
    return "😌"
  }

  const getSleepEmoji = (sleep: number) => {
    if (sleep >= 9) return "😴"
    if (sleep >= 7) return "🌙"
    if (sleep >= 5) return "🛏️"
    if (sleep >= 3) return "🥱"
    return "😵"
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* Average Mood */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Humor Médio</CardTitle>
          <Heart className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">{getMoodEmoji(statistics.averageMood)}</span>
            {statistics.averageMood.toFixed(1)}
          </div>
          <p className="text-xs text-muted-foreground">
            Baseado em {statistics.totalEntries} registros
          </p>
        </CardContent>
      </Card>

      {/* Current Streak */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sequência Atual</CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            {statistics.currentStreak}
          </div>
          <p className="text-xs text-muted-foreground">
            Dias consecutivos
          </p>
        </CardContent>
      </Card>

      {/* Average Energy */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Energia Média</CardTitle>
          <Zap className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-2">
            <span className="text-2xl">{getEnergyEmoji(statistics.averageEnergy)}</span>
            {statistics.averageEnergy.toFixed(1)}
          </div>
          <p className="text-xs text-muted-foreground">
            Nível de energia geral
          </p>
        </CardContent>
      </Card>

      {/* Average Anxiety */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ansiedade Média</CardTitle>
          <Brain className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-2">
            <span className="text-2xl">{getAnxietyEmoji(statistics.averageAnxiety)}</span>
            {statistics.averageAnxiety.toFixed(1)}
          </div>
          <p className="text-xs text-muted-foreground">
            Nível de ansiedade
          </p>
        </CardContent>
      </Card>

      {/* Average Sleep */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sono Médio</CardTitle>
          <Moon className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-2">
            <span className="text-2xl">{getSleepEmoji(statistics.averageSleep)}</span>
            {statistics.averageSleep.toFixed(1)}
          </div>
          <p className="text-xs text-muted-foreground">
            Qualidade do sono
          </p>
        </CardContent>
      </Card>

      {/* Total Entries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
          <Calendar className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-2">
            <span className="text-2xl">📊</span>
            {statistics.totalEntries}
          </div>
          <p className="text-xs text-muted-foreground">
            Registros totais
          </p>
        </CardContent>
      </Card>

      {/* Most Common Emotion */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Emoções Mais Comuns</CardTitle>
          <Heart className="h-4 w-4 text-pink-500" />
        </CardHeader>
        <CardContent>
          {statistics.mostCommonEmotions.length > 0 ? (
            <div className="space-y-2">
              {statistics.mostCommonEmotions.slice(0, 3).map((emotion, index) => (
                <div key={emotion.emotion} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                    </span>
                    <span className="font-medium">{emotion.emotion}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={emotion.percentage} className="w-16 h-2" />
                    <span className="text-sm text-muted-foreground w-8">
                      {emotion.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Registre emoções para ver estatísticas
            </p>
          )}
        </CardContent>
      </Card>

      {/* Most Common Activities */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Atividades Mais Comuns</CardTitle>
          <Target className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          {statistics.mostCommonActivities.length > 0 ? (
            <div className="space-y-2">
              {statistics.mostCommonActivities.slice(0, 3).map((activity, index) => (
                <div key={activity.activity} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {index === 0 ? "🏆" : index === 1 ? "🎖️" : "🏅"}
                    </span>
                    <span className="font-medium">{activity.activity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={activity.percentage} className="w-16 h-2" />
                    <span className="text-sm text-muted-foreground w-8">
                      {activity.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Registre atividades para ver estatísticas
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
