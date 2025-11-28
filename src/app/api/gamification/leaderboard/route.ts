import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

interface LeaderboardUser {
  userId: string
  points: number
  level: number
  streak: number
  longestStreak: number
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    createdAt: Date
  }
  periodPoints?: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "all" // "all", "week", "month"
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)

    // Calculate date ranges
    const now = new Date()
    let startDate: Date | undefined

    if (period === "week") {
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
    } else if (period === "month") {
      startDate = new Date(now)
      startDate.setMonth(now.getMonth() - 1)
    }

    // Build where clause for filtering
    const whereClause: {
      user: {
        status: "ACTIVE"
        role: {
          not: "SUPER_ADMIN"
        }
      }
      createdAt?: {
        gte: Date
      }
    } = {
      user: {
        status: "ACTIVE",
        role: {
          not: "SUPER_ADMIN"
        }
      }
    }

    if (startDate) {
      whereClause.createdAt = {
        gte: startDate
      }
    }

    // Get leaderboard data
    const leaderboardData = await prisma.patientProfile.findMany({
      where: {
        user: {
          status: "ACTIVE",
          role: {
            not: "SUPER_ADMIN"
          }
        }
      },
      select: {
        userId: true,
        points: true,
        level: true,
        streak: true,
        longestStreak: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          }
        }
      },
      orderBy: {
        points: "desc"
      },
      take: limit,
    })

    // Calculate points for the period if needed
    let processedLeaderboard: LeaderboardUser[] = leaderboardData

    if (startDate) {
      // For week/month periods, we need to calculate points earned in that period
      const periodPoints = await prisma.pointTransaction.groupBy({
        by: ["userId"],
        where: {
          createdAt: {
            gte: startDate
          }
        },
        _sum: {
          amount: true
        }
      })

      // Create a map of userId to period points
      const periodPointsMap = new Map(
        periodPoints.map(p => [p.userId, p._sum.amount || 0])
      )

      // Filter and sort by period points
      processedLeaderboard = leaderboardData
        .map(user => ({
          ...user,
          periodPoints: periodPointsMap.get(user.userId) || 0
        }))
        .filter(user => user.periodPoints! > 0)
        .sort((a, b) => b.periodPoints! - a.periodPoints!)
        .slice(0, limit)
    }

    // Add position and format data
    const leaderboard = processedLeaderboard.map((user, index) => ({
      position: index + 1,
      userId: user.userId,
      name: user.user.name || "Usuário Anônimo",
      email: user.user.email,
      image: user.user.image,
      level: user.level,
      totalPoints: user.points,
      periodPoints: period === "all" ? user.points : user.periodPoints || 0,
      currentStreak: user.streak,
      longestStreak: user.longestStreak,
      memberSince: user.user.createdAt,
    }))

    // Get current user position if not in top results
    const session = await auth()
    let currentUserPosition = null

    if (session?.user?.id) {
      if (!leaderboard.find(u => u.userId === session.user.id)) {
        // User is not in top results, find their position
        const userPosition = await getUserPosition(session.user.id, period, startDate)
        if (userPosition) {
          currentUserPosition = userPosition
        }
      }
    }

    return NextResponse.json({
      data: {
        leaderboard,
        currentUserPosition,
        period,
        totalCount: leaderboard.length,
      }
    })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

async function getUserPosition(userId: string, period: string, startDate?: Date) {
  try {
    // Get user's stats
    const userStats = await prisma.patientProfile.findUnique({
      where: { userId },
      select: {
        points: true,
        level: true,
        streak: true,
        longestStreak: true,
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            createdAt: true,
          }
        }
      }
    })

    if (!userStats) return null

    let userPoints = userStats.points

    if (startDate) {
      // Calculate points for the period
      const periodPoints = await prisma.pointTransaction.aggregate({
        where: {
          userId,
          createdAt: {
            gte: startDate
          }
        },
        _sum: {
          amount: true
        }
      })
      userPoints = periodPoints._sum.amount || 0
    }

    // Count users with more points
    const usersWithMorePoints = await prisma.patientProfile.count({
      where: {
        points: {
          gt: userPoints
        },
        user: {
          status: "ACTIVE",
          role: {
            not: "SUPER_ADMIN"
          }
        }
      }
    })

    const position = usersWithMorePoints + 1

    return {
      position,
      userId,
      name: userStats.user.name || "Usuário Anônimo",
      email: userStats.user.email,
      image: userStats.user.image,
      level: userStats.level,
      totalPoints: userStats.points,
      periodPoints: userPoints,
      currentStreak: userStats.streak,
      longestStreak: userStats.longestStreak,
      memberSince: userStats.user.createdAt,
    }
  } catch (error) {
    console.error("Error getting user position:", error)
    return null
  }
}
