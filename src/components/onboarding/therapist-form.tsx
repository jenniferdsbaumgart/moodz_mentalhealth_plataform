"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { therapistOnboardingSchema, type TherapistOnboardingData } from "@/lib/validations/onboarding"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Upload } from "lucide-react"
import { THERAPIST_SPECIALTIES } from "@/lib/constants/user"

export function TherapistForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<TherapistOnboardingData>({
    resolver: zodResolver(therapistOnboardingSchema),
    defaultValues: {
      crp: "",
      specialties: [],
      bio: "",
      education: "",
      experience: "",
      documentUrl: "",
    },
  })

  const onSubmit = async (data: TherapistOnboardingData) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/onboarding/therapist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Erro ao completar onboarding")
      }

      router.push("/onboarding/pending")
    } catch (error) {
      console.error("Error completing onboarding:", error)
      alert("Erro ao completar cadastro. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSpecialtyToggle = (specialty: string, checked: boolean) => {
    const currentSpecialties = form.getValues("specialties") || []
    if (checked) {
      form.setValue("specialties", [...currentSpecialties, specialty])
    } else {
      form.setValue(
        "specialties",
        currentSpecialties.filter((s) => s !== specialty)
      )
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Cadastro de Terapeuta</CardTitle>
        <CardDescription>
          Complete seu perfil profissional para ser aprovado na plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crp">CRP *</Label>
              <Input
                id="crp"
                placeholder="Ex: 12/34567"
                {...form.register("crp")}
              />
              {form.formState.errors.crp && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.crp.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentUrl">Link do Documento CRP *</Label>
              <Input
                id="documentUrl"
                placeholder="https://drive.google.com/..."
                {...form.register("documentUrl")}
              />
              {form.formState.errors.documentUrl && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.documentUrl.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Especialidades *</Label>
            <p className="text-sm text-muted-foreground">
              Selecione suas especialidades (mínimo 1)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
              {THERAPIST_SPECIALTIES.map((specialty) => (
                <div key={specialty} className="flex items-center space-x-2">
                  <Checkbox
                    id={specialty}
                    onCheckedChange={(checked) =>
                      handleSpecialtyToggle(specialty, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={specialty}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {specialty}
                  </Label>
                </div>
              ))}
            </div>
            {form.formState.errors.specialties && (
              <p className="text-sm text-red-500">
                {form.formState.errors.specialties.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografia Profissional *</Label>
            <Textarea
              id="bio"
              placeholder="Descreva sua experiência, abordagem terapêutica, especialidades..."
              className="min-h-[120px]"
              {...form.register("bio")}
            />
            <p className="text-sm text-muted-foreground">
              Mínimo 100 caracteres, máximo 2000 caracteres
            </p>
            {form.formState.errors.bio && (
              <p className="text-sm text-red-500">
                {form.formState.errors.bio.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="education">Formação Acadêmica</Label>
              <Textarea
                id="education"
                placeholder="Ex: Psicologia - USP (2010-2015)"
                className="min-h-[80px]"
                {...form.register("education")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experiência Profissional</Label>
              <Textarea
                id="experience"
                placeholder="Descreva sua experiência profissional..."
                className="min-h-[80px]"
                {...form.register("experience")}
              />
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Revisão Pendente
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    Seu cadastro será revisado por nossa equipe. Você receberá um email
                    quando for aprovado para começar a atender pacientes na plataforma.
                  </p>
                </div>
              </div>
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
                  Enviando...
                </>
              ) : (
                "Enviar para Aprovação"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}



