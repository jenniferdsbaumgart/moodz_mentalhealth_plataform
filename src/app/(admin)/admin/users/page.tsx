import { Suspense } from "react"
import { UsersTable } from "@/components/admin/users-table"
import { UsersFilters } from "@/components/admin/users-filters"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminUsersPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie todos os usuários da plataforma
          </p>
        </div>

        <UsersFilters />

        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <UsersTable />
        </Suspense>
      </div>
    </DashboardShell>
  )
}
