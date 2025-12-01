"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AdvancedFilters,
  BulkActions,
  UserDetailModal,
  UserFilters
} from "@/components/admin/users"

interface User {
  id: string
  name: string | null
  email: string
  role: string
  status: string
  createdAt: string
  image: string | null
  _count: {
    sessionParticipants: number
    posts: number
  }
}

interface UsersResponse {
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AdminUsersPage() {
  const [filters, setFilters] = useState<UserFilters>({})
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [detailUserId, setDetailUserId] = useState<string | null>(null)
  const limit = 20

  // Build query params
  const queryParams = useMemo(() => {
    const params = new URLSearchParams()
    params.set("page", page.toString())
    params.set("limit", limit.toString())
    if (filters.search) params.set("search", filters.search)
    if (filters.role) params.set("role", filters.role)
    if (filters.status) params.set("status", filters.status)
    if (filters.dateRange?.from) params.set("startDate", filters.dateRange.from.toISOString())
    if (filters.dateRange?.to) params.set("endDate", filters.dateRange.to.toISOString())
    if (filters.engagement) params.set("engagement", filters.engagement)
    if (filters.verified) params.set("verified", filters.verified)
    return params.toString()
  }, [page, filters])

  // Fetch users
  const { data, isLoading, error } = useQuery<UsersResponse>({
    queryKey: ["admin-users", queryParams],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users?${queryParams}`)
      if (!response.ok) throw new Error("Failed to fetch users")
      return response.json()
    }
  })

  const users = data?.users || []
  const totalPages = data?.totalPages || 1

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(users.map(u => u.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, userId])
    } else {
      setSelectedIds(prev => prev.filter(id => id !== userId))
    }
  }

  const selectedUsers = useMemo(() => {
    return users.filter(u => selectedIds.includes(u.id))
  }, [users, selectedIds])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ACTIVE: "default",
      INACTIVE: "secondary",
      SUSPENDED: "outline",
      BANNED: "destructive"
    }
    const labels: Record<string, string> = {
      ACTIVE: "Ativo",
      INACTIVE: "Inativo",
      SUSPENDED: "Suspenso",
      BANNED: "Banido"
    }
    return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>
  }

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
      THERAPIST: "bg-blue-100 text-blue-800 border-blue-200",
      PATIENT: "bg-green-100 text-green-800 border-green-200"
    }
    const labels: Record<string, string> = {
      ADMIN: "Admin",
      THERAPIST: "Terapeuta",
      PATIENT: "Paciente"
    }
    return (
      <Badge className={colors[role] || ""} variant="outline">
        {labels[role] || role}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="h-8 w-8" />
          Gestão de Usuários
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie todos os usuários da plataforma
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <AdvancedFilters
          filters={filters}
          onChange={(newFilters) => {
            setFilters(newFilters)
            setPage(1)
          }}
          onClear={() => {
            setFilters({})
            setPage(1)
          }}
        />
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedIds={selectedIds}
        selectedUsers={selectedUsers}
        onClearSelection={() => setSelectedIds([])}
      />

      {/* Users Table */}
      <div className="border rounded-lg mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">
            Erro ao carregar usuários
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Nenhum usuário encontrado
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === users.length && users.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sessões</TableHead>
                  <TableHead>Posts</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(user.id)}
                        onCheckedChange={(checked) => handleSelectOne(user.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image || ""} />
                          <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name || "Sem nome"}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{user._count.sessionParticipants}</TableCell>
                    <TableCell>{user._count.posts}</TableCell>
                    <TableCell>
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
                          <DropdownMenuItem onClick={() => setDetailUserId(user.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Mostrando {users.length} de {data?.total || 0} usuários
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        userId={detailUserId}
        onClose={() => setDetailUserId(null)}
      />
    </div>
  )
}