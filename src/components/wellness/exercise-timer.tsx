"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"

interface ExerciseTimerProps {
  duration: number // in minutes
  onComplete: () => void
  onTimeUpdate?: (currentTime: number) => void
  autoStart?: boolean
  className?: string
}

export function ExerciseTimer({
  duration,
  onComplete,
  onTimeUpdate,
  autoStart = false,
  className
}: ExerciseTimerProps) {
  const [isRunning, setIsRunning] = useState(autoStart)
  const [currentTime, setCurrentTime] = useState(0) // in seconds
  const totalSeconds = duration * 60

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && currentTime < totalSeconds) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1
          onTimeUpdate?.(newTime)

          if (newTime >= totalSeconds) {
            setIsRunning(false)
            onComplete()
          }

          return newTime
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, currentTime, totalSeconds, onComplete, onTimeUpdate])

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setCurrentTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = (currentTime / totalSeconds) * 100
  const remainingTime = totalSeconds - currentTime
  const strokeDasharray = 2 * Math.PI * 60 // circumference of circle with r=60
  const strokeDashoffset = strokeDasharray - (progress / 100) * strokeDasharray

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-6">
          {/* Circular Progress */}
          <div className="relative w-32 h-32">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 120 120"
            >
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-muted"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                className="text-primary transition-all duration-1000"
                style={{
                  strokeDasharray,
                  strokeDashoffset,
                }}
              />
            </svg>

            {/* Time display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatTime(remainingTime)}
                </div>
                <div className="text-xs text-muted-foreground">
                  restante
                </div>
              </div>
            </div>
          </div>

          {/* Progress text */}
          <div className="text-center space-y-1">
            <div className="text-sm font-medium">
              {Math.round(progress)}% concluído
            </div>
            <div className="text-xs text-muted-foreground">
              {formatTime(currentTime)} de {formatTime(totalSeconds)}
            </div>
          </div>

          {/* Controls */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTimer}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  {currentTime === 0 ? "Iniciar" : "Continuar"}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={resetTimer}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reiniciar
            </Button>
          </div>

          {/* Quick actions */}
          {progress > 50 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Quase lá! Você está indo muito bem.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
