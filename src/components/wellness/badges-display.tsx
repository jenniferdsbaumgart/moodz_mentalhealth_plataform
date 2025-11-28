"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Trophy, Star, Lock } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface PatientBadge {
  id: string
  name: string
  title: string
  description: string
  icon: string
  category: string
  unlockedAt: string
  points: number
}

interface BadgesDisplayProps {
  badges: PatientBadge[]
  totalBadges?: number
  className?: string
}

const categoryLabels = {
  MOOD_TRACKING: "Rastreamento de Humor",
  JOURNALING: "Diário",
  MINDFULNESS: "Mindfulness",
  STREAKS: "Sequências",
  ACHIEVEMENT: "Conquistas",
} as const

const categoryColors = {
  MOOD_TRACKING: "bg-blue-100 text-blue-800 border-blue-200",
  JOURNALING: "bg-green-100 text-green-800 border-green-200",
  MINDFULNESS: "bg-purple-100 text-purple-800 border-purple-200",
  STREAKS: "bg-orange-100 text-orange-800 border-orange-200",
  ACHIEVEMENT: "bg-red-100 text-red-800 border-red-200",
} as const

export function BadgesDisplay({ badges, totalBadges = 7, className }: BadgesDisplayProps) {
  const unlockedCount = badges.length
  const completionPercentage = Math.round((unlockedCount / totalBadges) * 100)

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Conquistas
            </CardTitle>
            <CardDescription>
              {unlockedCount} de {totalBadges} badges desbloqueadas
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            {completionPercentage}% concluído
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{unlockedCount}/{totalBadges}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Badges Grid */}
        {badges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {badges.map((badge) => (
              <TooltipProvider key={badge.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <div className="text-center">
                        <div className="font-medium text-sm mb-1">{badge.title}</div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${categoryColors[badge.category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800"}`}
                        >
                          {categoryLabels[badge.category as keyof typeof categoryLabels] || badge.category}
                        </Badge>
                        {badge.points > 0 && (
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-muted-foreground">+{badge.points}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-2">
                      <div className="font-medium">{badge.title}</div>
                      <div className="text-sm text-muted-foreground">{badge.description}</div>
                      <div className="text-xs text-muted-foreground">
                        Desbloqueado em {format(new Date(badge.unlockedAt), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      {badge.points > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs">+{badge.points} pontos</span>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma conquista ainda</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Continue usando o app para desbloquear suas primeiras conquistas!
            </p>
            <div className="flex justify-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>7 badges disponíveis</span>
            </div>
          </div>
        )}

        {/* Recent Badges */}
        {badges.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Conquistas Recentes</h4>
            <div className="space-y-2">
              {badges.slice(0, 3).map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                  <span className="text-xl">{badge.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{badge.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(badge.unlockedAt), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  </div>
                  {badge.points > 0 && (
                    <Badge variant="outline" className="text-xs">
                      +{badge.points}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

