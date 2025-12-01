"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, Clock } from "lucide-react"
import { format, addDays, startOfWeek } from "date-fns"
import { ptBR } from "date-fns/locale"

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

interface AvailabilityGridProps {
  availability: TherapistAvailability[]
  blockedDates: BlockedDate[]
  onAddSlot: (slot: { dayOfWeek: number; startTime: string; endTime: string }) => Promise<void>
  onRemoveSlot: (slotId: string) => Promise<void>
}

const DAYS_OF_WEEK = [
  { key: 0, label: "Dom", full: "Domingo" },
  { key: 1, label: "Seg", full: "Segunda" },
  { key: 2, label: "Ter", full: "Terça" },
  { key: 3, label: "Qua", full: "Quarta" },
  { key: 4, label: "Qui", full: "Quinta" },
  { key: 5, label: "Sex", full: "Sexta" },
  { key: 6, label: "Sáb", full: "Sábado" },
]

const TIME_SLOTS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
]

export function AvailabilityGrid({
  availability,
  blockedDates,
  onAddSlot,
  onRemoveSlot,
}: AvailabilityGridProps) {
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())
  const [isAdding, setIsAdding] = useState(false)

  // Get availability for a specific day and time
  const getAvailabilityForSlot = (dayOfWeek: number, time: string) => {
    return availability.find(slot =>
      slot.dayOfWeek === dayOfWeek &&
      slot.startTime <= time &&
      slot.endTime > time &&
      slot.isRecurring
    )
  }

  // Check if date is blocked
  const isDateBlocked = (date: Date) => {
    return blockedDates.some(block =>
      format(block.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )
  }

  // Toggle slot selection
  const toggleSlotSelection = (dayOfWeek: number, time: string) => {
    const slotKey = `${dayOfWeek}-${time}`
    const newSelected = new Set(selectedSlots)

    if (newSelected.has(slotKey)) {
      newSelected.delete(slotKey)
    } else {
      newSelected.add(slotKey)
    }

    setSelectedSlots(newSelected)
  }

  // Add selected slots
  const handleAddSelectedSlots = async () => {
    if (selectedSlots.size === 0) return

    setIsAdding(true)
    try {
      // Group consecutive slots by day
      const slotsByDay: { [key: number]: string[] } = {}

      selectedSlots.forEach(slotKey => {
        const [dayStr, time] = slotKey.split('-')
        const day = parseInt(dayStr)

        if (!slotsByDay[day]) {
          slotsByDay[day] = []
        }
        slotsByDay[day].push(time)
      })

      // Create availability slots for each day
      for (const [dayStr, times] of Object.entries(slotsByDay)) {
        const day = parseInt(dayStr)
        const sortedTimes = times.sort()

        if (sortedTimes.length > 0) {
          await onAddSlot({
            dayOfWeek: day,
            startTime: sortedTimes[0],
            endTime: `${parseInt(sortedTimes[sortedTimes.length - 1].split(':')[0]) + 1}:00`,
          })
        }
      }

      setSelectedSlots(new Set())
    } catch (error) {
      console.error("Erro ao adicionar slots:", error)
    } finally {
      setIsAdding(false)
    }
  }

  // Get slots for a specific day
  const getSlotsForDay = (dayOfWeek: number) => {
    return availability.filter(slot =>
      slot.dayOfWeek === dayOfWeek && slot.isRecurring
    )
  }

  // Current week dates for reference
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 })
  const weekDates = DAYS_OF_WEEK.map((_, index) => addDays(weekStart, index))

  return (
    <div className="space-y-4">
      {/* Controls */}
      {selectedSlots.size > 0 && (
        <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm text-blue-800">
            {selectedSlots.size} slot{selectedSlots.size !== 1 ? 's' : ''} selecionado{selectedSlots.size !== 1 ? 's' : ''}
          </span>
          <Button
            size="sm"
            onClick={handleAddSelectedSlots}
            disabled={isAdding}
            className="ml-auto"
          >
            {isAdding ? "Adicionando..." : "Adicionar Horários"}
          </Button>
        </div>
      )}

      {/* Grid */}
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-8 bg-gray-50 border-b">
          <div className="p-3 font-medium text-gray-700">Horário</div>
          {DAYS_OF_WEEK.map((day) => (
            <div key={day.key} className="p-3 text-center font-medium text-gray-700">
              <div className="text-sm">{day.label}</div>
              <div className="text-xs text-gray-500">
                {format(weekDates[day.key], 'dd/MM', { locale: ptBR })}
              </div>
            </div>
          ))}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {TIME_SLOTS.map((time) => (
            <div key={time} className="grid grid-cols-8 border-b last:border-b-0">
              <div className="p-3 text-sm font-medium text-gray-600 bg-gray-50">
                {time}
              </div>
              {DAYS_OF_WEEK.map((day) => {
                const availability = getAvailabilityForSlot(day.key, time)
                const isBlocked = isDateBlocked(weekDates[day.key])
                const slotKey = `${day.key}-${time}`
                const isSelected = selectedSlots.has(slotKey)
                const hasAvailability = !!availability

                return (
                  <div
                    key={`${day.key}-${time}`}
                    className={`
                      p-2 text-center cursor-pointer transition-colors
                      ${hasAvailability ? 'bg-green-100 hover:bg-green-200' : ''}
                      ${isSelected ? 'bg-blue-200 hover:bg-blue-300' : ''}
                      ${isBlocked ? 'bg-red-100 cursor-not-allowed' : 'hover:bg-gray-100'}
                      ${!hasAvailability && !isBlocked ? 'hover:bg-blue-50' : ''}
                    `}
                    onClick={() => {
                      if (isBlocked) return
                      if (hasAvailability) {
                        // Remove existing availability
                        if (availability) {
                          onRemoveSlot(availability.id)
                        }
                      } else {
                        // Select/deselect slot
                        toggleSlotSelection(day.key, time)
                      }
                    }}
                  >
                    {hasAvailability ? (
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-800">
                          {availability.startTime}-{availability.endTime}
                        </span>
                      </div>
                    ) : isBlocked ? (
                      <div className="text-xs text-red-600">Bloqueado</div>
                    ) : isSelected ? (
                      <div className="text-xs text-blue-600">Selecionado</div>
                    ) : (
                      <div className="text-xs text-gray-400">Disponível</div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-200 border border-blue-300 rounded"></div>
          <span>Selecionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span>Bloqueado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
          <span>Livre</span>
        </div>
      </div>

      {/* Current Availability Summary */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-3">Horários Atuais</h3>
          <div className="space-y-2">
            {DAYS_OF_WEEK.map((day) => {
              const daySlots = getSlotsForDay(day.key)
              if (daySlots.length === 0) return null

              return (
                <div key={day.key} className="flex items-center gap-2">
                  <span className="font-medium w-16">{day.label}:</span>
                  <div className="flex flex-wrap gap-1">
                    {daySlots.map((slot) => (
                      <Badge
                        key={slot.id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {slot.startTime}-{slot.endTime}
                        <button
                          onClick={() => onRemoveSlot(slot.id)}
                          className="ml-1 hover:text-red-600"
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
              <p className="text-gray-500 text-sm">Nenhum horário configurado</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
