"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, getDay } from "date-fns"
import { ptBR } from "date-fns/locale"

interface MoodHeatmapProps {
  data: Array<{
    date: string
    day: number
    week: number
    mood: number | null
    hasEntry: boolean
  }>
  className?: string
}

export function MoodHeatmap({ data, className }: MoodHeatmapProps) {
  const monthName = useMemo(() => {
    if (data.length === 0) return ""
    const firstDay = new Date(data[0].date)
    return format(firstDay, "MMMM yyyy", { locale: ptBR })
  }, [data])

  const weeks = useMemo(() => {
    const weekMap = new Map<number, typeof data>()

    data.forEach(item => {
      if (!weekMap.has(item.week)) {
        weekMap.set(item.week, [])
      }
      weekMap.get(item.week)!.push(item)
    })

    return Array.from(weekMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([, weekData]) => weekData)
  }, [data])

  const getMoodColor = (mood: number | null): string => {
    if (!mood) return "bg-gray-100 dark:bg-gray-800"

    if (mood >= 9) return "bg-green-500"      // Muito bom
    if (mood >= 7) return "bg-green-400"      // Bom
    if (mood >= 5) return "bg-yellow-400"     // Ok
    if (mood >= 3) return "bg-orange-400"     // Regular
    if (mood >= 1) return "bg-red-400"        // Ruim
    return "bg-gray-400"                       // Muito ruim
  }

  const getMoodEmoji = (mood: number | null): string => {
    if (!mood) return "⬜"

    if (mood >= 9) return "🥳"
    if (mood >= 7) return "😊"
    if (mood >= 5) return "🙂"
    if (mood >= 3) return "😐"
    if (mood >= 1) return "😞"
    return "😢"
  }

  const totalEntries = data.filter(d => d.hasEntry).length
  const avgMood = data.filter(d => d.hasEntry).length > 0
    ? data.filter(d => d.hasEntry)
        .reduce((sum, d) => sum + (d.mood || 0), 0) / data.filter(d => d.hasEntry).length
    : 0

  const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Calendário de Humor</CardTitle>
        <CardDescription>
          {monthName} • {totalEntries} registros • Média: {avgMood.toFixed(1)}/10
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Menos</span>
            <div className="flex gap-1">
              {[1, 3, 5, 7, 9].map(level => (
                <div key={level} className="flex flex-col items-center gap-1">
                  <div className={`w-3 h-3 rounded-sm ${getMoodColor(level)}`} />
                  <span>{level}</span>
                </div>
              ))}
            </div>
            <span className="text-muted-foreground">Mais</span>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-1">
            {/* Day labels */}
            <div className="grid grid-cols-8 gap-1 text-xs font-medium text-muted-foreground">
              <div></div> {/* Empty corner */}
              {dayLabels.map(day => (
                <div key={day} className="text-center py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-8 gap-1">
                {/* Week number */}
                <div className="text-xs text-muted-foreground flex items-center justify-center">
                  {weekIndex + 1}
                </div>

                {/* Days */}
                {dayLabels.map((_, dayIndex) => {
                  const dayData = week.find(d => getDay(new Date(d.date)) === dayIndex)

                  if (!dayData) {
                    return <div key={dayIndex} className="aspect-square" />
                  }

                  return (
                    <TooltipProvider key={dayIndex}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`
                              aspect-square rounded-sm border cursor-pointer transition-all hover:ring-2 hover:ring-primary/50
                              ${dayData.hasEntry
                                ? getMoodColor(dayData.mood)
                                : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                              }
                              flex items-center justify-center text-xs
                            `}
                          >
                            {dayData.hasEntry ? (
                              <span className="text-white drop-shadow-sm">
                                {getMoodEmoji(dayData.mood)}
                              </span>
                            ) : (
                              <span className="text-gray-400">{dayData.day}</span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-center">
                            <div className="font-medium">
                              {format(new Date(dayData.date), "dd/MM/yyyy")}
                            </div>
                            {dayData.hasEntry ? (
                              <div className="space-y-1 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {getMoodEmoji(dayData.mood)} {dayData.mood}/10
                                </Badge>
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">
                                Nenhum registro
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="flex justify-between items-center pt-4 border-t text-sm">
            <div className="text-muted-foreground">
              Dias registrados: <Badge variant="outline">{totalEntries}</Badge>
            </div>
            <div className="text-muted-foreground">
              Dias no mês: <Badge variant="outline">{data.length}</Badge>
            </div>
            <div className="text-muted-foreground">
              Consistência: <Badge variant="outline">
                {data.length > 0 ? Math.round((totalEntries / data.length) * 100) : 0}%
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
