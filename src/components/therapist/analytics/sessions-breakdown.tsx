"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line
} from "recharts"
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle
} from "lucide-react"

interface SessionsBreakdownProps {
  data?: {
    sessionStats: {
      totalSessions: number
      completedSessions: number
      cancelledSessions: number
      attendanceRate: number
      averageDuration: number
      noShowRate: number
    }
    sessionStatusDistribution: Array<{
      status: string
      count: number
      percentage: number
      color: string
    }>
    sessionsByDay: Array<{
      day: string
      completed: number
      cancelled: number
      noShow: number
    }>
    durationTrend: Array<{
      date: string
      averageDuration: number
      minDuration: number
      maxDuration: number
    }>
  }
  period: "month" | "quarter" | "year"
}

const STATUS_COLORS = {
  completed: "#22c55e",
  cancelled: "#ef4444",
  scheduled: "#3b82f6",
  noShow: "#f59e0b"
}

export function SessionsBreakdown({ data, period }: SessionsBreakdownProps) {
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

  const { sessionStats, sessionStatusDistribution, sessionsByDay, durationTrend } = data

  return (
    <div className="space-y-6">
      {/* Session Stats Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Sessões realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Comparecimento</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {sessionStats.attendanceRate}%
            </div>
            <Progress value={sessionStats.attendanceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats.averageDuration}min</div>
            <p className="text-xs text-muted-foreground">
              Por sessão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Faltas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {sessionStats.noShowRate}%
            </div>
            <Progress value={sessionStats.noShowRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Session Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status das Sessões</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sessionStatusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percentage }) =>
                    `${status}: ${percentage}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {sessionStatusDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Sessões"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sessions by Day of Week */}
        <Card>
          <CardHeader>
            <CardTitle>Sessões por Dia da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sessionsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="completed"
                  stackId="a"
                  fill={STATUS_COLORS.completed}
                  name="Concluídas"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="cancelled"
                  stackId="a"
                  fill={STATUS_COLORS.cancelled}
                  name="Canceladas"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="noShow"
                  stackId="a"
                  fill={STATUS_COLORS.noShow}
                  name="Faltas"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Duration Trend */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendência de Duração das Sessões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={durationTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  label={{ value: 'Minutos', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  formatter={(value: number, name) => [
                    `${value} min`,
                    name === "averageDuration" ? "Média" :
                    name === "minDuration" ? "Mínima" : "Máxima"
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="averageDuration"
                  stroke="#8884d8"
                  strokeWidth={3}
                  name="averageDuration"
                  dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="minDuration"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="minDuration"
                  dot={{ fill: "#82ca9d", strokeWidth: 2, r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="maxDuration"
                  stroke="#ffc658"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="maxDuration"
                  dot={{ fill: "#ffc658", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {sessionStatusDistribution.map((status) => (
              <div key={status.status} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="font-medium capitalize">{status.status}</span>
                  </div>
                  <Badge variant="outline">
                    {status.count}
                  </Badge>
                </div>
                <Progress value={status.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {status.percentage}% das sessões
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights das Sessões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className={`p-4 rounded-lg ${
              sessionStats.attendanceRate >= 80 ? 'bg-green-50' :
              sessionStats.attendanceRate >= 60 ? 'bg-yellow-50' : 'bg-red-50'
            }`}>
              <h4 className="font-medium mb-2">Comparecimento</h4>
              <p className="text-sm">
                {sessionStats.attendanceRate >= 80 ? 'Excelente' :
                 sessionStats.attendanceRate >= 60 ? 'Bom' : 'Precisa melhorar'} -{" "}
                {sessionStats.attendanceRate}% dos pacientes comparecem
              </p>
            </div>

            <div className={`p-4 rounded-lg ${
              sessionStats.noShowRate <= 10 ? 'bg-green-50' :
              sessionStats.noShowRate <= 20 ? 'bg-yellow-50' : 'bg-red-50'
            }`}>
              <h4 className="font-medium mb-2">Taxa de Faltas</h4>
              <p className="text-sm">
                {sessionStats.noShowRate}% dos agendamentos resultam em faltas não justificadas
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Duração Ideal</h4>
              <p className="text-sm">
                Sessões de {sessionStats.averageDuration} minutos em média.{" "}
                Considere ajustar para otimizar o tempo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
