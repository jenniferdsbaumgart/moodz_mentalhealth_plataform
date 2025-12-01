"use client"

import { AuditLog, User, AuditAction } from "@prisma/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ChevronLeft,
  ChevronRight,
  Info,
  UserPlus,
  UserMinus,
  Shield,
  ShieldOff,
  FileText,
  Settings,
  AlertTriangle,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter, useSearchParams } from "next/navigation"

type AuditLogWithUser = AuditLog & {
  user: Pick<User, "id" | "name" | "email">
}

interface AuditLogTableProps {
  logs: AuditLogWithUser[]
  currentPage: number
  totalPages: number
  total: number
}

const actionLabels: Record<AuditAction, string> = {
  USER_CREATED: "Usuário Criado",
  USER_UPDATED: "Usuário Atualizado",
  USER_DELETED: "Usuário Deletado",
  USER_BANNED: "Usuário Banido",
  USER_UNBANNED: "Usuário Desbanido",
  ROLE_CHANGED: "Role Alterada",
  ADMIN_CREATED: "Admin Criado",
  ADMIN_REMOVED: "Admin Removido",
  THERAPIST_APPROVED: "Terapeuta Aprovado",
  THERAPIST_REJECTED: "Terapeuta Rejeitado",
  POST_DELETED: "Post Deletado",
  COMMENT_DELETED: "Comentário Deletado",
  REPORT_RESOLVED: "Report Resolvido",
  SESSION_CANCELLED: "Sessão Cancelada",
  SETTINGS_UPDATED: "Configurações Atualizadas",
  SYSTEM_CONFIG_CHANGED: "Config Sistema Alterada",
}

const actionIcons: Record<string, React.ReactNode> = {
  USER_CREATED: <UserPlus className="h-4 w-4" />,
  USER_DELETED: <UserMinus className="h-4 w-4" />,
  USER_BANNED: <AlertTriangle className="h-4 w-4" />,
  ADMIN_CREATED: <Shield className="h-4 w-4" />,
  ADMIN_REMOVED: <ShieldOff className="h-4 w-4" />,
  SETTINGS_UPDATED: <Settings className="h-4 w-4" />,
}

const actionColors: Record<string, string> = {
  USER_BANNED: "destructive",
  USER_DELETED: "destructive",
  ADMIN_REMOVED: "destructive",
  POST_DELETED: "destructive",
  COMMENT_DELETED: "destructive",
  ADMIN_CREATED: "default",
  USER_CREATED: "default",
  THERAPIST_APPROVED: "default",
}

export function AuditLogTable({
  logs,
  currentPage,
  totalPages,
  total,
}: AuditLogTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`/super-admin/audit?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>Executado por</TableHead>
              <TableHead>IP</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Nenhum log encontrado
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    {format(log.createdAt, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={actionColors[log.action] as any || "secondary"}
                      className="gap-1"
                    >
                      {actionIcons[log.action]}
                      {actionLabels[log.action]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {log.entity}
                      {log.entityId && (
                        <span className="text-muted-foreground">
                          /{log.entityId.slice(0, 8)}...
                        </span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{log.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {log.user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.ipAddress || "-"}
                  </TableCell>
                  <TableCell>
                    {log.details && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Ver detalhes">
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-[300px]">
                            <pre className="text-xs">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {logs.length} de {total} registros
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="text-sm">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

