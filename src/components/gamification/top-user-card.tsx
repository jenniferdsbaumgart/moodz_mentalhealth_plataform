"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LevelBadge } from "./level-badge"
import { StreakBadge } from "./streak-display"
import { Crown } from "lucide-react"
import { cn } from "@/lib/utils"

interface TopUserCardProps {
  user: {
    position: number
    userId: string
    name: string
    image?: string
    level: number
    totalPoints: number
    periodPoints: number
    currentStreak: number
  }
  isCurrentUser?: boolean
  className?: string
}

const podiumConfig = {
  1: {
    medal: "🥇",
    color: "from-yellow-400 to-yellow-600",
    bgColor: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20",
    borderColor: "border-yellow-300",
    glow: "shadow-yellow-200/50",
    size: "lg",
  },
  2: {
    medal: "🥈",
    color: "from-gray-300 to-gray-500",
    bgColor: "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20",
    borderColor: "border-gray-300",
    glow: "shadow-gray-200/50",
    size: "md",
  },
  3: {
    medal: "🥉",
    color: "from-orange-400 to-orange-600",
    bgColor: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20",
    borderColor: "border-orange-300",
    glow: "shadow-orange-200/50",
    size: "sm",
  },
} as const

export function TopUserCard({ user, isCurrentUser = false, className }: TopUserCardProps) {
  const config = podiumConfig[user.position as keyof typeof podiumConfig]

  if (!config) return null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        config.bgColor,
        config.borderColor,
        config.glow,
        isCurrentUser && "ring-2 ring-primary ring-offset-2",
        className
      )}
    >
      {/* Medal/Podium Position */}
      <div className="absolute -top-2 -right-2 z-10">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg",
          `bg-gradient-to-r ${config.color} text-white`
        )}>
          {config.medal}
        </div>
      </div>

      <CardContent className="pt-8 pb-6 px-6">
        <div className="text-center space-y-4">
          {/* Avatar */}
          <div className="relative mx-auto">
            <Avatar className={cn(
              "border-4",
              config.borderColor,
              config.glow
            )}>
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className={cn(
                "font-bold text-white",
                `bg-gradient-to-r ${config.color}`
              )}>
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            {/* Crown for 1st place */}
            {user.position === 1 && (
              <div className="absolute -top-2 -right-2">
                <Crown className="w-6 h-6 text-yellow-500" />
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <h3 className="font-bold text-lg truncate" title={user.name}>
              {user.name}
            </h3>
            {isCurrentUser && (
              <Badge variant="secondary" className="mt-1">
                Você
              </Badge>
            )}
          </div>

          {/* Level Badge */}
          <div className="flex justify-center">
            <LevelBadge level={user.level} size="md" />
          </div>

          {/* Points */}
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">
              {user.periodPoints.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              pontos
            </div>
          </div>

          {/* Streak */}
          {user.currentStreak > 0 && (
            <div className="flex justify-center">
              <StreakBadge
                currentStreak={user.currentStreak}
                type="daily"
                className="scale-90"
              />
            </div>
          )}

          {/* Position Badge */}
          <Badge
            variant="outline"
            className={cn(
              "font-bold",
              `border-${config.color.split(' ')[0].replace('from-', '')}-400`,
              `text-${config.color.split(' ')[0].replace('from-', '')}-700`
            )}
          >
            #{user.position} lugar
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
