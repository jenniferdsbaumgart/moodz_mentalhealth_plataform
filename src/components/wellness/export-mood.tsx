"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Download, Calendar as CalendarIcon, FileText } from "lucide-react"
import { format, subDays, startOfMonth, endOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ExportMoodProps {
  className?: string
}

export function ExportMood({ className }: ExportMoodProps) {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [preset, setPreset] = useState<string>("30days")
  const [isExporting, setIsExporting] = useState(false)

  const handlePresetChange = (value: string) => {
    setPreset(value)
    const now = new Date()

    switch (value) {
      case "7days":
        setDateRange({
          from: subDays(now, 7),
          to: now,
        })
        break
      case "30days":
        setDateRange({
          from: subDays(now, 30),
          to: now,
        })
        break
      case "90days":
        setDateRange({
          from: subDays(now, 90),
          to: now,
        })
        break
      case "currentMonth":
        setDateRange({
          from: startOfMonth(now),
          to: endOfMonth(now),
        })
        break
      case "lastMonth":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
        setDateRange({
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth),
        })
        break
      default:
        break
    }
  }

  const handleExport = async () => {
    if (!dateRange.from || !dateRange.to) {
      alert("Selecione um período válido")
      return
    }

    setIsExporting(true)

    try {
      const params = new URLSearchParams({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      })

      const response = await fetch(`/api/wellness/mood?${params}`)
      if (!response.ok) {
        throw new Error("Erro ao buscar dados")
      }

      const data = await response.json()
      const entries = data.data || []

      // Convert to CSV
      const csvContent = convertToCSV(entries)

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `mood-data-${format(dateRange.from, "yyyy-MM-dd")}-to-${format(dateRange.to, "yyyy-MM-dd")}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (error) {
      console.error("Error exporting data:", error)
      alert("Erro ao exportar dados")
    } finally {
      setIsExporting(false)
    }
  }

  const convertToCSV = (entries: Array<{
    date: string
    mood?: number
    energy?: number
    anxiety?: number
    sleep?: number
    emotions: string[]
    activities: string[]
    notes?: string
  }>): string => {
    if (entries.length === 0) return ""

    const headers = [
      "Data",
      "Humor",
      "Energia",
      "Ansiedade",
      "Sono",
      "Emoções",
      "Atividades",
      "Notas"
    ]

    const rows = entries.map(entry => [
      format(new Date(entry.date), "yyyy-MM-dd"),
      entry.mood || "",
      entry.energy || "",
      entry.anxiety || "",
      entry.sleep || "",
      entry.emotions.join("; ") || "",
      entry.activities.join("; ") || "",
      entry.notes || ""
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n")

    return csvContent
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar Dados de Humor
        </CardTitle>
        <CardDescription>
          Baixe seus registros de humor em formato CSV para análise externa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preset Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Período</label>
          <Select value={preset} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="90days">Últimos 90 dias</SelectItem>
              <SelectItem value="currentMonth">Mês atual</SelectItem>
              <SelectItem value="lastMonth">Mês passado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data inicial</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    "Selecionar data"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data final</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.to ? (
                    format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    "Selecionar data"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Export Info */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">O que será exportado?</p>
              <ul className="space-y-1 text-xs">
                <li>• Data do registro</li>
                <li>• Níveis de humor, energia, ansiedade e sono</li>
                <li>• Lista de emoções sentidas</li>
                <li>• Atividades realizadas</li>
                <li>• Notas adicionais</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={!dateRange.from || !dateRange.to || isExporting}
          className="w-full"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
