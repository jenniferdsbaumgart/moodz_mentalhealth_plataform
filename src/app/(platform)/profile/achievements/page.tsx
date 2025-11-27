"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsOverview } from "@/components/gamification/stats-overview"
import { BadgeGrid } from "@/components/gamification/badge-grid"
import { PointsHistory } from "@/components/gamification/points-history"
import { ActivityCalendar } from "@/components/gamification/activity-calendar"
import { useGamificationStats } from "@/hooks/use-wellness"
import { useDailyCheckIn } from "@/hooks/use-wellness"

export default function AchievementsPage() {
  const { data: gamificationData, isLoading: isLoadingStats } = useGamificationStats()
  useDailyCheckIn() // Load check-in data for activity calendar

  const [badges, setBadges] = useState<Array<{
    id: string
    name: string
    slug: string
    description: string
    icon: string
    category: string
    rarity: string
    pointsReward: number
    criteriaType?: string
    criteriaValue?: number
    unlockedAt?: Date
    progress?: {
      current: number
      target: number
      percentage: number
    }
  }>>([])
  const [pointsHistory, setPointsHistory] = useState<Array<{
    id: string
    amount: number
    type: string
    description?: string
    referenceId?: string
    referenceType?: string
    createdAt: Date
  }>>([])
  const [activityData, setActivityData] = useState<Array<{
    date: string
    hasActivity: boolean
    activityCount: number
    pointsEarned: number
    streakDay?: boolean
  }>>([])
  const [isLoadingBadges, setIsLoadingBadges] = useState(true)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [isLoadingActivity, setIsLoadingActivity] = useState(true)

  // Load badges
  useEffect(() => {
    const loadBadges = async () => {
      try {
        const [allBadgesResponse, userBadgesResponse] = await Promise.all([
          fetch("/api/gamification/badges"),
          fetch("/api/gamification/badges/user")
        ])

        if (allBadgesResponse.ok && userBadgesResponse.ok) {
          const allBadges: { data?: Array<{ id: string; name: string; slug: string; description: string; icon: string; category: string; rarity: string; pointsReward: number; criteriaType?: string; criteriaValue?: number }> } = await allBadgesResponse.json()
          const userBadges: { data?: Array<{ badgeId: string; unlockedAt: Date }> } = await userBadgesResponse.json()

          // Mark unlocked badges
          const unlockedBadgeIds = userBadges.data?.map((ub: { badgeId: string; unlockedAt: Date }) => ub.badgeId) || []

          // Add progress information for locked badges
          const badgesWithProgress = allBadges.data?.map((badge: {
            id: string
            name: string
            slug: string
            description: string
            icon: string
            category: string
            rarity: string
            pointsReward: number
            criteriaType?: string
            criteriaValue?: number
          }) => {
            const userBadge = userBadges.data?.find((ub: { badgeId: string; unlockedAt: Date }) => ub.badgeId === badge.id)
            const isUnlocked = unlockedBadgeIds.includes(badge.id)

            if (isUnlocked) {
              return {
                ...badge,
                unlockedAt: userBadge?.unlockedAt,
              }
            }

            // Calculate progress for locked badges
            const progress = null
            if (badge.criteriaType && gamificationData?.data) {
              const stats = gamificationData.data
              const current = 0
              const target = badge.criteriaValue || 0

              switch (badge.criteriaType) {
                case "user_registered":
                  current = 1 // Always unlocked for registered users
                  break
                case "days_active":
                  current = stats.daysActive || 0
                  break
                case "posts_created":
                  current = stats.totalPosts || 0
                  break
                case "comments_created":
                  current = stats.totalComments || 0
                  break
                case "sessions_attended":
                  current = stats.totalSessions || 0
                  break
                case "mood_entries":
                  current = stats.totalMoodEntries || 0
                  break
                case "journal_entries":
                  current = stats.totalJournalEntries || 0
                  break
                case "exercises_completed":
                  current = stats.totalExercisesCompleted || 0
                  break
                case "mood_streak":
                  current = stats.longestMoodStreak || 0
                  break
                case "upvote_received":
                  current = stats.totalUpvotesReceived || 0
                  break
              }

              if (target > 0) {
                progress = {
                  current,
                  target,
                  percentage: Math.min((current / target) * 100, 100),
                }
              }
            }

            return {
              ...badge,
              progress,
            }
          }) || []

          setBadges(badgesWithProgress)
        }
      } catch (error) {
        console.error("Error loading badges:", error)
      } finally {
        setIsLoadingBadges(false)
      }
    }

    loadBadges()
  }, [gamificationData])

  // Load points history
  useEffect(() => {
    const loadPointsHistory = async () => {
      try {
        const response = await fetch("/api/gamification/points")
        if (response.ok) {
          const data = await response.json()
          setPointsHistory(data.data || [])
        }
      } catch (error) {
        console.error("Error loading points history:", error)
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadPointsHistory()
  }, [])

  // Load activity data
  useEffect(() => {
    const loadActivityData = async () => {
      try {
        const response = await fetch("/api/gamification/checkin?type=calendar&days=365")
        if (response.ok) {
          const data = await response.json()

          // Transform check-in data to activity data
          const activityData = data.data?.map((day: { date: string; hasCheckIn: boolean }) => ({
            date: day.date,
            hasActivity: day.hasCheckIn,
            activityCount: day.hasCheckIn ? 1 : 0,
            pointsEarned: day.hasCheckIn ? 10 : 0, // Daily login points
            streakDay: day.hasCheckIn,
          })) || []

          setActivityData(activityData)
        }
      } catch (error) {
        console.error("Error loading activity data:", error)
      } finally {
        setIsLoadingActivity(false)
      }
    }

    loadActivityData()
  }, [])

  const unlockedBadgeIds = badges
    .filter(badge => badge.unlockedAt)
    .map(badge => badge.id)

  const isLoading = isLoadingStats || isLoadingBadges || isLoadingHistory || isLoadingActivity

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-4"></div>
            <div className="h-4 bg-muted rounded w-96"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-muted rounded"></div>
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">🏆 Minhas Conquistas</h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso, conquiste badges e veja sua jornada de bem-estar.
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverview />

        {/* Main Content Tabs */}
        <Tabs defaultValue="badges" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          {/* Badges Tab */}
          <TabsContent value="badges" className="mt-6">
            <BadgeGrid
              badges={badges}
              unlockedBadgeIds={unlockedBadgeIds}
            />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-6">
            <ActivityCalendar
              activityData={activityData}
              months={6}
            />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            <PointsHistory
              transactions={pointsHistory}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
