"use client"

import { SessionCategory } from "@prisma/client"
import { SESSION_CATEGORIES } from "@/lib/constants/session"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CategorySelectorProps {
  value?: SessionCategory
  onChange: (category: SessionCategory) => void
  className?: string
}

export function CategorySelector({ value, onChange, className }: CategorySelectorProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3", className)}>
      {Object.entries(SESSION_CATEGORIES).map(([key, config]) => {
        const category = key as SessionCategory
        const Icon = config.icon
        const isSelected = value === category

        return (
          <Button
            key={category}
            type="button"
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "h-auto p-4 flex flex-col items-center gap-2",
              isSelected && `bg-${config.color}-500 hover:bg-${config.color}-600 text-white`
            )}
            onClick={() => onChange(category)}
          >
            <Icon className="h-6 w-6" />
            <span className="text-sm font-medium">{config.label}</span>
          </Button>
        )
      })}
    </div>
  )
}
