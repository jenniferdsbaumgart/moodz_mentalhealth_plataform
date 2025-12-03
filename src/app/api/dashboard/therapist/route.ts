import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  // Buscar TherapistProfile primeiro para obter o therapistId correto
  // GroupSession.therapistId referencia TherapistProfile.id, não User.id
  const therapistProfile = await db.therapistProfile.findUnique({
    where: { userId },
    select: { id: true }
  })

  // Se não tem perfil de terapeuta, retornar dados vazios
  if (!therapistProfile) {
    return NextResponse.json({
      upcomingSessions: [],
      stats: {
        totalPatients: 0,
        sessionsThisMonth: 0,
        upcomingCount: 0,
        nextSessionDate: null
      },
      recentSessions: []
    })
  }

  const therapistId = therapistProfile.id

  const [
    upcomingSessions,
    totalParticipants,
    sessionsThisMonth,
    recentSessions
  ] = await Promise.all([
    // Próximas sessões
    db.groupSession.findMany({
      where: {
        therapistId,
        scheduledAt: { gte: new Date() },
        status: "SCHEDULED"
      },
      include: {
        _count: { select: { participants: true } }
      },
      orderBy: { scheduledAt: "asc" },
      take: 5
    }),

    // Total de participantes únicos
    db.sessionParticipant.groupBy({
      by: ["userId"],
      where: {
        session: { therapistId }
      }
    }),

    // Sessões realizadas este mês
    db.groupSession.count({
      where: {
        therapistId,
        status: "COMPLETED",
        scheduledAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    }),

    // Últimas sessões realizadas
    db.groupSession.findMany({
      where: {
        therapistId,
        status: "COMPLETED"
      },
      include: {
        _count: { select: { participants: true } }
      },
      orderBy: { scheduledAt: "desc" },
      take: 5
    })
  ])

  const nextSession = upcomingSessions[0]

  return NextResponse.json({
    upcomingSessions: upcomingSessions.map(s => ({
      id: s.id,
      title: s.title,
      scheduledAt: s.scheduledAt,
      participantCount: s._count.participants,
      maxParticipants: s.maxParticipants
    })),
    stats: {
      totalPatients: totalParticipants.length,
      sessionsThisMonth,
      upcomingCount: upcomingSessions.length,
      nextSessionDate: nextSession?.scheduledAt || null
    },
    recentSessions: recentSessions.map(s => ({
      id: s.id,
      title: s.title,
      date: s.scheduledAt,
      participantCount: s._count.participants
    }))
  })
}
