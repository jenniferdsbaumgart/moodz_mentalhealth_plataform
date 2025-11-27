"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, Users, Loader2 } from "lucide-react"

interface JoinButtonProps {
  sessionId: string
  isEnrolled: boolean
  isFull: boolean
  isLive: boolean
  isScheduled: boolean
  onEnrollmentChange?: (enrolled: boolean) => void
}

export function JoinButton({
  sessionId,
  isEnrolled,
  isFull,
  isLive,
  isScheduled,
  onEnrollmentChange
}: JoinButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleJoin = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/sessions/${sessionId}/join`, {
        method: "POST",
      })

      if (response.ok) {
        onEnrollmentChange?.(true)
      } else {
        const data = await response.json()
        alert(data.message || "Erro ao se inscrever")
      }
    } catch (error) {
      console.error("Error joining session:", error)
      alert("Erro ao se inscrever na sessão")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/sessions/${sessionId}/leave`, {
        method: "POST",
      })

      if (response.ok) {
        onEnrollmentChange?.(false)
      } else {
        const data = await response.json()
        alert(data.message || "Erro ao cancelar inscrição")
      }
    } catch (error) {
      console.error("Error leaving session:", error)
      alert("Erro ao cancelar inscrição")
    } finally {
      setIsLoading(false)
    }
  }

  // Estados do botao
  if (isLive) {
    return (
      <Button disabled className="w-full">
        <CheckCircle className="h-4 w-4 mr-2" />
        Sessão em Andamento
      </Button>
    )
  }

  if (!isScheduled) {
    return (
      <Button disabled variant="outline" className="w-full">
        Inscrições Encerradas
      </Button>
    )
  }

  if (isFull && !isEnrolled) {
    return (
      <Button disabled variant="outline" className="w-full">
        <Users className="h-4 w-4 mr-2" />
        Sessão Lotada
      </Button>
    )
  }

  if (isEnrolled) {
    return (
      <div className="space-y-2 w-full">
        <div className="flex items-center justify-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700 dark:text-green-300 font-medium">
            Você está inscrito
          </span>
        </div>
        <Button
          variant="outline"
          onClick={handleLeave}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Cancelando...
            </>
          ) : (
            "Cancelar Inscrição"
          )}
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={handleJoin}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Inscrevendo...
        </>
      ) : (
        "Inscrever-se"
      )}
    </Button>
  )
}
