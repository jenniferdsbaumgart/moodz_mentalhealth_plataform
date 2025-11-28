"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Star, TrendingUp, TrendingDown, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"

interface PointsTransaction {
  id: string
  amount: number
  type: string
  description?: string
  referenceId?: string
  referenceType?: string
  createdAt: Date
}

interface PointsHistoryProps {
  transactions?: PointsTransaction[]
  isLoading?: boolean
  className?: string
}

const pointTypeLabels = {
  DAILY_LOGIN: "Check-in Diário",
  STREAK_BONUS_7: "Bônus de Sequência (7 dias)",
  STREAK_BONUS_30: "Bônus de Sequência (30 dias)",
  STREAK_BONUS_100: "Bônus de Sequência (100 dias)",
  POST_CREATED: "Post Criado",
  COMMENT_CREATED: "Comentário Criado",
  UPVOTE_RECEIVED: "Upvote Recebido",
  SESSION_ATTENDED: "Sessão Participada",
  MOOD_LOGGED: "Humor Registrado",
  JOURNAL_WRITTEN: "Diário Escrito",
  EXERCISE_COMPLETED: "Exercício Completado",
  BADGE_UNLOCKED: "Badge Desbloqueado",
  ADMIN_BONUS: "Bônus Admin",
  PENALTY: "Penalidade",
} as const

const pointTypeIcons = {
  DAILY_LOGIN: Star,
  STREAK_BONUS_7: TrendingUp,
  STREAK_BONUS_30: TrendingUp,
  STREAK_BONUS_100: TrendingUp,
  POST_CREATED: TrendingUp,
  COMMENT_CREATED: TrendingUp,
  UPVOTE_RECEIVED: TrendingUp,
  SESSION_ATTENDED: TrendingUp,
  MOOD_LOGGED: TrendingUp,
  JOURNAL_WRITTEN: TrendingUp,
  EXERCISE_COMPLETED: TrendingUp,
  BADGE_UNLOCKED: TrendingUp,
  ADMIN_BONUS: Star,
  PENALTY: TrendingDown,
} as const

const pointTypeColors = {
  DAILY_LOGIN: "text-blue-600",
  STREAK_BONUS_7: "text-green-600",
  STREAK_BONUS_30: "text-green-600",
  STREAK_BONUS_100: "text-green-600",
  POST_CREATED: "text-purple-600",
  COMMENT_CREATED: "text-purple-600",
  UPVOTE_RECEIVED: "text-yellow-600",
  SESSION_ATTENDED: "text-indigo-600",
  MOOD_LOGGED: "text-pink-600",
  JOURNAL_WRITTEN: "text-orange-600",
  EXERCISE_COMPLETED: "text-teal-600",
  BADGE_UNLOCKED: "text-red-600",
  ADMIN_BONUS: "text-cyan-600",
  PENALTY: "text-red-600",
} as const

export function PointsHistory({ transactions = [], isLoading = false, className }: PointsHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = format(new Date(transaction.createdAt), "yyyy-MM-dd")
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(transaction)
    return groups
  }, {} as Record<string, PointsTransaction[]>)

  // Sort dates descending and transactions within each date by time
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a))

  // Pagination
  const totalPages = Math.ceil(sortedDates.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDates = sortedDates.slice(startIndex, endIndex)

  const getTotalPointsToday = () => {
    const today = format(new Date(), "yyyy-MM-dd")
    return transactions
      .filter(t => format(new Date(t.createdAt), "yyyy-MM-dd") === today)
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getTotalPointsThisWeek = () => {
    const weekAgo = subDays(new Date(), 7)
    return transactions
      .filter(t => new Date(t.createdAt) >= weekAgo)
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getPointsChange = () => {
    const today = getTotalPointsToday()
    const yesterday = transactions
      .filter(t => {
        const transactionDate = new Date(t.createdAt)
        const yesterdayDate = subDays(new Date(), 1)
        return transactionDate >= startOfDay(yesterdayDate) && transactionDate <= endOfDay(yesterdayDate)
      })
      .reduce((sum, t) => sum + t.amount, 0)

    if (yesterday === 0) return { change: today, isPositive: true }
    const change = today - yesterday
    return { change: Math.abs(change), isPositive: change >= 0 }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Histórico de Pontos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const pointsChange = getPointsChange()

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Histórico de Pontos
          </CardTitle>

          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold">{getTotalPointsToday()}</div>
              <div className="text-muted-foreground">Hoje</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{getTotalPointsThisWeek()}</div>
              <div className="text-muted-foreground">Esta semana</div>
            </div>
            <div className="flex items-center gap-1">
              {pointsChange.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={pointsChange.isPositive ? "text-green-600" : "text-red-600"}>
                {pointsChange.change > 0 ? `+${pointsChange.change}` : pointsChange.change}
              </span>
              <span className="text-muted-foreground">vs ontem</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum ponto ainda</h3>
            <p className="text-muted-foreground">
              Comece a ganhar pontos registrando seu humor, escrevendo no diário ou participando de sessões!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <ScrollArea className="h-96">
              {currentDates.map(date => {
                const dayTransactions = groupedTransactions[date]
                const totalDayPoints = dayTransactions.reduce((sum, t) => sum + t.amount, 0)

                return (
                  <div key={date} className="space-y-3">
                    {/* Date Header */}
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                        </span>
                      </div>
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-3 w-3" />
                        {totalDayPoints > 0 ? `+${totalDayPoints}` : totalDayPoints}
                      </Badge>
                    </div>

                    {/* Transactions */}
                    <div className="space-y-2 pl-6">
                      {dayTransactions
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map(transaction => {
                          const Icon = pointTypeIcons[transaction.type as keyof typeof pointTypeIcons] || Star
                          const colorClass = pointTypeColors[transaction.type as keyof typeof pointTypeColors] || "text-gray-600"
                          const label = pointTypeLabels[transaction.type as keyof typeof pointTypeLabels] || transaction.type

                          return (
                            <div key={transaction.id} className="flex items-center justify-between py-2">
                              <div className="flex items-center gap-3">
                                <div className={`p-1 rounded ${colorClass.replace('text-', 'bg-').replace('-600', '-100')}`}>
                                  <Icon className={`h-4 w-4 ${colorClass}`} />
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{label}</div>
                                  {transaction.description && (
                                    <div className="text-xs text-muted-foreground">{transaction.description}</div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`font-semibold text-sm ${
                                  transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(transaction.createdAt), "HH:mm")}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                    </div>

                    {date !== currentDates[currentDates.length - 1] && <Separator />}
                  </div>
                )
              })}
            </ScrollArea>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>

                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

