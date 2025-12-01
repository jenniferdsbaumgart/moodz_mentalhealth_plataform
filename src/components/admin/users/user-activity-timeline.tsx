"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  MessageSquare,
  MessageCircle,
  Calendar,
  Trophy,
  Activity
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TimelineItem {
  type: "post" | "comment" | "session" | "badge"
  id: string
  title: string
  date: string
  details?: Record<string, any>
}

interface UserActivityTimelineProps {
  timeline: TimelineItem[]
}

const typeConfig = {
  post: {
    icon: MessageSquare,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
    label: "Post"
  },
  comment: {
    icon: MessageCircle,
    color: "text-green-500",
    bgColor: "bg-green-100",
    label: "Comentário"
  },
  session: {
    icon: Calendar,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
    label: "Sessão"
  },
  badge: {
    icon: Trophy,
    color: "text-amber-500",
    bgColor: "bg-amber-100",
    label: "Badge"
  }
}

export function UserActivityTimeline({ timeline }: UserActivityTimelineProps) {
  if (timeline.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Nenhuma atividade registrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {timeline.map((item, index) => {
        const config = typeConfig[item.type]
        const Icon = config.icon

        return (
          <div key={`${item.type}-${item.id}`} className="flex gap-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={`p-2 rounded-full ${config.bgColor}`}>
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>
              {index < timeline.length - 1 && (
                <div className="w-px h-full bg-border mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {config.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(item.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
              <p className="font-medium">{item.title}</p>
              {item.details && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.details.category && (
                    <Badge variant="secondary" className="text-xs">
                      {item.details.category}
                    </Badge>
                  )}
                  {item.details.status && (
                    <Badge
                      variant={item.details.status === "COMPLETED" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {item.details.status}
                    </Badge>
                  )}
                  {item.details.comments !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {item.details.comments} comentários
                    </span>
                  )}
                  {item.details.votes !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {item.details.votes} votos
                    </span>
                  )}
                  {item.details.icon && (
                    <span className="text-lg">{item.details.icon}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
