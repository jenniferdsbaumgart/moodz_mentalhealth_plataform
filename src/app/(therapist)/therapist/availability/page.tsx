"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Calendar, Clock, Ban, Plus } from "lucide-react"
import { AvailabilityGrid } from "@/components/therapist/availability-grid"
import { TimeSlotPicker } from "@/components/therapist/time-slot-picker"
import { BlockedDates } from "@/components/therapist/blocked-dates"

interface TherapistAvailability {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isRecurring: boolean
  specificDate?: Date | null
}

interface BlockedDate {
  id: string
  date: Date
  reason?: string
  createdAt: Date
}

export default function TherapistAvailabilityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [availability, setAvailability] = useState<TherapistAvailability[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("schedule")

  // Redirect if not therapist
  useEffect(() => {
    if (status === "unauthenticated" || (session && session.user?.role !== "THERAPIST")) {
      router.push("/unauthorized")
    }
  }, [session, status, router])

  // Load availability data
  useEffect(() => {
    if (session?.user?.role === "THERAPIST") {
      loadAvailability()
    }
  }, [session])

  const loadAvailability = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [availabilityRes, blockedRes] = await Promise.all([
        fetch("/api/therapist/availability"),
        fetch("/api/therapist/availability/blocked"),
      ])

      if (!availabilityRes.ok || !blockedRes.ok) {
        throw new Error("Erro ao carregar disponibilidade")
      }

      const [availabilityData, blockedData] = await Promise.all([
        availabilityRes.json(),
        blockedRes.json(),
      ])

      if (availabilityData.success) {
        setAvailability(availabilityData.data)
      }

      if (blockedData.success) {
        setBlockedDates(blockedData.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSlot = async (slot: { dayOfWeek: number; startTime: string; endTime: string }) => {
    try {
      const response = await fetch("/api/therapist/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(slot),
      })

      if (!response.ok) {
        throw new Error("Erro ao adicionar horário")
      }

      const data = await response.json()
      if (data.success) {
        setAvailability(prev => [...prev, data.data])
      }
    } catch (err) {
      console.error("Erro ao adicionar slot:", err)
      throw err
    }
  }

  const handleRemoveSlot = async (slotId: string) => {
    try {
      const response = await fetch(`/api/therapist/availability/${slotId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao remover horário")
      }

      setAvailability(prev => prev.filter(slot => slot.id !== slotId))
    } catch (err) {
      console.error("Erro ao remover slot:", err)
      throw err
    }
  }

  const handleBlockDate = async (date: Date, reason?: string) => {
    try {
      const response = await fetch("/api/therapist/availability/block", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date, reason }),
      })

      if (!response.ok) {
        throw new Error("Erro ao bloquear data")
      }

      const data = await response.json()
      if (data.success) {
        setBlockedDates(prev => [...prev, data.data])
      }
    } catch (err) {
      console.error("Erro ao bloquear data:", err)
      throw err
    }
  }

  const handleUnblockDate = async (blockId: string) => {
    try {
      const response = await fetch(`/api/therapist/availability/block/${blockId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao desbloquear data")
      }

      setBlockedDates(prev => prev.filter(block => block.id !== blockId))
    } catch (err) {
      console.error("Erro ao desbloquear data:", err)
      throw err
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="max-w-2xl mx-auto mt-8">
        <AlertDescription>
          Erro ao carregar disponibilidade: {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Disponibilidade</h1>
            <p className="text-muted-foreground">
              Gerencie seus horários de atendimento e bloqueie datas específicas
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {availability.length} horários
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Ban className="h-3 w-3" />
              {blockedDates.length} bloqueadas
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Horários</span>
            </TabsTrigger>
            <TabsTrigger value="block" className="flex items-center gap-2">
              <Ban className="h-4 w-4" />
              <span className="hidden sm:inline">Bloqueios</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Configurar</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>Grade de Disponibilidade</CardTitle>
                  <CardDescription>
                    Configure seus horários de atendimento por dia da semana
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AvailabilityGrid
                    availability={availability}
                    blockedDates={blockedDates}
                    onAddSlot={handleAddSlot}
                    onRemoveSlot={handleRemoveSlot}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="block">
              <BlockedDates
                blockedDates={blockedDates}
                onBlockDate={handleBlockDate}
                onUnblockDate={handleUnblockDate}
              />
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Horário</CardTitle>
                  <CardDescription>
                    Adicione ou remova horários específicos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TimeSlotPicker
                    onAddSlot={handleAddSlot}
                    onRemoveSlot={handleRemoveSlot}
                    availability={availability}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
