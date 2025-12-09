import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AuditLogTable } from "@/components/super-admin/audit-log-table"
import { AuditFilters } from "@/components/super-admin/audit-filters"

interface AuditPageProps {
  searchParams: {
    action?: string
    entity?: string
    userId?: string
    from?: string
    to?: string
    page?: string
  }
}

export default async function AuditPage({ searchParams }: AuditPageProps) {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") {
    redirect("/unauthorized")
  }

  const page = Number(searchParams.page) || 1
  const pageSize = 20

  // Construir filtros
  const where: any = {}

  if (searchParams.action) {
    where.action = searchParams.action
  }
  if (searchParams.entity) {
    where.entity = searchParams.entity
  }
  if (searchParams.userId) {
    where.userId = searchParams.userId
  }
  if (searchParams.from || searchParams.to) {
    where.createdAt = {}
    if (searchParams.from) {
      where.createdAt.gte = new Date(searchParams.from)
    }
    if (searchParams.to) {
      where.createdAt.lte = new Date(searchParams.to)
    }
  }

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.auditLog.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  // Buscar lista de usuários para filtro
  const users = await db.user.findMany({
    where: {
      role: { in: ["SUPER_ADMIN", "ADMIN"] },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  return (
    <DashboardShell role="SUPER_ADMIN"
      title="Logs de Auditoria"
      description="Histórico de ações críticas na plataforma"
    >
      <div className="space-y-6">
        <AuditFilters users={users} />
        <AuditLogTable
          logs={logs}
          currentPage={page}
          totalPages={totalPages}
          total={total}
        />
      </div>
    </DashboardShell>
  )
}


