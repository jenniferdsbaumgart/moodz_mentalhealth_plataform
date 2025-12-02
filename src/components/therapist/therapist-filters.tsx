"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface TherapistFiltersProps {
  specialization: string
  language: string
  availableOnly: boolean
  onSpecializationChange: (value: string) => void
  onLanguageChange: (value: string) => void
  onAvailableChange: (value: boolean) => void
}

const SPECIALIZATIONS = [
  "Psicologia Clínica",
  "Terapia Cognitivo-Comportamental (TCC)",
  "Psicanálise",
  "Psicologia Humanista",
  "Terapia Familiar e de Casais",
  "Psicologia Infantil e Adolescente",
  "Psicologia Esportiva",
  "Psicologia Organizacional",
  "Neuropsicologia",
  "Psicologia Forense",
  "Terapia Gestalt",
  "Psicodrama",
  "Hipnoterapia",
  "Arteterapia",
  "Musicoterapia"
]

const LANGUAGES = [
  "Português",
  "Inglês",
  "Espanhol",
  "Francês",
  "Alemão",
  "Italiano",
  "Japonês",
  "Mandarim",
  "Russo",
  "Árabe"
]

export function TherapistFilters({
  specialization,
  language,
  availableOnly,
  onSpecializationChange,
  onLanguageChange,
  onAvailableChange
}: TherapistFiltersProps) {
  const hasActiveFilters = specialization !== "all" || language !== "all" || availableOnly

  const clearFilters = () => {
    onSpecializationChange("all")
    onLanguageChange("all")
    onAvailableChange(false)
  }

  const activeFilterCount = [
    specialization !== "all" ? 1 : 0,
    language !== "all" ? 1 : 0,
    availableOnly ? 1 : 0
  ].reduce((sum, count) => sum + count, 0)

  return (
    <div className="space-y-4">
      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Filtros ativos ({activeFilterCount})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs h-7 px-2"
            >
              <X className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          </div>

          <div className="flex flex-wrap gap-1">
            {specialization !== "all" && (
              <Badge variant="secondary" className="text-xs">
                {specialization}
                <button
                  onClick={() => onSpecializationChange("all")}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            )}
            {language !== "all" && (
              <Badge variant="secondary" className="text-xs">
                {language}
                <button
                  onClick={() => onLanguageChange("all")}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            )}
            {availableOnly && (
              <Badge variant="secondary" className="text-xs">
                Disponíveis
                <button
                  onClick={() => onAvailableChange(false)}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Specialization Filter */}
        <div className="space-y-2">
          <Label htmlFor="specialization" className="text-sm font-medium">
            Especialização
          </Label>
          <Select value={specialization} onValueChange={onSpecializationChange}>
            <SelectTrigger id="specialization">
              <SelectValue placeholder="Todas as especializações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as especializações</SelectItem>
              {SPECIALIZATIONS.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Language Filter */}
        <div className="space-y-2">
          <Label htmlFor="language" className="text-sm font-medium">
            Idioma
          </Label>
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger id="language">
              <SelectValue placeholder="Todos os idiomas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os idiomas</SelectItem>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Availability Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Disponibilidade</Label>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="available"
              checked={availableOnly}
              onCheckedChange={(checked) => onAvailableChange(checked as boolean)}
            />
            <Label
              htmlFor="available"
              className="text-sm font-normal cursor-pointer"
            >
              Apenas terapeutas aceitando novos pacientes
            </Label>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-md p-3">
        <p>
          💡 <strong>Dica:</strong> Combine filtros para encontrar o terapeuta ideal para suas necessidades.
          Você pode filtrar por especialização, idioma e disponibilidade simultaneamente.
        </p>
      </div>
    </div>
  )
}

