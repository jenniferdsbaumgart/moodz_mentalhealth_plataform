import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  // Buscar dados em paralelo
  const [
    upcomingSessions,
    recentMoods,
    recentBadges,
    profile,
    streakData
  ] = await Promise.all([
    // Próximas sessões inscritas
    db.sessionParticipant.findMany({
      where: {
        userId,
        session: {
          scheduledAt: { gte: new Date() },
          status: "SCHEDULED"
        }
      },
      include: {
        session: {
          include: { therapist: { include: { profile: true } } }
        }
      },
      orderBy: { session: { scheduledAt: "asc" } },
      take: 3
    }),

    // Mood entries dos últimos 7 dias
    db.moodEntry.findMany({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      orderBy: { createdAt: "desc" },
      take: 7
    }),

    // Badges recentes
    db.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { unlockedAt: "desc" },
      take: 3
    }),

    // Perfil com pontos e nível
    db.patientProfile.findUnique({
      where: { userId },
      select: { points: true, level: true, streak: true }
    }),

    // Verificar streak atual
    db.moodEntry.findFirst({
      where: {
        userId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0) - 24 * 60 * 60 * 1000)
        }
      }
    })
  ])

  return NextResponse.json({
    upcomingSessions: upcomingSessions.map(p => ({
      id: p.session.id,
      title: p.session.title,
      scheduledAt: p.session.scheduledAt,
      therapistName: p.session.therapist.profile?.name || "Terapeuta"
    })),
    moodTrend: recentMoods.map(m => ({
      date: m.createdAt,
      value: m.value,
      emotion: m.emotion
    })),
    recentBadges: recentBadges.map(ub => ({
      id: ub.badge.id,
      name: ub.badge.name,
      icon: ub.badge.icon,
      earnedAt: ub.unlockedAt
    })),
    stats: {
      points: profile?.points || 0,
      level: profile?.level || 1,
      streak: profile?.streak || 0,
      hasCheckedInToday: !!streakData
    }
  })
}
