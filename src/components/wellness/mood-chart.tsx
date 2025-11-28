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
  Area,
  AreaChart,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CARD_HOVER } from "@/lib/design-tokens"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface TooltipProps {
  active?: boolean
  payload?: Array<{
    payload: {
      date: string
      mood?: number
      energy?: number
      anxiety?: number
      sleep?: number
      hasEntry: boolean
      moodDisplay: number
      energyDisplay: number
      anxietyDisplay: number
      sleepDisplay: number
    }
  }>
  label?: string
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-background border border-border rounded-lg p-4 shadow-lg">
        <p className="font-medium">{`Dia ${label}`}</p>
        {data.hasEntry ? (
          <div className="space-y-1 mt-2">
            {data.mood && (
              <p className="text-sm">Humor: <Badge variant="outline">{data.mood}/10</Badge></p>
            )}
            {data.energy && (
              <p className="text-sm">Energia: <Badge variant="outline">{data.energy}/10</Badge></p>
            )}
            {data.anxiety && (
              <p className="text-sm">Ansiedade: <Badge variant="outline">{data.anxiety}/10</Badge></p>
            )}
            {data.sleep && (
              <p className="text-sm">Sono: <Badge variant="outline">{data.sleep}/10</Badge></p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum registro</p>
        )}
      </div>
    )
  }
  return null
}

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-600" />
    case 'down':
      return <TrendingDown className="h-4 w-4 text-red-600" />
    default:
      return <Minus className="h-4 w-4 text-gray-600" />
  }
}

interface MoodChartProps {
  data: Array<{
    date: string
    fullDate: string
    mood: number | null
    energy: number | null
    anxiety: number | null
    sleep: number | null
    hasEntry: boolean
  }>
  className?: string
}

export function MoodChart({ data, className }: MoodChartProps) {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      moodDisplay: item.mood || 0,
      energyDisplay: item.energy || 0,
      anxietyDisplay: item.anxiety || 0,
      sleepDisplay: item.sleep || 0,
    }))
  }, [data])

  const recentEntries = data.filter(d => d.hasEntry)
  const totalEntries = recentEntries.length
  const avgMood = recentEntries.length > 0
    ? recentEntries.reduce((sum, d) => sum + (d.mood || 0), 0) / recentEntries.length
    : 0

  const trend = useMemo(() => {
    if (recentEntries.length < 2) return 'neutral'

    const firstHalf = recentEntries.slice(0, Math.floor(recentEntries.length / 2))
    const secondHalf = recentEntries.slice(Math.floor(recentEntries.length / 2))

    const firstAvg = firstHalf.reduce((sum, d) => sum + (d.mood || 0), 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, d) => sum + (d.mood || 0), 0) / secondHalf.length

    const diff = secondAvg - firstAvg
    if (diff > 0.5) return 'up'
    if (diff < -0.5) return 'down'
    return 'neutral'
  }, [recentEntries])


  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendIcon trend={trend} />
              Tendência de Humor (30 dias)
            </CardTitle>
            <CardDescription>
              {totalEntries} registros • Média: {avgMood.toFixed(1)}/10
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            Últimos 30 dias
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mood" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="mood">Humor</TabsTrigger>
            <TabsTrigger value="energy">Energia</TabsTrigger>
            <TabsTrigger value="anxiety">Ansiedade</TabsTrigger>
            <TabsTrigger value="sleep">Sono</TabsTrigger>
          </TabsList>

          <TabsContent value="mood" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={processedData}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="moodDisplay"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#moodGradient)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#3b82f6" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="energy" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="energyDisplay"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#10b981" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="anxiety" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="anxietyDisplay"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#ef4444" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="sleep" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="sleepDisplay"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#8b5cf6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
