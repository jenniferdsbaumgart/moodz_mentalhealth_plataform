import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  format,
  subMonths,
  startOfMonth,
  subDays,
  subWeeks,
  subQuarters,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  isWithinInterval,
  parseISO
} from "date-fns"
import { ptBR } from "date-fns/locale"

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

  // Buscar sessões do período anterior para comparação
  let previousPeriodFilter = {}
  const now = new Date()
  if (fromDate && toDate) {
    const from = parseISO(fromDate)
    const to = parseISO(toDate)
    const diff = to.getTime() - from.getTime()
    previousPeriodFilter = {
      scheduledAt: {
        gte: new Date(from.getTime() - diff),
        lte: from
      }
    }
  } else {
    switch (period) {
      case "month":
        previousPeriodFilter = {
          scheduledAt: {
            gte: startOfMonth(subMonths(now, 1)),
            lte: subMonths(now, 1)
          }
        }
        break
      case "quarter":
        const prevQuarterStart = startOfQuarter(subQuarters(now, 1))
        previousPeriodFilter = {
          scheduledAt: {
            gte: prevQuarterStart,
            lte: endOfQuarter(prevQuarterStart)
          }
        }
        break
      case "year":
        previousPeriodFilter = {
          scheduledAt: {
            gte: startOfYear(subDays(startOfYear(now), 1)),
            lte: endOfYear(subDays(startOfYear(now), 1))
          }
        }
        break
    }
  }

  const previousSessions = await db.groupSession.findMany({
    where: {
      therapistId,
      ...previousPeriodFilter
    },
    include: {
      participants: true,
      _count: { select: { participants: true } }
    }
  })

  // Stats básicas
  const totalSessions = sessions.length
  const completedSessions = sessions.filter(s => s.status === "COMPLETED").length
  const cancelledSessions = sessions.filter(s => s.status === "CANCELLED").length
  const sessionsThisMonth = sessions.filter(
    s => new Date(s.scheduledAt).getMonth() === now.getMonth()
  ).length
  const sessionsLastMonth = previousSessions.length

  // Pacientes únicos
  const uniquePatients = new Set(
    sessions.flatMap(s => s.participants.map(p => p.userId))
  ).size
  const patientsThisMonth = new Set(
    sessions.filter(s => new Date(s.scheduledAt).getMonth() === now.getMonth())
      .flatMap(s => s.participants.map(p => p.userId))
  ).size
  const patientsLastMonth = new Set(
    previousSessions.flatMap(s => s.participants.map(p => p.userId))
  ).size

  // Taxa de comparecimento
  const totalRegistrations = sessions.reduce(
    (acc, s) => acc + s._count.participants,
    0
  )
  const attended = sessions.reduce(
    (acc, s) => acc + s.participants.filter(p => p.status === "ATTENDED").length,
    0
  )
  const noShows = sessions.reduce(
    (acc, s) => acc + s.participants.filter(p => p.status === "NO_SHOW").length,
    0
  )
  const attendanceRate = totalRegistrations > 0
    ? Math.round((attended / totalRegistrations) * 100)
    : 0
  const noShowRate = totalRegistrations > 0
    ? Math.round((noShows / totalRegistrations) * 100)
    : 0

  // Cálculos de crescimento
  const growthRate = sessionsLastMonth > 0
    ? ((sessionsThisMonth - sessionsLastMonth) / sessionsLastMonth) * 100
    : 0

  // Receita estimada (mock - baseado em sessões completadas)
  const estimatedRevenue = completedSessions * 150 // R$ 150 por sessão

  // Duração média (mock)
  const averageDuration = 60 // minutos

  // Sessões por mês (últimos 6 meses)
  const sessionsByMonth = []
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i)
    const monthStart = startOfMonth(date)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    const count = sessions.filter(s => {
      const sessionDate = new Date(s.scheduledAt)
      return sessionDate >= monthStart && sessionDate <= monthEnd
    }).length

    sessionsByMonth.push({
      month: format(date, "MMM", { locale: ptBR }),
      count
    })
  }

  // Distribuição por categoria
  const categoryCount: Record<string, number> = {}
  sessions.forEach(s => {
    const cat = s.category || "Outros"
    categoryCount[cat] = (categoryCount[cat] || 0) + 1
  })
  const categoryDistribution = Object.entries(categoryCount).map(
    ([name, value]) => ({ name, value })
  )

  // Participantes ao longo do tempo (últimas sessões)
  const participantsOverTime = sessions.slice(0, 10).reverse().map(s => ({
    date: format(new Date(s.scheduledAt), "dd/MM"),
    participants: s._count.participants
  }))

  return NextResponse.json({
    stats: {
      totalSessions,
      sessionsThisMonth,
      sessionsLastMonth,
      uniquePatients,
      patientsThisMonth,
      patientsLastMonth,
      completedSessions,
      cancelledSessions,
      attendanceRate,
      noShowRate,
      growthRate,
      estimatedRevenue,
      averageDuration,
      averageRating: 4.2 // Mock - implementar sistema de avaliações
    },
    sessionsByMonth,
    categoryDistribution,
    participantsOverTime
  })
}

