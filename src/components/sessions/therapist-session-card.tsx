"use client"

import { useState } from "react"
import { SessionStatus } from "@prisma/client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Play,
  Edit,
  Users,
  X,
  Calendar,
  Clock,
  MoreHorizontal,
  Eye,
  AlertTriangle
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { SESSION_CATEGORIES } from "@/lib/constants/session"

interface TherapistSessionCardProps {
  session: {
    id: string
    title: string
    category: string
    scheduledAt: string
    duration: number
    maxParticipants: number
    status: SessionStatus
    participants: Array<{
      id: string
      status: string
    }>
    coverImage?: string | null
  }
  onStartSession?: (sessionId: string) => void
  onEditSession?: (sessionId: string) => void
  onViewParticipants?: (sessionId: string) => void
  onCancelSession?: (sessionId: string) => void
  onViewDetails?: (sessionId: string) => void
}

export function TherapistSessionCard({
  session,
  onStartSession,
  onEditSession,
  onViewParticipants,
  onCancelSession,
  onViewDetails
}: TherapistSessionCardProps) {
  const [isStarting, setIsStarting] = useState(false)

  const categoryInfo = SESSION_CATEGORIES[session.category as keyof typeof SESSION_CATEGORIES]
  const confirmedParticipants = session.participants.filter(p => p.status === "CONFIRMED").length
  const totalParticipants = session.participants.length
  const isUpcoming = new Date(session.scheduledAt) > new Date()
  const isLive = session.status === "LIVE"
  const canStart = isUpcoming && session.status === "SCHEDULED" && confirmedParticipants > 0

  const getStatusBadge = () => {
    const variants = {
      SCHEDULED: "outline",
      LIVE: "default",
      COMPLETED: "secondary",
      CANCELLED: "destructive",
    } as const

    const labels = {
      SCHEDULED: "Agendada",
      LIVE: "Ao Vivo",
      COMPLETED: "Concluída",
      CANCELLED: "Cancelada",
    }

    return (
      <Badge variant={variants[session.status]}>
        {labels[session.status]}
      </Badge>
    )
  }

  const handleStartSession = async () => {
    if (!onStartSession) return

    setIsStarting(true)
    try {
      await onStartSession(session.id)
    } catch (error) {
      console.error("Error starting session:", error)
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {categoryInfo && (
                <div className="flex items-center gap-1">
                  <categoryInfo.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{categoryInfo.label}</span>
                </div>
              )}
              {getStatusBadge()}
            </div>

            <h3 className="font-semibold text-lg leading-tight mb-2 truncate">
              {session.title}
            </h3>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(session.scheduledAt), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{session.duration}min</span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails?.(session.id)}>
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalhes
              </DropdownMenuItem>
              {session.status === "SCHEDULED" && (
                <>
                  <DropdownMenuItem onClick={() => onEditSession?.(session.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onCancelSession?.(session.id)}
                    className="text-red-600"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar Sessão
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {confirmedParticipants}/{session.maxParticipants} confirmados
            </span>
          </div>

          {totalParticipants > confirmedParticipants && (
            <Badge variant="outline" className="text-xs">
              {totalParticipants - confirmedParticipants} pendentes
            </Badge>
          )}
        </div>

        {session.status === "CANCELLED" && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-800 dark:text-red-200">
                  Sessão cancelada
                </p>
                <p className="text-red-700 dark:text-red-300">
                  Todos os participantes foram notificados.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {canStart && (
            <Button
              onClick={handleStartSession}
              disabled={isStarting}
              className="flex-1"
            >
              {isStarting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Iniciando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Sessão
                </>
              )}
            </Button>
          )}

          {isLive && (
            <Button
              variant="outline"
              onClick={() => onViewDetails?.(session.id)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Entrar na Sessão
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => onViewParticipants?.(session.id)}
            size="sm"
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
