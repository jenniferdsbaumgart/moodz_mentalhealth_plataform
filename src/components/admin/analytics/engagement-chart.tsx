"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface EngagementChartProps {
  data: Array<{
    date: string
    count: number
  }>
  title?: string
  description?: string
}

export function EngagementChart({
  data,
  title = "Engajamento por Dia",
  description = "Posts, comentários e registros de humor"
}: EngagementChartProps) {
  const chartData = useMemo(() => {
    return data.map(item => ({
      date: item.date,
      engajamento: Number(item.count),
      formattedDate: format(parseISO(item.date), "dd/MM", { locale: ptBR })
    }))
  }, [data])

  // Calculate average
  const avgEngagement = useMemo(() => {
    if (chartData.length === 0) return 0
    const total = chartData.reduce((sum, item) => sum + item.engajamento, 0)
    return Math.round(total / chartData.length)
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
            <p className="text-2xl font-bold">{avgEngagement}</p>
            <p className="text-xs text-muted-foreground">média/dia</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm">
                          Engajamento: <span className="font-medium">{payload[0].value}</span>
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              <Bar
                dataKey="engajamento"
                name="Interações"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
