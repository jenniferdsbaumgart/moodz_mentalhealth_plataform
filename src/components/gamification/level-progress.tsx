"use client"

import { Progress } from "@/components/ui/progress"
import { calculateLevel, getLevelProgress } from "@/lib/gamification/levels"
import { cn } from "@/lib/utils"

interface LevelProgressProps {
  currentPoints: number
  currentLevel?: number
  compact?: boolean
  showDetails?: boolean
  className?: string
}

export function LevelProgress({
  currentPoints,
  currentLevel,
  compact = false,
  showDetails = true,
  className
}: LevelProgressProps) {
  const levelInfo = calculateLevel(currentPoints)
  const actualLevel = currentLevel || (typeof levelInfo === 'number' ? levelInfo : levelInfo.level)
  const progress = getLevelProgress(currentPoints)

  const isMaxLevel = actualLevel >= 10

  if (isMaxLevel) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Nível Máximo Alcançado!</span>
          <span className="text-muted-foreground">🏆</span>
        </div>
        <Progress value={100} className="h-2" />
        {showDetails && (
          <p className="text-xs text-muted-foreground text-center">
            Parabéns! Você alcançou o nível máximo.
          </p>
        )}
      </div>
    )
  }

  if (compact) {
    return (
      <div className={cn("space-y-1", className)}>
        <Progress value={progress.progressPercent} className="h-2" />
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Progress Header */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          Nível {progress.currentLevel.level}: {progress.currentLevel.name}
        </span>
        <span className="text-muted-foreground">
          {progress.pointsInLevel}/{progress.pointsToNext} pontos
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progress.progressPercent} className="h-3" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Nível {progress.currentLevel.level}</span>
          <span>{progress.progressPercent}%</span>
          <span>Nível {progress.currentLevel.level + 1}</span>
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Mais {progress.pointsToNext} pontos para alcançar o próximo nível!
          </p>
        </div>
      )}
    </div>
  )
}



