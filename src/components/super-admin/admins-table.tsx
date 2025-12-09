"use client"

import { useState } from "react"
import { User } from "@prisma/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Ban, UserCheck, ShieldOff } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type AdminWithProfile = User & { profile: any }

interface AdminsTableProps {
  admins: AdminWithProfile[]
}

export function AdminsTable({ admins }: AdminsTableProps) {
  const router = useRouter()
  const [selectedAdmin, setSelectedAdmin] = useState<AdminWithProfile | null>(null)
  const [action, setAction] = useState<"remove" | "demote" | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleAction() {
    if (!selectedAdmin || !action) return
    setIsLoading(true)
    try {
      const endpoint = action === "remove"
        ? `/api/super-admin/admins/${selectedAdmin.id}`
        : `/api/super-admin/admins/${selectedAdmin.id}/demote`

      const response = await fetch(endpoint, {
        method: action === "remove" ? "DELETE" : "POST",
      })
      if (!response.ok) throw new Error()

      toast.success(
        action === "remove"
          ? "Administrador removido com sucesso"
          : "Administrador rebaixado para paciente"
      )
      router.refresh()
    } catch {
      toast.error("Erro ao processar ação")
    } finally {
      setIsLoading(false)
      setSelectedAdmin(null)
      setAction(null)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Desde</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Nenhum administrador encontrado
              </TableCell>
            </TableRow>
          ) : (
            admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={admin.image || ""} />
                      <AvatarFallback>
                        {admin.name?.charAt(0) || admin.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{admin.profile?.displayName || admin.name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>
                  <Badge variant={admin.status === "ACTIVE" ? "default" : "secondary"}>
                    {admin.status === "ACTIVE" ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(admin.createdAt, {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Ações">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedAdmin(admin)
                          setAction("demote")
                        }}
                      >
                        <ShieldOff className="mr-2 h-4 w-4" />
                        Rebaixar para Paciente
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setSelectedAdmin(admin)
                          setAction("remove")
                        }}
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Remover Admin
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={!!selectedAdmin && !!action} onOpenChange={() => {
        setSelectedAdmin(null)
        setAction(null)
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "remove" ? "Remover Administrador" : "Rebaixar Administrador"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "remove"
                ? `Tem certeza que deseja remover ${selectedAdmin?.name} como administrador? Esta ação não pode ser desfeita.`
                : `Tem certeza que deseja rebaixar ${selectedAdmin?.name} para paciente? Ele perderá todos os privilégios de administrador.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={isLoading}
              className={action === "remove" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {isLoading ? "Processando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


