"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"

interface StreakDisplayProps {
  currentStreak: number
  longestStreak?: number
  type?: "daily" | "mood" | "exercise"
  size?: "sm" | "md" | "lg"
  showDetails?: boolean
  className?: string
}

const typeLabels = {
  daily: "Check-in Diário",
  mood: "Registro de Humor",
  exercise: "Exercícios",
} as const

const typeEmojis = {
  daily: "🔥",
  mood: "😊",
  exercise: "🧘‍♀️",
} as const

const typeColors = {
  daily: "text-orange-600",
  mood: "text-blue-600",
  exercise: "text-green-600",
} as const

export function StreakDisplay({
  currentStreak,
  longestStreak,
  type = "daily",
  showDetails = false,
  className
}: StreakDisplayProps) {
  const label = typeLabels[type]
  const colorClass = typeColors[type]

  const getStreakIntensity = (streak: number) => {
    if (streak >= 100) return "legendary"
    if (streak >= 30) return "epic"
    if (streak >= 7) return "rare"
    if (streak >= 3) return "uncommon"
    return "common"
  }

  const intensity = getStreakIntensity(currentStreak)
  const intensityEmojis = {
    common: "🔥",
    uncommon: "🔥🔥",
    rare: "🔥🔥🔥",
    epic: "🔥🔥🔥🔥",
    legendary: "🔥🔥🔥🔥🔥",
  }

  if (showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer", className)}>
              <div className="flex items-center gap-2">
                <Flame className={cn("h-5 w-5", colorClass)} />
                <span className="text-lg font-bold">{currentStreak}</span>
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{label}</div>
                <div className="text-xs text-muted-foreground">
                  Sequência atual • Recorde: {longestStreak || currentStreak}
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-2">
              <div className="font-medium">{label}</div>
              <div className="text-sm space-y-1">
                <div>Sequência atual: {currentStreak} dias</div>
                <div>Recorde pessoal: {longestStreak || currentStreak} dias</div>
                <div>Intensidade: {intensity}</div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Flame Icon */}
      <div className="relative">
        <Flame className={cn("h-6 w-6", colorClass)} />
        {currentStreak > 0 && (
          <div className="absolute -top-1 -right-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>
        )}
      </div>

      {/* Streak Number */}
      <span className="font-bold text-lg">{currentStreak}</span>

      {/* Streak Indicator */}
      <div className="flex items-center gap-1">
        {intensityEmojis[intensity].split("").map((fire, index) => (
          <span key={index} className="text-sm animate-pulse" style={{ animationDelay: `${index * 0.1}s` }}>
            {fire}
          </span>
        ))}
      </div>

      {/* Optional Badge */}
      {currentStreak >= 7 && (
        <Badge variant="outline" className="text-xs">
          🔥 {currentStreak >= 30 ? "Épico" : currentStreak >= 100 ? "Lendário" : "Fogo"}
        </Badge>
      )}
    </div>
  )
}

// Compact version for headers
export function StreakBadge({
  currentStreak,
  type = "daily",
  className
}: Omit<StreakDisplayProps, "showDetails" | "size">) {
  const emoji = typeEmojis[type]
  const colorClass = typeColors[type]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-full cursor-pointer", className)}>
            <Flame className={cn("h-4 w-4", colorClass)} />
            <span className="text-sm font-medium">{currentStreak}</span>
            <span className="text-xs">{emoji}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-medium">Sequência de {currentStreak} dias</div>
            <div className="text-sm text-muted-foreground">{typeLabels[type]}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
