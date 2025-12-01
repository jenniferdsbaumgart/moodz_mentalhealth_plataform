import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, Users } from "lucide-react"
import Link from "next/link"

interface UpcomingSession {
  id: string
  title: string
  description: string
  scheduledAt: Date
  duration: number
  maxParticipants: number
  _count: {
    participants: number
  }
}

interface UpcomingSessionsProps {
  sessions: UpcomingSession[]
}

export function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            Próximas Sessões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Nenhuma sessão agendada no momento
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-blue-600" />
          Próximas Sessões ({sessions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => {
            const availableSpots = session.maxParticipants - session._count.participants
            const isFull = availableSpots <= 0

            return (
              <div
                key={session.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {session.title}
                    </h4>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {session.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {new Date(session.scheduledAt).toLocaleDateString('pt-BR')} às {new Date(session.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.duration} min
                      </div>

                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {session._count.participants}/{session.maxParticipants}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col items-end gap-2">
                    <Badge
                      variant={isFull ? "secondary" : "default"}
                      className={isFull ? "bg-gray-100 text-gray-600" : ""}
                    >
                      {isFull ? "Lotado" : `${availableSpots} vaga${availableSpots !== 1 ? 's' : ''}`}
                    </Badge>

                    <Link href={`/sessions/${session.id}`}>
                      <Button
                        size="sm"
                        disabled={isFull}
                        className="w-full"
                      >
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {sessions.length >= 3 && (
          <div className="mt-6 text-center">
            <Link href="/sessions">
              <Button variant="outline">
                Ver Todas as Sessões
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
