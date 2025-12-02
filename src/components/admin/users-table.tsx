"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
import { MoreHorizontal, Ban, UserCheck, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

const roleLabels = {
  PATIENT: "Paciente",
  THERAPIST: "Terapeuta",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin"
}

const statusColors = {
  ACTIVE: "bg-green-500",
  INACTIVE: "bg-gray-500",
  BANNED: "bg-red-500",
  PENDING: "bg-yellow-500"
}

export function UsersTable() {
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", searchParams.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users?${searchParams.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch users")
      return res.json()
    }
  })

  const banMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Violação das regras da plataforma" })
      })
      if (!res.ok) throw new Error("Failed to ban user")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      toast.success("Usuário banido com sucesso")
    },
    onError: () => {
      toast.error("Erro ao banir usuário")
    }
  })

  const unbanMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Failed to unban user")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      toast.success("Usuário desbanido com sucesso")
    },
    onError: () => {
      toast.error("Erro ao desbanir usuário")
    }
  })

  if (isLoading) return <div>Carregando...</div>

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.users.map((user: any) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image} />
                    <AvatarFallback>
                      {user.name?.charAt(0) || user.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name || "Sem nome"}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{roleLabels[user.role]}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${statusColors[user.status]}`} />
                  {user.status}
                </div>
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(user.createdAt), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Ações do usuário">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver perfil
                    </DropdownMenuItem>
                    {user.status !== "BANNED" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN" && (
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => banMutation.mutate(user.id)}
                        disabled={banMutation.isPending}
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Banir usuário
                      </DropdownMenuItem>
                    )}
                    {user.status === "BANNED" && (
                      <DropdownMenuItem
                        onClick={() => unbanMutation.mutate(user.id)}
                        disabled={unbanMutation.isPending}
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Desbanir
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}


