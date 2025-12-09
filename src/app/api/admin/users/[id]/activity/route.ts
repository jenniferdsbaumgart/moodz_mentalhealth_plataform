import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * GET /api/admin/users/[id]/activity
 * Get detailed activity history for a user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    if (admin?.role !== "ADMIN" && admin?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id: userId } = await params

    // Fetch user basic info first
    const user = await db.user.findUnique({
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
            isVerified: true,
            specializations: true,
            crp: true
          }
        },
        patientProfile: {
          select: {
            points: true,
            level: true
          }
        },
        profile: {
          select: {
            bio: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Fetch details in parallel
    const [posts, comments, sessions, reports, badges, moodLogs, auditLogs] = await Promise.all([
      // Posts
      db.post.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          createdAt: true,
          _count: { select: { comments: true, votes: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 10
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
        take: 10
      }),
      // Sessions
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
        take: 5
      }),
      // Reports (authored by user)
      db.report.findMany({
        where: { reporterId: userId },
        take: 5,
        orderBy: { createdAt: "desc" }
      }),
      // Badges
      db.userBadge.findMany({
        where: { userId: userId },
        include: { badge: true },
        orderBy: { unlockedAt: "desc" },
        take: 10
      }),
      // Mood Logs
      db.userMoodLog.findMany({
        where: { userId: userId },
        select: {
          mood: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" },
        take: 30
      }),
      // Audit Logs
      db.auditLog.findMany({
        where: {
          OR: [
            { userId: userId },
            { entityId: userId, entity: "USER" }
          ]
        },
        take: 20,
        orderBy: { createdAt: "desc" }
      })
    ])

    // Calculate stats
    const stats = {
      postsCount: await db.post.count({ where: { authorId: userId } }),
      commentsCount: await db.comment.count({ where: { authorId: userId } }),
      sessionsCount: await db.sessionParticipant.count({
        where: { userId: userId, status: "ATTENDED" }
      }),
      reportsCount: await db.report.count({
        where: { reporterId: userId }
      }),
      avgMood: moodLogs.length > 0
        ? moodLogs.reduce((acc: number, log) => acc + log.mood, 0) / moodLogs.length
        : 0
    }

    // Build timeline
    const timeline = [
      ...posts.map(p => ({
        id: p.id,
        type: "post",
        title: p.title,
        content: p.content.substring(0, 100),
        createdAt: p.createdAt,
        details: { category: p.category, ...p._count }
      })),
      ...comments.map(c => ({
        id: c.id,
        type: "comment",
        content: c.content.substring(0, 100),
        createdAt: c.createdAt,
        details: { postTitle: c.post?.title }
      })),
      ...auditLogs.map(l => ({
        id: l.id,
        type: "audit",
        action: l.action,
        details: l.details,
        createdAt: l.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50)

    return NextResponse.json({
      user: {
        ...user,
        profile: user.patientProfile || user.therapistProfile || user.profile,
        type: user.role === "THERAPIST" ? "therapist" : "patient"
      },
      timeline,
      stats,
      recentActivity: {
        sessions,
        reports,
        badges: badges.map(b => ({
          ...b,
          badgeName: b.badge.name,
          badgeIcon: b.badge.icon
        })),
        moodHistory: moodLogs
      }
    })

  } catch (error) {
    console.error("Error fetching user activity:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
