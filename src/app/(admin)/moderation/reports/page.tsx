"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { ReportQueue } from "@/components/admin/report-queue"

export default function ReportsPage() {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-8">
        <ReportQueue />
      </div>
    </MainLayout>
  )
}
