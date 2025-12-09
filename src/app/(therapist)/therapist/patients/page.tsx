"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Calendar, MessageSquare, Activity } from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Patient {
  id: string
  name: string | null
  email: string
  image: string | null
  patientProfile: {
    points: number
    level: number
    streak: number
    moodStreak: number
  } | null
  sessionsAttended: number
  lastSessionDate: string | null
}

export default function TherapistPatientsPage() {
  const [search, setSearch] = useState("")

  const { data, isLoading } = useQuery<{ patients: Patient[] }>({
    queryKey: ["therapist-patients", search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set("search", search)

      const res = await fetch(`/api/therapist/patients?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch patients")
      return res.json()
    }
  })

  const patients = data?.patients || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Meus Pacientes</h1>
        <p className="text-muted-foreground">
          Pacientes que participaram das suas sessões de grupo.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Input
          placeholder="Buscar pacientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Patients Grid */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : patients.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum paciente ainda</h3>
          <p className="text-muted-foreground">
            Os pacientes aparecerão aqui quando participarem das suas sessões.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={patient.image || ""} />
                    <AvatarFallback>
                      {patient.name?.charAt(0).toUpperCase() || "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{patient.name || "Anônimo"}</h3>
                    <p className="text-sm text-muted-foreground truncate">{patient.email}</p>

                    {patient.patientProfile && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          Nível {patient.patientProfile.level}
                        </Badge>
                        {patient.patientProfile.streak > 0 && (
                          <Badge variant="outline" className="text-xs">
                            🔥 {patient.patientProfile.streak} dias
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{patient.sessionsAttended} sessões</span>
                  </div>
                  {patient.lastSessionDate && (
                    <div className="text-sm text-muted-foreground">
                      Última: {format(new Date(patient.lastSessionDate), "dd/MM", { locale: ptBR })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
