"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { GroupSession, SessionStatus } from "@prisma/client"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Video
} from "lucide-react"
import { JoinButton } from "@/components/sessions/join-button"
import { SESSION_CATEGORIES } from "@/lib/constants/session"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

interface SessionWithDetails extends GroupSession {
  therapist: {
    user: {
      id: string
      name: string | null
      image: string | null
    }
    bio: string
    specialties: string[]
  }
  _count: {
    participants: number
  }
}

export default function SessionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [session, setSession] = useState<SessionWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchSession()
      checkEnrollment()
    }
  }, [params.id])

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/public/sessions/${params.id}`)
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

  const checkEnrollment = async () => {
    try {
      const response = await fetch(`/api/sessions/${params.id}/enrollment`)
      if (response.ok) {
        const data = await response.json()
        setIsEnrolled(data.data?.enrolled || false)
      }
    } catch (error) {
      // User might not be logged in, that's ok
    }
  }

  const handleEnrollmentChange = (enrolled: boolean) => {
    setIsEnrolled(enrolled)
    // Refresh session data to update participant count
    fetchSession()
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
  const availableSpots = session.maxParticipants - session._count.participants
  const isFull = availableSpots <= 0
  const isLive = session.status === "LIVE"

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sessions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>

        {/* Cover Image */}
        {session.coverImage && (
          <div className="relative h-64 rounded-lg overflow-hidden">
            <img
              src={session.coverImage}
              alt={session.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <Badge
                variant={isLive ? "default" : "secondary"}
                className={isLive ? "bg-red-500 hover:bg-red-600" : ""}
              >
                {isLive ? "AO VIVO" : "AGENDADA"}
              </Badge>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Session Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <Badge variant="outline">{categoryConfig.label}</Badge>
                  {!session.coverImage && (
                    <Badge
                      variant={isLive ? "default" : "secondary"}
                      className={isLive ? "bg-red-500 hover:bg-red-600" : ""}
                    >
                      {isLive ? "AO VIVO" : "AGENDADA"}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl">{session.title}</CardTitle>
                <CardDescription className="text-base">
                  {session.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(session.scheduledAt), "PPP 'às' p", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{session.duration} minutos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {session._count.participants}/{session.maxParticipants} participantes
                    </span>
                  </div>
                  {session.roomName && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Sala: {session.roomName}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
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

            {/* Therapist Info */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre o Terapeuta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={session.therapist.user.image || ""} />
                    <AvatarFallback className="text-lg">
                      {session.therapist.user.name?.charAt(0).toUpperCase() || "T"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {session.therapist.user.name || "Terapeuta"}
                    </h3>
                    {session.therapist.specialties && session.therapist.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {session.therapist.specialties.slice(0, 3).map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {session.therapist.bio && (
                      <p className="text-muted-foreground text-sm mt-2 line-clamp-3">
                        {session.therapist.bio}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment/Room Access Card */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {isLive ? "Sala Virtual" : "Inscrição"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {session._count.participants}/{session.maxParticipants}
                  </div>
                  <p className="text-sm text-muted-foreground">participantes inscritos</p>
                </div>

                {isLive && isEnrolled ? (
                  <Button asChild className="w-full">
                    <Link href={`/sessions/${session.id}/room`}>
                      <Video className="h-4 w-4 mr-2" />
                      Entrar na Sala Virtual
                    </Link>
                  </Button>
                ) : (
                  <JoinButton
                    sessionId={session.id}
                    isEnrolled={isEnrolled}
                    isFull={isFull}
                    isLive={isLive}
                    isScheduled={session.status === "SCHEDULED"}
                    onEnrollmentChange={handleEnrollmentChange}
                  />
                )}
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duração:</span>
                  <span>{session.duration} min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vagas:</span>
                  <span>{availableSpots} disponíveis</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Categoria:</span>
                  <span>{categoryConfig.label}</span>
                </div>
                <Separator />
                <div className="text-xs text-muted-foreground">
                  Ao se inscrever, você concorda em participar ativamente da sessão e respeitar as regras da comunidade.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
