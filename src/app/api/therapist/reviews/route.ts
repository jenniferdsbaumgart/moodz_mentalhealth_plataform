import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
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
  parseISO,
  isWithinInterval
} from "date-fns"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const therapistId = session.user.id
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "all"
  const rating = searchParams.get("rating")
  const sort = searchParams.get("sort") || "newest"
  const fromDate = searchParams.get("from")
  const toDate = searchParams.get("to")

  // Determinar período de análise
  let dateFilter = {}
  if (fromDate && toDate) {
    dateFilter = {
      createdAt: {
        gte: parseISO(fromDate),
        lte: parseISO(toDate)
      }
    }
  } else {
    const now = new Date()
    switch (period) {
      case "month":
        dateFilter = {
          createdAt: {
            gte: startOfMonth(now),
          }
        }
        break
      case "quarter":
        dateFilter = {
          createdAt: {
            gte: startOfQuarter(now),
            lte: endOfQuarter(now)
          }
        }
        break
      case "year":
        dateFilter = {
          createdAt: {
            gte: startOfYear(now),
            lte: now
          }
        }
        break
      default:
        // "all" - no date filter
        break
    }
  }

  // Importar mock storage (em produção seria do banco)
  // Como não temos tabela Review, vamos simular com dados mock
  const mockReviews = [
    {
      id: "1",
      sessionId: "session-1",
      patientId: "patient-1",
      therapistId,
      rating: 5,
      comment: "Excelente sessão! Me senti muito acolhido e as técnicas apresentadas foram muito úteis.",
      isAnonymous: false,
      createdAt: new Date("2024-01-15"),
      session: {
        title: "Ansiedade e Mindfulness",
        scheduledAt: new Date("2024-01-14"),
      },
      patient: {
        name: "Maria Silva",
        image: null,
      },
    },
    {
      id: "2",
      sessionId: "session-2",
      patientId: "patient-2",
      therapistId,
      rating: 4,
      comment: "Muito boa a abordagem. Gostei das explicações claras e do material fornecido.",
      isAnonymous: false,
      createdAt: new Date("2024-01-10"),
      session: {
        title: "Terapia Cognitivo-Comportamental",
        scheduledAt: new Date("2024-01-09"),
      },
      patient: {
        name: "João Santos",
        image: null,
      },
    },
    {
      id: "3",
      sessionId: "session-3",
      patientId: "patient-3",
      therapistId,
      rating: 5,
      comment: "Profissional excepcional! Recomendo fortemente.",
      isAnonymous: true,
      createdAt: new Date("2024-01-08"),
      session: {
        title: "Relacionamentos Familiares",
        scheduledAt: new Date("2024-01-07"),
      },
      patient: null, // Anonymous
    },
    {
      id: "4",
      sessionId: "session-4",
      patientId: "patient-4",
      therapistId,
      rating: 3,
      comment: "Sessão interessante, mas gostaria de mais exercícios práticos.",
      isAnonymous: false,
      createdAt: new Date("2024-01-05"),
      session: {
        title: "Gestão do Estresse",
        scheduledAt: new Date("2024-01-04"),
      },
      patient: {
        name: "Carlos Oliveira",
        image: null,
      },
    },
    {
      id: "5",
      sessionId: "session-5",
      patientId: "patient-5",
      therapistId,
      rating: 4,
      comment: "Muito profissional e atencioso. Já estou sentindo melhoras.",
      isAnonymous: false,
      createdAt: new Date("2024-01-03"),
      session: {
        title: "Ansiedade e Mindfulness",
        scheduledAt: new Date("2024-01-02"),
      },
      patient: {
        name: "Patricia Lima",
        image: null,
      },
    },
  ]

  let filteredReviews = mockReviews.filter(review => {
    // Filtro de período
    if (Object.keys(dateFilter).length > 0) {
      const reviewDate = new Date(review.createdAt)
      if (fromDate && toDate) {
        if (!isWithinInterval(reviewDate, {
          start: parseISO(fromDate),
          end: parseISO(toDate)
        })) return false
      }
    }

    // Filtro de rating
    if (rating && rating !== "all") {
      if (review.rating !== parseInt(rating)) return false
    }

    return true
  })

  // Aplicar ordenação
  filteredReviews = filteredReviews.sort((a, b) => {
    switch (sort) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "rating":
        return b.rating - a.rating
      default:
        return 0
    }
  })

  return NextResponse.json({
    success: true,
    data: filteredReviews,
  })
}

