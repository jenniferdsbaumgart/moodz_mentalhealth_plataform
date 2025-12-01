"use client"

import { useState } from "react"
import { SessionCategory } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SESSION_CATEGORIES } from "@/lib/constants/session"
import { Search, Filter, X } from "lucide-react"

export interface SessionFilters {
  categories: SessionCategory[]
  dateRange: "all" | "today" | "week" | "month"
  availability: "all" | "available" | "full"
  therapist: string
  searchQuery: string
}

interface SessionFiltersProps {
  filters: SessionFilters
  onFiltersChange: (filters: SessionFilters) => void
  totalResults?: number
}

export function SessionFiltersComponent({ filters, onFiltersChange, totalResults }: SessionFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCategoryToggle = (category: SessionCategory, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category)

    onFiltersChange({
      ...filters,
      categories: newCategories,
    })
  }

  const handleDateRangeChange = (dateRange: SessionFilters["dateRange"]) => {
    onFiltersChange({
      ...filters,
      dateRange,
    })
  }

  const handleAvailabilityChange = (availability: SessionFilters["availability"]) => {
    onFiltersChange({
      ...filters,
      availability,
    })
  }

  const handleTherapistChange = (therapist: string) => {
    onFiltersChange({
      ...filters,
      therapist,
    })
  }

  const handleSearchChange = (searchQuery: string) => {
    onFiltersChange({
      ...filters,
      searchQuery,
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      dateRange: "all",
      availability: "all",
      therapist: "",
      searchQuery: "",
    })
  }

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.dateRange !== "all" ||
    filters.availability !== "all" ||
    filters.therapist ||
    filters.searchQuery

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="text-lg">Filtros</CardTitle>
            {totalResults !== undefined && (
              <Badge variant="secondary" className="ml-2">
                {totalResults} resultado{totalResults !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Recolher" : "Expandir"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar - Always Visible */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar sessões..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Período</Label>
            <Select value={filters.dateRange} onValueChange={handleDateRangeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mês</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Vagas</Label>
            <Select value={filters.availability} onValueChange={handleAvailabilityChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as sessões</SelectItem>
                <SelectItem value="available">Com vagas</SelectItem>
                <SelectItem value="full">Lotadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Terapeuta</Label>
            <Input
              placeholder="Nome do terapeuta"
              value={filters.therapist}
              onChange={(e) => handleTherapistChange(e.target.value)}
            />
          </div>
        </div>

        {/* Advanced Filters - Expandable */}
        {isExpanded && (
          <div className="border-t pt-4">
            <Label className="text-base font-medium mb-3 block">Categorias</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(SESSION_CATEGORIES).map(([key, config]) => {
                const category = key as SessionCategory
                const isSelected = filters.categories.includes(category)
                const Icon = config.icon

                return (
                  <div
                    key={category}
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                    }`}
                    onClick={() => handleCategoryToggle(category, !isSelected)}
                  >
                    <Checkbox
                      id={category}
                      checked={isSelected}
                      onChange={() => {}} // Controlled by parent div
                      className="pointer-events-none"
                    />
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Label
                      htmlFor={category}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {config.label}
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="border-t pt-4">
            <Label className="text-sm font-medium mb-2 block">Filtros Ativos:</Label>
            <div className="flex flex-wrap gap-2">
              {filters.categories.map(category => (
                <Badge key={category} variant="secondary" className="flex items-center gap-1">
                  {SESSION_CATEGORIES[category].label}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleCategoryToggle(category, false)}
                  />
                </Badge>
              ))}
              {filters.dateRange !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.dateRange === "today" && "Hoje"}
                  {filters.dateRange === "week" && "Esta semana"}
                  {filters.dateRange === "month" && "Este mês"}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleDateRangeChange("all")}
                  />
                </Badge>
              )}
              {filters.availability !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.availability === "available" && "Com vagas"}
                  {filters.availability === "full" && "Lotadas"}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleAvailabilityChange("all")}
                  />
                </Badge>
              )}
              {filters.therapist && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Terapeuta: {filters.therapist}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleTherapistChange("")}
                  />
                </Badge>
              )}
              {filters.searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Busca: "{filters.searchQuery}"
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleSearchChange("")}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


