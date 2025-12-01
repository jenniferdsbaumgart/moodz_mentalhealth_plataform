import { Suspense } from "react"
import { TherapistQueue } from "@/components/admin/therapist-queue"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminTherapistsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Aprovação de Terapeutas
          </h1>
          <p className="text-muted-foreground">
            Revise e aprove novos terapeutas
          </p>
        </div>

        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <TherapistQueue />
        </Suspense>
      </div>
    </DashboardShell>
  )
}

