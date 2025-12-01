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
  parseISO
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

  // Buscar sessões do período para calcular métricas
  const sessions = await db.groupSession.findMany({
    where: {
      therapistId,
      ...dateFilter,
      status: "COMPLETED" // Apenas sessões concluídas para avaliações
    },
    include: {
      participants: true,
      _count: { select: { participants: true } }
    },
    orderBy: { scheduledAt: "desc" }
  })

  // Dados mock de avaliações (em produção, viriam de uma tabela de ratings)
  const totalSessions = sessions.length
  const averageRating = 4.2
  const totalRatings = Math.floor(totalSessions * 0.8) // 80% das sessões têm avaliação

  // Evolução das avaliações ao longo do tempo (últimos 6 meses)
  const ratingTrend = []
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i)
    const monthSessions = sessions.filter(s => {
      const sessionDate = new Date(s.scheduledAt)
      return sessionDate.getMonth() === date.getMonth() &&
             sessionDate.getFullYear() === date.getFullYear()
    }).length

    // Mock: avaliação varia ligeiramente por mês
    const baseRating = 4.2
    const variation = (Math.random() - 0.5) * 0.4 // ±0.2
    const rating = Math.max(1, Math.min(5, baseRating + variation))

    ratingTrend.push({
      date: format(date, "MMM/yyyy"),
      averageRating: Math.round(rating * 10) / 10,
      totalRatings: Math.floor(monthSessions * 0.8)
    })
  }

  // Distribuição das notas (1-5 estrelas)
  const ratingDistribution = [
    { rating: 5, count: Math.floor(totalRatings * 0.45), percentage: 45 },
    { rating: 4, count: Math.floor(totalRatings * 0.35), percentage: 35 },
    { rating: 3, count: Math.floor(totalRatings * 0.15), percentage: 15 },
    { rating: 2, count: Math.floor(totalRatings * 0.04), percentage: 4 },
    { rating: 1, count: Math.floor(totalRatings * 0.01), percentage: 1 }
  ]

  // Comentários recentes (mock)
  const recentComments = [
    {
      id: "1",
      rating: 5,
      comment: "Excelente sessão! Me senti muito acolhido e as técnicas apresentadas foram muito úteis.",
      patientName: "Maria Silva",
      sessionTitle: "Ansiedade e Mindfulness",
      createdAt: subDays(new Date(), 2)
    },
    {
      id: "2",
      rating: 4,
      comment: "Muito boa a abordagem. Gostei das explicações claras e do material fornecido.",
      patientName: "João Santos",
      sessionTitle: "Terapia Cognitivo-Comportamental",
      createdAt: subDays(new Date(), 5)
    },
    {
      id: "3",
      rating: 5,
      comment: "Profissional excepcional! Recomendo fortemente.",
      patientName: "Ana Costa",
      sessionTitle: "Relacionamentos Familiares",
      createdAt: subDays(new Date(), 7)
    },
    {
      id: "4",
      rating: 3,
      comment: "Sessão interessante, mas gostaria de mais exercícios práticos.",
      patientName: "Carlos Oliveira",
      sessionTitle: "Gestão do Estresse",
      createdAt: subDays(new Date(), 10)
    },
    {
      id: "5",
      rating: 4,
      comment: "Muito profissional e atencioso. Já estou sentindo melhoras.",
      patientName: "Patricia Lima",
      sessionTitle: "Ansiedade e Mindfulness",
      createdAt: subDays(new Date(), 12)
    }
  ]

  // Estatísticas gerais
  const overallStats = {
    averageRating,
    totalRatings,
    ratingChange: 0.3 // Comparado ao período anterior
  }

  return NextResponse.json({
    ratingTrend,
    ratingDistribution,
    recentComments,
    overallStats
  })
}
