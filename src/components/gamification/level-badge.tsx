"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface LevelBadgeProps {
  level: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

const levelColors = {
  1: "bg-gray-100 text-gray-800 border-gray-300", // Iniciante
  2: "bg-green-100 text-green-800 border-green-300", // Explorador
  3: "bg-blue-100 text-blue-800 border-blue-300", // Participante
  4: "bg-purple-100 text-purple-800 border-purple-300", // Engajado
  5: "bg-orange-100 text-orange-800 border-orange-300", // Veterano
  6: "bg-pink-100 text-pink-800 border-pink-300", // Mentor
  7: "bg-red-100 text-red-800 border-red-300", // Expert
  8: "bg-yellow-100 text-yellow-800 border-yellow-300", // Mestre
  9: "bg-cyan-100 text-cyan-800 border-cyan-300", // Lenda
  10: "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white border-purple-500", // Iluminado
} as const

const levelEmojis = {
  1: "🌱",
  2: "🧭",
  3: "👥",
  4: "💪",
  5: "🎖️",
  6: "👨‍🏫",
  7: "🎓",
  8: "👑",
  9: "🏆",
  10: "✨",
} as const

const sizeClasses = {
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-lg",
  lg: "w-16 h-16 text-xl",
} as const

export function LevelBadge({
  level,
  size = "md",
  showLabel = false,
  className
}: LevelBadgeProps) {
  const clampedLevel = Math.max(1, Math.min(10, level))
  const colorClass = levelColors[clampedLevel as keyof typeof levelColors]
  const emoji = levelEmojis[clampedLevel as keyof typeof levelEmojis]
  const sizeClass = sizeClasses[size]

  if (showLabel) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "flex items-center gap-2 font-semibold",
          colorClass,
          className
        )}
      >
        <div
          className={cn(
            "rounded-full flex items-center justify-center font-bold",
            sizeClass
          )}
        >
          {level}
        </div>
        <span>Nível {level}</span>
      </Badge>
    )
  }

  return (
    <div
      className={cn(
        "rounded-full border-2 flex items-center justify-center font-bold shadow-sm hover:shadow-md transition-shadow cursor-default",
        sizeClass,
        colorClass,
        className
      )}
      title={`Nível ${level}`}
    >
      {clampedLevel === 10 ? emoji : level}
    </div>
  )
}



