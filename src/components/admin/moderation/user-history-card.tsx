"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  User,
  AlertTriangle,
  MessageSquare,
  Calendar,
  Trophy,
  Ban,
  Clock,
  Loader2
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface UserHistoryCardProps {
  user: {
    id: string
    name: string | null
    image: string | null
    email: string
  }
  history: {
    user: {
      role: string
      status: string
      createdAt: string
    }
    stats: {
      totalPosts: number
      totalComments: number
      totalSessions: number
      reportsReceived: number
      badgesEarned: number
    }
    activity: {
      reportsReceived: Array<{
        id: string
        reason: string
        status: string
        createdAt: string
      }>
    }
  } | null
  isLoading: boolean
}

export function UserHistoryCard({ user, history, isLoading }: UserHistoryCardProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ACTIVE: "default",
      INACTIVE: "secondary",
      SUSPENDED: "outline",
      BANNED: "destructive"
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  return (
    <div className="space-y-4">
      {/* User Header */}
      <div className="flex items-center gap-3 p-4 border rounded-lg">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.image || ""} />
          <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">{user.name || "Sem nome"}</p>
            {history?.user && getStatusBadge(history.user.status)}
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {history?.user && (
            <p className="text-xs text-muted-foreground">
              Membro desde {format(new Date(history.user.createdAt), "MMM yyyy", { locale: ptBR })}
            </p>
          )}
        </div>
      </div>

      {history && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 border rounded-lg">
              <MessageSquare className="h-4 w-4 mx-auto mb-1 text-blue-500" />
              <p className="text-lg font-bold">{history.stats.totalPosts}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <Calendar className="h-4 w-4 mx-auto mb-1 text-green-500" />
              <p className="text-lg font-bold">{history.stats.totalSessions}</p>
              <p className="text-xs text-muted-foreground">Sessões</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-red-500" />
              <p className="text-lg font-bold">{history.stats.reportsReceived}</p>
              <p className="text-xs text-muted-foreground">Reports</p>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Avaliação de Risco
            </h4>
            {history.stats.reportsReceived === 0 ? (
              <Badge variant="default" className="bg-green-500">Baixo Risco</Badge>
            ) : history.stats.reportsReceived < 3 ? (
              <Badge className="bg-yellow-500">Risco Moderado</Badge>
            ) : (
              <Badge variant="destructive">Alto Risco</Badge>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {history.stats.reportsReceived === 0 
                ? "Este usuário não possui histórico de reports."
                : `Este usuário possui ${history.stats.reportsReceived} report(s) no histórico.`
              }
            </p>
          </div>

          {/* Recent Reports */}
          {history.activity.reportsReceived.length > 0 && (
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Reports Anteriores</h4>
              <div className="space-y-2">
                {history.activity.reportsReceived.slice(0, 5).map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {report.reason}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={report.status === "RESOLVED" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {report.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(report.createdAt), "dd/MM/yy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
