"use client"

import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { FileText, Loader2, AlertCircle, History } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportBuilder, ReportPreview, ReportConfig } from "@/components/admin/reports"

interface ReportTypesResponse {
  reportTypes: Array<{
    type: string
    label: string
    description: string
    fields: string[]
    filters: string[]
  }>
  filterOptions: {
    roles: Array<{ value: string; label: string; count: number }>
    sessionCategories: Array<{ value: string; label: string; count: number }>
    postCategories: Array<{ value: string; label: string; count: number }>
    therapists: Array<{ value: string; label: string }>
    statuses: Array<{ value: string; label: string }>
  }
}

interface GeneratedReport {
  type: string
  format: "csv" | "json"
  count: number
  generatedAt: string
  data: any[]
}

export default function AdminReportsPage() {
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null)
  const [reportHistory, setReportHistory] = useState<Array<{
    type: string
    count: number
    generatedAt: string
  }>>([])

  // Fetch report types and filter options
  const { data: reportConfig, isLoading: isLoadingConfig, error: configError } = useQuery<ReportTypesResponse>({
    queryKey: ["admin-report-config"],
    queryFn: async () => {
      const response = await fetch("/api/admin/reports/export")
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Acesso negado. Apenas administradores podem acessar esta página.")
        }
        throw new Error("Falha ao carregar configurações de relatórios")
      }
      return response.json()
    }
  })

  // Generate report mutation
  const generateMutation = useMutation({
    mutationFn: async (config: ReportConfig) => {
      const response = await fetch("/api/admin/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      })

      if (!response.ok) {
        throw new Error("Falha ao gerar relatório")
      }

      // If CSV, download directly
      if (config.format === "csv") {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${config.type}-report-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        return null
      }

      // JSON format - return data for preview
      return response.json()
    },
    onSuccess: (data, variables) => {
      if (data) {
        setGeneratedReport({
          type: variables.type,
          format: variables.format,
          count: data.count,
          generatedAt: data.generatedAt,
          data: data.data
        })

        // Add to history
        setReportHistory(prev => [
          {
            type: variables.type,
            count: data.count,
            generatedAt: data.generatedAt
          },
          ...prev.slice(0, 9)
        ])
      }
    }
  })

  const handleGenerate = (config: ReportConfig) => {
    generateMutation.mutate(config)
  }

  const handleDownload = () => {
    if (!generatedReport) return

    // Download JSON
    const blob = new Blob([JSON.stringify(generatedReport.data, null, 2)], {
      type: "application/json"
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${generatedReport.type}-report-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (configError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            {configError instanceof Error ? configError.message : "Erro ao carregar página"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileText className="h-8 w-8" />
          Relatórios
        </h1>
        <p className="text-muted-foreground mt-1">
          Gere e exporte relatórios detalhados da plataforma
        </p>
      </div>

      {isLoadingConfig ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : reportConfig ? (
        <Tabs defaultValue="builder" className="space-y-6">
          <TabsList>
            <TabsTrigger value="builder">Construtor</TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedReport}>
              Prévia {generatedReport && `(${generatedReport.count})`}
            </TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          {/* Builder Tab */}
          <TabsContent value="builder">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ReportBuilder
                  reportTypes={reportConfig.reportTypes}
                  filterOptions={reportConfig.filterOptions}
                  onGenerate={handleGenerate}
                  isLoading={generateMutation.isPending}
                />
              </div>

              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tipos de Relatório</CardTitle>
                    <CardDescription>
                      Relatórios disponíveis para exportação
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reportConfig.reportTypes.map((report) => (
                        <div
                          key={report.type}
                          className="p-3 border rounded-lg"
                        >
                          <h4 className="font-medium">{report.label}</h4>
                          <p className="text-sm text-muted-foreground">
                            {report.fields.length} campos
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Export Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Formatos de Exportação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <h4 className="font-medium">CSV</h4>
                        <p className="text-sm text-muted-foreground">
                          Compatível com Excel e Google Sheets
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <h4 className="font-medium">JSON</h4>
                        <p className="text-sm text-muted-foreground">
                          Para integração com outros sistemas
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            {generatedReport && (
              <ReportPreview
                data={generatedReport.data}
                type={generatedReport.type}
                format={generatedReport.format}
                count={generatedReport.count}
                generatedAt={generatedReport.generatedAt}
                onDownload={handleDownload}
              />
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Histórico de Relatórios
                </CardTitle>
                <CardDescription>
                  Relatórios gerados nesta sessão
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reportHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum relatório gerado ainda
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reportHistory.map((report, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium capitalize">{report.type}</h4>
                          <p className="text-sm text-muted-foreground">
                            {report.count} registros
                          </p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(report.generatedAt).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  )
}

