"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface BreathingAnimationProps {
  phase: "inhale" | "hold" | "exhale" | "rest"
  duration: number
  currentTime: number
  instructions: string
  className?: string
}

export function BreathingAnimation({
  phase,
  duration,
  currentTime,
  instructions,
  className
}: BreathingAnimationProps) {

  const circleSize = useMemo(() => {
    // Calculate circle size based on phase
    switch (phase) {
      case "inhale":
        // Expand from 1x to 1.5x
        return 1 + (currentTime / duration) * 0.5
      case "hold":
        // Stay expanded
        return 1.5
      case "exhale":
        // Contract from 1.5x to 1x
        return 1.5 - (currentTime / duration) * 0.5
      case "rest":
        // Stay at minimum
        return 1
      default:
        return 1
    }
  }, [phase, currentTime, duration])

  const getPhaseColor = () => {
    switch (phase) {
      case "inhale":
        return "from-blue-400 to-blue-600"
      case "hold":
        return "from-purple-400 to-purple-600"
      case "exhale":
        return "from-green-400 to-green-600"
      case "rest":
        return "from-gray-400 to-gray-600"
      default:
        return "from-blue-400 to-blue-600"
    }
  }

  const getPhaseEmoji = () => {
    switch (phase) {
      case "inhale":
        return "🌬️"
      case "hold":
        return "⏸️"
      case "exhale":
        return "💨"
      case "rest":
        return "😌"
      default:
        return "🌬️"
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          {/* Instructions */}
          <div className="space-y-2">
            <div className="text-2xl font-medium text-primary">
              {instructions}
            </div>
            <div className="text-sm text-muted-foreground">
              {duration - currentTime}s restantes
            </div>
          </div>

          {/* Breathing Circle */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Outer ring */}
              <div className="w-48 h-48 rounded-full border-4 border-muted flex items-center justify-center">
                {/* Breathing circle */}
                <div
                  className={`w-24 h-24 rounded-full bg-gradient-to-br ${getPhaseColor()} flex items-center justify-center text-white text-3xl transition-all duration-1000 ease-in-out shadow-lg`}
                  style={{
                    transform: `scale(${circleSize})`,
                  }}
                >
                  {getPhaseEmoji()}
                </div>
              </div>

              {/* Phase indicator */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="px-3 py-1 bg-background border rounded-full text-sm font-medium">
                  {phase === "inhale" && "Inspire"}
                  {phase === "hold" && "Segure"}
                  {phase === "exhale" && "Expire"}
                  {phase === "rest" && "Pausa"}
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-xs mx-auto">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>

          {/* Breathing pattern hint */}
          <div className="text-xs text-muted-foreground">
            Respiração 4-7-8: Inspire por 4s → Segure por 7s → Expire por 8s
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Specialized component for 4-7-8 breathing
export function Breathing478Animation({
  phase,
  currentTime,
  className
}: Omit<BreathingAnimationProps, "duration" | "instructions">) {
  const getInstructions = () => {
    switch (phase) {
      case "inhale":
        return "Inspire lentamente pelo nariz"
      case "hold":
        return "Segure a respiração"
      case "exhale":
        return "Expire pela boca fazendo 'whoosh'"
      case "rest":
        return "Pausa antes do próximo ciclo"
      default:
        return "Prepare-se para respirar"
    }
  }

  const getDuration = () => {
    switch (phase) {
      case "inhale":
        return 4
      case "hold":
        return 7
      case "exhale":
        return 8
      case "rest":
        return 2
      default:
        return 4
    }
  }

  return (
    <BreathingAnimation
      phase={phase}
      duration={getDuration()}
      currentTime={currentTime}
      instructions={getInstructions()}
      className={className}
    />
  )
}
