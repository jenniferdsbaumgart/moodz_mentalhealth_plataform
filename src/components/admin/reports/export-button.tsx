"use client"

import { useState } from "react"
import { Download, FileSpreadsheet, FileJson, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ExportButtonProps {
  onExport: (format: "csv" | "json") => Promise<void>
  disabled?: boolean
}

export function ExportButton({ onExport, disabled = false }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportingFormat, setExportingFormat] = useState<string | null>(null)

  const handleExport = async (format: "csv" | "json") => {
    setIsExporting(true)
    setExportingFormat(format)
    try {
      await onExport(format)
    } finally {
      setIsExporting(false)
      setExportingFormat(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={disabled || isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          disabled={isExporting}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar como CSV
          {exportingFormat === "csv" && (
            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("json")}
          disabled={isExporting}
        >
          <FileJson className="h-4 w-4 mr-2" />
          Exportar como JSON
          {exportingFormat === "json" && (
            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
