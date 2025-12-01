"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, X, Star } from "lucide-react"
import { ExerciseCategory, Difficulty } from "@prisma/client"

interface ExerciseFiltersProps {
  onFiltersChange: (filters: {
    search?: string
    category?: ExerciseCategory
    difficulty?: Difficulty
    featured?: boolean
  }) => void
  className?: string
}

const categoryLabels = {
  BREATHING: "Respiração",
  MEDITATION: "Meditação",
  BODY_SCAN: "Body Scan",
  GROUNDING: "Ancoragem",
  VISUALIZATION: "Visualização",
  RELAXATION: "Relaxamento",
  MINDFUL_MOVEMENT: "Movimento",
} as const

const categoryIcons = {
  BREATHING: "💨",
  MEDITATION: "🧠",
  BODY_SCAN: "👤",
  GROUNDING: "⚓",
  VISUALIZATION: "👁️",
  RELAXATION: "🍃",
  MINDFUL_MOVEMENT: "🏃",
} as const

const difficultyLabels = {
  BEGINNER: "Iniciante",
  INTERMEDIATE: "Intermediário",
  ADVANCED: "Avançado",
} as const

export function ExerciseFilters({ onFiltersChange, className }: ExerciseFiltersProps) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<ExerciseCategory | "">("")
  const [difficulty, setDifficulty] = useState<Difficulty | "">("")
  const [featured, setFeatured] = useState(false)

  const handleFiltersChange = () => {
    onFiltersChange({
      search: search || undefined,
      category: category || undefined,
      difficulty: difficulty || undefined,
      featured: featured || undefined,
    })
  }

  const clearFilters = () => {
    setSearch("")
    setCategory("")
    setDifficulty("")
    setFeatured(false)
    onFiltersChange({})
  }

  const hasActiveFilters = search || category || difficulty || featured

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filtros
        </CardTitle>
        <CardDescription>
          Encontre o exercício perfeito para você
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar exercícios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleFiltersChange()}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Categoria</label>
          <Select value={category} onValueChange={(value) => setCategory(value as ExerciseCategory)}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as categorias</SelectItem>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <span>{categoryIcons[key as ExerciseCategory]}</span>
                    <span>{label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Dificuldade</label>
          <Select value={difficulty} onValueChange={(value) => setDifficulty(value as Difficulty)}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as dificuldades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as dificuldades</SelectItem>
              {Object.entries(difficultyLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Featured Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              Apenas destaques
            </label>
            <p className="text-xs text-muted-foreground">
              Mostrar apenas exercícios recomendados
            </p>
          </div>
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="rounded"
          />
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Filtros ativos</label>
            <div className="flex flex-wrap gap-2">
              {search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Busca: {search}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearch("")}
                    className="h-4 w-4 p-0 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {category && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {categoryLabels[category as ExerciseCategory]}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCategory("")}
                    className="h-4 w-4 p-0 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {difficulty && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {difficultyLabels[difficulty as Difficulty]}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDifficulty("")}
                    className="h-4 w-4 p-0 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {featured && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Destaques
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFeatured(false)}
                    className="h-4 w-4 p-0 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleFiltersChange} className="flex-1">
            Aplicar Filtros
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Limpar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


