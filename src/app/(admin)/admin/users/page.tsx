"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Search, MoreHorizontal, Ban, CheckCircle, Shield, User as UserIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: "PATIENT" | "THERAPIST" | "ADMIN" | "SUPER_ADMIN"
  status: "ACTIVE" | "PENDING" | "SUSPENDED" | "BANNED"
  createdAt: string
  _count: {
    posts: number
    comments: number
  }
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [banUserId, setBanUserId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<{ users: User[]; total: number }>({
    queryKey: ["admin-users", search, roleFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (roleFilter !== "all") params.set("role", roleFilter)
      if (statusFilter !== "all") params.set("status", statusFilter)

      const res = await fetch(`/api/admin/users?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch users")
      return res.json()
    }
  })

  const banMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "ban" | "unban" }) => {
      const res = await fetch(`/api/admin/users/${id}/${action}`, { method: "POST" })
      if (!res.ok) throw new Error(`Failed to ${action} user`)
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      setBanUserId(null)
    }
  })

  const users = data?.users || []

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Badge className="bg-purple-500">Super Admin</Badge>
      case "ADMIN":
        return <Badge className="bg-blue-500">Admin</Badge>
      case "THERAPIST":
        return <Badge className="bg-green-500">Terapeuta</Badge>
      case "PATIENT":
        return <Badge variant="outline">Paciente</Badge>
      default:
        return <Badge>{role}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">Ativo</Badge>
      case "PENDING":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pendente</Badge>
      case "SUSPENDED":
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Suspenso</Badge>
      case "BANNED":
        return <Badge variant="destructive">Banido</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie os usuários da plataforma.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Roles</SelectItem>
            <SelectItem value="PATIENT">Paciente</SelectItem>
            <SelectItem value="THERAPIST">Terapeuta</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="ACTIVE">Ativo</SelectItem>
            <SelectItem value="PENDING">Pendente</SelectItem>
            <SelectItem value="SUSPENDED">Suspenso</SelectItem>
            <SelectItem value="BANNED">Banido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Posts</TableHead>
              <TableHead className="hidden md:table-cell">Cadastro</TableHead>
              <TableHead className="w-[70px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback>
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name || "Sem nome"}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {user._count.posts}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <UserIcon className="h-4 w-4 mr-2" />
                          Ver Perfil
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === "BANNED" ? (
                          <DropdownMenuItem
                            onClick={() => banMutation.mutate({ id: user.id, action: "unban" })}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Desbanir
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setBanUserId(user.id)}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Banir
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Ban Dialog */}
      <AlertDialog open={!!banUserId} onOpenChange={() => setBanUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Banir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              O usuário não poderá mais acessar a plataforma. Esta ação pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => banUserId && banMutation.mutate({ id: banUserId, action: "ban" })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Banir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}