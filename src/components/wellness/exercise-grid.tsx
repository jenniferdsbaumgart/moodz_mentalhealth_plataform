"use client"

import { useState } from "react"
import { ExerciseCard } from "./exercise-card"
import { ExerciseFilters } from "./exercise-filters"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ExerciseCategory, Difficulty } from "@prisma/client"

interface MindfulnessExercise {
  id: string
  title: string
  description: string
  category: ExerciseCategory
  duration: number
  difficulty: Difficulty
  isFeatured: boolean
}

interface ExerciseGridProps {
  exercises: MindfulnessExercise[]
  isLoading?: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onFiltersChange: (filters: {
    search?: string
    category?: ExerciseCategory
    difficulty?: Difficulty
    featured?: boolean
  }) => void
  onExerciseStart: (exercise: MindfulnessExercise) => void
  className?: string
}

export function ExerciseGrid({
  exercises,
  isLoading = false,
  currentPage,
  totalPages,
  onPageChange,
  onFiltersChange,
  onExerciseStart,
  className
}: ExerciseGridProps) {
  const [showFilters, setShowFilters] = useState(false)

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters Toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Biblioteca de Exercícios</h2>
          <p className="text-muted-foreground">
            {exercises.length} exercícios disponíveis
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <ExerciseFilters onFiltersChange={onFiltersChange} />
      )}

      {/* Exercise Grid */}
      {exercises.length === 0 ? (
        <div className="text-center py-12">
          <div className="space-y-4">
            <div className="text-6xl">🧘‍♀️</div>
            <div>
              <h3 className="text-lg font-medium mb-2">Nenhum exercício encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros ou remover alguns critérios de busca.
              </p>
              <Button onClick={() => onFiltersChange({})}>
                Ver todos os exercícios
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onStart={onExerciseStart}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                  return (
                    <Button
                      key={pageNumber}
                      variant={pageNumber === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(pageNumber)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNumber}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

