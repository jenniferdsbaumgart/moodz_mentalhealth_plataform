"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { GroupSession, SessionParticipant, SessionStatus } from "@prisma/client"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Edit,
  Play,
  Square,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Video
} from "lucide-react"
import Link from "next/link"
import { SESSION_CATEGORIES } from "@/lib/constants/session"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface SessionWithDetails extends GroupSession {
  participants: (SessionParticipant & {
    user: {
      id: string
      name: string | null
      image: string | null
    }
  })[]
  _count: {
    participants: number
  }
}

export default function SessionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [session, setSession] = useState<SessionWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchSession()
    }
  }, [params.id])

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setSession(data.data)
      }
    } catch (error) {
      console.error("Error fetching session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const startSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${params.id}/room`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setSession(prev => prev ? { ...prev, ...data.data.session } : null)
        // Optionally redirect to the room
        // router.push(`/sessions/${params.id}/room`)
      } else {
        const error = await response.json()
        alert(error.message || "Erro ao iniciar sessão")
      }
    } catch (error) {
      console.error("Error starting session:", error)
      alert("Erro ao iniciar sessão")
    }
  }

  const updateSessionStatus = async (status: SessionStatus) => {
    try {
      const response = await fetch(`/api/sessions/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchSession() // Refresh data
      }
    } catch (error) {
      console.error("Error updating session status:", error)
    }
  }

  const getStatusBadge = (status: SessionStatus) => {
    const variants = {
      SCHEDULED: "secondary",
      LIVE: "default",
      COMPLETED: "outline",
      CANCELLED: "destructive",
    } as const

    const labels = {
      SCHEDULED: "Agendada",
      LIVE: "Ao Vivo",
      COMPLETED: "Concluída",
      CANCELLED: "Cancelada",
    }

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div>Carregando sessão...</div>
        </div>
      </MainLayout>
    )
  }

  if (!session) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div>Sessão não encontrada</div>
        </div>
      </MainLayout>
    )
  }

  const categoryConfig = SESSION_CATEGORIES[session.category]
  const Icon = categoryConfig.icon

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/therapist/sessions">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{session.title}</h1>
              <p className="text-muted-foreground">
                Detalhes da sessão
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/therapist/sessions/${session.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
            {session.status === "SCHEDULED" && (
              <Button onClick={startSession}>
                <Play className="h-4 w-4 mr-2" />
                Iniciar Sessão
              </Button>
            )}
            {session.status === "LIVE" && (
              <Button onClick={() => updateSessionStatus("COMPLETED")} variant="outline">
                <Square className="h-4 w-4 mr-2" />
                Finalizar Sessão
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <Badge variant="outline">{categoryConfig.label}</Badge>
                  </div>
                  {getStatusBadge(session.status)}
                </div>
                <CardTitle>{session.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{session.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {format(new Date(session.scheduledAt), "PPP 'às' p", { locale: ptBR })}
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    {session.duration} minutos
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    {session._count.participants}/{session.maxParticipants} participantes
                  </div>
                  {session.roomName && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      Sala: {session.roomName}
                    </div>
                  )}
                </div>

                {session.tags && session.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {session.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle>Participantes ({session.participants.length})</CardTitle>
                <CardDescription>
                  Pessoas inscritas nesta sessão
                </CardDescription>
              </CardHeader>
              <CardContent>
                {session.participants.length === 0 ? (
                  <p className="text-muted-foreground">Nenhum participante ainda</p>
                ) : (
                  <div className="space-y-3">
                    {session.participants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={participant.user.image || ""} />
                            <AvatarFallback>
                              {participant.user.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {participant.user.name || "Usuário"}
                          </span>
                        </div>
                        <Badge
                          variant={
                            participant.status === "ATTENDED" ? "default" :
                            participant.status === "CONFIRMED" ? "secondary" :
                            participant.status === "NO_SHOW" ? "destructive" : "outline"
                          }
                        >
                          {participant.status === "ATTENDED" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {participant.status === "NO_SHOW" && <XCircle className="h-3 w-3 mr-1" />}
                          {participant.status === "REGISTERED" && "Inscrito"}
                          {participant.status === "CONFIRMED" && "Confirmado"}
                          {participant.status === "ATTENDED" && "Presente"}
                          {participant.status === "NO_SHOW" && "Faltou"}
                          {participant.status === "CANCELLED" && "Cancelado"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full"
                  onClick={startSession}
                  disabled={session.status !== "SCHEDULED"}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Sessão
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => updateSessionStatus("COMPLETED")}
                  disabled={session.status !== "LIVE"}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Finalizar Sessão
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => updateSessionStatus("CANCELLED")}
                  disabled={session.status === "COMPLETED"}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar Sessão
                </Button>
              </CardContent>
            </Card>

            {session.roomUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Acesso à Sala</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <Link href={`/sessions/${session.id}/room`}>
                      <Video className="h-4 w-4 mr-2" />
                      Entrar na Sala Virtual
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
