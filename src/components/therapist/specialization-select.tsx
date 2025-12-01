"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { THERAPIST_SPECIALTIES } from "@/lib/constants/user"
import { TherapistProfile } from "@/types/user"

const specializationSchema = z.object({
  specialties: z.array(z.string()).min(1, "Selecione pelo menos uma especialidade"),
  specializations: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  sessionPrice: z.number().positive().optional(),
  currency: z.string().optional(),
  availableForNew: z.boolean().optional(),
})

type SpecializationFormData = z.infer<typeof specializationSchema>

interface SpecializationSelectProps {
  profile: TherapistProfile | null
  onSave: (data: Partial<TherapistProfile>) => Promise<void>
  isSaving: boolean
}

const AVAILABLE_LANGUAGES = [
  "Português",
  "Inglês",
  "Espanhol",
  "Francês",
  "Italiano",
  "Alemão",
  "Japonês",
  "Mandarim",
  "Russo",
  "Árabe",
]

const APPROACHES = [
  "Psicanálise",
  "Terapia Cognitivo-Comportamental (TCC)",
  "Terapia Humanista",
  "Terapia Sistêmica",
  "Terapia Familiar",
  "Terapia de Casal",
  "Terapia Gestalt",
  "Psicodrama",
  "Hipnoterapia",
  "EMDR",
  "Mindfulness",
  "Terapia Positiva",
  "Neuropsicologia",
  "Psicologia Esportiva",
  "Psicologia Organizacional",
  "Psicologia Forense",
]

export function SpecializationSelect({
  profile,
  onSave,
  isSaving,
}: SpecializationSelectProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    profile?.languages || []
  )
  const [selectedApproaches, setSelectedApproaches] = useState<string[]>(
    profile?.specializations || []
  )

  const form = useForm<SpecializationFormData>({
    resolver: zodResolver(specializationSchema),
    defaultValues: {
      specialties: profile?.specialties || [],
      specializations: profile?.specializations || [],
      languages: profile?.languages || [],
      sessionPrice: profile?.sessionPrice || undefined,
      currency: profile?.currency || "BRL",
      availableForNew: profile?.availableForNew ?? true,
    },
  })

  const onSubmit = async (data: SpecializationFormData) => {
    const updateData = {
      ...data,
      languages: selectedLanguages,
      specializations: selectedApproaches,
    }
    await onSave(updateData)
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

  const handleLanguageToggle = (language: string, checked: boolean) => {
    if (checked) {
      setSelectedLanguages([...selectedLanguages, language])
    } else {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== language))
    }
  }

  const handleApproachToggle = (approach: string, checked: boolean) => {
    if (checked) {
      setSelectedApproaches([...selectedApproaches, approach])
    } else {
      setSelectedApproaches(selectedApproaches.filter((a) => a !== approach))
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Especialidades */}
      <div className="space-y-3">
        <Label>Especialidades *</Label>
        <p className="text-sm text-muted-foreground">
          Selecione suas especialidades (mínimo 1)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
          {THERAPIST_SPECIALTIES.map((specialty) => (
            <div key={specialty} className="flex items-center space-x-2">
              <Checkbox
                id={`specialty-${specialty}`}
                checked={form.watch("specialties")?.includes(specialty) || false}
                onCheckedChange={(checked) =>
                  handleSpecialtyToggle(specialty, checked as boolean)
                }
              />
              <Label
                htmlFor={`specialty-${specialty}`}
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

      {/* Abordagens Terapêuticas */}
      <div className="space-y-3">
        <Label>Abordagens Terapêuticas</Label>
        <p className="text-sm text-muted-foreground">
          Selecione as abordagens que você utiliza (opcional)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
          {APPROACHES.map((approach) => (
            <div key={approach} className="flex items-center space-x-2">
              <Checkbox
                id={`approach-${approach}`}
                checked={selectedApproaches.includes(approach)}
                onCheckedChange={(checked) =>
                  handleApproachToggle(approach, checked as boolean)
                }
              />
              <Label
                htmlFor={`approach-${approach}`}
                className="text-sm font-normal cursor-pointer"
              >
                {approach}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Idiomas */}
      <div className="space-y-3">
        <Label>Idiomas</Label>
        <p className="text-sm text-muted-foreground">
          Selecione os idiomas que você fala
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto border rounded-lg p-4">
          {AVAILABLE_LANGUAGES.map((language) => (
            <div key={language} className="flex items-center space-x-2">
              <Checkbox
                id={`language-${language}`}
                checked={selectedLanguages.includes(language)}
                onCheckedChange={(checked) =>
                  handleLanguageToggle(language, checked as boolean)
                }
              />
              <Label
                htmlFor={`language-${language}`}
                className="text-sm font-normal cursor-pointer"
              >
                {language}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Preço da Sessão */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sessionPrice">Preço por Sessão</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              R$
            </span>
            <input
              type="number"
              id="sessionPrice"
              className="flex h-10 w-full rounded-md border border-input bg-background px-8 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="0,00"
              step="0.01"
              min="0"
              {...form.register("sessionPrice", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Moeda</Label>
          <Select
            value={form.watch("currency")}
            onValueChange={(value) => form.setValue("currency", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a moeda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">Real (R$)</SelectItem>
              <SelectItem value="USD">Dólar ($)</SelectItem>
              <SelectItem value="EUR">Euro (€)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Disponibilidade para Novos Pacientes */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="availableForNew"
            checked={form.watch("availableForNew") ?? true}
            onCheckedChange={(checked) =>
              form.setValue("availableForNew", checked as boolean)
            }
          />
          <Label
            htmlFor="availableForNew"
            className="text-sm font-normal cursor-pointer"
          >
            Aceito novos pacientes
          </Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Desmarque se você não está aceitando novos pacientes no momento
        </p>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Alterações"
          )}
        </Button>
      </div>
    </form>
  )
}
