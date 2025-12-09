import { db } from "@/lib/db"
import { generateCSV, CSVColumn, formatDateForCSV, formatBooleanForCSV } from "./csv"

export type ReportType = "users" | "sessions" | "posts" | "moderation" | "wellness"

export interface ReportFilters {
  startDate?: Date
  endDate?: Date
  role?: string
  status?: string
  category?: string
  therapistId?: string
}

export interface ReportResult {
  data: any[]
  csv: string
  count: number
  generatedAt: Date
}

/**
 * Generate Users Report
 */
export async function generateUsersReport(filters: ReportFilters): Promise<ReportResult> {
  const where: any = {}

  if (filters.startDate || filters.endDate) {
    where.createdAt = {}
    if (filters.startDate) where.createdAt.gte = filters.startDate
    if (filters.endDate) where.createdAt.lte = filters.endDate
  }

  if (filters.role) {
    where.role = filters.role
  }

  if (filters.status) {
    where.status = filters.status
  }

  const users = await db.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          sessionParticipants: true,
          posts: true,
          comments: true,
          badges: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  const columns: CSVColumn[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Nome" },
    { key: "email", header: "Email" },
    { key: "role", header: "Função" },
    { key: "status", header: "Status" },
    { key: "createdAt", header: "Data de Criação", formatter: formatDateForCSV },
    { key: "_count.sessionParticipants", header: "Sessões" },
    { key: "_count.posts", header: "Posts" },
    { key: "_count.comments", header: "Comentários" },
    { key: "_count.badges", header: "Badges" }
  ]

  return {
    data: users,
    csv: generateCSV(users, columns),
    count: users.length,
    generatedAt: new Date()
  }
}

/**
 * Generate Sessions Report
 */
export async function generateSessionsReport(filters: ReportFilters): Promise<ReportResult> {
  const where: any = {}

  if (filters.startDate || filters.endDate) {
    where.scheduledAt = {}
    if (filters.startDate) where.scheduledAt.gte = filters.startDate
    if (filters.endDate) where.scheduledAt.lte = filters.endDate
  }

  if (filters.category) {
    where.category = filters.category
  }

  if (filters.therapistId) {
    where.therapistId = filters.therapistId
  }

  if (filters.status) {
    where.status = filters.status
  }

  const sessions = await db.groupSession.findMany({
    where,
    select: {
      id: true,
      title: true,
      category: true,
      scheduledAt: true,
      duration: true,
      maxParticipants: true,
      status: true,
      therapist: {
        select: {
          user: {
            select: { name: true, email: true }
          }
        }
      },
      _count: {
        select: { participants: true }
      }
    },
    orderBy: { scheduledAt: "desc" }
  })

  const columns: CSVColumn[] = [
    { key: "id", header: "ID" },
    { key: "title", header: "Título" },
    { key: "category", header: "Categoria" },
    { key: "therapist.user.name", header: "Terapeuta" },
    { key: "therapist.user.email", header: "Email Terapeuta" },
    { key: "scheduledAt", header: "Data/Hora", formatter: formatDateForCSV },
    { key: "duration", header: "Duração (min)" },
    { key: "_count.participants", header: "Participantes" },
    { key: "maxParticipants", header: "Máx. Participantes" },
    { key: "status", header: "Status" }
  ]

  return {
    data: sessions,
    csv: generateCSV(sessions, columns),
    count: sessions.length,
    generatedAt: new Date()
  }
}

/**
 * Generate Posts Report
 */
export async function generatePostsReport(filters: ReportFilters): Promise<ReportResult> {
  const where: any = {}

  if (filters.startDate || filters.endDate) {
    where.createdAt = {}
    if (filters.startDate) where.createdAt.gte = filters.startDate
    if (filters.endDate) where.createdAt.lte = filters.endDate
  }

  if (filters.category) {
    where.category = filters.category
  }

  const posts = await db.post.findMany({
    where,
    select: {
      id: true,
      title: true,
      category: true,
      createdAt: true,
      author: {
        select: { name: true, email: true }
      },
      _count: {
        select: {
          comments: true,
          votes: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  const columns: CSVColumn[] = [
    { key: "id", header: "ID" },
    { key: "title", header: "Título" },
    { key: "category", header: "Categoria" },
    { key: "author.name", header: "Autor" },
    { key: "author.email", header: "Email Autor" },
    { key: "createdAt", header: "Data de Criação", formatter: formatDateForCSV },
    { key: "_count.comments", header: "Comentários" },
    { key: "_count.votes", header: "Votos" }
  ]

  return {
    data: posts,
    csv: generateCSV(posts, columns),
    count: posts.length,
    generatedAt: new Date()
  }
}

/**
 * Generate Moderation Report (TODO: Fix Prisma schema - contentType, contentId, resolvedAt, reporter)
 */
export async function generateModerationReport(_filters: ReportFilters): Promise<ReportResult> {
  // Stubbed out - Prisma Report model doesn't have required fields
  return {
    data: [],
    csv: '',
    count: 0,
    generatedAt: new Date()
  }
}

/**
 * Generate Wellness Report (TODO: Fix Prisma schema - moodScore, factors, user relation)
 */
export async function generateWellnessReport(_filters: ReportFilters): Promise<ReportResult> {
  // Stubbed out - Prisma UserMoodLog model doesn't have required fields
  return {
    data: [],
    csv: '',
    count: 0,
    generatedAt: new Date()
  }
}

/**
 * Main report generator function
 */
export async function generateReport(
  type: ReportType,
  filters: ReportFilters
): Promise<ReportResult> {
  switch (type) {
    case "users":
      return generateUsersReport(filters)
    case "sessions":
      return generateSessionsReport(filters)
    case "posts":
      return generatePostsReport(filters)
    case "moderation":
      return generateModerationReport(filters)
    case "wellness":
      return generateWellnessReport(filters)
    default:
      throw new Error(`Unknown report type: ${type}`)
  }
}

