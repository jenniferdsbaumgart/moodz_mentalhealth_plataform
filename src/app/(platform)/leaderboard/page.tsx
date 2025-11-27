"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TopUserCard } from "@/components/gamification/top-user-card"
import { LeaderboardTable } from "@/components/gamification/leaderboard-table"
import { Trophy, Medal, Award, TrendingUp, Users, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface LeaderboardUser {
  position: number
  userId: string
  name: string
  image?: string
  level: number
  totalPoints: number
  periodPoints: number
  currentStreak: number
}

interface LeaderboardData {
  leaderboard: LeaderboardUser[]
  currentUserPosition?: LeaderboardUser
  period: string
  totalCount: number
}

export default function LeaderboardPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("all")
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadLeaderboard = async (period: string) => {
    try {
      setIsRefreshing(true)
      const response = await fetch(`/api/gamification/leaderboard?period=${period}&limit=50`)

      if (response.ok) {
        const data = await response.json()
        setLeaderboardData(data.data)
      } else {
        console.error("Error loading leaderboard:", response.statusText)
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadLeaderboard(activeTab)
  }, [activeTab])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleRefresh = () => {
    loadLeaderboard(activeTab)
  }

  const getTabLabel = (period: string) => {
    switch (period) {
      case "all": return "Geral"
      case "week": return "Esta Semana"
      case "month": return "Este Mês"
      default: return "Geral"
    }
  }

  const getTabDescription = (period: string) => {
    switch (period) {
      case "all":
        return "Ranking geral baseado em todos os pontos acumulados"
      case "week":
        return "Ranking baseado nos pontos ganhos nesta semana"
      case "month":
        return "Ranking baseado nos pontos ganhos neste mês"
      default:
        return ""
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-4"></div>
            <div className="h-4 bg-muted rounded w-96"></div>
          </div>

          {/* Loading skeleton for podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-muted rounded"></div>
              </div>
            ))}
          </div>

          <div className="animate-pulse">
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const topUsers = leaderboardData?.leaderboard.slice(0, 3) || []
  const currentUserPosition = leaderboardData?.currentUserPosition
  const showCurrentUserCard = currentUserPosition && !topUsers.find(u => u.userId === session?.user?.id)

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Leaderboard
            </h1>
            <p className="text-muted-foreground">
              Veja como você se compara com outros usuários da plataforma
            </p>
          </div>

          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Atualizar
          </Button>
        </div>

        {/* Period Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="gap-2">
              <Award className="h-4 w-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="week" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Semana
            </TabsTrigger>
            <TabsTrigger value="month" className="gap-2">
              <Users className="h-4 w-4" />
              Mês
            </TabsTrigger>
          </TabsList>

          {/* Tab Description */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {getTabDescription(activeTab)}
            </p>
          </div>

          <TabsContent value={activeTab} className="mt-8 space-y-8">
            {/* Podium - Top 3 */}
            {topUsers.length > 0 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">🏆 Pódio</h2>
                  <p className="text-muted-foreground">
                    Os melhores da {getTabLabel(activeTab).toLowerCase()}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topUsers.map((user, index) => {
                    // Reorder for podium: 2nd, 1st, 3rd for better visual layout
                    const displayOrder = [1, 0, 2] // position 2, 1, 3
                    const podiumUser = topUsers[displayOrder[index]]

                    if (!podiumUser) return null

                    return (
                      <TopUserCard
                        key={podiumUser.userId}
                        user={podiumUser}
                        isCurrentUser={podiumUser.userId === session?.user?.id}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Current User Highlight (if not in top 3) */}
            {showCurrentUserCard && currentUserPosition && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Medal className="h-5 w-5 text-primary" />
                    Sua Posição
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        #{currentUserPosition.position}
                      </Badge>
                      <div>
                        <div className="font-semibold">{currentUserPosition.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {currentUserPosition.periodPoints.toLocaleString()} pontos
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Nível</div>
                      <div className="font-semibold">{currentUserPosition.level}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Full Leaderboard Table */}
            <LeaderboardTable
              users={leaderboardData?.leaderboard || []}
              currentUserId={session?.user?.id}
              totalCount={leaderboardData?.totalCount || 0}
              itemsPerPage={10}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
