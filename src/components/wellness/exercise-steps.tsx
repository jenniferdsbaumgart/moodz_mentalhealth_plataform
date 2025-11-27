"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"

interface ExerciseStepsProps {
  steps: string[]
  currentStep: number
  onStepChange: (step: number) => void
  onSkip?: () => void
  onComplete?: () => void
  className?: string
}

export function ExerciseSteps({
  steps,
  currentStep,
  onStepChange,
  onSkip,
  onComplete,
  className
}: ExerciseStepsProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const handleStepComplete = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]))
  }

  const handleNext = () => {
    handleStepComplete()
    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1)
    } else {
      onComplete?.()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1)
    }
  }

  const goToStep = (stepIndex: number) => {
    onStepChange(stepIndex)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              Passo {currentStep + 1} de {steps.length}
            </CardTitle>
            <CardDescription>
              Siga as instruções calmamente
            </CardDescription>
          </div>
          <Badge variant="outline">
            {completedSteps.size}/{steps.length} concluídos
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Step */}
        <div className="min-h-[120px] flex items-center justify-center p-6 bg-muted/50 rounded-lg">
          <div className="text-center space-y-2">
            <div className="text-4xl mb-2">
              {completedSteps.has(currentStep) ? "✅" : "👆"}
            </div>
            <p className="text-lg font-medium leading-relaxed">
              {steps[currentStep]}
            </p>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center space-x-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => goToStep(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentStep
                  ? "bg-primary scale-125"
                  : completedSteps.has(index)
                  ? "bg-green-500"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Ir para passo ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex gap-2">
            {onSkip && (
              <Button
                variant="ghost"
                onClick={onSkip}
                size="sm"
              >
                Pular
              </Button>
            )}

            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Concluir
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Tips */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Respire profundamente e foque em cada passo.
            {currentStep > 0 && " Você pode voltar aos passos anteriores se precisar."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
