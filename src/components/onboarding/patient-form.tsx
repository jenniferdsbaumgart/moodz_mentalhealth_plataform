"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { patientOnboardingSchema, type PatientOnboardingData } from "@/lib/validations/onboarding"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { PATIENT_CATEGORIES } from "@/lib/constants/user"

export function PatientForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<PatientOnboardingData>({
    resolver: zodResolver(patientOnboardingSchema),
    defaultValues: {
      bio: "",
      phone: "",
      birthDate: "",
      preferredCategories: [],
    },
  })

  const onSubmit = async (data: PatientOnboardingData) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/onboarding/patient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Erro ao completar onboarding")
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Error completing onboarding:", error)
      alert("Erro ao completar cadastro. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryToggle = (category: string, checked: boolean) => {
    const currentCategories = form.getValues("preferredCategories") || []
    if (checked) {
      form.setValue("preferredCategories", [...currentCategories, category])
    } else {
      form.setValue(
        "preferredCategories",
        currentCategories.filter((c) => c !== category)
      )
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Complete seu Perfil</CardTitle>
        <CardDescription>
          Conte-nos um pouco sobre você para personalizar sua experiência
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bio">Biografia (opcional)</Label>
            <Textarea
              id="bio"
              placeholder="Conte um pouco sobre você, seus objetivos ou o que te trouxe aqui..."
              className="min-h-[100px]"
              {...form.register("bio")}
            />
            <p className="text-sm text-muted-foreground">
              Máximo de 500 caracteres
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                {...form.register("phone")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento (opcional)</Label>
              <Input
                id="birthDate"
                type="date"
                {...form.register("birthDate")}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Áreas de Interesse (opcional)</Label>
            <p className="text-sm text-muted-foreground">
              Selecione as áreas que mais te interessam para personalizar seu feed
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PATIENT_CATEGORIES.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    onCheckedChange={(checked) =>
                      handleCategoryToggle(category, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={category}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="flex-1"
            >
              Voltar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Finalizar Cadastro"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
