"use client"

import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { SessionForm } from "@/components/sessions/session-form"
import { CreateSessionInput } from "@/lib/validations/session"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NewSessionPage() {
  const router = useRouter()

  const handleSubmit = async (data: CreateSessionInput) => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Erro ao criar sessão")
      }

      router.push("/therapist/sessions")
    } catch (error) {
      console.error("Error creating session:", error)
      throw error
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/therapist/sessions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Criar Nova Sessão</h1>
            <p className="text-muted-foreground">
              Configure uma nova sessão de terapia em grupo
            </p>
          </div>
        </div>

        <SessionForm onSubmit={handleSubmit} />
      </div>
    </MainLayout>
  )
}
