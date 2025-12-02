"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Star,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Filter,
  Loader2,
  Calendar
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Review {
  id: string
  sessionId: string
  patientId: string
  rating: number
  comment?: string
  isAnonymous: boolean
  createdAt: Date
  session: {
    title: string
    scheduledAt: Date
  }
  patient?: {
    name: string
    image?: string
  }
}

interface ReviewsStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: Array<{
    rating: number
    count: number
    percentage: number
  }>
  recentReviews: Review[]
  ratingTrend: Array<{
    date: string
    averageRating: number
    reviewCount: number
  }>
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

export function ReviewsManagement() {
  const [filterPeriod, setFilterPeriod] = useState<"all" | "month" | "quarter" | "year">("all")
  const [filterRating, setFilterRating] = useState<"all" | number>("all")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "rating">("newest")

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["therapist", "reviews", "stats", filterPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/therapist/reviews/stats?period=${filterPeriod}`)
      if (!response.ok) throw new Error("Failed to fetch stats")
      return response.json()
    },
  })

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ["therapist", "reviews", filterPeriod, filterRating, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams({
        period: filterPeriod,
        rating: filterRating.toString(),
        sort: sortBy,
      })
      const response = await fetch(`/api/therapist/reviews?${params}`)
      if (!response.ok) throw new Error("Failed to fetch reviews")
      return response.json()
    },
  })

  const reviews: Review[] = reviewsData?.data || []
  const reviewsStats: ReviewsStats = stats?.data

  const filteredReviews = reviews.filter(review => {
    if (filterRating !== "all" && review.rating !== filterRating) return false
    return true
  }).sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "rating":
        return b.rating - a.rating
      default:
        return 0
    }
  })

  if (statsLoading || reviewsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      {reviewsStats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviewsStats.totalReviews}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reviewsStats.averageRating.toFixed(1)}
              </div>
              <StarRating rating={Math.round(reviewsStats.averageRating)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avaliações 5★</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {reviewsStats.ratingDistribution.find(r => r.rating === 5)?.percentage || 0}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comentários</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reviews.filter(r => r.comment).length}
              </div>
              <p className="text-xs text-muted-foreground">
                com comentários
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>

            <Select value={filterPeriod} onValueChange={(value: "all" | "month" | "quarter" | "year") => setFilterPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="month">Este mês</SelectItem>
                <SelectItem value="quarter">Este trimestre</SelectItem>
                <SelectItem value="year">Este ano</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterRating.toString()} onValueChange={(value) => setFilterRating(value === "all" ? "all" : parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Todas as notas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as notas</SelectItem>
                <SelectItem value="5">5 estrelas</SelectItem>
                <SelectItem value="4">4 estrelas</SelectItem>
                <SelectItem value="3">3 estrelas</SelectItem>
                <SelectItem value="2">2 estrelas</SelectItem>
                <SelectItem value="1">1 estrela</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: "newest" | "oldest" | "rating") => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mais recentes</SelectItem>
                <SelectItem value="oldest">Mais antigas</SelectItem>
                <SelectItem value="rating">Melhor avaliação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Avaliações ({filteredReviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma avaliação encontrada</p>
              <p className="text-sm text-gray-400 mt-1">
                Tente ajustar os filtros
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {review.isAnonymous ? "?" : (review.patient?.name?.charAt(0)?.toUpperCase() || "?")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">
                          {review.isAnonymous ? "Avaliação Anônima" : (review.patient?.name || "Paciente")}
                        </span>
                        <StarRating rating={review.rating} />
                        <Badge variant="outline" className="text-xs">
                          {review.rating} estrela{review.rating !== 1 ? "s" : ""}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(review.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                        <span>•</span>
                        <span>Sessão: {review.session.title}</span>
                      </div>

                      {review.comment && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mt-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {review.comment}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

