import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { SystemSettingsForm } from "@/components/super-admin/system-settings-form"
import { SystemStatus } from "@/components/super-admin/system-status"

export default async function SystemPage() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") {
    redirect("/unauthorized")
  }

  // Buscar ou criar configurações do sistema
  let settings = await db.systemSettings.findUnique({
    where: { id: "system" },
  })
  if (!settings) {
    settings = await db.systemSettings.create({
      data: { id: "system" },
    })
  }

  // Buscar estatísticas do sistema
  const [
    totalUsers,
    activeUsers,
    totalSessions,
    totalPosts,
    pendingReports,
    pendingTherapists,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { status: "ACTIVE" } }),
    db.groupSession.count(),
    db.post.count(),
    db.report.count({ where: { status: "PENDING" } }),
    db.user.count({
      where: {
        role: "THERAPIST",
        therapistProfile: { isApproved: false },
      },
    }),
  ])

  const stats = {
    totalUsers,
    activeUsers,
    totalSessions,
    totalPosts,
    pendingReports,
    pendingTherapists,
  }

  return (
    <DashboardShell
      title="Configurações do Sistema"
      description="Gerencie as configurações globais da plataforma"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <SystemSettingsForm settings={settings} />
        <SystemStatus stats={stats} />
      </div>
    </DashboardShell>
  )
}

