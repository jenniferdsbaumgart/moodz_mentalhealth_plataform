"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Trophy,
  Target,
  Flame,
  TrendingUp,
  Star,
  Calendar,
  BookOpen,
  Activity,
  Award
} from "lucide-react"

interface GamificationStats {
  points: number
  level: number
  streak: number
  moodStreak: number
  exerciseStreak: number
  totalMoodEntries: number
  totalJournalEntries: number
  totalExercisesCompleted: number
  badges: Array<{
    id: string
    name: string
    title: string
    description: string
    icon: string
    category: string
    unlockedAt: string
    points: number
  }>
}

interface GamificationStatsProps {
  stats: GamificationStats
  className?: string
}

export function GamificationStats({ stats, className }: GamificationStatsProps) {
  const getLevelProgress = () => {
    // Simple level calculation: every 100 points = 1 level
    const pointsForCurrentLevel = (stats.level - 1) * 100
    const pointsForNextLevel = stats.level * 100
    const progress = ((stats.points - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100
    return Math.min(progress, 100)
  }

  const levelProgress = getLevelProgress()
  const pointsToNextLevel = (stats.level * 100) - stats.points

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Level and Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Nível e Pontos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">Nível {stats.level}</div>
              <div className="text-sm text-muted-foreground">
                {stats.points} pontos acumulados
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                Próximo nível em
              </div>
              <div className="text-lg font-semibold text-primary">
                {pointsToNextLevel} pontos
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso para Nível {stats.level + 1}</span>
              <span>{Math.round(levelProgress)}%</span>
            </div>
            <Progress value={levelProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Streaks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Sequências Atuais
          </CardTitle>
          <CardDescription>
            Dias consecutivos de atividade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stats.moodStreak}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Calendar className="h-4 w-4" />
                Registro de Humor
              </div>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {stats.exerciseStreak}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Activity className="h-4 w-4" />
                Exercícios
              </div>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {stats.streak}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Star className="h-4 w-4" />
                Geral
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Resumo de Atividades
          </CardTitle>
          <CardDescription>
            Seu progresso geral na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-lg font-semibold">{stats.totalMoodEntries}</div>
                <div className="text-sm text-muted-foreground">Registros de humor</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <BookOpen className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-lg font-semibold">{stats.totalJournalEntries}</div>
                <div className="text-sm text-muted-foreground">Entradas no diário</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Activity className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-lg font-semibold">{stats.totalExercisesCompleted}</div>
                <div className="text-sm text-muted-foreground">Exercícios concluídos</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Points Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Como Ganhar Pontos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span className="text-sm">Registrar humor</span>
              </div>
              <Badge variant="outline">+10 pontos</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
              <div className="flex items-center gap-3">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-sm">Bônus de sequência diária</span>
              </div>
              <Badge variant="outline">+5 por dia</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-green-500" />
                <span className="text-sm">Entrada no diário</span>
              </div>
              <Badge variant="outline">+15 pontos</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-sm">Entrada longa (&gt;500 palavras)</span>
              </div>
              <Badge variant="outline">+10 bônus</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-purple-500" />
                <span className="text-sm">Completar exercício</span>
              </div>
              <Badge variant="outline">+25 pontos</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-red-500" />
                <span className="text-sm">Conquistar badges</span>
              </div>
              <Badge variant="outline">+pontos variados</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
