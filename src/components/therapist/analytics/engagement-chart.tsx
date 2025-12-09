"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts"
import { RotateCcw, Users, Clock, TrendingUp } from "lucide-react"

interface EngagementChartProps {
  data?: {
    returnRate: number
    patientFrequency: Array<{
      frequency: string
      count: number
      percentage: number
    }>
    popularHours: Array<{
      hour: string
      sessions: number
      attendance: number
    }>
    engagementTrend: Array<{
      date: string
      newPatients: number
      returningPatients: number
      totalSessions: number
    }>
  }
  period: "month" | "quarter" | "year"
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00C49F", "#FF6B6B"]

export function EngagementChart({ data, period }: EngagementChartProps) {
  if (!data) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Return Rate & Frequency Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Taxa de Retorno */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Retorno</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.returnRate}%</div>
            <p className="text-xs text-muted-foreground">
              Pacientes que retornaram
            </p>
          </CardContent>
        </Card>

        {/* Frequência de Pacientes */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Frequência dos Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.patientFrequency.map((freq, index) => (
                <div key={freq.frequency} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{freq.frequency}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{freq.count}</span>
                    <Badge variant="outline" className="text-xs">
                      {freq.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Horários Mais Populares */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horários Mais Populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.popularHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name === "sessions" ? "Sessões" : "Comparecimento"
                  ]}
                />
                <Bar
                  dataKey="sessions"
                  fill="#8884d8"
                  name="sessions"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="attendance"
                  fill="#82ca9d"
                  name="attendance"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de Frequência (Pie Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Frequência</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.patientFrequency}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ payload }: any) =>
                    `${payload?.frequency || ""}: ${payload?.percentage || 0}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.patientFrequency.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Pacientes"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tendência de Engajamento */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendência de Engajamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.engagementTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="newPatients"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  name="Novos Pacientes"
                />
                <Area
                  type="monotone"
                  dataKey="returningPatients"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                  name="Pacientes Retornando"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights de Engajamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Horário Mais Popular</h4>
              <p className="text-sm text-blue-700">
                {data.popularHours?.[0]?.hour || "N/A"} -{" "}
                {data.popularHours?.[0]?.sessions || 0} sessões
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Tipo de Paciente Mais Comum</h4>
              <p className="text-sm text-green-700">
                {data.patientFrequency?.[0]?.frequency || "N/A"} -{" "}
                {data.patientFrequency?.[0]?.percentage || 0}% dos pacientes
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Taxa de Retenção</h4>
              <p className="text-sm text-purple-700">
                {data.returnRate}% dos pacientes retornam para sessões adicionais
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

