"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { VideoRoom } from "@/components/video/video-room"
import { useDailyRoom } from "@/lib/daily-client"
import { ReviewPrompt } from "@/components/session/review-prompt"
import { Loader2 } from "lucide-react"

export default function SessionRoomPage() {
  const params = useParams()
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [roomUrl, setRoomUrl] = useState<string | null>(null)
  const [isTherapist, setIsTherapist] = useState(false)
  const [therapistId, setTherapistId] = useState<string>()
  const [isLoadingToken, setIsLoadingToken] = useState(true)
  const [showReviewPrompt, setShowReviewPrompt] = useState(false)
  const [sessionTitle, setSessionTitle] = useState<string>()

  const { room, isLoading: isRoomLoading, error: roomError, joinRoom, leaveRoom } = useDailyRoom(roomUrl)

  useEffect(() => {
    fetchToken()
  }, [params.id])

  const fetchToken = async () => {
    try {
      setIsLoadingToken(true)
      const response = await fetch(`/api/sessions/${params.id}/token`)

      if (response.ok) {
        const data = await response.json()
        setToken(data.data.token)
        setRoomUrl(data.data.roomUrl)
        setIsTherapist(data.data.isTherapist)
        setSessionTitle(data.data.sessionTitle)
      } else {
        const error = await response.json()
        alert(error.message || "Erro ao acessar sala")
        router.push(`/sessions/${params.id}`)
      }
    } catch (error) {
      console.error("Error fetching token:", error)
      alert("Erro ao acessar sala")
      router.push(`/sessions/${params.id}`)
    } finally {
      setIsLoadingToken(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!room || !token) return

    try {
      await joinRoom(token)
    } catch (error) {
      console.error("Error joining room:", error)
      alert("Erro ao entrar na sala")
    }
  }

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom()
      // Show review prompt instead of redirecting immediately
      setShowReviewPrompt(true)
    } catch (error) {
      console.error("Error leaving room:", error)
    }
  }

  const handleReviewComplete = () => {
    setShowReviewPrompt(false)
    router.push(`/sessions/${params.id}`)
  }

  // Show loading while fetching token
  if (isLoadingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Conectando à sala...</p>
        </div>
      </div>
    )
  }

  // Show pre-join screen if room is not connected
  if (!room || !room.participants) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sala de Terapia Virtual
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Você foi convidado para participar desta sessão
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>Sala privada e segura</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
              <span>Chat disponível durante a sessão</span>
            </div>
          </div>

          {roomError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
              <p className="text-sm text-red-700 dark:text-red-300">
                Erro ao conectar: {roomError}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/sessions/${params.id}`)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Voltar
            </button>
            <button
              onClick={handleJoinRoom}
              disabled={isRoomLoading || !!roomError}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRoomLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  Entrando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                  </svg>
                  Entrar na Sala
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show the video room interface
  return (
    <>
      <VideoRoom
        room={room}
        sessionId={params.id}
        onLeave={handleLeaveRoom}
        isTherapist={isTherapist}
        therapistId={therapistId}
      />

      {/* Review Prompt */}
      <ReviewPrompt
        sessionId={params.id}
        isOpen={showReviewPrompt}
        onClose={handleReviewComplete}
        sessionTitle={sessionTitle}
      />
    </>
  )
}
