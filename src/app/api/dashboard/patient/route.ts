import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  // Buscar PatientProfile primeiro para obter o patientId correto
  const patientProfile = await db.patientProfile.findUnique({
    where: { userId },
    select: { id: true, points: true, level: true, streak: true }
  })

  // Se não tem perfil de paciente, retornar dados vazios
  if (!patientProfile) {
    return NextResponse.json({
      upcomingSessions: [],
      moodTrend: [],
      recentBadges: [],
      stats: {
        points: 0,
        level: 1,
        streak: 0,
        hasCheckedInToday: false
      }
    })
  }

  const patientId = patientProfile.id

  // Buscar dados em paralelo
  const [
    upcomingSessions,
    recentMoods,
    recentBadges,
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
          include: { 
            therapist: { 
              include: { user: { select: { name: true } } } 
            } 
          }
        }
      },
      orderBy: { session: { scheduledAt: "asc" } },
      take: 3
    }),

    // Mood entries dos últimos 7 dias - usando patientId correto
    db.moodEntry.findMany({
      where: {
        patientId,
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

    // Verificar streak atual - usando patientId correto
    db.moodEntry.findFirst({
      where: {
        patientId,
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
      therapistName: p.session.therapist.user?.name || "Terapeuta"
    })),
    moodTrend: recentMoods.map(m => ({
      date: m.createdAt,
      value: m.mood,
      emotions: m.emotions
    })),
    recentBadges: recentBadges.map(ub => ({
      id: ub.badge.id,
      name: ub.badge.name,
      icon: ub.badge.icon,
      earnedAt: ub.unlockedAt
    })),
    stats: {
      points: patientProfile.points,
      level: patientProfile.level,
      streak: patientProfile.streak,
      hasCheckedInToday: !!streakData
    }
  })
}
