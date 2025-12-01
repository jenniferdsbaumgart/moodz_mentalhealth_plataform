"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Star, Send, ArrowLeft } from "lucide-react"
import { useMutation } from "@tanstack/react-query"

interface ReviewFormProps {
  sessionId: string
  sessionTitle?: string
  onComplete: () => void
  onCancel: () => void
}

function StarRating({
  rating,
  onRatingChange,
  size = "lg"
}: {
  rating: number
  onRatingChange: (rating: number) => void
  size?: "sm" | "lg"
}) {
  const starSize = size === "sm" ? "h-5 w-5" : "h-8 w-8"

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className={`transition-colors ${
            star <= rating
              ? "text-yellow-400 hover:text-yellow-500"
              : "text-gray-300 hover:text-yellow-400"
          }`}
        >
          <Star className={`${starSize} fill-current`} />
        </button>
      ))}
    </div>
  )
}

const RATING_LABELS = {
  1: "Muito Ruim",
  2: "Ruim",
  3: "Regular",
  4: "Bom",
  5: "Excelente"
}

export function ReviewForm({
  sessionId,
  sessionTitle,
  onComplete,
  onCancel
}: ReviewFormProps) {
  const { data: session } = useSession()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)

  const submitReviewMutation = useMutation({
    mutationFn: async (data: { rating: number; comment: string; isAnonymous: boolean }) => {
      const response = await fetch(`/api/sessions/${sessionId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao enviar avaliação")
      }

      return response.json()
    },
    onSuccess: () => {
      onComplete()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      alert("Por favor, selecione uma avaliação em estrelas")
      return
    }

    submitReviewMutation.mutate({
      rating,
      comment: comment.trim(),
      isAnonymous,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-lg font-semibold">Avaliar Sessão</h3>
          <p className="text-sm text-muted-foreground">
            {sessionTitle || "Sessão de terapia"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            Como foi sua experiência? *
          </Label>
          <div className="flex flex-col items-center gap-3">
            <StarRating rating={rating} onRatingChange={setRating} />
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {RATING_LABELS[rating as keyof typeof RATING_LABELS]}
              </p>
            )}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <Label htmlFor="comment">
            Comentário (opcional)
          </Label>
          <Textarea
            id="comment"
            placeholder="Conte-nos mais sobre sua experiência..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[80px]"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">
            {comment.length}/500 caracteres
          </p>
        </div>

        {/* Anonymous Option */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
          />
          <Label
            htmlFor="anonymous"
            className="text-sm font-normal cursor-pointer"
          >
            Enviar avaliação anonimamente
          </Label>
        </div>

        {!isAnonymous && (
          <p className="text-xs text-muted-foreground">
            Seu nome ({session?.user?.name || "Usuário"}) será exibido junto com a avaliação.
          </p>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={rating === 0 || submitReviewMutation.isPending}
            className="flex-1"
          >
            {submitReviewMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Avaliação
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Privacy Notice */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
        <p className="text-xs text-muted-foreground">
          <strong>Privacidade:</strong> Suas avaliações ajudam a melhorar a qualidade das sessões
          e são compartilhadas apenas com o terapeuta responsável (exceto se marcada como anônima).
        </p>
      </div>
    </div>
  )
}
