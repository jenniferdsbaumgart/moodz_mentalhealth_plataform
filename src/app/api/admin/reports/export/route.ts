import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateReport, ReportType, ReportFilters } from "@/lib/reports"

/**
 * POST /api/admin/reports/export
 * Generate and export a report
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { type, format, filters } = body

    // Validate report type
    const validTypes: ReportType[] = ["users", "sessions", "posts", "moderation", "wellness"]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid report type" },
        { status: 400 }
      )
    }

    // Validate format
    if (!["csv", "json"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Use 'csv' or 'json'" },
        { status: 400 }
      )
    }

    // Parse date filters
    const reportFilters: ReportFilters = {}
    
    if (filters?.startDate) {
      reportFilters.startDate = new Date(filters.startDate)
    }
    if (filters?.endDate) {
      reportFilters.endDate = new Date(filters.endDate)
    }
    if (filters?.role) {
      reportFilters.role = filters.role
    }
    if (filters?.status) {
      reportFilters.status = filters.status
    }
    if (filters?.category) {
      reportFilters.category = filters.category
    }
    if (filters?.therapistId) {
      reportFilters.therapistId = filters.therapistId
    }

    // Generate report
    const report = await generateReport(type, reportFilters)

    // Return based on format
    if (format === "csv") {
      return new NextResponse(report.csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${type}-report-${new Date().toISOString().split("T")[0]}.csv"`
        }
      })
    }

    // JSON format
    return NextResponse.json({
      type,
      filters: reportFilters,
      count: report.count,
      generatedAt: report.generatedAt,
      data: report.data
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/reports/export
 * Get available report types and their fields
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const reportTypes = [
      {
        type: "users",
        label: "Usuários",
        description: "Relatório completo de usuários da plataforma",
        fields: ["ID", "Nome", "Email", "Função", "Status", "Data de Criação", "Sessões", "Posts", "Comentários", "Badges"],
        filters: ["role", "status", "startDate", "endDate"]
      },
      {
        type: "sessions",
        label: "Sessões",
        description: "Relatório de sessões de terapia",
        fields: ["ID", "Título", "Categoria", "Terapeuta", "Data/Hora", "Duração", "Participantes", "Status"],
        filters: ["category", "status", "therapistId", "startDate", "endDate"]
      },
      {
        type: "posts",
        label: "Posts",
        description: "Relatório de posts da comunidade",
        fields: ["ID", "Título", "Categoria", "Autor", "Data", "Comentários", "Votos", "Reports"],
        filters: ["category", "startDate", "endDate"]
      },
      {
        type: "moderation",
        label: "Moderação",
        description: "Relatório de reports e ações de moderação",
        fields: ["ID", "Tipo de Conteúdo", "Motivo", "Status", "Reportado por", "Data", "Data de Resolução"],
        filters: ["status", "startDate", "endDate"]
      },
      {
        type: "wellness",
        label: "Bem-estar",
        description: "Relatório de registros de humor e bem-estar",
        fields: ["ID", "Usuário", "Pontuação", "Fatores", "Data/Hora"],
        filters: ["startDate", "endDate"]
      }
    ]

    // Get filter options
    const [roles, sessionCategories, postCategories, therapists] = await Promise.all([
      // Get distinct roles
      db.user.groupBy({
        by: ["role"],
        _count: { id: true }
      }),
      // Get session categories
      db.groupSession.groupBy({
        by: ["category"],
        _count: { id: true }
      }),
      // Get post categories
      db.post.groupBy({
        by: ["category"],
        _count: { id: true }
      }),
      // Get therapists
      db.therapistProfile.findMany({
        select: {
          id: true,
          user: { select: { name: true } }
        }
      })
    ])

    return NextResponse.json({
      reportTypes,
      filterOptions: {
        roles: roles.map(r => ({ value: r.role, label: r.role, count: r._count.id })),
        sessionCategories: sessionCategories.map(c => ({ value: c.category, label: c.category, count: c._count.id })),
        postCategories: postCategories.map(c => ({ value: c.category, label: c.category, count: c._count.id })),
        therapists: therapists.map(t => ({ value: t.id, label: t.user.name || "Sem nome" })),
        statuses: [
          { value: "ACTIVE", label: "Ativo" },
          { value: "INACTIVE", label: "Inativo" },
          { value: "BANNED", label: "Banido" },
          { value: "PENDING", label: "Pendente" },
          { value: "RESOLVED", label: "Resolvido" },
          { value: "DISMISSED", label: "Descartado" }
        ]
      }
    })
  } catch (error) {
    console.error("Error fetching report types:", error)
    return NextResponse.json(
      { error: "Failed to fetch report types" },
      { status: 500 }
    )
  }
}

