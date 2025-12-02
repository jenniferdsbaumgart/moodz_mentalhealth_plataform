"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface GrowthComparisonProps {
  currentPeriod: Array<{
    date: string
    count: number
  }>
  previousPeriod: Array<{
    date: string
    count: number
  }>
  title?: string
  description?: string
  metric?: string
}

export function GrowthComparison({
  currentPeriod,
  previousPeriod,
  title = "Comparativo de Crescimento",
  description = "Período atual vs período anterior",
  metric = "usuários"
}: GrowthComparisonProps) {
  const chartData = useMemo(() => {
    const maxLength = Math.max(currentPeriod.length, previousPeriod.length)
    const data = []

    for (let i = 0; i < maxLength; i++) {
      data.push({
        day: `Dia ${i + 1}`,
        atual: currentPeriod[i]?.count || 0,
        anterior: previousPeriod[i]?.count || 0
      })
    }

    return data
  }, [currentPeriod, previousPeriod])

  // Calculate totals and growth
  const currentTotal = useMemo(() => {
    return currentPeriod.reduce((sum, item) => sum + Number(item.count), 0)
  }, [currentPeriod])

  const previousTotal = useMemo(() => {
    return previousPeriod.reduce((sum, item) => sum + Number(item.count), 0)
  }, [previousPeriod])

  const growthRate = useMemo(() => {
    if (previousTotal === 0) return currentTotal > 0 ? 100 : 0
    return Math.round(((currentTotal - previousTotal) / previousTotal) * 100)
  }, [currentTotal, previousTotal])

  const TrendIcon = growthRate > 0 ? TrendingUp : growthRate < 0 ? TrendingDown : Minus
  const trendColor = growthRate > 0 ? "text-green-600" : growthRate < 0 ? "text-red-600" : "text-gray-600"

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          Sem dados disponíveis para comparação
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
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="h-5 w-5" />
              <span className="text-2xl font-bold">
                {growthRate > 0 ? "+" : ""}{growthRate}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              vs período anterior
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="day"
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
                        {payload.map((entry, index) => (
                          <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {entry.value} {metric}
                          </p>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="atual"
                name="Período Atual"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="anterior"
                name="Período Anterior"
                stroke="#9ca3af"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{currentTotal}</p>
            <p className="text-xs text-muted-foreground">Período Atual</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-600">{previousTotal}</p>
            <p className="text-xs text-muted-foreground">Período Anterior</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

