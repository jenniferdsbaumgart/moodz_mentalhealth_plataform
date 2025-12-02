"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Download, FileSpreadsheet, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { subDays, format } from "date-fns"

type ExportType = "mood" | "journal"
type PeriodType = "7" | "30" | "90" | "all" | "custom"

export function ExportDataDialog() {
  const [open, setOpen] = useState(false)
  const [exportType, setExportType] = useState<ExportType>("mood")
  const [period, setPeriod] = useState<PeriodType>("30")
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleExport() {
    setIsLoading(true)
    try {
      // Calcular datas baseado no período
      let from: string | undefined
      let to: string | undefined

      if (period === "custom") {
        from = customFrom
        to = customTo
      } else if (period !== "all") {
        const days = parseInt(period)
        from = format(subDays(new Date(), days), "yyyy-MM-dd")
      }

      // Construir URL
      const params = new URLSearchParams()
      if (from) params.set("from", from)
      if (to) params.set("to", to)

      const url = `/api/user/export/${exportType}?${params.toString()}`

      // Fazer download
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Erro ao exportar dados")
      }

      // Criar blob e fazer download
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = response.headers
        .get("Content-Disposition")
        ?.split("filename=")[1]
        ?.replace(/"/g, "") || `export-${exportType}.csv`

      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)

      toast.success("Dados exportados com sucesso!")
      setOpen(false)
    } catch (error) {
      toast.error("Erro ao exportar dados. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Exportar Dados
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar Dados</DialogTitle>
          <DialogDescription>
            Exporte seus dados em formato CSV para usar em planilhas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Tipo de dados */}
          <div className="space-y-3">
            <Label>O que exportar?</Label>
            <RadioGroup
              value={exportType}
              onValueChange={(v) => setExportType(v as ExportType)}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="mood"
                  id="mood"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="mood"
                  className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <FileSpreadsheet className="mb-3 h-6 w-6" />
                  <span className="text-sm font-medium">Registro de Humor</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="journal"
                  id="journal"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="journal"
                  className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <FileSpreadsheet className="mb-3 h-6 w-6" />
                  <span className="text-sm font-medium">Diário</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Período */}
          <div className="space-y-3">
            <Label>Período</Label>
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodType)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="all">Todos os dados</SelectItem>
                <SelectItem value="custom">Período personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Datas personalizadas */}
          {period === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from">De</Label>
                <Input
                  id="from"
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">Até</Label>
                <Input
                  id="to"
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


