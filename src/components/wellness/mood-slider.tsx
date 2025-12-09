"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { MOOD_LEVELS } from "@/lib/constants/wellness"

interface MoodSliderProps {
  value: number
  onChange: (value: number) => void
  label?: string
  showLabels?: boolean
  size?: "sm" | "md" | "lg"
}

export function MoodSlider({
  value,
  onChange,
  label = "Como você está se sentindo?",
  showLabels = true,
  size = "md"
}: MoodSliderProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)
  const currentMood = MOOD_LEVELS.find(m => m.value === (hoveredValue ?? value))

  const handleValueChange = (values: number[]) => {
    onChange(values[0])
  }

  const sizeClasses = {
    sm: {
      emoji: "text-2xl",
      label: "text-sm",
      card: "p-4",
    },
    md: {
      emoji: "text-3xl",
      label: "text-base",
      card: "p-6",
    },
    lg: {
      emoji: "text-4xl",
      label: "text-lg",
      card: "p-8",
    },
  }

  return (
    <div className="space-y-4">
      {label && (
        <div className="text-center">
          <h3 className="font-semibold text-lg mb-2">{label}</h3>
          <p className="text-muted-foreground text-sm">
            Arraste o slider para selecionar seu humor
          </p>
        </div>
      )}

      <Card>
        <CardContent className={sizeClasses[size].card}>
          {/* Current Mood Display */}
          <div className="text-center mb-6">
            <div className={`text-6xl mb-2 ${sizeClasses[size].emoji}`}>
              {currentMood?.emoji || "😐"}
            </div>
            <div className={`font-medium ${sizeClasses[size].label} mb-1`}>
              {currentMood?.label || "Selecione seu humor"}
            </div>
            <Badge variant="outline" className="text-sm">
              Nível {value}
            </Badge>
          </div>

          {/* Slider */}
          <div className="space-y-4">
            <Slider
              value={[value]}
              onValueChange={handleValueChange}
              onValueCommit={(values) => setHoveredValue(null)}
              onPointerEnter={() => setHoveredValue(value)}
              onPointerLeave={() => setHoveredValue(null)}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />

            {/* Mood Level Indicators */}
            {showLabels && (
              <div className="flex justify-between text-xs text-muted-foreground px-2">
                {MOOD_LEVELS.filter((_, index) => index % 2 === 0).map((mood) => (
                  <div key={mood.value} className="text-center">
                    <div className="text-lg mb-1">{mood.emoji}</div>
                    <div className="text-xs">{mood.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Selection Buttons */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 3, 5, 7, 10].map((level) => {
              const mood = MOOD_LEVELS.find(m => m.value === level)!
              return (
                <button
                  key={level}
                  onClick={() => onChange(level)}
                  className={`p-2 rounded-full transition-all hover:scale-110 ${value === level
                      ? "ring-2 ring-primary ring-offset-2"
                      : "hover:bg-muted"
                    }`}
                  title={mood.label}
                >
                  <span className="text-xl">{mood.emoji}</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



