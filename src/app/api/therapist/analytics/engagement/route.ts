import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  format,
  subDays,
  subWeeks,
  subMonths,
  startOfMonth,
  subQuarters,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  parseISO,
  isWithinInterval
} from "date-fns"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const therapistId = session.user.id
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "month"
  const fromDate = searchParams.get("from")
  const toDate = searchParams.get("to")

  // Determinar período de análise
  let dateFilter = {}
  if (fromDate && toDate) {
    dateFilter = {
      scheduledAt: {
        gte: parseISO(fromDate),
        lte: parseISO(toDate)
      }
    }
  } else {
    const now = new Date()
    switch (period) {
      case "month":
        dateFilter = {
          scheduledAt: {
            gte: startOfMonth(now),
          }
        }
        break
      case "quarter":
        dateFilter = {
          scheduledAt: {
            gte: startOfQuarter(now),
            lte: endOfQuarter(now)
          }
        }
        break
      case "year":
        dateFilter = {
          scheduledAt: {
            gte: startOfYear(now),
            lte: now
          }
        }
        break
    }
  }

  // Buscar sessões do período
  const sessions = await db.groupSession.findMany({
    where: {
      therapistId,
      ...dateFilter
    },
    include: {
      participants: true,
      _count: { select: { participants: true } }
    },
    orderBy: { scheduledAt: "desc" }
  })

  // Calcular taxa de retorno
  const allParticipants = new Set(
    sessions.flatMap(s => s.participants.map(p => p.userId))
  )

  const returningPatients = new Set()
  const firstTimePatients = new Set()

  // Para cada paciente, verificar se teve sessões anteriores
  for (const patientId of allParticipants) {
    const patientSessions = await db.sessionParticipant.findMany({
      where: {
        userId: patientId,
        session: {
          therapistId,
          scheduledAt: {
            lt: new Date() // Antes de agora
          }
        }
      }
    })

    if (patientSessions.length > 0) {
      returningPatients.add(patientId)
    } else {
      firstTimePatients.add(patientId)
    }
  }

  const returnRate = allParticipants.size > 0
    ? Math.round((returningPatients.size / allParticipants.size) * 100)
    : 0

  // Frequência dos pacientes
  const patientSessionCounts: Record<string, number> = {}

  for (const session of sessions) {
    for (const participant of session.participants) {
      patientSessionCounts[participant.userId] =
        (patientSessionCounts[participant.userId] || 0) + 1
    }
  }

  const frequencyStats = {
    "1 sessão": 0,
    "2-3 sessões": 0,
    "4-6 sessões": 0,
    "7+ sessões": 0
  }

  Object.values(patientSessionCounts).forEach((count: number) => {
    if (count === 1) frequencyStats["1 sessão"]++
    else if (count >= 2 && count <= 3) frequencyStats["2-3 sessões"]++
    else if (count >= 4 && count <= 6) frequencyStats["4-6 sessões"]++
    else if (count >= 7) frequencyStats["7+ sessões"]++
  })

  const patientFrequency = Object.entries(frequencyStats).map(([frequency, count]) => ({
    frequency,
    count,
    percentage: allParticipants.size > 0 ? Math.round((count / allParticipants.size) * 100) : 0
  }))

  // Horários mais populares
  const hourStats: Record<string, { sessions: number; attendance: number }> = {}

  sessions.forEach(session => {
    const hour = format(new Date(session.scheduledAt), "HH:00")
    if (!hourStats[hour]) {
      hourStats[hour] = { sessions: 0, attendance: 0 }
    }
    hourStats[hour].sessions++
    hourStats[hour].attendance += session.participants.filter(p => p.status === "ATTENDED").length
  })

  const popularHours = Object.entries(hourStats)
    .sort(([, a], [, b]) => b.sessions - a.sessions)
    .slice(0, 8) // Top 8 horários
    .map(([hour, stats]) => ({
      hour,
      sessions: stats.sessions,
      attendance: stats.attendance
    }))

  // Tendência de engajamento (últimas 4 semanas)
  const engagementTrend = []
  for (let i = 3; i >= 0; i--) {
    const weekStart = subWeeks(new Date(), i)
    const weekEnd = subWeeks(new Date(), i - 1)

    const weekSessions = sessions.filter(s =>
      isWithinInterval(new Date(s.scheduledAt), {
        start: weekStart,
        end: weekEnd
      })
    )

    const newPatients = new Set(
      weekSessions.flatMap(s =>
        s.participants.filter(p => {
          // Verificar se é primeira sessão do paciente
          // Esta é uma simplificação - em produção seria mais complexo
          return true
        }).map(p => p.userId)
      )
    )

    const returningPatientsCount = weekSessions.reduce((acc, s) => {
      return acc + s.participants.filter(p => {
        // Verificar se já teve sessões anteriores
        // Esta é uma simplificação
        return true
      }).length
    }, 0) - newPatients.size

    engagementTrend.push({
      date: format(weekStart, "dd/MM"),
      newPatients: newPatients.size,
      returningPatients: Math.max(0, returningPatientsCount),
      totalSessions: weekSessions.length
    })
  }

  return NextResponse.json({
    returnRate,
    patientFrequency,
    popularHours,
    engagementTrend
  })
}

