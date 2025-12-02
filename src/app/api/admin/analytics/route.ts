import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * GET /api/admin/analytics
 * Get comprehensive platform analytics for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30d"

    // Calculate date ranges
    const now = new Date()
    let startDate: Date

    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))

    // Fetch all stats in parallel
    const [
      // User stats
      totalUsers,
      activeUsers7d,
      newUsers30d,
      usersByRole,
      previousPeriodUsers,

      // Session stats
      totalSessions,
      completedSessions,
      cancelledSessions,
      sessionParticipants,
      sessionsByCategory,

      // Community stats
      totalPosts,
      postsInPeriod,
      totalComments,
      commentsInPeriod,
      pendingReports,
      bannedUsers,

      // Wellness stats
      moodEntries,
      journalEntries,
      exercisesCompleted,

      // Gamification stats
      badgesUnlocked,
      totalPoints,
      activeStreaks,

      // Time series data
      usersOverTime,
      sessionsOverTime,
      engagementOverTime
    ] = await Promise.all([
      // User stats
      db.user.count(),
      db.user.count({
        where: {
          OR: [
            { sessionParticipants: { some: { joinedAt: { gte: sevenDaysAgo } } } },
            { dailyCheckIns: { some: { date: { gte: sevenDaysAgo } } } },
            { moodLogs: { some: { createdAt: { gte: sevenDaysAgo } } } },
            { posts: { some: { createdAt: { gte: sevenDaysAgo } } } },
            { comments: { some: { createdAt: { gte: sevenDaysAgo } } } }
          ]
        }
      }),
      db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      db.user.groupBy({
        by: ["role"],
        _count: { id: true }
      }),
      db.user.count({ where: { createdAt: { gte: previousPeriodStart, lt: startDate } } }),

      // Session stats
      db.groupSession.count(),
      db.groupSession.count({ where: { status: "COMPLETED" } }),
      db.groupSession.count({ where: { status: "CANCELLED" } }),
      db.sessionParticipant.count(),
      db.groupSession.groupBy({
        by: ["category"],
        _count: { id: true }
      }),

      // Community stats
      db.post.count(),
      db.post.count({ where: { createdAt: { gte: startDate } } }),
      db.comment.count(),
      db.comment.count({ where: { createdAt: { gte: startDate } } }),
      db.report.count({ where: { status: "PENDING" } }),
      db.user.count({ where: { status: "BANNED" } }),

      // Wellness stats
      db.userMoodLog.count({ where: { createdAt: { gte: startDate } } }),
      db.journalEntry.count({ where: { createdAt: { gte: startDate } } }),
      db.exerciseCompletion.count({ where: { completedAt: { gte: startDate } } }),

      // Gamification stats
      db.userBadge.count({ where: { earnedAt: { gte: startDate } } }),
      db.pointTransaction.aggregate({
        where: { createdAt: { gte: startDate } },
        _sum: { points: true }
      }),
      db.dailyCheckIn.count({
        where: {
          date: { gte: sevenDaysAgo }
        }
      }),

      // Time series - Users over time (last 30 days, grouped by day)
      db.$queryRaw`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM "User"
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,

      // Time series - Sessions over time
      db.$queryRaw`
        SELECT DATE(scheduled_at) as date, COUNT(*) as count
        FROM "GroupSession"
        WHERE scheduled_at >= ${startDate}
        GROUP BY DATE(scheduled_at)
        ORDER BY date ASC
      `,

      // Time series - Engagement (posts + comments + mood logs)
      db.$queryRaw`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM (
          SELECT created_at FROM "Post" WHERE created_at >= ${startDate}
          UNION ALL
          SELECT created_at FROM "Comment" WHERE created_at >= ${startDate}
          UNION ALL
          SELECT created_at FROM "UserMoodLog" WHERE created_at >= ${startDate}
        ) as engagement
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `
    ])

    // Calculate derived metrics
    const avgParticipation = totalSessions > 0 
      ? Math.round((sessionParticipants / totalSessions) * 10) / 10 
      : 0

    const noShowRate = completedSessions > 0
      ? Math.round(((totalSessions - completedSessions - cancelledSessions) / totalSessions) * 100)
      : 0

    const retentionRate = previousPeriodUsers > 0
      ? Math.round((activeUsers7d / previousPeriodUsers) * 100)
      : 0

    // Format users by role
    const roleStats = usersByRole.reduce((acc: Record<string, number>, item) => {
      acc[item.role] = item._count.id
      return acc
    }, {})

    // Format sessions by category
    const categoryStats = sessionsByCategory.reduce((acc: Record<string, number>, item) => {
      acc[item.category] = item._count.id
      return acc
    }, {})

    // Calculate daily averages
    const daysInPeriod = Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
    const postsPerDay = daysInPeriod > 0 ? Math.round((postsInPeriod / daysInPeriod) * 10) / 10 : 0
    const commentsPerDay = daysInPeriod > 0 ? Math.round((commentsInPeriod / daysInPeriod) * 10) / 10 : 0
    const moodEntriesPerDay = daysInPeriod > 0 ? Math.round((moodEntries / daysInPeriod) * 10) / 10 : 0

    return NextResponse.json({
      stats: {
        // Users
        totalUsers,
        activeUsers7d,
        newUsers30d,
        retentionRate,
        usersByRole: roleStats,

        // Sessions
        totalSessions,
        completedSessions,
        cancelledSessions,
        avgParticipation,
        noShowRate,
        sessionsByCategory: categoryStats,

        // Community
        totalPosts,
        postsPerDay,
        totalComments,
        commentsPerDay,
        pendingReports,
        bannedUsers,

        // Wellness
        moodEntries,
        moodEntriesPerDay,
        journalEntries,
        exercisesCompleted,

        // Gamification
        badgesUnlocked,
        totalPointsDistributed: totalPoints._sum.points || 0,
        activeStreaks
      },
      charts: {
        usersOverTime: usersOverTime || [],
        sessionsOverTime: sessionsOverTime || [],
        engagementOverTime: engagementOverTime || [],
        sessionsByCategory: Object.entries(categoryStats).map(([name, value]) => ({
          name,
          value
        }))
      },
      period,
      generatedAt: now.toISOString()
    })
  } catch (error) {
    console.error("Error fetching admin analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}

