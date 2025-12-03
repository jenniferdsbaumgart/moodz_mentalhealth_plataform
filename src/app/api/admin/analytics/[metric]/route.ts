import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
/**
 * GET /api/admin/analytics/[metric]
 * Get detailed analytics for a specific metric
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { metric: string } }
) {
  try {
    const session = await auth()
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
    const metric = params.metric
    // Calculate date range
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
    let data: any
    switch (metric) {
      case "users":
        data = await getUsersMetrics(startDate, now)
        break
      case "sessions":
        data = await getSessionsMetrics(startDate, now)
        break
      case "community":
        data = await getCommunityMetrics(startDate, now)
        break
      case "wellness":
        data = await getWellnessMetrics(startDate, now)
        break
      case "gamification":
        data = await getGamificationMetrics(startDate, now)
        break
      case "mood":
        data = await getMoodMetrics(startDate, now)
        break
      default:
        return NextResponse.json(
          { error: "Invalid metric" },
          { status: 400 }
        )
    }
    return NextResponse.json({
      metric,
      period,
      data,
      generatedAt: now.toISOString()
    })
  } catch (error) {
    console.error(`Error fetching ${params.metric} analytics:`, error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
async function getUsersMetrics(startDate: Date, endDate: Date) {
  const [
    total,
    newInPeriod,
    byRole,
    byStatus,
    growthOverTime,
    topActiveUsers
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: startDate } } }),
    db.user.groupBy({
      by: ["role"],
      _count: { id: true }
    }),
    db.user.groupBy({
      by: ["status"],
      _count: { id: true }
    }),
    db.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM "User"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `,
    db.user.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            sessionParticipants: true,
            posts: true,
            comments: true
          }
        }
      },
      orderBy: {
        sessionParticipants: { _count: "desc" }
      },
      take: 10
    })
  ])
  return {
    total,
    newInPeriod,
    byRole: byRole.reduce((acc: Record<string, number>, item) => {
      acc[item.role] = item._count.id
      return acc
    }, {}),
    byStatus: byStatus.reduce((acc: Record<string, number>, item) => {
      acc[item.status] = item._count.id
      return acc
    }, {}),
    growthOverTime,
    topActiveUsers: topActiveUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      sessions: u._count.sessionParticipants,
      posts: u._count.posts,
      comments: u._count.comments
    }))
  }
}
async function getSessionsMetrics(startDate: Date, endDate: Date) {
  const [
    total,
    inPeriod,
    byStatus,
    byCategory,
    avgParticipants,
    sessionsOverTime,
    topTherapists
  ] = await Promise.all([
    db.groupSession.count(),
    db.groupSession.count({ where: { scheduledAt: { gte: startDate } } }),
    db.groupSession.groupBy({
      by: ["status"],
      _count: { id: true }
    }),
    db.groupSession.groupBy({
      by: ["category"],
      _count: { id: true }
    }),
    db.groupSession.aggregate({
      _avg: { maxParticipants: true }
    }),
    db.$queryRaw`
      SELECT DATE(scheduled_at) as date, COUNT(*) as count, status
      FROM "GroupSession"
      WHERE scheduled_at >= ${startDate}
      GROUP BY DATE(scheduled_at), status
      ORDER BY date ASC
    `,
    db.therapistProfile.findMany({
      select: {
        id: true,
        user: { select: { name: true, email: true } },
        _count: { select: { sessions: true } }
      },
      orderBy: { sessions: { _count: "desc" } },
      take: 10
    })
  ])
  return {
    total,
    inPeriod,
    byStatus: byStatus.reduce((acc: Record<string, number>, item) => {
      acc[item.status] = item._count.id
      return acc
    }, {}),
    byCategory: byCategory.reduce((acc: Record<string, number>, item) => {
      acc[item.category] = item._count.id
      return acc
    }, {}),
    avgParticipants: avgParticipants._avg.maxParticipants || 0,
    sessionsOverTime,
    topTherapists: topTherapists.map(t => ({
      id: t.id,
      name: t.user.name,
      email: t.user.email,
      sessionsCount: t._count.sessions
    }))
  }
}
async function getCommunityMetrics(startDate: Date, endDate: Date) {
  const [
    totalPosts,
    postsInPeriod,
    totalComments,
    commentsInPeriod,
    totalVotes,
    reportsByStatus,
    postsOverTime,
    topPosters
  ] = await Promise.all([
    db.post.count(),
    db.post.count({ where: { createdAt: { gte: startDate } } }),
    db.comment.count(),
    db.comment.count({ where: { createdAt: { gte: startDate } } }),
    db.vote.count({ where: { createdAt: { gte: startDate } } }),
    db.report.groupBy({
      by: ["status"],
      _count: { id: true }
    }),
    db.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as posts,
        (SELECT COUNT(*) FROM "Comment" WHERE DATE(created_at) = DATE(p.created_at)) as comments
      FROM "Post" p
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `,
    db.user.findMany({
      where: { posts: { some: { createdAt: { gte: startDate } } } },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            posts: { where: { createdAt: { gte: startDate } } },
            comments: { where: { createdAt: { gte: startDate } } }
          }
        }
      },
      orderBy: { posts: { _count: "desc" } },
      take: 10
    })
  ])
  return {
    totalPosts,
    postsInPeriod,
    totalComments,
    commentsInPeriod,
    totalVotes,
    reportsByStatus: reportsByStatus.reduce((acc: Record<string, number>, item) => {
      acc[item.status] = item._count.id
      return acc
    }, {}),
    postsOverTime,
    topPosters: topPosters.map(u => ({
      id: u.id,
      name: u.name,
      posts: u._count.posts,
      comments: u._count.comments
    }))
  }
}
async function getWellnessMetrics(startDate: Date, endDate: Date) {
  const [
    moodEntries,
    journalEntries,
    exercisesCompleted,
    checkIns,
    moodOverTime,
    exercisesByType
  ] = await Promise.all([
    db.userMoodLog.count({ where: { createdAt: { gte: startDate } } }),
    db.journalEntry.count({ where: { createdAt: { gte: startDate } } }),
    db.exerciseCompletion.count({ where: { completedAt: { gte: startDate } } }),
    db.dailyCheckIn.count({ where: { date: { gte: startDate } } }),
    db.$queryRaw`
      SELECT DATE(created_at) as date, AVG(mood_score) as avg_mood, COUNT(*) as count
      FROM "UserMoodLog"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `,
    db.exerciseCompletion.groupBy({
      by: ["exerciseId"],
      where: { completedAt: { gte: startDate } },
      _count: { id: true }
    })
  ])
  return {
    moodEntries,
    journalEntries,
    exercisesCompleted,
    checkIns,
    moodOverTime,
    exercisesByType
  }
}
async function getGamificationMetrics(startDate: Date, endDate: Date) {
  const [
    badgesEarned,
    totalPoints,
    pointsByType,
    streaksActive,
    topBadges,
    leaderboard
  ] = await Promise.all([
    db.userBadge.count({ where: { earnedAt: { gte: startDate } } }),
    db.pointTransaction.aggregate({
      where: { createdAt: { gte: startDate } },
      _sum: { points: true }
    }),
    db.pointTransaction.groupBy({
      by: ["type"],
      where: { createdAt: { gte: startDate } },
      _sum: { points: true },
      _count: { id: true }
    }),
    db.dailyCheckIn.count({
      where: {
        date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    }),
    db.userBadge.groupBy({
      by: ["badgeId"],
      where: { earnedAt: { gte: startDate } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10
    }),
    db.user.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { badges: true, pointTransactions: true } }
      },
      orderBy: { badges: { _count: "desc" } },
      take: 10
    })
  ])
  return {
    badgesEarned,
    totalPoints: totalPoints._sum.points || 0,
    pointsByType: pointsByType.map(p => ({
      type: p.type,
      total: p._sum.points || 0,
      count: p._count.id
    })),
    streaksActive,
    topBadges,
    leaderboard: leaderboard.map(u => ({
      id: u.id,
      name: u.name,
      badges: u._count.badges,
      transactions: u._count.pointTransactions
    }))
  }
}
async function getMoodMetrics(startDate: Date, endDate: Date) {
  const [
    totalEntries,
    avgMood,
    moodDistribution,
    moodOverTime,
    topFactors
  ] = await Promise.all([
    db.userMoodLog.count({ where: { createdAt: { gte: startDate } } }),
    db.userMoodLog.aggregate({
      where: { createdAt: { gte: startDate } },
      _avg: { moodScore: true }
    }),
    db.userMoodLog.groupBy({
      by: ["moodScore"],
      where: { createdAt: { gte: startDate } },
      _count: { id: true }
    }),
    db.$queryRaw`
      SELECT DATE(created_at) as date, 
             AVG(mood_score) as avg_mood,
             MIN(mood_score) as min_mood,
             MAX(mood_score) as max_mood,
             COUNT(*) as count
      FROM "UserMoodLog"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `,
    db.$queryRaw`
      SELECT factors, COUNT(*) as count
      FROM "UserMoodLog"
      WHERE created_at >= ${startDate} AND factors IS NOT NULL
      GROUP BY factors
      ORDER BY count DESC
      LIMIT 10
    `
  ])
  return {
    totalEntries,
    avgMood: avgMood._avg.moodScore || 0,
    moodDistribution: moodDistribution.map(m => ({
      score: m.moodScore,
      count: m._count.id
    })),
    moodOverTime,
    topFactors
  }
}
