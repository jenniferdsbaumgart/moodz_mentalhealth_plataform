"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { GroupSession } from "@prisma/client"
import { MainLayout } from "@/components/layout/main-layout"
import { SessionForm } from "@/components/sessions/session-form"
import { CreateSessionInput } from "@/lib/validations/session"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function EditSessionPage() {
  const params = useParams()
  const router = useRouter()
  const [session, setSession] = useState<GroupSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchSession()
    }
  }, [params.id])

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setSession(data.data)
      }
    } catch (error) {
      console.error("Error fetching session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: CreateSessionInput) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/sessions/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Erro ao atualizar sessão")
      }

      router.push(`/therapist/sessions/${params.id}`)
    } catch (error) {
      console.error("Error updating session:", error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    )
  }

  if (!session) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div>Sessão não encontrada</div>
        </div>
      </MainLayout>
    )
  }

  const initialData: Partial<CreateSessionInput> = {
    title: session.title,
    description: session.description,
    category: session.category,
    scheduledAt: session.scheduledAt.toISOString().slice(0, 16), // Format for datetime-local
    duration: session.duration,
    maxParticipants: session.maxParticipants,
    coverImage: session.coverImage || "",
    tags: session.tags || [],
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/therapist/sessions/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Sessão</h1>
            <p className="text-muted-foreground">
              Atualize as informações da sessão
            </p>
          </div>
        </div>

        <SessionForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={isSaving}
        />
      </div>
    </MainLayout>
  )
}
