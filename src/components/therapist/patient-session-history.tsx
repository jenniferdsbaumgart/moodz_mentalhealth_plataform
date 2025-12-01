"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Loader2,
} from "lucide-react"
import { format, isAfter, isBefore } from "date-fns"
import { ptBR } from "date-fns/locale"

interface PatientSessionHistoryProps {
  patientId: string
}

interface Session {
  id: string
  title: string
  description: string
  scheduledAt: Date
  duration: number
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED"
  category: string
  therapist: {
    name: string
    image?: string
  }
  participants: Array<{
    id: string
    name: string
    joinedAt?: Date
    leftAt?: Date
  }>
  _count: {
    participants: number
  }
}

const statusConfig = {
  SCHEDULED: {
    label: "Agendada",
    icon: Calendar,
    color: "bg-blue-100 text-blue-800",
  },
  LIVE: {
    label: "Ao vivo",
    icon: AlertCircle,
    color: "bg-green-100 text-green-800",
  },
  COMPLETED: {
    label: "Concluída",
    icon: CheckCircle,
    color: "bg-gray-100 text-gray-800",
  },
  CANCELLED: {
    label: "Cancelada",
    icon: XCircle,
    color: "bg-red-100 text-red-800",
  },
}

export function PatientSessionHistory({ patientId }: PatientSessionHistoryProps) {
  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ["therapist", "patient", patientId, "sessions"],
    queryFn: async () => {
      const res = await fetch(`/api/therapist/patients/${patientId}/sessions`)
      if (!res.ok) throw new Error("Failed to fetch sessions")
      return res.json()
    },
  })

  const sessions: Session[] = sessionsData?.data || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const upcomingSessions = sessions.filter(session =>
    isAfter(new Date(session.scheduledAt), new Date())
  )

  const pastSessions = sessions.filter(session =>
    isBefore(new Date(session.scheduledAt), new Date())
  )

  return (
    <div className="space-y-6">
      {/* Sessões Próximas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Sessões Agendadas ({upcomingSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma sessão agendada
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => {
                const StatusIcon = statusConfig[session.status].icon
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${statusConfig[session.status].color}`}>
                        <StatusIcon className="h-4 w-4" />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium">{session.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(session.scheduledAt), "dd/MM/yyyy 'às' HH:mm", {
                              locale: ptBR
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.duration}min
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {session._count.participants} participantes
                          </span>
                        </div>
                        <Badge variant="outline" className="mt-2">
                          {session.category}
                        </Badge>
                      </div>
                    </div>

                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Sessões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            Histórico de Sessões ({pastSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pastSessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma sessão realizada ainda
            </p>
          ) : (
            <div className="space-y-4">
              {pastSessions.map((session) => {
                const StatusIcon = statusConfig[session.status].icon
                const participant = session.participants.find(p => p.id === patientId)

                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${statusConfig[session.status].color}`}>
                        <StatusIcon className="h-4 w-4" />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium">{session.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(session.scheduledAt), "dd/MM/yyyy", {
                              locale: ptBR
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.duration}min
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {session.category}
                          </Badge>
                          {participant?.joinedAt && participant?.leftAt && (
                            <Badge variant="secondary" className="text-xs">
                              Participou
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Detalhes
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center">{sessions.length}</div>
            <p className="text-xs text-muted-foreground text-center">Total de sessões</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center text-green-600">
              {sessions.filter(s => s.status === "COMPLETED").length}
            </div>
            <p className="text-xs text-muted-foreground text-center">Concluídas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center text-blue-600">
              {sessions.filter(s => s.status === "SCHEDULED").length}
            </div>
            <p className="text-xs text-muted-foreground text-center">Agendadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center text-red-600">
              {sessions.filter(s => s.status === "CANCELLED").length}
            </div>
            <p className="text-xs text-muted-foreground text-center">Canceladas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
