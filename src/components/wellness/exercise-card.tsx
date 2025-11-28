"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Star, Play } from "lucide-react"
import { ExerciseCategory, Difficulty } from "@prisma/client"

interface MindfulnessExercise {
  id: string
  title: string
  description: string
  category: ExerciseCategory
  duration: number
  difficulty: Difficulty
  isFeatured: boolean
}

interface ExerciseCardProps {
  exercise: MindfulnessExercise
  onStart: (exercise: MindfulnessExercise) => void
  className?: string
}

const categoryLabels = {
  BREATHING: "Respiração",
  MEDITATION: "Meditação",
  BODY_SCAN: "Body Scan",
  GROUNDING: "Ancoragem",
  VISUALIZATION: "Visualização",
  RELAXATION: "Relaxamento",
  MINDFUL_MOVEMENT: "Movimento",
} as const

const categoryIcons = {
  BREATHING: "💨",
  MEDITATION: "🧠",
  BODY_SCAN: "👤",
  GROUNDING: "⚓",
  VISUALIZATION: "👁️",
  RELAXATION: "🍃",
  MINDFUL_MOVEMENT: "🏃",
} as const

const difficultyLabels = {
  BEGINNER: "Iniciante",
  INTERMEDIATE: "Intermediário",
  ADVANCED: "Avançado",
} as const

const difficultyColors = {
  BEGINNER: "bg-green-100 text-green-800 border-green-200",
  INTERMEDIATE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ADVANCED: "bg-red-100 text-red-800 border-red-200",
} as const

export function ExerciseCard({ exercise, onStart, className }: ExerciseCardProps) {
  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{categoryIcons[exercise.category]}</span>
            <div>
              <Badge variant="outline" className="text-xs">
                {categoryLabels[exercise.category]}
              </Badge>
              {exercise.isFeatured && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Destaque
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {exercise.duration}min
          </div>
        </div>

        <CardTitle className="text-lg group-hover:text-primary transition-colors">
          {exercise.title}
        </CardTitle>

        <CardDescription className="line-clamp-2">
          {exercise.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={`text-xs ${difficultyColors[exercise.difficulty]}`}
          >
            {difficultyLabels[exercise.difficulty]}
          </Badge>

          <Button
            onClick={() => onStart(exercise)}
            size="sm"
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Começar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

