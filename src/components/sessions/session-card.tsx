"use client"

import { GroupSession, SessionStatus } from "@prisma/client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Users, MapPin } from "lucide-react"
import { SESSION_CATEGORIES } from "@/lib/constants/session"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { JoinButton } from "./join-button"

interface SessionCardProps {
  session: GroupSession & {
    therapist: {
      user: {
        id: string
        name: string | null
        image: string | null
      }
    }
    _count: {
      participants: number
    }
  }
  showJoinButton?: boolean
}

export function SessionCard({ session, showJoinButton = true }: SessionCardProps) {
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isLoadingEnrollment, setIsLoadingEnrollment] = useState(true)

  const categoryConfig = SESSION_CATEGORIES[session.category]
  const Icon = categoryConfig.icon

  const availableSpots = session.maxParticipants - session._count.participants
  const isFull = availableSpots <= 0
  const isLive = session.status === "LIVE"
  const isScheduled = session.status === "SCHEDULED"

  useEffect(() => {
    if (showJoinButton) {
      checkEnrollment()
    } else {
      setIsLoadingEnrollment(false)
    }
  }, [session.id, showJoinButton])

  const checkEnrollment = async () => {
    try {
      const response = await fetch(`/api/sessions/${session.id}/enrollment`)
      if (response.ok) {
        const data = await response.json()
        setIsEnrolled(data.data?.enrolled || false)
      }
    } catch (error) {
      // User might not be logged in, that's ok
    } finally {
      setIsLoadingEnrollment(false)
    }
  }

  const handleEnrollmentChange = (enrolled: boolean) => {
    setIsEnrolled(enrolled)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Cover Image */}
      {session.coverImage && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={session.coverImage}
            alt={session.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge
              variant={isLive ? "default" : "secondary"}
              className={isLive ? "bg-red-500 hover:bg-red-600" : ""}
            >
              {isLive ? "AO VIVO" : "AGENDADA"}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">{categoryConfig.label}</Badge>
          </div>
          {!session.coverImage && (
            <Badge
              variant={isLive ? "default" : "secondary"}
              className={isLive ? "bg-red-500 hover:bg-red-600" : ""}
            >
              {isLive ? "AO VIVO" : "AGENDADA"}
            </Badge>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-lg line-clamp-2">{session.title}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
            {session.description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Session Info */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            {format(new Date(session.scheduledAt), "PPP 'às' p", { locale: ptBR })}
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            {session.duration} minutos
          </div>

          {session.roomName && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              Sala: {session.roomName}
            </div>
          )}
        </div>

        {/* Therapist Info */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session.therapist.user.image || ""} />
            <AvatarFallback>
              {session.therapist.user.name?.charAt(0).toUpperCase() || "T"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {session.therapist.user.name || "Terapeuta"}
            </p>
            <p className="text-xs text-muted-foreground">Terapeuta</p>
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {session._count.participants}/{session.maxParticipants} participantes
            </span>
          </div>

          <Badge
            variant={isFull ? "destructive" : availableSpots <= 2 ? "secondary" : "default"}
          >
            {isFull ? "Lotada" : `${availableSpots} vaga${availableSpots !== 1 ? 's' : ''}`}
          </Badge>
        </div>

        {/* Tags */}
        {session.tags && session.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {session.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {session.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{session.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Action Button */}
        {showJoinButton && !isLoadingEnrollment ? (
          <JoinButton
            sessionId={session.id}
            isEnrolled={isEnrolled}
            isFull={isFull}
            isLive={isLive}
            isScheduled={isScheduled}
            onEnrollmentChange={handleEnrollmentChange}
          />
        ) : (
          <Button asChild className="w-full" disabled={session.status === "CANCELLED"}>
            <Link href={`/sessions/${session.id}`}>
              Ver Detalhes
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
