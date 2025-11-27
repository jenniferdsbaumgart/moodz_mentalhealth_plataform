"use client"

import { LevelBadge } from "./level-badge"
import { LevelProgress } from "./level-progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Star, TrendingUp } from "lucide-react"
import { useGamificationStats } from "@/hooks/use-wellness"

interface PointsDisplayProps {
  compact?: boolean
  showProgress?: boolean
  className?: string
}

export function PointsDisplay({
  compact = false,
  showProgress = true,
  className = ""
}: PointsDisplayProps) {
  const { data: gamificationData } = useGamificationStats()
  const stats = gamificationData?.data

  if (!stats) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="animate-pulse">
          <div className="w-10 h-10 bg-muted rounded-full"></div>
        </div>
        <div className="animate-pulse">
          <div className="w-16 h-4 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  const { totalPoints, currentLevel, levelName, pointsToNextLevel } = stats

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-2 cursor-pointer ${className}`}>
              <LevelBadge level={currentLevel} size="sm" />
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold text-sm">{totalPoints}</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-2">
              <div className="font-medium">Nível {currentLevel}: {levelName}</div>
              <div className="text-sm text-muted-foreground">
                {totalPoints} pontos • {pointsToNextLevel > 0
                  ? `${pointsToNextLevel} para o próximo nível`
                  : "Nível máximo alcançado!"
                }
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Level Badge */}
      <LevelBadge level={currentLevel} />

      {/* Points Info */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span className="font-bold text-lg">{totalPoints.toLocaleString()}</span>
          <Badge variant="outline" className="text-xs">
            Nível {currentLevel}
          </Badge>
        </div>

        {showProgress && pointsToNextLevel > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>{pointsToNextLevel} pontos para o próximo nível</span>
          </div>
        )}

        {showProgress && (
          <LevelProgress
            currentPoints={totalPoints}
            currentLevel={currentLevel}
            compact
            className="mt-2"
          />
        )}
      </div>
    </div>
  )
}
