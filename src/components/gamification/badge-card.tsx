"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Lock, Star, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface BadgeCardProps {
  badge: {
    id: string
    name: string
    slug: string
    description: string
    icon: string
    category: string
    rarity: string
    pointsReward: number
    criteriaType?: string
    criteriaValue?: number
  }
  isUnlocked?: boolean
  unlockedAt?: Date
  progress?: {
    current: number
    target: number
    percentage: number
  }
  className?: string
}

const rarityConfig = {
  COMMON: {
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-300",
    badgeColor: "bg-gray-100 text-gray-800",
    label: "Comum",
    glow: "shadow-gray-200/50",
  },
  UNCOMMON: {
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-300",
    badgeColor: "bg-green-100 text-green-800",
    label: "Incomum",
    glow: "shadow-green-200/50",
  },
  RARE: {
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-300",
    badgeColor: "bg-blue-100 text-blue-800",
    label: "Raro",
    glow: "shadow-blue-200/50",
  },
  EPIC: {
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-300",
    badgeColor: "bg-purple-100 text-purple-800",
    label: "Épico",
    glow: "shadow-purple-200/50",
  },
  LEGENDARY: {
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 border-yellow-300",
    borderColor: "border-yellow-400",
    badgeColor: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white",
    label: "Lendário",
    glow: "shadow-yellow-200/50",
  },
} as const

export function BadgeCard({
  badge,
  isUnlocked = false,
  unlockedAt,
  progress,
  className
}: BadgeCardProps) {
  const rarity = rarityConfig[badge.rarity as keyof typeof rarityConfig] || rarityConfig.COMMON

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case "MILESTONE": return "🏆"
      case "COMMUNITY": return "💬"
      case "SESSIONS": return "🤝"
      case "WELLNESS": return "🧘‍♀️"
      case "SOCIAL": return "🤗"
      case "SPECIAL": return "⭐"
      default: return "🏅"
    }
  }

  const getProgressText = () => {
    if (!progress) return null
    return `${progress.current}/${progress.target}`
  }

  const getCriteriaDescription = () => {
    if (!badge.criteriaType || !badge.criteriaValue) return badge.description

    const criteriaDescriptions = {
      user_registered: "Se cadastrar na plataforma",
      days_active: `Ficar ativo por ${badge.criteriaValue} dias`,
      posts_created: `Criar ${badge.criteriaValue} posts`,
      comments_created: `Fazer ${badge.criteriaValue} comentários`,
      sessions_attended: `Participar de ${badge.criteriaValue} sessões`,
      mood_entries: `Registrar humor ${badge.criteriaValue} vezes`,
      journal_entries: `Escrever ${badge.criteriaValue} entradas no diário`,
      exercises_completed: `Completar ${badge.criteriaValue} exercícios`,
      mood_streak: `Manter streak de humor por ${badge.criteriaValue} dias`,
      upvote_received: `Receber ${badge.criteriaValue} upvotes`,
      helpful_answers: `Receber ${badge.criteriaValue} respostas úteis`,
      badges_unlocked: `Desbloquear ${badge.criteriaValue} badges`,
    }

    return criteriaDescriptions[badge.criteriaType as keyof typeof criteriaDescriptions] || badge.description
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={cn(
              "relative overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer",
              isUnlocked ? rarity.glow : "opacity-60 grayscale",
              className
            )}
          >
            <CardContent className="p-4">
              {/* Rarity Badge */}
              <div className="absolute top-2 right-2">
                <Badge className={cn("text-xs font-medium", rarity.badgeColor)}>
                  {rarity.label}
                </Badge>
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-3">
                <div
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center text-3xl border-4 shadow-lg",
                    isUnlocked ? rarity.bgColor : "bg-gray-100",
                    rarity.borderColor
                  )}
                >
                  {isUnlocked ? badge.icon : <Lock className="h-8 w-8 text-gray-400" />}
                </div>
              </div>

              {/* Content */}
              <div className="text-center space-y-2">
                <h3 className={cn(
                  "font-semibold text-sm",
                  isUnlocked ? "text-foreground" : "text-muted-foreground"
                )}>
                  {badge.name}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {isUnlocked ? badge.description : getCriteriaDescription()}
                </p>

                {/* Unlocked Info */}
                {isUnlocked && unlockedAt && (
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(unlockedAt), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                )}

                {/* Progress for Locked Badges */}
                {!isUnlocked && progress && (
                  <div className="space-y-2">
                    <Progress value={progress.percentage} className="h-2" />
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{getProgressText()}</span>
                      <span>{Math.round(progress.percentage)}%</span>
                    </div>
                  </div>
                )}

                {/* Category and Points */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="text-xs">{getCategoryEmoji(badge.category)}</span>
                  {badge.pointsReward > 0 && (
                    <div className="flex items-center gap-1 text-xs text-yellow-600">
                      <Star className="h-3 w-3" />
                      <span>+{badge.pointsReward}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Glow Effect for Legendary */}
              {badge.rarity === "LEGENDARY" && isUnlocked && (
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg animate-pulse" />
              )}
            </CardContent>
          </Card>
        </TooltipTrigger>

        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold">{badge.name}</div>
            <div className="text-sm">{badge.description}</div>
            {isUnlocked && unlockedAt && (
              <div className="text-xs text-muted-foreground">
                Conquistado em {format(new Date(unlockedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>
            )}
            {!isUnlocked && progress && (
              <div className="text-xs">
                Progresso: {progress.current}/{progress.target} ({Math.round(progress.percentage)}%)
              </div>
            )}
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className={rarity.badgeColor}>
                {rarity.label}
              </Badge>
              {badge.pointsReward > 0 && (
                <span className="flex items-center gap-1 text-yellow-600">
                  <Star className="h-3 w-3" />
                  +{badge.pointsReward} pontos
                </span>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
