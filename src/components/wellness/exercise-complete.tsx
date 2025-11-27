"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Star, Trophy, Clock, Target, MessageSquare } from "lucide-react"
import { ExerciseCategory } from "@prisma/client"

interface ExerciseCompleteProps {
  category: ExerciseCategory
  duration: number
  pointsAwarded: number
  onRate: (rating: number, notes?: string) => void
  onRestart?: () => void
  onBackToLibrary?: () => void
  className?: string
}

export function ExerciseComplete({
  category,
  duration,
  pointsAwarded,
  onRate,
  onRestart,
  onBackToLibrary,
  className
}: ExerciseCompleteProps) {
  const [rating, setRating] = useState<number>(0)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onRate(rating, notes.trim() || undefined)
    } finally {
      setIsSubmitting(false)
    }
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Success Animation */}
      <div className="text-center space-y-4">
        <div className="text-8xl animate-bounce">🎉</div>
        <h1 className="text-3xl font-bold text-primary">Parabéns!</h1>
        <p className="text-lg text-muted-foreground">
          Você completou o exercício com sucesso!
        </p>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Seu Desempenho
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-1">
                {duration}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="h-4 w-4" />
                Minutos
              </div>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                +{pointsAwarded}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Target className="h-4 w-4" />
                Pontos
              </div>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {categoryLabels[category]}
              </div>
              <div className="text-sm text-muted-foreground">
                Categoria
              </div>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                ✅
              </div>
              <div className="text-sm text-muted-foreground">
                Concluído
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Como foi sua experiência?
          </CardTitle>
          <CardDescription>
            Avalie o exercício para nos ajudar a melhorar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Sua avaliação</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-colors ${
                    star <= rating
                      ? "text-yellow-400"
                      : "text-gray-300 hover:text-yellow-200"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {rating === 1 && "Não gostei muito"}
              {rating === 2 && "Poderia ser melhor"}
              {rating === 3 && "Foi ok"}
              {rating === 4 && "Gostei bastante"}
              {rating === 5 && "Amei! Foi incrível"}
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Observações (opcional)
            </label>
            <Textarea
              placeholder="Conte-nos o que achou do exercício, se teve alguma dificuldade ou sugestão de melhoria..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onRestart && (
          <Button
            variant="outline"
            onClick={onRestart}
            className="flex-1"
          >
            Fazer Novamente
          </Button>
        )}

        <Button
          variant="outline"
          onClick={onBackToLibrary}
          className="flex-1"
        >
          Biblioteca de Exercícios
        </Button>
      </div>

      {/* Encouragement */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Continue praticando! Cada exercício contribui para seu bem-estar.
        </p>
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-xs">
            🔥 Sequência mantida
          </Badge>
        </div>
      </div>
    </div>
  )
}
