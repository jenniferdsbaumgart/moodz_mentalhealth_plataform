"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface TherapistSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function TherapistSearch({
  value,
  onChange,
  placeholder = "Buscar terapeutas...",
  className = ""
}: TherapistSearchProps) {
  const [localValue, setLocalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [localValue, onChange])

  // Update local value when external value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleClear = () => {
    setLocalValue("")
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClear()
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        {localValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Suggestions/Tips */}
      {!localValue && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 hidden group-hover:block">
          <div className="p-3 text-xs text-gray-500">
            <p className="font-medium mb-2">💡 Dicas de busca:</p>
            <ul className="space-y-1">
              <li>• Nome do terapeuta</li>
              <li>• Especialização (ex: "TCC", "Psicanálise")</li>
              <li>• Tipo de terapia (ex: "familiar", "infantil")</li>
              <li>• Abordagem (ex: "cognitivo", "humanista")</li>
            </ul>
          </div>
        </div>
      )}

      {/* Search Results Count (when typing) */}
      {localValue && localValue.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <div className="p-2 text-xs text-gray-600 flex items-center gap-2">
            <Search className="h-3 w-3" />
            Buscando por "{localValue}"...
          </div>
        </div>
      )}
    </div>
  )
}

