"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Trash2, Ban } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface BlockedDate {
  id: string
  date: Date
  reason?: string
  createdAt: Date
}

interface BlockedDatesProps {
  blockedDates: BlockedDate[]
  onBlockDate: (date: Date, reason?: string) => Promise<void>
  onUnblockDate: (blockId: string) => Promise<void>
}

export function BlockedDates({
  blockedDates,
  onBlockDate,
  onUnblockDate,
}: BlockedDatesProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [reason, setReason] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const handleAddBlock = async () => {
    if (!selectedDate) return

    // Check if date is already blocked
    const isAlreadyBlocked = blockedDates.some(block =>
      format(block.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    )

    if (isAlreadyBlocked) {
      alert("Esta data já está bloqueada")
      return
    }

    setIsAdding(true)
    try {
      await onBlockDate(selectedDate, reason || undefined)
      setSelectedDate(undefined)
      setReason("")
      setCalendarOpen(false)
    } catch (error) {
      console.error("Erro ao bloquear data:", error)
    } finally {
      setIsAdding(false)
    }
  }

  // Get blocked dates for calendar
  const blockedDatesSet = new Set(
    blockedDates.map(block => format(block.date, 'yyyy-MM-dd'))
  )

  // Sort blocked dates by date (most recent first)
  const sortedBlockedDates = [...blockedDates].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="space-y-6">
      {/* Add Block Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Bloquear Data
          </CardTitle>
          <CardDescription>
            Selecione uma data específica para bloquear (férias, feriados, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      "Selecione uma data"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date)
                      setCalendarOpen(false)
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motivo (opcional)</Label>
              <Input
                id="reason"
                placeholder="Ex: Férias, Feriado, Compromisso pessoal..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleAddBlock}
            disabled={!selectedDate || isAdding}
            className="w-full md:w-auto"
          >
            {isAdding ? "Bloqueando..." : "Bloquear Data"}
          </Button>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Calendário</CardTitle>
          <CardDescription>
            Visualize datas bloqueadas no calendário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            className="rounded-md border w-full"
            modifiers={{
              blocked: (date) => blockedDatesSet.has(format(date, 'yyyy-MM-dd'))
            }}
            modifiersStyles={{
              blocked: {
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                fontWeight: 'bold'
              }
            }}
            disabled={(date) => date < new Date()}
          />
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
            <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
            <span>Datas bloqueadas</span>
          </div>
        </CardContent>
      </Card>

      {/* Blocked Dates List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5" />
            Datas Bloqueadas ({blockedDates.length})
          </CardTitle>
          <CardDescription>
            Lista de todas as datas bloqueadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedBlockedDates.length === 0 ? (
            <div className="text-center py-8">
              <Ban className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma data bloqueada</p>
              <p className="text-sm text-gray-400 mt-1">
                Use o formulário acima para bloquear datas específicas
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedBlockedDates.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <CalendarIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-red-900">
                        {format(new Date(block.date), "EEEE, dd 'de' MMMM 'de' yyyy", {
                          locale: ptBR
                        })}
                      </p>
                      {block.reason && (
                        <p className="text-sm text-red-700 mt-1">
                          {block.reason}
                        </p>
                      )}
                      <p className="text-xs text-red-600 mt-1">
                        Bloqueado em {format(new Date(block.createdAt), "dd/MM/yyyy", {
                          locale: ptBR
                        })}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUnblockDate(block.id)}
                    className="text-red-600 border-red-300 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Desbloquear
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Bloqueie datas comuns rapidamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: "Próximo fim de semana", days: 7 },
              { label: "Próximas 2 semanas", days: 14 },
              { label: "Próximo mês", days: 30 },
              { label: "Carnaval", specific: "carnaval" },
              { label: "Páscoa", specific: "pascoa" },
              { label: "Natal", specific: "natal" },
            ].map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  // Implementar ações rápidas
                  console.log("Ação rápida:", action.label)
                }}
                className="justify-start"
              >
                <Plus className="h-3 w-3 mr-2" />
                {action.label}
              </Button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Funcionalidades de bloqueio em lote serão implementadas em breve
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
