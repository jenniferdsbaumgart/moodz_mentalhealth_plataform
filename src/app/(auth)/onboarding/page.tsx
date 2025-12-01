"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, GraduationCap } from "lucide-react"

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRoleSelection = async (role: "patient" | "therapist") => {
    setIsLoading(true)
    try {
      // Update user role
      const response = await fetch("/api/user/role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: role.toUpperCase() }),
      })

      if (!response.ok) {
        throw new Error("Erro ao atualizar role")
      }

      // Redirect to appropriate onboarding
      router.push(`/onboarding/${role}`)
    } catch (error) {
      console.error("Error updating role:", error)
      alert("Erro ao selecionar tipo de usuário. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="w-full max-w-4xl space-y-8 p-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">
            Bem-vindo ao Moodz
          </h1>
          <p className="text-xl text-muted-foreground">
            Escolha como você deseja usar nossa plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <CardHeader className="text-center">
              <Heart className="mx-auto h-16 w-16 text-primary mb-4" />
              <CardTitle className="text-2xl">Paciente</CardTitle>
              <CardDescription className="text-lg">
                Busco apoio e ferramentas para minha saúde mental
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>✓ Participar de sessões de terapia em grupo</li>
                <li>✓ Acessar ferramentas de bem-estar</li>
                <li>✓ Conectar com comunidade de apoio</li>
                <li>✓ Rastrear meu progresso pessoal</li>
              </ul>
              <Button
                className="w-full"
                size="lg"
                onClick={() => handleRoleSelection("patient")}
                disabled={isLoading}
              >
                {isLoading ? "Processando..." : "Continuar como Paciente"}
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <CardHeader className="text-center">
              <GraduationCap className="mx-auto h-16 w-16 text-secondary mb-4" />
              <CardTitle className="text-2xl">Terapeuta</CardTitle>
              <CardDescription className="text-lg">
                Sou profissional de saúde mental e quero ajudar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>✓ Conduzir sessões de terapia em grupo</li>
                <li>✓ Gerenciar meus pacientes</li>
                <li>✓ Acompanhar progresso e analytics</li>
                <li>✓ Agendar e gerenciar consultas</li>
              </ul>
              <Button
                className="w-full"
                variant="outline"
                size="lg"
                onClick={() => handleRoleSelection("therapist")}
                disabled={isLoading}
              >
                {isLoading ? "Processando..." : "Continuar como Terapeuta"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Não sabe qual escolher? Você pode alterar seu tipo de conta posteriormente
            entrando em contato com nosso suporte.
          </p>
        </div>
      </div>
    </div>
  )
}


