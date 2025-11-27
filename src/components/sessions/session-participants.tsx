"use client"

import { useState } from "react"
import { ParticipantStatus } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  CheckCircle,
  Clock,
  XCircle,
  UserCheck,
  Loader2
} from "lucide-react"

interface Participant {
  id: string
  status: ParticipantStatus
  joinedAt?: string | null
  leftAt?: string | null
  user: {
    id: string
    name: string | null
    email: string
    image?: string | null
  }
}

interface SessionParticipantsProps {
  participants: Participant[]
  maxParticipants: number
  isLive?: boolean
  onUpdateStatus?: (participantId: string, status: ParticipantStatus) => void
}

export function SessionParticipants({
  participants,
  maxParticipants,
  isLive = false,
  onUpdateStatus
}: SessionParticipantsProps) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const getStatusBadge = (status: ParticipantStatus) => {
    const variants = {
      REGISTERED: "outline",
      CONFIRMED: "secondary",
      ATTENDED: "default",
      NO_SHOW: "destructive",
      CANCELLED: "secondary",
    } as const

    const labels = {
      REGISTERED: "Inscrito",
      CONFIRMED: "Confirmado",
      ATTENDED: "Presente",
      NO_SHOW: "Faltou",
      CANCELLED: "Cancelado",
    }

    const icons = {
      REGISTERED: <Clock className="h-3 w-3" />,
      CONFIRMED: <CheckCircle className="h-3 w-3" />,
      ATTENDED: <UserCheck className="h-3 w-3" />,
      NO_SHOW: <XCircle className="h-3 w-3" />,
      CANCELLED: <XCircle className="h-3 w-3" />,
    }

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {icons[status]}
        {labels[status]}
      </Badge>
    )
  }

  const handleStatusUpdate = async (participantId: string, newStatus: ParticipantStatus) => {
    if (!onUpdateStatus) return

    setUpdatingStatus(participantId)
    try {
      await onUpdateStatus(participantId, newStatus)
    } catch (error) {
      console.error("Error updating participant status:", error)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const registeredParticipants = participants.filter(p => p.status === "REGISTERED")
  const confirmedParticipants = participants.filter(p => p.status === "CONFIRMED")
  const attendedParticipants = participants.filter(p => p.status === "ATTENDED")

  const ParticipantList = ({ participants, showActions = false }: { participants: Participant[], showActions?: boolean }) => (
    <ScrollArea className="h-[300px]">
      <div className="space-y-3">
        {participants.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum participante nesta categoria</p>
          </div>
        ) : (
          participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={participant.user.image || ""} />
                  <AvatarFallback>
                    {participant.user.name?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">
                    {participant.user.name || "Participante"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {participant.user.email}
                  </p>
                  {participant.joinedAt && (
                    <p className="text-xs text-muted-foreground">
                      Entrou: {new Date(participant.joinedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(participant.status)}

                {showActions && onUpdateStatus && (
                  <div className="flex gap-1">
                    {participant.status === "REGISTERED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(participant.id, "CONFIRMED")}
                        disabled={updatingStatus === participant.id}
                      >
                        {updatingStatus === participant.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Confirmar"
                        )}
                      </Button>
                    )}
                    {participant.status === "CONFIRMED" && isLive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(participant.id, "ATTENDED")}
                        disabled={updatingStatus === participant.id}
                      >
                        {updatingStatus === participant.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Presente"
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Participantes ({participants.length}/{maxParticipants})
        </CardTitle>
        <CardDescription>
          Gerencie os participantes inscritos nesta sessão
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="attended">Presentes</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ParticipantList participants={participants} showActions={!isLive} />
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <ParticipantList
              participants={[...registeredParticipants, ...confirmedParticipants]}
              showActions={!isLive}
            />
          </TabsContent>

          <TabsContent value="attended" className="mt-4">
            <ParticipantList participants={attendedParticipants} />
          </TabsContent>
        </Tabs>

        {participants.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum participante</h3>
            <p className="text-muted-foreground text-sm">
              Ainda não há participantes inscritos nesta sessão.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
