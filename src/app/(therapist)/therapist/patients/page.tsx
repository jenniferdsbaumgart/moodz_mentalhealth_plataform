import { Suspense } from "react"
import { PatientsList } from "@/components/therapist/patients-list"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Download, Users, TrendingUp } from "lucide-react"

export default function TherapistPatientsPage() {
  const handleExportPatients = () => {
    // Implementar export CSV
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
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
                <p className="text-2xl font-bold">--</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sessões Este Mês</p>
                <p className="text-2xl font-bold">--</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pacientes Ativos</p>
                <p className="text-2xl font-bold">--</p>
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <PatientsList />
        </Suspense>
      </div>
    </DashboardShell>
  )
}

