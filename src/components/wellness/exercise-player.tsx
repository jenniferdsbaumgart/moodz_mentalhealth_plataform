"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExerciseTimer } from "./exercise-timer"
import { ExerciseSteps } from "./exercise-steps"
import { ExerciseComplete } from "./exercise-complete"
import { Breathing478Animation } from "./breathing-animation"
import { Play, Info, ArrowLeft } from "lucide-react"
import { ExerciseCategory, Difficulty } from "@prisma/client"

interface MindfulnessExercise {
  id: string
  title: string
  description: string
  category: ExerciseCategory
  duration: number
  difficulty: Difficulty
  instructions: string[]
  benefits: string[]
  isFeatured: boolean
}

interface ExercisePlayerProps {
  exercise: MindfulnessExercise
  onComplete: (duration: number, rating: number, notes?: string) => Promise<void>
  onBack: () => void
  className?: string
}

type PlayerState = "intro" | "playing" | "completed"

export function ExercisePlayer({
  exercise,
  onComplete,
  onBack,
  className
}: ExercisePlayerProps) {
  const [playerState, setPlayerState] = useState<PlayerState>("intro")
  const [currentStep, setCurrentStep] = useState(0)
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("rest")
  const [breathingTime, setBreathingTime] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  const categoryLabels = {
    BREATHING: "Respiração",
    MEDITATION: "Meditação",
    BODY_SCAN: "Body Scan",
    GROUNDING: "Ancoragem",
    VISUALIZATION: "Visualização",
    RELAXATION: "Relaxamento",
    MINDFUL_MOVEMENT: "Movimento",
  } as const

  const difficultyLabels = {
    BEGINNER: "Iniciante",
    INTERMEDIATE: "Intermediário",
    ADVANCED: "Avançado",
  } as const

  // Breathing animation for breathing exercises
  useEffect(() => {
    if (playerState !== "playing" || exercise.category !== "BREATHING") return

    const breathingCycle = () => {
      if (breathingPhase === "rest") {
        setBreathingPhase("inhale")
        setBreathingTime(0)
      } else if (breathingPhase === "inhale") {
        if (breathingTime >= 4) {
          setBreathingPhase("hold")
          setBreathingTime(0)
        }
      } else if (breathingPhase === "hold") {
        if (breathingTime >= 7) {
          setBreathingPhase("exhale")
          setBreathingTime(0)
        }
      } else if (breathingPhase === "exhale") {
        if (breathingTime >= 8) {
          setBreathingPhase("rest")
          setBreathingTime(0)
        }
      }
    }

    const interval = setInterval(() => {
      setBreathingTime(prev => prev + 1)
      breathingCycle()
    }, 1000)

    return () => clearInterval(interval)
  }, [playerState, exercise.category, breathingPhase, breathingTime])

  const handleStart = () => {
    setPlayerState("playing")
    setCurrentStep(0)
    setCurrentTime(0)
  }

  const handleTimerComplete = () => {
    setPlayerState("completed")
  }

  const handleStepChange = (step: number) => {
    setCurrentStep(step)
  }

  const handleStepSkip = () => {
    if (currentStep < exercise.instructions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setPlayerState("completed")
    }
  }

  const handleExerciseComplete = async (rating: number, notes?: string) => {
    await onComplete(exercise.duration, rating, notes)
  }

  const handleRestart = () => {
    setPlayerState("intro")
    setCurrentStep(0)
    setCurrentTime(0)
    setBreathingPhase("rest")
    setBreathingTime(0)
  }

  const renderIntro = () => (
    <div className="space-y-6">
      {/* Exercise Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-2xl">{exercise.title}</CardTitle>
                {exercise.isFeatured && (
                  <Badge variant="secondary">⭐ Destaque</Badge>
                )}
              </div>
              <CardDescription className="text-base">
                {exercise.description}
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline">
              {categoryLabels[exercise.category]}
            </Badge>
            <Badge variant="outline">
              {exercise.duration} minutos
            </Badge>
            <Badge variant="outline">
              {difficultyLabels[exercise.difficulty]}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              Benefícios
            </h4>
            <ul className="space-y-1">
              {exercise.benefits.map((benefit, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Start Button */}
      <div className="text-center">
        <Button
          onClick={handleStart}
          size="lg"
          className="px-8 py-6 text-lg gap-3"
        >
          <Play className="h-5 w-5" />
          Começar Exercício
        </Button>
        <p className="text-sm text-muted-foreground mt-3">
          Reserve {exercise.duration} minutos para este exercício
        </p>
      </div>
    </div>
  )

  const renderPlaying = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Timer */}
      <div className="lg:col-span-1">
        <ExerciseTimer
          duration={exercise.duration}
          onComplete={handleTimerComplete}
          onTimeUpdate={setCurrentTime}
          autoStart={true}
        />
      </div>

      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Breathing Animation for breathing exercises */}
        {exercise.category === "BREATHING" && (
          <Breathing478Animation
            phase={breathingPhase}
            currentTime={breathingTime}
          />
        )}

        {/* Steps */}
        <ExerciseSteps
          steps={exercise.instructions}
          currentStep={currentStep}
          onStepChange={handleStepChange}
          onSkip={handleStepSkip}
          onComplete={handleTimerComplete}
        />

        {/* Quick Actions */}
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPlayerState("completed")}
            size="sm"
          >
            Concluir Agora
          </Button>
        </div>
      </div>
    </div>
  )

  const renderCompleted = () => (
    <ExerciseComplete
      category={exercise.category}
      duration={exercise.duration}
      pointsAwarded={10 + Math.floor(exercise.duration / 5) * 5} // Base calculation
      onRate={handleExerciseComplete}
      onRestart={handleRestart}
      onBackToLibrary={onBack}
    />
  )

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Biblioteca
        </Button>

        {playerState !== "intro" && (
          <div className="text-center">
            <h1 className="text-2xl font-bold">{exercise.title}</h1>
            <p className="text-muted-foreground">
              {playerState === "playing" && "Exercício em andamento"}
              {playerState === "completed" && "Exercício concluído"}
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      {playerState === "intro" && renderIntro()}
      {playerState === "playing" && renderPlaying()}
      {playerState === "completed" && renderCompleted()}
    </div>
  )
}
