"use client"

import { Suspense } from "react"
import { PatientsList } from "@/components/therapist/patients-list"
import { PatientsStats } from "@/components/therapist/patients-stats"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function TherapistPatientsPage() {
  const handleExportPatients = () => {
    window.open("/api/therapist/patients/export", "_blank")
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meus Pacientes</h1>
            <p className="text-muted-foreground">
              Gerencie e acompanhe seus pacientes
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExportPatients}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <PatientsStats />

        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <PatientsList />
        </Suspense>
      </div>
    </DashboardShell>
  )
}

