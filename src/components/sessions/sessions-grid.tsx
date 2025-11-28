"use client"

import { GroupSession } from "@prisma/client"
import { SessionCard } from "./session-card"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Search } from "lucide-react"

interface SessionsGridProps {
  sessions: (GroupSession & {
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
  })[]
  isLoading?: boolean
}

export function SessionsGrid({ sessions, isLoading }: SessionsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-muted rounded-t-lg" />
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-10 bg-muted rounded w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma sessão encontrada</h3>
          <p className="text-muted-foreground text-center">
            Tente ajustar os filtros ou volte mais tarde para ver novas sessões.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  )
}

