"use client"

import { cn } from "@/lib/utils"

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className={cn(
        "fixed left-4 top-4 z-[100] -translate-y-full rounded-md",
        "bg-primary px-4 py-2 text-primary-foreground",
        "transition-transform duration-200",
        "focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring"
      )}
    >
      Pular para o conteúdo principal
    </a>
  )
}

