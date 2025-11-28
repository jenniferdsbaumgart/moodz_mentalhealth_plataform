import { Suspense } from "react"
import { PatientsList } from "@/components/therapist/patients-list"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function TherapistPatientsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Pacientes</h1>
          <p className="text-muted-foreground">
            Pacientes que participaram das suas sessões
          </p>
        </div>

        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <PatientsList />
        </Suspense>
      </div>
    </DashboardShell>
  )
}
