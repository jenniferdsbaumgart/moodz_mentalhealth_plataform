import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    totalUsers,
    activeUsers,
    pendingReports,
    pendingTherapists,
    sessionsToday,
    recentPosts
  ] = await Promise.all([
    // Total de usuários
    db.user.count(),

    // Usuários ativos (logaram nos últimos 7 dias)
    db.user.count({
      where: {
        sessions: {
          some: {
            expires: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        }
      }
    }),

    // Reports pendentes
    db.report.count({
      where: { status: "PENDING" }
    }),

    // Terapeutas aguardando aprovação - campo correto é isVerified
    db.therapistProfile.count({
      where: { isVerified: false }
    }),

    // Sessões agendadas para hoje
    db.groupSession.count({
      where: {
        scheduledAt: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    }),

    // Posts recentes - o campo name está em User, não em UserProfile
    db.post.findMany({
      include: {
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { comments: true, votes: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ])

  return NextResponse.json({
    stats: {
      totalUsers,
      activeUsers,
      pendingReports,
      pendingTherapists,
      sessionsToday
    },
    recentPosts: recentPosts.map(p => ({
      id: p.id,
      title: p.title,
      authorName: p.author.name || "Usuário",
      authorImage: p.author.image,
      createdAt: p.createdAt,
      commentCount: p._count.comments,
      voteCount: p._count.votes
    }))
  })
}
