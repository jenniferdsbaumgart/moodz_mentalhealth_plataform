"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { User, AuditAction } from "@prisma/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

const actionOptions: { value: AuditAction; label: string }[] = [
  { value: "USER_CREATED", label: "Usuário Criado" },
  { value: "USER_BANNED", label: "Usuário Banido" },
  { value: "ROLE_CHANGED", label: "Role Alterada" },
  { value: "ADMIN_CREATED", label: "Admin Criado" },
  { value: "ADMIN_REMOVED", label: "Admin Removido" },
  { value: "THERAPIST_APPROVED", label: "Terapeuta Aprovado" },
  { value: "THERAPIST_REJECTED", label: "Terapeuta Rejeitado" },
  { value: "POST_DELETED", label: "Post Deletado" },
  { value: "SETTINGS_UPDATED", label: "Configurações Atualizadas" },
]

const entityOptions = [
  { value: "User", label: "Usuário" },
  { value: "Session", label: "Sessão" },
  { value: "Post", label: "Post" },
  { value: "Comment", label: "Comentário" },
  { value: "Report", label: "Report" },
  { value: "SystemSettings", label: "Configurações" },
]

interface AuditFiltersProps {
  users: Pick<User, "id" | "name" | "email">[]
}

export function AuditFilters({ users }: AuditFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page") // Reset pagination
    router.push(`/super-admin/audit?${params.toString()}`)
  }

  function clearFilters() {
    router.push("/super-admin/audit")
  }

  const hasFilters = searchParams.toString().length > 0

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-card p-4">
      <div className="space-y-2">
        <Label>Ação</Label>
        <Select
          value={searchParams.get("action") || ""}
          onValueChange={(value) => updateFilter("action", value || null)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todas as ações" />
          </SelectTrigger>
          <SelectContent>
            {actionOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Entidade</Label>
        <Select
          value={searchParams.get("entity") || ""}
          onValueChange={(value) => updateFilter("entity", value || null)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            {entityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Executado por</Label>
        <Select
          value={searchParams.get("userId") || ""}
          onValueChange={(value) => updateFilter("userId", value || null)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todos os usuários" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>De</Label>
        <Input
          type="date"
          value={searchParams.get("from") || ""}
          onChange={(e) => updateFilter("from", e.target.value || null)}
          className="w-[150px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Até</Label>
        <Input
          type="date"
          value={searchParams.get("to") || ""}
          onChange={(e) => updateFilter("to", e.target.value || null)}
          className="w-[150px]"
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-2 h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  )
}
