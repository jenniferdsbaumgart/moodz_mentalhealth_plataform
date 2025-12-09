"use client"

import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { MoodInput } from "@/components/wellness/mood-input"
import { ExportDataDialog } from "@/components/wellness/export-data-dialog"

export default function MoodPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/wellness")
  }

  return (
    <DashboardShell role="PATIENT"
      title="Registro de Humor"
      description="Acompanhe suas emoções ao longo do tempo"
      action={<ExportDataDialog />}
    >
      <MoodInput onSuccess={handleSuccess} />
    </DashboardShell>
  )
}

