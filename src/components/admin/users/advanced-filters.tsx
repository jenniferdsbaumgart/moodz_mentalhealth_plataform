"use client"

import { useState } from "react"
import { Filter, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Badge } from "@/components/ui/badge"
import { DateRange } from "react-day-picker"

export interface UserFilters {
  search?: string
  role?: string
  status?: string
  dateRange?: DateRange
  engagement?: string
  verified?: string
}

interface AdvancedFiltersProps {
  filters: UserFilters
  onChange: (filters: UserFilters) => void
  onClear: () => void
}

export function AdvancedFilters({ filters, onChange, onClear }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== "").length

  const handleSearchChange = (value: string) => {
    onChange({ ...filters, search: value || undefined })
  }

  const handleRoleChange = (value: string) => {
    onChange({ ...filters, role: value === "all" ? undefined : value })
  }

  const handleStatusChange = (value: string) => {
    onChange({ ...filters, status: value === "all" ? undefined : value })
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    onChange({ ...filters, dateRange: range })
  }

  const handleEngagementChange = (value: string) => {
    onChange({ ...filters, engagement: value === "all" ? undefined : value })
  }

  const handleVerifiedChange = (value: string) => {
    onChange({ ...filters, verified: value === "all" ? undefined : value })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Quick Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={filters.search || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Role Filter */}
        <Select value={filters.role || "all"} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas funções</SelectItem>
            <SelectItem value="PATIENT">Paciente</SelectItem>
            <SelectItem value="THERAPIST">Terapeuta</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={filters.status || "all"} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="ACTIVE">Ativo</SelectItem>
            <SelectItem value="INACTIVE">Inativo</SelectItem>
            <SelectItem value="SUSPENDED">Suspenso</SelectItem>
            <SelectItem value="BANNED">Banido</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced Filters Popover */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avançados
              {activeFilterCount > 2 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {activeFilterCount - 2}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Filtros Avançados</h4>

              {/* Date Range */}
              <div className="space-y-2">
                <Label>Data de Cadastro</Label>
                <DatePickerWithRange
                  date={filters.dateRange}
                  onDateChange={handleDateRangeChange}
                />
              </div>

              {/* Engagement Level */}
              <div className="space-y-2">
                <Label>Nível de Engajamento</Label>
                <Select
                  value={filters.engagement || "all"}
                  onValueChange={handleEngagementChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="high">Alto (10+ sessões)</SelectItem>
                    <SelectItem value="medium">Médio (5-10 sessões)</SelectItem>
                    <SelectItem value="low">Baixo (1-5 sessões)</SelectItem>
                    <SelectItem value="none">Sem atividade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Therapist Verification */}
              <div className="space-y-2">
                <Label>Verificação (Terapeutas)</Label>
                <Select
                  value={filters.verified || "all"}
                  onValueChange={handleVerifiedChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="verified">Verificados</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="rejected">Rejeitados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                Aplicar Filtros
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4 mr-1" />
            Limpar ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Busca: {filters.search}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onChange({ ...filters, search: undefined })}
              />
            </Badge>
          )}
          {filters.role && (
            <Badge variant="secondary" className="gap-1">
              Função: {filters.role}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onChange({ ...filters, role: undefined })}
              />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onChange({ ...filters, status: undefined })}
              />
            </Badge>
          )}
          {filters.dateRange && (
            <Badge variant="secondary" className="gap-1">
              Período selecionado
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onChange({ ...filters, dateRange: undefined })}
              />
            </Badge>
          )}
          {filters.engagement && (
            <Badge variant="secondary" className="gap-1">
              Engajamento: {filters.engagement}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onChange({ ...filters, engagement: undefined })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
