import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { SystemSettingsForm } from "@/components/super-admin/system-settings-form"
import { SystemStatus } from "@/components/super-admin/system-status"
import { FeatureFlags } from "@/components/super-admin/feature-flags"
import { ServiceStatusPanel } from "@/components/super-admin/service-status-panel"
import { SystemLogs } from "@/components/super-admin/system-logs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Flag, Activity, FileText } from "lucide-react"

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
        therapistProfile: { isVerified: false },
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
      role="SUPER_ADMIN"
      title="Painel de Controle do Sistema"
      description="Gerencie configurações, feature flags, serviços e logs da plataforma"
    >
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configurações</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <Flag className="h-4 w-4" />
            <span className="hidden sm:inline">Feature Flags</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Serviços</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <SystemSettingsForm settings={settings} />
            <SystemStatus stats={stats} />
          </div>
        </TabsContent>

        <TabsContent value="features">
          <FeatureFlags />
        </TabsContent>

        <TabsContent value="services">
          <ServiceStatusPanel />
        </TabsContent>

        <TabsContent value="logs">
          <SystemLogs />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}