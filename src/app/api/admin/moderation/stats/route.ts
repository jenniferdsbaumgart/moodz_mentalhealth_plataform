import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
/**
 * GET /api/admin/moderation/stats
 * Get moderation statistics and metrics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // Check if user is admin
    const admin = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    if (!["ADMIN", "SUPER_ADMIN"].includes(admin?.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    // Get report counts by status
    const [
      pendingCount,
      // inReviewCount,
      resolvedCount,
      dismissedCount,
      totalReports
    ] = await Promise.all([
      db.report.count({ where: { status: "PENDING" } }),
      // db.report.count({ where: { status: "IN_REVIEW" } }),
      db.report.count({ where: { status: "RESOLVED" } }),
      db.report.count({ where: { status: "DISMISSED" } }),
      db.report.count()
    ])
    const inReviewCount = 0
    // Get reports by reason/type
    const reportsByReason = await db.report.groupBy({
      by: ["reason"],
      _count: { id: true },
      where: { status: "PENDING" }
    })
    // Get resolved today
    const resolvedToday = await db.report.count({
      where: {
        resolvedAt: { gte: todayStart },
        status: { in: ["RESOLVED", "DISMISSED"] }
      }
    })
    // Get resolved this week
    const resolvedThisWeek = await db.report.count({
      where: {
        resolvedAt: { gte: weekStart },
        status: { in: ["RESOLVED", "DISMISSED"] }
      }
    })
    // Calculate average resolution time (for resolved reports this month)
    const resolvedReportsData = await db.report.findMany({
      where: {
        resolvedAt: { gte: monthStart },
        status: { in: ["RESOLVED", "DISMISSED"] }
      },
      select: {
        createdAt: true,
        resolvedAt: true
      }
    })
    let avgResolutionTime = 0
    if (resolvedReportsData.length > 0) {
      const totalTime = resolvedReportsData.reduce((sum, report) => {
        if (report.resolvedAt) {
          return sum + (report.resolvedAt.getTime() - report.createdAt.getTime())
        }
        return sum
      }, 0)
      avgResolutionTime = totalTime / resolvedReportsData.length / (1000 * 60 * 60) // Convert to hours
    }
    // Get most active moderators
    const moderatorActions = await db.auditLog.groupBy({
      by: ["userId"],
      _count: { id: true },
      where: {
        action: {
          in: [
            "REPORT_RESOLVED",
            "POST_DELETED",
            "COMMENT_DELETED",
            "USER_BANNED",
            "USER_UPDATED"
          ]
        }, createdAt: { gte: weekStart }
      },
      orderBy: { _count: { id: "desc" } },
      take: 5
    })
    // Get moderator details
    const moderatorIds = moderatorActions.map(m => m.userId)
    const moderators = await db.user.findMany({
      where: { id: { in: moderatorIds } },
      select: { id: true, name: true, image: true }
    })
    const topModerators = moderatorActions.map(action => {
      const moderator = moderators.find(m => m.id === action.userId)
      return {
        id: action.userId,
        name: moderator?.name || "Unknown",
        image: moderator?.image,
        actionsCount: action._count.id
      }
    })
    // Get banned users count
    const bannedUsersCount = await db.user.count({
      where: { status: "BANNED" }
    })
    // Get suspended users count
    const suspendedUsersCount = await db.user.count({
      where: { status: "SUSPENDED" }
    })
    // Get content stats
    const [totalPosts, totalComments] = await Promise.all([
      db.post.count(),
      db.comment.count()
    ])
    // Priority queue - reports sorted by severity
    const priorityMapping: Record<string, number> = {
      "SELF_HARM": 1,
      "SUICIDE": 1,
      "VIOLENCE": 2,
      "HATE_SPEECH": 2,
      "HARASSMENT": 3,
      "INAPPROPRIATE": 4,
      "SPAM": 5,
      "OTHER": 6
    }
    const pendingReportsByPriority = await db.report.findMany({
      where: { status: "PENDING" },
      select: { reason: true }
    })
    const priorityBreakdown = {
      critical: pendingReportsByPriority.filter(r => ["SELF_HARM", "SUICIDE"].includes(r.reason)).length,
      high: pendingReportsByPriority.filter(r => ["VIOLENCE", "HATE_SPEECH"].includes(r.reason)).length,
      medium: pendingReportsByPriority.filter(r => ["HARASSMENT", "INAPPROPRIATE"].includes(r.reason)).length,
      low: pendingReportsByPriority.filter(r => ["SPAM", "OTHER"].includes(r.reason)).length
    }
    // Resolution rate
    const resolutionRate = totalReports > 0
      ? Math.round(((resolvedCount + dismissedCount) / totalReports) * 100)
      : 0
    return NextResponse.json({
      overview: {
        pendingReports: pendingCount,
        inReviewReports: inReviewCount,
        resolvedReports: resolvedCount,
        dismissedReports: dismissedCount,
        totalReports,
        bannedUsers: bannedUsersCount,
        suspendedUsers: suspendedUsersCount,
        totalPosts,
        totalComments
      },
      performance: {
        resolvedToday,
        resolvedThisWeek,
        avgResolutionTimeHours: Math.round(avgResolutionTime * 10) / 10,
        resolutionRate
      },
      reportsByReason: reportsByReason.map(r => ({
        reason: r.reason,
        count: r._count.id
      })),
      priorityBreakdown,
      topModerators
    })
  } catch (error) {
    console.error("Error fetching moderation stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch moderation stats" },
      { status: 500 }
    )
  }
}
