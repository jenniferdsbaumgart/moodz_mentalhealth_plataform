"use client"

import { useQuery } from "@tanstack/react-query"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InteractiveCard } from "@/components/ui/interactive-card"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PAGE_SPACING, CARD_HOVER } from "@/lib/design-tokens"
import { Calendar, MessageSquare } from "lucide-react"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function PatientsList() {
  const [search, setSearch] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["therapist", "patients"],
    queryFn: async () => {
      const res = await fetch("/api/therapist/patients")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    }
  })

  const filteredPatients = data?.patients?.filter((p: any) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return <div>Carregando...</div>

  return (
    <div className={PAGE_SPACING.items}>
      <Input
        placeholder="Buscar paciente..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPatients?.map((patient: any) => (
          <InteractiveCard key={patient.id} hoverStyle="interactive">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <UserAvatar name={patient.name || "Paciente"} image={patient.image} />
                <div>
                  <CardTitle className="text-base">
                    {patient.name || "Paciente"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {patient.email}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{patient.sessionCount} sessões</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Última participação:{" "}
                {formatDistanceToNow(new Date(patient.lastSessionDate), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{patient.favoriteCategory}</Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Ver notas
              </Button>
            </CardContent>
          </InteractiveCard>
        ))}
      </div>

      {!filteredPatients?.length && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum paciente encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
