"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  dateRange?: { from: Date; to: Date }
  onDateRangeChange: (range: { from: Date; to: Date } | undefined) => void
  className?: string
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onDateRangeChange({ from: range.from, to: range.to })
      setIsOpen(false)
    } else if (range?.from) {
      // Single date selected, wait for second date
      return
    }
  }

  const clearRange = () => {
    onDateRangeChange(undefined)
    setIsOpen(false)
  }

  const quickRanges = [
    {
      label: "Últimos 7 dias",
      getValue: () => ({
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date()
      })
    },
    {
      label: "Últimos 30 dias",
      getValue: () => ({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date()
      })
    },
    {
      label: "Últimos 90 dias",
      getValue: () => ({
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        to: new Date()
      })
    },
    {
      label: "Este ano",
      getValue: () => ({
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date()
      })
    }
  ]

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              "Selecionar período"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <div className="space-y-2">
              <p className="text-sm font-medium">Períodos rápidos</p>
              <div className="grid grid-cols-2 gap-2">
                {quickRanges.map((range) => (
                  <Button
                    key={range.label}
                    variant="ghost"
                    size="sm"
                    className="justify-start h-8 text-xs"
                    onClick={() => {
                      onDateRangeChange(range.getValue())
                      setIsOpen(false)
                    }}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-xs text-muted-foreground"
                onClick={clearRange}
                disabled={!dateRange}
              >
                Limpar período
              </Button>
            </div>
          </div>

          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={{
              from: dateRange?.from,
              to: dateRange?.to,
            }}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={ptBR}
            disabled={(date) => date > new Date()}
          />

          <div className="p-3 border-t">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Selecione data inicial e final
              </p>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
                disabled={!dateRange?.from || !dateRange?.to}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
