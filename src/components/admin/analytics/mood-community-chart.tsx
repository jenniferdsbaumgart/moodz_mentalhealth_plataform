"use client"

import { useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface MoodCommunityChartProps {
  data: Array<{
    date: string
    avg_mood: number
    count: number
  }>
  title?: string
  description?: string
}

const getMoodLabel = (score: number): string => {
  if (score >= 4.5) return "Excelente"
  if (score >= 3.5) return "Bom"
  if (score >= 2.5) return "Neutro"
  if (score >= 1.5) return "Baixo"
  return "Muito Baixo"
}

const getMoodColor = (score: number): string => {
  if (score >= 4.5) return "#10b981" // green
  if (score >= 3.5) return "#84cc16" // lime
  if (score >= 2.5) return "#f59e0b" // amber
  if (score >= 1.5) return "#f97316" // orange
  return "#ef4444" // red
}

export function MoodCommunityChart({
  data,
  title = "Humor da Comunidade",
  description = "Média de humor ao longo do tempo"
}: MoodCommunityChartProps) {
  const chartData = useMemo(() => {
    return data.map(item => ({
      date: item.date,
      humor: Number(item.avg_mood?.toFixed(2) || 0),
      registros: Number(item.count),
      formattedDate: format(parseISO(item.date), "dd/MM", { locale: ptBR })
    }))
  }, [data])

  // Calculate overall average
  const overallAvg = useMemo(() => {
    if (chartData.length === 0) return 0
    const total = chartData.reduce((sum, item) => sum + item.humor, 0)
    return (total / chartData.length).toFixed(2)
  }, [chartData])

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          Sem dados disponíveis para o período selecionado
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: getMoodColor(Number(overallAvg)) }}>
              {overallAvg}
            </p>
            <p className="text-xs text-muted-foreground">
              {getMoodLabel(Number(overallAvg))}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[1, 5]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={30}
                ticks={[1, 2, 3, 4, 5]}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm">
                          Humor médio:{" "}
                          <span
                            className="font-medium"
                            style={{ color: getMoodColor(data.humor) }}
                          >
                            {data.humor} ({getMoodLabel(data.humor)})
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {data.registros} registros
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="humor"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#moodGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Mood scale legend */}
        <div className="mt-4 flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>1-2 Baixo</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>2-3 Neutro</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-lime-500" />
            <span>3-4 Bom</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>4-5 Excelente</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

