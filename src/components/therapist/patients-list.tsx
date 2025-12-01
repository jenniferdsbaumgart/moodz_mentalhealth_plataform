"use client"

import { useQuery } from "@tanstack/react-query"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InteractiveCard } from "@/components/ui/interactive-card"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PAGE_SPACING, CARD_HOVER } from "@/lib/design-tokens"
import { Calendar, MessageSquare, Filter, Eye, Tag } from "lucide-react"
import { useState } from "react"
import { formatDistanceToNow, isAfter, subDays, subWeeks, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { PatientDetailModal } from "./patient-detail-modal"

type FilterFrequency = "all" | "active" | "inactive" | "recent"
type SortBy = "name" | "lastSession" | "sessionCount" | "category"

export function PatientsList() {
  const [search, setSearch] = useState("")
  const [frequencyFilter, setFrequencyFilter] = useState<FilterFrequency>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortBy>("lastSession")
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["therapist", "patients"],
    queryFn: async () => {
      const res = await fetch("/api/therapist/patients")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    }
  })

  // Aplicar filtros
  let filteredPatients = data?.patients?.filter((p: any) => {
    // Filtro de busca
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
                         p.email?.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    // Filtro de frequência
    if (frequencyFilter !== "all") {
      const lastSession = new Date(p.lastSessionDate)
      const now = new Date()

      switch (frequencyFilter) {
        case "active":
          if (!isAfter(lastSession, subWeeks(now, 2))) return false
          break
        case "inactive":
          if (isAfter(lastSession, subMonths(now, 1))) return false
          break
        case "recent":
          if (!isAfter(lastSession, subDays(now, 7))) return false
          break
      }
    }

    // Filtro de categoria
    if (categoryFilter !== "all" && p.favoriteCategory !== categoryFilter) {
      return false
    }

    return true
  }) || []

  // Aplicar ordenação
  filteredPatients = filteredPatients.sort((a: any, b: any) => {
    switch (sortBy) {
      case "name":
        return (a.name || "").localeCompare(b.name || "")
      case "lastSession":
        return new Date(b.lastSessionDate).getTime() - new Date(a.lastSessionDate).getTime()
      case "sessionCount":
        return b.sessionCount - a.sessionCount
      case "category":
        return (a.favoriteCategory || "").localeCompare(b.favoriteCategory || "")
      default:
        return 0
    }
  })

  const handleViewPatient = (patientId: string) => {
    setSelectedPatientId(patientId)
  }

  if (isLoading) return <div>Carregando...</div>

  return (
    <>
      <div className={PAGE_SPACING.items}>
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Input
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />

          <div className="flex flex-wrap gap-2">
            <Select value={frequencyFilter} onValueChange={(value: FilterFrequency) => setFrequencyFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Frequência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos (2 semanas)</SelectItem>
                <SelectItem value="recent">Recentes (7 dias)</SelectItem>
                <SelectItem value="inactive">Inativos (1 mês)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="ANXIETY">Ansiedade</SelectItem>
                <SelectItem value="DEPRESSION">Depressão</SelectItem>
                <SelectItem value="RELATIONSHIPS">Relacionamentos</SelectItem>
                <SelectItem value="STRESS">Estresse</SelectItem>
                <SelectItem value="TRAUMA">Trauma</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastSession">Última sessão</SelectItem>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="sessionCount">Nº de sessões</SelectItem>
                <SelectItem value="category">Categoria</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resultados */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filteredPatients.length} pacientes encontrados</span>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Filtros aplicados</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient: any) => {
            const lastSession = new Date(patient.lastSessionDate)
            const isActive = isAfter(lastSession, subWeeks(new Date(), 2))
            const isRecent = isAfter(lastSession, subDays(new Date(), 7))

            return (
              <InteractiveCard key={patient.id} hoverStyle="interactive">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={patient.name || "Paciente"} image={patient.image} />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">
                        {patient.name || "Paciente"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground truncate">
                        {patient.email}
                      </p>
                    </div>
                    {isActive && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Ativo
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.sessionCount} sessões</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    Última participação:{" "}
                    {formatDistanceToNow(lastSession, {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{patient.favoriteCategory}</Badge>
                    {isRecent && (
                      <Badge variant="secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        Novo
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleViewPatient(patient.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalhes
                  </Button>
                </CardContent>
              </InteractiveCard>
            )
          })}
        </div>

        {!filteredPatients.length && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Filter className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhum paciente encontrado</p>
              <p className="text-sm text-muted-foreground mt-2">
                Tente ajustar os filtros ou buscar por outro termo
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedPatientId && (
        <PatientDetailModal
          patientId={selectedPatientId}
          isOpen={!!selectedPatientId}
          onClose={() => setSelectedPatientId(null)}
        />
      )}
    </>
  )
}
