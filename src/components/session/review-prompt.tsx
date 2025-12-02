"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Star, MessageCircle, X } from "lucide-react"
import { ReviewForm } from "./review-form"

interface ReviewPromptProps {
  sessionId: string
  isOpen: boolean
  onClose: () => void
  sessionTitle?: string
}

export function ReviewPrompt({
  sessionId,
  isOpen,
  onClose,
  sessionTitle
}: ReviewPromptProps) {
  const { data: session } = useSession()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)

  // Check if user has already reviewed this session
  useEffect(() => {
    if (isOpen && sessionId) {
      checkReviewStatus()
    }
  }, [isOpen, sessionId])

  const checkReviewStatus = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/review/status`)
      if (response.ok) {
        const data = await response.json()
        setHasReviewed(data.data?.hasReviewed || false)
      }
    } catch (error) {
      console.error("Error checking review status:", error)
    }
  }

  const handleReviewLater = () => {
    // Store preference to not show again for this session
    localStorage.setItem(`review-prompt-${sessionId}`, 'dismissed')
    onClose()
  }

  const handleStartReview = () => {
    setShowReviewForm(true)
  }

  const handleReviewComplete = () => {
    setHasReviewed(true)
    setShowReviewForm(false)
    onClose()
  }

  if (hasReviewed) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {!showReviewForm ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Avalie a Sessão
              </DialogTitle>
              <DialogDescription>
                Sua opinião é muito importante para nós! Ajude-nos a melhorar
                compartilhando sua experiência com a sessão.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">
                      Sessão Concluída
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      {sessionTitle || "Sessão de terapia em grupo"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Leva menos de 1 minuto e ajuda outros pacientes a escolherem sessões melhores.
                </p>

                <div className="flex gap-3 justify-center">
                  <Button onClick={handleStartReview}>
                    <Star className="h-4 w-4 mr-2" />
                    Avaliar Agora
                  </Button>
                  <Button variant="outline" onClick={handleReviewLater}>
                    <X className="h-4 w-4 mr-2" />
                    Talvez Depois
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <ReviewForm
            sessionId={sessionId}
            sessionTitle={sessionTitle}
            onComplete={handleReviewComplete}
            onCancel={() => setShowReviewForm(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

