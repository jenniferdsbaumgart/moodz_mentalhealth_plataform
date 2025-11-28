"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Plus } from "lucide-react"
import { TherapistSessionCard } from "@/components/sessions/therapist-session-card"
import { CancelSessionDialog } from "@/components/sessions/cancel-session-dialog"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface SessionData {
  id: string
  title: string
  category: string
  scheduledAt: string
  duration: number
  maxParticipants: number
  status: string
  participants: Array<{
    id: string
    status: string
  }>
  coverImage?: string | null
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancelDialog, setCancelDialog] = useState<{
    isOpen: boolean
    sessionId: string
    sessionTitle: string
  }>({ isOpen: false, sessionId: "", sessionTitle: "" })
  const router = useRouter()

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions")
      if (response.ok) {
        const data = await response.json()
        setSessions(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast.error("Erro ao carregar sessões")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "LIVE" }),
      })

      if (response.ok) {
        toast.success("Sessão iniciada com sucesso!")
        fetchSessions()
        // Redirect to session room
        router.push(`/sessions/${sessionId}/room`)
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao iniciar sessão")
      }
    } catch (error) {
      console.error("Error starting session:", error)
      toast.error("Erro ao iniciar sessão")
    }
  }

  const handleCancelSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      setCancelDialog({
        isOpen: true,
        sessionId,
        sessionTitle: session.title
      })
    }
  }

  const handleConfirmCancel = async (reason: string) => {
    try {
      const response = await fetch(`/api/sessions/${cancelDialog.sessionId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "CANCELLED", reason }),
      })

      if (response.ok) {
        toast.success("Sessão cancelada com sucesso")
        fetchSessions()
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao cancelar sessão")
      }
    } catch (error) {
      console.error("Error canceling session:", error)
      toast.error("Erro ao cancelar sessão")
    }
  }

  const handleEditSession = (sessionId: string) => {
    router.push(`/therapist/sessions/${sessionId}/edit`)
  }

  const handleViewDetails = (sessionId: string) => {
    router.push(`/therapist/sessions/${sessionId}`)
  }

  const handleViewParticipants = (sessionId: string) => {
    router.push(`/therapist/sessions/${sessionId}?tab=participants`)
  }

  // Separate sessions into upcoming and past
  const now = new Date()
  const upcomingSessions = sessions.filter(session =>
    new Date(session.scheduledAt) >= now ||
    session.status === "LIVE"
  )
  const pastSessions = sessions.filter(session =>
    new Date(session.scheduledAt) < now &&
    session.status !== "LIVE"
  )

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div>Carregando sessões...</div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Minhas Sessões</h1>
            <p className="text-muted-foreground">
              Gerencie suas sessões de terapia em grupo
            </p>
          </div>
          <Button asChild>
            <Link href="/therapist/sessions/new">
              <Plus className="h-4 w-4 mr-2" />
              Nova Sessão
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">
              Próximas ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Anteriores ({pastSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingSessions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma sessão próxima</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Você não tem sessões agendadas ou ao vivo no momento
                  </p>
                  <Button asChild>
                    <Link href="/therapist/sessions/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Nova Sessão
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingSessions.map((session) => (
                  <TherapistSessionCard
                    key={session.id}
                    session={session}
                    onStartSession={handleStartSession}
                    onEditSession={handleEditSession}
                    onViewParticipants={handleViewParticipants}
                    onCancelSession={handleCancelSession}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastSessions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma sessão anterior</h3>
                  <p className="text-muted-foreground text-center">
                    Suas sessões concluídas aparecerão aqui
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastSessions.map((session) => (
                  <TherapistSessionCard
                    key={session.id}
                    session={session}
                    onStartSession={handleStartSession}
                    onEditSession={handleEditSession}
                    onViewParticipants={handleViewParticipants}
                    onCancelSession={handleCancelSession}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <CancelSessionDialog
          sessionId={cancelDialog.sessionId}
          sessionTitle={cancelDialog.sessionTitle}
          isOpen={cancelDialog.isOpen}
          onClose={() => setCancelDialog({ isOpen: false, sessionId: "", sessionTitle: "" })}
          onConfirm={handleConfirmCancel}
        />
      </div>
    </MainLayout>
  )
}
