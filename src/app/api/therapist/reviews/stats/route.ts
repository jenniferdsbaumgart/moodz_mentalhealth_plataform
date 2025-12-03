import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db as prisma } from "@/lib/db"
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
  const period = searchParams.get("period") || "all"
  // Mock data para estatísticas (em produção seria calculado do banco)
  const mockStats = {
    totalReviews: 24,
    averageRating: 4.2,
    ratingDistribution: [
      { rating: 5, count: 12, percentage: 50 },
      { rating: 4, count: 6, percentage: 25 },
      { rating: 3, count: 3, percentage: 12.5 },
      { rating: 2, count: 2, percentage: 8.3 },
      { rating: 1, count: 1, percentage: 4.2 },
    ],
    recentReviews: [
      {
        id: "1",
        rating: 5,
        comment: "Excelente sessão! Me senti muito acolhido e as técnicas apresentadas foram muito úteis.",
        patientName: "Maria Silva",
        sessionTitle: "Ansiedade e Mindfulness",
        createdAt: new Date("2024-01-15"),
      },
      {
        id: "2",
        rating: 4,
        comment: "Muito boa a abordagem. Gostei das explicações claras e do material fornecido.",
        patientName: "João Santos",
        sessionTitle: "Terapia Cognitivo-Comportamental",
        createdAt: new Date("2024-01-10"),
      },
    ],
    ratingTrend: [
      { date: "Dez/2023", averageRating: 4.1, totalRatings: 8 },
      { date: "Jan/2024", averageRating: 4.2, totalRatings: 12 },
      { date: "Fev/2024", averageRating: 4.3, totalRatings: 4 },
    ],
  }
  // Ajustar dados baseado no período
  let adjustedStats = { ...mockStats }
  switch (period) {
    case "month":
      adjustedStats = {
        ...mockStats,
        totalReviews: 12,
        ratingTrend: mockStats.ratingTrend.slice(-1), // Apenas último mês
      }
      break
    case "quarter":
      adjustedStats = {
        ...mockStats,
        totalReviews: 16,
        ratingTrend: mockStats.ratingTrend, // Últimos 3 meses
      }
      break
    case "year":
      adjustedStats = {
        ...mockStats,
        totalReviews: 24,
        ratingTrend: mockStats.ratingTrend, // Todo o período
      }
      break
  }
  return NextResponse.json({
    success: true,
    data: {
      ...adjustedStats,
      overallStats: {
        averageRating: adjustedStats.averageRating,
        totalRatings: adjustedStats.totalReviews,
        ratingChange: 0.3, // Comparado ao período anterior
      },
    },
  })
}
