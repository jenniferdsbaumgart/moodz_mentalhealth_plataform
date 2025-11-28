import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { AdminsTable } from "@/components/super-admin/admins-table"
import { CreateAdminDialog } from "@/components/super-admin/create-admin-dialog"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export default async function AdminsPage() {
  const session = await auth()

  if (session?.user?.role !== "SUPER_ADMIN") {
    redirect("/unauthorized")
  }

  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    include: {
      profile: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Administradores</h1>
          <p className="text-muted-foreground">
            Gerencie os administradores da plataforma
          </p>
        </div>

        <CreateAdminDialog />

        <AdminsTable admins={admins} />
      </div>
    </DashboardShell>
  )
}
