import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { format, subMonths, startOfMonth } from "date-fns"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const therapistId = session.user.id

  // Buscar todas as sessões do terapeuta
  const sessions = await db.groupSession.findMany({
    where: { therapistId },
    include: {
      participants: true,
      _count: { select: { participants: true } }
    },
    orderBy: { scheduledAt: "desc" }
  })

  // Stats básicas
  const totalSessions = sessions.length
  const completedSessions = sessions.filter(s => s.status === "COMPLETED")
  const currentMonth = new Date().getMonth()
  const sessionsThisMonth = sessions.filter(
    s => new Date(s.scheduledAt).getMonth() === currentMonth
  ).length

  // Pacientes únicos
  const uniquePatients = new Set(
    sessions.flatMap(s => s.participants.map(p => p.userId))
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
  const attendanceRate = totalRegistrations > 0
    ? Math.round((attended / totalRegistrations) * 100)
    : 0

  // Sessões por mês (últimos 6 meses)
  const sessionsByMonth = []
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i)
    const monthStart = startOfMonth(date)
    const count = sessions.filter(s => {
      const sessionDate = new Date(s.scheduledAt)
      return sessionDate.getMonth() === monthStart.getMonth() &&
             sessionDate.getFullYear() === monthStart.getFullYear()
    }).length
    sessionsByMonth.push({
      month: format(date, "MMM"),
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

  // Participantes ao longo do tempo (últimas 10 sessões)
  const participantsOverTime = completedSessions.slice(0, 10).reverse().map(s => ({
    date: format(new Date(s.scheduledAt), "dd/MM"),
    participants: s._count.participants
  }))

  return NextResponse.json({
    stats: {
      totalSessions,
      sessionsThisMonth,
      uniquePatients,
      attendanceRate,
      averageRating: null // TODO: implementar sistema de avaliação
    },
    sessionsByMonth,
    categoryDistribution,
    participantsOverTime
  })
}
