"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { ExerciseGrid } from "@/components/wellness/exercise-grid"
import { Button } from "@/components/ui/button"
import { useExercises } from "@/hooks/use-wellness"
import { ArrowLeft, Play } from "lucide-react"
import Link from "next/link"
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

export default function ExercisesPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<{
    search?: string
    category?: ExerciseCategory
    difficulty?: Difficulty
    featured?: boolean
  }>({})

  const { data, isLoading, error } = useExercises({
    page: currentPage,
    limit: 12,
    ...filters,
  })

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleExerciseStart = (exercise: MindfulnessExercise) => {
    // For now, just log. We'll implement the exercise player later
    console.log("Starting exercise:", exercise.title)
    // TODO: Navigate to exercise player or open modal
  }

  return (
    <MainLayout>
      <div className="py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/wellness">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Bem-estar
            </Link>
          </Button>
        </div>

        {/* Featured Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold mb-4">Exercícios de Mindfulness</h1>
              <p className="text-lg text-muted-foreground mb-6">
                Explore nossa biblioteca completa de exercícios de atenção plena.
                Encontre a prática perfeita para o seu momento e nível de experiência.
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="gap-2">
                  <Play className="h-5 w-5" />
                  Começar Agora
                </Button>
                <Button variant="outline" size="lg">
                  Ver Destaques
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Erro ao carregar exercícios</h2>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar os exercícios. Tente novamente.
            </p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <ExerciseGrid
            exercises={data?.data || []}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={data?.pagination?.totalPages || 1}
            onPageChange={handlePageChange}
            onFiltersChange={handleFiltersChange}
            onExerciseStart={handleExerciseStart}
          />
        )}

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-muted/50 rounded-lg">
            <div className="text-3xl mb-2">🧘‍♀️</div>
            <h3 className="font-semibold mb-2">Para Todos os Níveis</h3>
            <p className="text-sm text-muted-foreground">
              Exercícios adequados para iniciantes até praticantes avançados.
            </p>
          </div>

          <div className="text-center p-6 bg-muted/50 rounded-lg">
            <div className="text-3xl mb-2">⏱️</div>
            <h3 className="font-semibold mb-2">Durações Variadas</h3>
            <p className="text-sm text-muted-foreground">
              Sessões de 5 a 20 minutos para se adequar à sua rotina.
            </p>
          </div>

          <div className="text-center p-6 bg-muted/50 rounded-lg">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold mb-2">Resultados Comprovados</h3>
            <p className="text-sm text-muted-foreground">
              Técnicas baseadas em evidências científicas para bem-estar.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
