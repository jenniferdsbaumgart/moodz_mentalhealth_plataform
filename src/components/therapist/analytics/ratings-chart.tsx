"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { Star, MessageSquare, TrendingUp, Award } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface RatingsChartProps {
  data?: {
    ratingTrend: Array<{
      date: string
      averageRating: number
      totalRatings: number
    }>
    ratingDistribution: Array<{
      rating: number
      count: number
      percentage: number
    }>
    recentComments: Array<{
      id: string
      rating: number
      comment: string
      patientName: string
      sessionTitle: string
      createdAt: Date
    }>
    overallStats: {
      averageRating: number
      totalRatings: number
      ratingChange: number
    }
  }
  period: "month" | "quarter" | "year"
}

const COLORS = ["#FF6B6B", "#FFA500", "#FFD700", "#ADFF2F", "#32CD32"]

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const starSize = size === "sm" ? "h-3 w-3" : "h-4 w-4"

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

export function RatingsChart({ data, period }: RatingsChartProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

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

  const filteredComments = selectedRating
    ? data.recentComments.filter(comment => comment.rating === selectedRating)
    : data.recentComments

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {data.overallStats.averageRating.toFixed(1)}
              </span>
              <StarRating rating={Math.round(data.overallStats.averageRating)} />
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-xs ${data.overallStats.ratingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.overallStats.ratingChange >= 0 ? '+' : ''}{data.overallStats.ratingChange.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                vs período anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overallStats.totalRatings}</div>
            <p className="text-xs text-muted-foreground">
              Avaliações recebidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Melhor Avaliação</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">5.0</span>
              <StarRating rating={5} />
            </div>
            <p className="text-xs text-muted-foreground">
              Meta a alcançar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Rating Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução das Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.ratingTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 5]}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => [value.toFixed(1), "Avaliação Média"]}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="averageRating"
                  stroke="#8884d8"
                  strokeWidth={3}
                  dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#8884d8", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição das Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.ratingDistribution} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="rating"
                  type="category"
                  tick={{ fontSize: 12 }}
                  width={30}
                />
                <Tooltip
                  formatter={(value: number, name) => [
                    name === "count" ? `${value} avaliações` : `${value}%`,
                    name === "count" ? "Quantidade" : "Percentual"
                  ]}
                />
                <Bar
                  dataKey="percentage"
                  fill="#8884d8"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Comments */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comentários Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Rating Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">Filtrar por nota:</span>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      selectedRating === rating
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <StarRating rating={rating} size="sm" />
                  </button>
                ))}
                {selectedRating && (
                  <button
                    onClick={() => setSelectedRating(null)}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded"
                  >
                    Limpar filtro
                  </button>
                )}
              </div>

              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {filteredComments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum comentário encontrado
                    </div>
                  ) : (
                    filteredComments.map((comment, index) => (
                      <div key={comment.id}>
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {comment.patientName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {comment.patientName}
                              </span>
                              <StarRating rating={comment.rating} />
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(comment.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                            </div>

                            <p className="text-sm text-muted-foreground mb-1">
                              Sessão: {comment.sessionTitle}
                            </p>

                            {comment.comment && (
                              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                {comment.comment}
                              </p>
                            )}
                          </div>
                        </div>

                        {index < filteredComments.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights das Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Nota Mais Comum</h4>
              <p className="text-sm text-green-700">
                {data.ratingDistribution?.find(r => r.percentage === Math.max(...data.ratingDistribution.map(r => r.percentage)))?.rating || "N/A"} estrelas -{" "}
                {Math.max(...data.ratingDistribution.map(r => r.percentage)).toFixed(1)}% das avaliações
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Tendência</h4>
              <p className="text-sm text-blue-700">
                {data.overallStats.ratingChange >= 0 ? "Melhorando" : "Diminuindo"} -{" "}
                {Math.abs(data.overallStats.ratingChange).toFixed(1)} pontos
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Comentários</h4>
              <p className="text-sm text-purple-700">
                {data.recentComments.filter(c => c.comment).length} de {data.recentComments.length} avaliações têm comentários
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

