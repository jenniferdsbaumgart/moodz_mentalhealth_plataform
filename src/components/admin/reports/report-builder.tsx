"use client"

import { useState } from "react"
import { Calendar, Filter, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"

interface ReportType {
  type: string
  label: string
  description: string
  fields: string[]
  filters: string[]
}

interface FilterOptions {
  roles: Array<{ value: string; label: string; count: number }>
  sessionCategories: Array<{ value: string; label: string; count: number }>
  postCategories: Array<{ value: string; label: string; count: number }>
  therapists: Array<{ value: string; label: string }>
  statuses: Array<{ value: string; label: string }>
}

interface ReportBuilderProps {
  reportTypes: ReportType[]
  filterOptions: FilterOptions
  onGenerate: (config: ReportConfig) => void
  isLoading?: boolean
}

export interface ReportConfig {
  type: string
  format: "csv" | "json"
  filters: {
    startDate?: string
    endDate?: string
    role?: string
    status?: string
    category?: string
    therapistId?: string
  }
}

export function ReportBuilder({
  reportTypes,
  filterOptions,
  onGenerate,
  isLoading = false
}: ReportBuilderProps) {
  const [selectedType, setSelectedType] = useState<string>("")
  const [format, setFormat] = useState<"csv" | "json">("csv")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [role, setRole] = useState<string>("")
  const [status, setStatus] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [therapistId, setTherapistId] = useState<string>("")

  const selectedReport = reportTypes.find(r => r.type === selectedType)

  const handleGenerate = () => {
    if (!selectedType) return

    const config: ReportConfig = {
      type: selectedType,
      format,
      filters: {}
    }

    if (dateRange?.from) {
      config.filters.startDate = dateRange.from.toISOString()
    }
    if (dateRange?.to) {
      config.filters.endDate = dateRange.to.toISOString()
    }
    if (role) config.filters.role = role
    if (status) config.filters.status = status
    if (category) config.filters.category = category
    if (therapistId) config.filters.therapistId = therapistId

    onGenerate(config)
  }

  const getCategories = () => {
    if (selectedType === "sessions") {
      return filterOptions.sessionCategories
    }
    if (selectedType === "posts") {
      return filterOptions.postCategories
    }
    return []
  }

  const showFilter = (filter: string) => {
    return selectedReport?.filters.includes(filter)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Construtor de Relatórios
        </CardTitle>
        <CardDescription>
          Selecione o tipo de relatório e configure os filtros
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type Selection */}
        <div className="space-y-2">
          <Label>Tipo de Relatório</Label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de relatório" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((report) => (
                <SelectItem key={report.type} value={report.type}>
                  {report.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedReport && (
            <p className="text-sm text-muted-foreground">
              {selectedReport.description}
            </p>
          )}
        </div>

        {selectedType && (
          <>
            {/* Date Range Filter */}
            {(showFilter("startDate") || showFilter("endDate")) && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Período
                </Label>
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                />
              </div>
            )}

            {/* Dynamic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Role Filter */}
              {showFilter("role") && (
                <div className="space-y-2">
                  <Label>Função</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as funções" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as funções</SelectItem>
                      {filterOptions.roles.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label} ({r.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Status Filter */}
              {showFilter("status") && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os status</SelectItem>
                      {filterOptions.statuses.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Category Filter */}
              {showFilter("category") && (
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as categorias</SelectItem>
                      {getCategories().map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label} ({c.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Therapist Filter */}
              {showFilter("therapistId") && (
                <div className="space-y-2">
                  <Label>Terapeuta</Label>
                  <Select value={therapistId} onValueChange={setTherapistId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os terapeutas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os terapeutas</SelectItem>
                      {filterOptions.therapists.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Formato de Exportação</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as "csv" | "json")}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fields Preview */}
            {selectedReport && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Campos incluídos
                </Label>
                <div className="flex flex-wrap gap-2">
                  {selectedReport.fields.map((field) => (
                    <span
                      key={field}
                      className="px-2 py-1 bg-muted rounded-md text-sm"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!selectedType || isLoading}
              className="w-full"
            >
              {isLoading ? "Gerando..." : "Gerar Relatório"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
