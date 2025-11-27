"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Calendar, Flame, Star } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, startOfWeek, endOfWeek } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ActivityDay {
  date: string
  hasActivity: boolean
  activityCount: number
  pointsEarned: number
  streakDay?: boolean
}

interface ActivityCalendarProps {
  activityData?: ActivityDay[]
  months?: number
  className?: string
}

const getActivityLevel = (count: number) => {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 10) return 3
  return 4
}

const activityColors = {
  0: "bg-muted hover:bg-muted/80",
  1: "bg-green-200 hover:bg-green-300 dark:bg-green-900 dark:hover:bg-green-800",
  2: "bg-green-300 hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-700",
  3: "bg-green-400 hover:bg-green-500 dark:bg-green-700 dark:hover:bg-green-600",
  4: "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500",
}

export function ActivityCalendar({ activityData = [], months = 12, className }: ActivityCalendarProps) {
  const activityMap = useMemo(() => {
    return activityData.reduce((map, day) => {
      map[day.date] = day
      return map
    }, {} as Record<string, ActivityDay>)
  }, [activityData])

  const monthsData = useMemo(() => {
    const monthsArray = []
    const today = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(today, i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      const weekStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday
      const weekEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

      const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

      monthsArray.push({
        month: monthDate,
        monthName: format(monthDate, "MMMM yyyy", { locale: ptBR }),
        days,
      })
    }

    return monthsArray
  }, [months])

  const getActivityForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    return activityMap[dateString] || {
      date: dateString,
      hasActivity: false,
      activityCount: 0,
      pointsEarned: 0,
      streakDay: false,
    }
  }

  const getStats = () => {
    const totalDays = activityData.length
    const totalActivities = activityData.reduce((sum, day) => sum + day.activityCount, 0)
    const totalPoints = activityData.reduce((sum, day) => sum + day.pointsEarned, 0)
    const streakDays = activityData.filter(day => day.streakDay).length
    const currentStreak = calculateCurrentStreak()

    return { totalDays, totalActivities, totalPoints, streakDays, currentStreak }
  }

  const calculateCurrentStreak = () => {
    let streak = 0
    const today = new Date()

    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const activity = getActivityForDate(date)

      if (activity.hasActivity) {
        streak++
      } else if (i > 0) { // Don't break streak for today
        break
      }
    }

    return streak
  }

  const stats = getStats()

  const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendário de Atividade
          </CardTitle>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              <Flame className="h-3 w-3" />
              {stats.currentStreak} dias
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Star className="h-3 w-3" />
              {stats.totalPoints}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div>Menos</div>
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className={cn("w-3 h-3 rounded-sm border", activityColors[level as keyof typeof activityColors])}
            />
          ))}
          <div>Mais</div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-8">
          {monthsData.map(({ month, monthName, days }) => (
            <div key={monthName} className="space-y-2">
              <h3 className="font-semibold text-sm">{monthName}</h3>

              <div className="grid grid-cols-7 gap-1">
                {/* Week day headers */}
                {weekDays.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {days.map(day => {
                  const activity = getActivityForDate(day)
                  const activityLevel = getActivityLevel(activity.activityCount)
                  const isToday = isSameDay(day, new Date())
                  const isCurrentMonth = day.getMonth() === month.getMonth()

                  return (
                    <TooltipProvider key={day.toISOString()}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "aspect-square rounded-sm border cursor-pointer transition-all hover:scale-110",
                              activityColors[activityLevel as keyof typeof activityColors],
                              !isCurrentMonth && "opacity-30",
                              isToday && "ring-2 ring-primary ring-offset-1",
                              activity.streakDay && "ring-1 ring-orange-400"
                            )}
                          />
                        </TooltipTrigger>

                        <TooltipContent>
                          <div className="text-center space-y-1">
                            <div className="font-medium">
                              {format(day, "dd 'de' MMMM", { locale: ptBR })}
                            </div>
                            {activity.hasActivity ? (
                              <div className="space-y-1">
                                <div className="text-sm">
                                  {activity.activityCount} atividade{activity.activityCount !== 1 ? 's' : ''}
                                </div>
                                <div className="flex items-center justify-center gap-2 text-xs">
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    +{activity.pointsEarned}
                                  </span>
                                  {activity.streakDay && (
                                    <span className="flex items-center gap-1">
                                      <Flame className="h-3 w-3 text-orange-500" />
                                      Streak
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                Nenhum atividade
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{stats.totalDays}</div>
              <div className="text-xs text-muted-foreground">Dias Ativos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.totalActivities}</div>
              <div className="text-xs text-muted-foreground">Atividades</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.totalPoints}</div>
              <div className="text-xs text-muted-foreground">Pontos Totais</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.streakDays}</div>
              <div className="text-xs text-muted-foreground">Dias de Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Sequência Atual</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
