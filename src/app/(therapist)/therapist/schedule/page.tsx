"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function TherapistSchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const { data } = useQuery({
    queryKey: ["therapist", "sessions", format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      const start = startOfMonth(currentDate).toISOString()
      const end = endOfMonth(currentDate).toISOString()
      const res = await fetch(
        `/api/therapist/sessions?start=${start}&end=${end}`
      )
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    }
  })

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { locale: ptBR })
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getSessionsForDay = (day: Date) => {
    return data?.sessions?.filter((s: any) =>
      isSameDay(new Date(s.scheduledAt), day)
    ) || []
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
            <p className="text-muted-foreground">
              Visualize e gerencie suas sessões
            </p>
          </div>
          <Button asChild>
            <Link href="/therapist/sessions/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova Sessão
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>
              {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                aria-label="Mês anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                aria-label="Próximo mês"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Header dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grid de dias */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const sessions = getSessionsForDay(day)
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isToday = isSameDay(day, new Date())

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-[100px] p-2 border rounded-lg",
                      !isCurrentMonth && "bg-muted/50 text-muted-foreground",
                      isToday && "border-primary"
                    )}
                  >
                    <div className="text-sm font-medium mb-1">
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {sessions.slice(0, 2).map((session: any) => (
                        <Link
                          key={session.id}
                          href={`/therapist/sessions/${session.id}`}
                          className="block"
                        >
                          <Badge
                            variant="secondary"
                            className="w-full truncate text-xs justify-start"
                          >
                            {format(new Date(session.scheduledAt), "HH:mm")}
                            {" - "}
                            {session.title.slice(0, 10)}
                          </Badge>
                        </Link>
                      ))}
                      {sessions.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{sessions.length - 2} mais
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

