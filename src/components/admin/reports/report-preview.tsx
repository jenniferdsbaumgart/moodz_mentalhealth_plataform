"use client"

import { useMemo } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { FileSpreadsheet, FileJson, Download, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ReportPreviewProps {
  data: any[]
  type: string
  format: "csv" | "json"
  count: number
  generatedAt: string
  onDownload: () => void
}

const PREVIEW_LIMIT = 10

export function ReportPreview({
  data,
  type,
  format: exportFormat,
  count,
  generatedAt,
  onDownload
}: ReportPreviewProps) {
  const previewData = useMemo(() => data.slice(0, PREVIEW_LIMIT), [data])

  const getColumns = (): string[] => {
    switch (type) {
      case "users":
        return ["Nome", "Email", "Função", "Status", "Criado em"]
      case "sessions":
        return ["Título", "Categoria", "Terapeuta", "Data", "Status"]
      case "posts":
        return ["Título", "Autor", "Categoria", "Comentários", "Votos"]
      case "moderation":
        return ["Tipo", "Motivo", "Status", "Reportado por", "Data"]
      case "wellness":
        return ["Usuário", "Humor", "Fatores", "Data"]
      default:
        return []
    }
  }

  const formatValue = (item: any, column: string): React.ReactNode => {
    switch (type) {
      case "users":
        switch (column) {
          case "Nome": return item.name || "-"
          case "Email": return item.email
          case "Função": return <Badge variant="outline">{item.role}</Badge>
          case "Status": return (
            <Badge variant={item.status === "ACTIVE" ? "default" : "secondary"}>
              {item.status}
            </Badge>
          )
          case "Criado em": return format(new Date(item.createdAt), "dd/MM/yyyy", { locale: ptBR })
          default: return "-"
        }
      case "sessions":
        switch (column) {
          case "Título": return item.title
          case "Categoria": return <Badge variant="outline">{item.category}</Badge>
          case "Terapeuta": return item.therapist?.user?.name || "-"
          case "Data": return format(new Date(item.scheduledAt), "dd/MM/yyyy HH:mm", { locale: ptBR })
          case "Status": return (
            <Badge variant={item.status === "COMPLETED" ? "default" : "secondary"}>
              {item.status}
            </Badge>
          )
          default: return "-"
        }
      case "posts":
        switch (column) {
          case "Título": return item.title
          case "Autor": return item.author?.name || "-"
          case "Categoria": return <Badge variant="outline">{item.category}</Badge>
          case "Comentários": return item._count?.comments || 0
          case "Votos": return item._count?.votes || 0
          default: return "-"
        }
      case "moderation":
        switch (column) {
          case "Tipo": return <Badge variant="outline">{item.contentType}</Badge>
          case "Motivo": return item.reason
          case "Status": return (
            <Badge variant={item.status === "RESOLVED" ? "default" : "destructive"}>
              {item.status}
            </Badge>
          )
          case "Reportado por": return item.reporter?.name || "-"
          case "Data": return format(new Date(item.createdAt), "dd/MM/yyyy", { locale: ptBR })
          default: return "-"
        }
      case "wellness":
        switch (column) {
          case "Usuário": return item.user?.name || "-"
          case "Humor": return (
            <span className={`font-medium ${
              item.moodScore >= 4 ? "text-green-600" :
              item.moodScore >= 3 ? "text-yellow-600" : "text-red-600"
            }`}>
              {item.moodScore}/5
            </span>
          )
          case "Fatores": return item.factors || "-"
          case "Data": return format(new Date(item.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })
          default: return "-"
        }
      default:
        return "-"
    }
  }

  const columns = getColumns()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Prévia do Relatório
            </CardTitle>
            <CardDescription>
              Mostrando {Math.min(PREVIEW_LIMIT, data.length)} de {count} registros
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              {exportFormat === "csv" ? (
                <FileSpreadsheet className="h-3 w-3" />
              ) : (
                <FileJson className="h-3 w-3" />
              )}
              {exportFormat.toUpperCase()}
            </Badge>
            <Button onClick={onDownload} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum registro encontrado com os filtros selecionados
          </div>
        ) : (
          <>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead key={column}>{column}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((item, index) => (
                    <TableRow key={item.id || index}>
                      {columns.map((column) => (
                        <TableCell key={column}>
                          {formatValue(item, column)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {data.length > PREVIEW_LIMIT && (
              <p className="text-sm text-muted-foreground text-center mt-4">
                ... e mais {count - PREVIEW_LIMIT} registros
              </p>
            )}

            <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
              Gerado em: {format(new Date(generatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
