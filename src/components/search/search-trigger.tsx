"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchTriggerProps {
  className?: string
  variant?: "default" | "compact" | "icon"
}

export function SearchTrigger({ className, variant = "default" }: SearchTriggerProps) {
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    // Detect if user is on Mac
    setIsMac(
      typeof navigator !== "undefined" &&
        navigator.platform.toUpperCase().indexOf("MAC") >= 0
    )
  }, [])

  const handleClick = () => {
    // Dispatch keyboard event to open command palette
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: isMac,
      ctrlKey: !isMac,
      bubbles: true,
    })
    document.dispatchEvent(event)
  }

  // Icon-only variant for mobile/compact spaces
  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-9 w-9", className)}
        onClick={handleClick}
        aria-label="Abrir busca (Cmd+K)"
      >
        <Search className="h-4 w-4" />
      </Button>
    )
  }

  // Compact variant for smaller spaces
  if (variant === "compact") {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "h-8 gap-2 text-muted-foreground",
          className
        )}
        onClick={handleClick}
      >
        <Search className="h-3.5 w-3.5" />
        <span className="text-xs">Buscar</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium sm:flex">
          <span>{isMac ? "⌘" : "Ctrl"}</span>K
        </kbd>
      </Button>
    )
  }

  // Default full variant
  return (
    <Button
      variant="outline"
      className={cn(
        "relative h-9 w-full justify-start rounded-md bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64",
        className
      )}
      onClick={handleClick}
    >
      <Search className="mr-2 h-4 w-4" />
      <span className="hidden lg:inline-flex">Buscar na plataforma...</span>
      <span className="inline-flex lg:hidden">Buscar...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">{isMac ? "⌘" : "Ctrl"}</span>K
      </kbd>
    </Button>
  )
}

