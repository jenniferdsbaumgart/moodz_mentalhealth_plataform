"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2 } from "lucide-react"

interface TherapistAvailability {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isRecurring: boolean
  specificDate?: Date | null
}

interface TimeSlotPickerProps {
  availability: TherapistAvailability[]
  onAddSlot: (slot: { dayOfWeek: number; startTime: string; endTime: string }) => Promise<void>
  onRemoveSlot: (slotId: string) => Promise<void>
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
]

const TIME_OPTIONS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"
]

export function TimeSlotPicker({
  availability,
  onAddSlot,
  onRemoveSlot,
}: TimeSlotPickerProps) {
  const [selectedDay, setSelectedDay] = useState<string>("")
  const [startTime, setStartTime] = useState<string>("")
  const [endTime, setEndTime] = useState<string>("")
  const [isAdding, setIsAdding] = useState(false)

  const handleAddSlot = async () => {
    if (!selectedDay || !startTime || !endTime) return

    // Validate time range
    if (startTime >= endTime) {
      alert("O horário de início deve ser anterior ao horário de fim")
      return
    }

    setIsAdding(true)
    try {
      await onAddSlot({
        dayOfWeek: parseInt(selectedDay),
        startTime,
        endTime,
      })

      // Reset form
      setSelectedDay("")
      setStartTime("")
      setEndTime("")
    } catch (error) {
      console.error("Erro ao adicionar horário:", error)
    } finally {
      setIsAdding(false)
    }
  }

  // Group availability by day
  const availabilityByDay = availability.reduce((acc, slot) => {
    if (!acc[slot.dayOfWeek]) {
      acc[slot.dayOfWeek] = []
    }
    acc[slot.dayOfWeek].push(slot)
    return acc
  }, {} as { [key: number]: TherapistAvailability[] })

  const getDayName = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(day => day.value === dayOfWeek)?.label || ""
  }

  return (
    <div className="space-y-6">
      {/* Add New Slot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Horário
          </CardTitle>
          <CardDescription>
            Configure um novo horário de disponibilidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="day-select">Dia da Semana</Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-time">Horário de Início</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">Horário de Fim</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleAddSlot}
            disabled={!selectedDay || !startTime || !endTime || isAdding}
            className="w-full md:w-auto"
          >
            {isAdding ? "Adicionando..." : "Adicionar Horário"}
          </Button>
        </CardContent>
      </Card>

      {/* Current Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Horários Configurados</CardTitle>
          <CardDescription>
            Lista de todos os horários de disponibilidade por dia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(availabilityByDay).map(([dayStr, slots]) => {
              const dayOfWeek = parseInt(dayStr)
              return (
                <div key={dayOfWeek} className="space-y-2">
                  <h4 className="font-medium text-gray-900">
                    {getDayName(dayOfWeek)}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => (
                      <Badge
                        key={slot.id}
                        variant="secondary"
                        className="flex items-center gap-2 px-3 py-1"
                      >
                        <span>{slot.startTime} - {slot.endTime}</span>
                        <button
                          onClick={() => onRemoveSlot(slot.id)}
                          className="hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )
            })}

            {availability.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum horário configurado ainda</p>
                <p className="text-sm text-gray-400 mt-1">
                  Use o formulário acima para adicionar seus primeiros horários
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Predefinições Rápidas</CardTitle>
          <CardDescription>
            Adicione horários comuns com um clique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: "Manhã (9h-12h)", start: "09:00", end: "12:00" },
              { label: "Tarde (14h-18h)", start: "14:00", end: "18:00" },
              { label: "Noite (19h-22h)", start: "19:00", end: "22:00" },
              { label: "Meio período manhã", start: "08:00", end: "12:00" },
              { label: "Meio período tarde", start: "13:00", end: "17:00" },
              { label: "Fim de semana", start: "10:00", end: "16:00" },
            ].map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedDay) {
                    onAddSlot({
                      dayOfWeek: parseInt(selectedDay),
                      startTime: preset.start,
                      endTime: preset.end,
                    })
                  }
                }}
                disabled={!selectedDay}
                className="justify-start"
              >
                <Plus className="h-3 w-3 mr-2" />
                {preset.label}
              </Button>
            ))}
          </div>
          {!selectedDay && (
            <p className="text-sm text-gray-500 mt-3">
              Selecione um dia da semana primeiro para usar as predefinições
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

