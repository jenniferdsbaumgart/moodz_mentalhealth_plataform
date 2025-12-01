"use client"

import { useState } from "react"
import {
  Shield,
  AlertTriangle,
  History,
  LayoutDashboard
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ModerationDashboard,
  ReportQueueEnhanced,
  ReportDetailPanel,
  ModerationLog
} from "@/components/admin/moderation"

interface Report {
  id: string
  contentType: "POST" | "COMMENT"
  contentId: string
  reason: string
  description: string | null
  status: string
  createdAt: string
  reporter: {
    id: string
    name: string | null
    image: string | null
  }
  content?: {
    id: string
    title?: string
    content?: string
    createdAt?: string
    author?: {
      id: string
      name: string | null
      image: string | null
      email: string
    }
  }
}

export default function ModerationPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report)
    // Switch to queue tab if on dashboard
    if (activeTab === "dashboard") {
      setActiveTab("queue")
    }
  }

  const handleActionComplete = () => {
    setSelectedReport(null)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="h-8 w-8" />
          Central de Moderação
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie reports, modere conteúdo e mantenha a comunidade segura
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Fila de Reports
          </TabsTrigger>
          <TabsTrigger value="log" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Log de Ações
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <ModerationDashboard />
        </TabsContent>

        {/* Queue Tab */}
        <TabsContent value="queue">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReportQueueEnhanced
              onSelectReport={handleSelectReport}
              selectedReportId={selectedReport?.id || null}
            />
            <ReportDetailPanel
              report={selectedReport}
              onActionComplete={handleActionComplete}
            />
          </div>
        </TabsContent>

        {/* Log Tab */}
        <TabsContent value="log">
          <ModerationLog />
        </TabsContent>
      </Tabs>
    </div>
  )
}