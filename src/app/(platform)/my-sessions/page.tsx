"use client"

import { useState, useEffect } from "react"
import { GroupSession, ParticipantStatus } from "@prisma/client"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tab"
import { Calendar, Clock, Users, MapPin, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { SESSION_CATEGORIES } from "@/lib/constants/session"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

interface MySession extends GroupSession {
  participants: {
    status: ParticipantStatus
    joinedAt: Date | null
    leftAt: Date | null
  }[]
  therapist: {
    user: {
      name: string | null
    }
  }
}

export default function MySessionsPage() {
  const [sessions, setSessions] = useState<MySession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMySessions()
  }, [])

  const fetchMySessions = async () => {
    try {
      const response = await fetch("/api/my-sessions")
      if (response.ok) {
        const data = await response.json()
        setSessions(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching my sessions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (session: MySession) => {
    const participant = session.participants[0]

    if (!participant) return null

    switch (participant.status) {
      case "ATTENDED":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Participou
          </Badge>
        )
      case "CONFIRMED":
        return (
          <Badge variant="secondary">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmado
          </Badge>
        )
      case "REGISTERED":
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            Inscrito
          </Badge>
        )
      case "NO_SHOW":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Faltou
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge variant="outline">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelado
          </Badge>
        )
      default:
        return null
    }
  }

  const upcomingSessions = sessions.filter(session =>
    session.status === "SCHEDULED" &&
    session.participants[0]?.status !== "CANCELLED" &&
    new Date(session.scheduledAt) > new Date()
  )

  const pastSessions = sessions.filter(session =>
    session.status === "COMPLETED" ||
    (session.status === "SCHEDULED" && new Date(session.scheduledAt) <= new Date())
  )

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div>Carregando suas sessões...</div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Minhas Sessões</h1>
          <p className="text-muted-foreground">
            Gerencie suas inscrições em sessões de terapia em grupo
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">
              Próximas ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Passadas ({pastSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingSessions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma sessão próxima</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Você não tem sessões agendadas para os próximos dias
                  </p>
                  <Button asChild>
                    <Link href="/sessions">Explorar Sessões</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingSessions.map((session) => {
                  const categoryConfig = SESSION_CATEGORIES[session.category]
                  const Icon = categoryConfig.icon

                  return (
                    <Card key={session.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline">{categoryConfig.label}</Badge>
                          </div>
                          {getStatusBadge(session)}
                        </div>
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {session.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                            {format(new Date(session.scheduledAt), "PPP 'às' p", { locale: ptBR })}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                            {session.duration} minutos
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                            {session.therapist.user.name || "Terapeuta"}
                          </div>
                          {session.roomName && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                              Sala: {session.roomName}
                            </div>
                          )}
                        </div>

                        {session.tags && session.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {session.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button asChild variant="outline" className="flex-1">
                            <Link href={`/sessions/${session.id}`}>
                              Ver Detalhes
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            {pastSessions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma sessão passada</h3>
                  <p className="text-muted-foreground text-center">
                    Suas sessões anteriores aparecerão aqui
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastSessions.map((session) => {
                  const categoryConfig = SESSION_CATEGORIES[session.category]
                  const Icon = categoryConfig.icon

                  return (
                    <Card key={session.id} className="hover:shadow-md transition-shadow opacity-75">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline">{categoryConfig.label}</Badge>
                          </div>
                          {getStatusBadge(session)}
                        </div>
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {session.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                            {format(new Date(session.scheduledAt), "PPP 'às' p", { locale: ptBR })}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                            {session.duration} minutos
                          </div>
                        </div>

                        <Button asChild variant="outline" className="w-full">
                          <Link href={`/sessions/${session.id}`}>
                            Ver Relatório
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
