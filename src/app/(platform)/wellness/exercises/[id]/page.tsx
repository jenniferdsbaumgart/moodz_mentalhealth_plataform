"use client"

import { useParams, useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { ExercisePlayer } from "@/components/wellness/exercise-player"
import { useExercise } from "@/hooks/use-wellness"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

export default function ExercisePlayerPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: exercise, isLoading, error } = useExercise(id)

  const handleComplete = async (duration: number, rating: number, notes?: string) => {
    try {
      const response = await fetch(`/api/wellness/exercises/${id}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          duration,
          rating,
          notes,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao salvar conclusão")
      }

      const result = await response.json()
      console.log("Exercise completed:", result)

      // Could show a success toast here
    } catch (error) {
      console.error("Error completing exercise:", error)
      throw error
    }
  }

  const handleBack = () => {
    router.push("/wellness/exercises")
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="py-8">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-64 w-full" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-80" />
                <Skeleton className="h-80 lg:col-span-2" />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error || !exercise) {
    return (
      <MainLayout>
        <div className="py-8">
          <div className="max-w-6xl mx-auto text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Exercício não encontrado</h1>
            <p className="text-muted-foreground mb-6">
              O exercício que você está procurando não existe ou não está disponível.
            </p>
            <button
              onClick={handleBack}
              className="text-primary hover:underline"
            >
              Voltar para a biblioteca
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="py-8">
        <ExercisePlayer
          exercise={exercise}
          onComplete={handleComplete}
          onBack={handleBack}
        />
      </div>
    </MainLayout>
  )
}
