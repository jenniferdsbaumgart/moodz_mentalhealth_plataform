import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * GET /api/admin/users/[id]/activity
 * Get detailed activity history for a user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const admin = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const userId = params.id

    // Fetch user with all related data
    const [
      user,
      posts,
      comments,
      sessions,
      reportsReceived,
      reportsSubmitted,
      badges,
      moodLogs,
      auditLogs
    ] = await Promise.all([
      // Basic user info
      db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          image: true,
          therapistProfile: {
            select: {
              verified: true,
              specialization: true,
              crp: true
            }
          }
        }
      }),

      // Posts
      db.post.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          title: true,
          category: true,
          createdAt: true,
          _count: { select: { comments: true, votes: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 20
      }),

      // Comments
      db.comment.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          content: true,
          createdAt: true,
          post: { select: { id: true, title: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 20
      }),

      // Sessions participated
      db.sessionParticipant.findMany({
        where: { userId: userId },
        select: {
          id: true,
          joinedAt: true,
          leftAt: true,
          session: {
            select: {
              id: true,
              title: true,
              category: true,
              scheduledAt: true,
              status: true
            }
          }
        },
        orderBy: { joinedAt: "desc" },
        take: 20
      }),

      // Reports received (against this user's content)
      db.report.findMany({
        where: {
          OR: [
            { contentId: { in: await db.post.findMany({ where: { authorId: userId }, select: { id: true } }).then(p => p.map(x => x.id)) } },
            { contentId: { in: await db.comment.findMany({ where: { authorId: userId }, select: { id: true } }).then(c => c.map(x => x.id)) } }
          ]
        },
        select: {
          id: true,
          reason: true,
          status: true,
          contentType: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" },
        take: 20
      }),

      // Reports submitted by user
      db.report.findMany({
        where: { reporterId: userId },
        select: {
          id: true,
          reason: true,
          status: true,
          contentType: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" },
        take: 10
      }),

      // Badges earned
      db.userBadge.findMany({
        where: { userId: userId },
        select: {
          id: true,
          earnedAt: true,
          badge: {
            select: {
              id: true,
              name: true,
              description: true,
              icon: true
            }
          }
        },
        orderBy: { earnedAt: "desc" }
      }),

      // Mood logs (last 30)
      db.userMoodLog.findMany({
        where: { userId: userId },
        select: {
          id: true,
          moodScore: true,
          factors: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" },
        take: 30
      }),

      // Audit logs for this user
      db.auditLog.findMany({
        where: {
          OR: [
            { userId: userId },
            { entityType: "USER", entityId: userId }
          ]
        },
        select: {
          id: true,
          action: true,
          entityType: true,
          details: true,
          createdAt: true,
          user: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 50
      })
    ])

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate stats
    const stats = {
      totalPosts: posts.length,
      totalComments: comments.length,
      totalSessions: sessions.length,
      reportsReceived: reportsReceived.length,
      reportsSubmitted: reportsSubmitted.length,
      badgesEarned: badges.length,
      avgMoodScore: moodLogs.length > 0
        ? moodLogs.reduce((sum, log) => sum + log.moodScore, 0) / moodLogs.length
        : null
    }

    // Build activity timeline
    const timeline = [
      ...posts.map(p => ({
        type: "post" as const,
        id: p.id,
        title: p.title,
        date: p.createdAt,
        details: { category: p.category, comments: p._count.comments, votes: p._count.votes }
      })),
      ...comments.map(c => ({
        type: "comment" as const,
        id: c.id,
        title: `Comentário em "${c.post.title}"`,
        date: c.createdAt,
        details: { postId: c.post.id }
      })),
      ...sessions.map(s => ({
        type: "session" as const,
        id: s.id,
        title: s.session.title,
        date: s.joinedAt,
        details: { category: s.session.category, status: s.session.status }
      })),
      ...badges.map(b => ({
        type: "badge" as const,
        id: b.id,
        title: `Conquistou badge "${b.badge.name}"`,
        date: b.earnedAt,
        details: { badgeId: b.badge.id, icon: b.badge.icon }
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 50)

    return NextResponse.json({
      user,
      stats,
      activity: {
        posts,
        comments,
        sessions,
        reportsReceived,
        reportsSubmitted,
        badges,
        moodLogs
      },
      timeline,
      auditLogs
    })
  } catch (error) {
    console.error("Error fetching user activity:", error)
    return NextResponse.json(
      { error: "Failed to fetch user activity" },
      { status: 500 }
    )
  }
}

