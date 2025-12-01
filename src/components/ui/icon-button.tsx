import * as React from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface IconButtonProps extends ButtonProps {
  /** Descrição obrigatória para acessibilidade */
  label: string
  /** Ícone a ser renderizado */
  icon: React.ReactNode
}

/**
 * Botão de ícone com aria-label obrigatório.
 * Use este componente ao invés de Button size="icon" para garantir acessibilidade.
 */
export function IconButton({
  label,
  icon,
  className,
  ...props
}: IconButtonProps) {
  return (
    <Button
      size="icon"
      aria-label={label}
      className={cn(className)}
      {...props}
    >
      {icon}
    </Button>
  )
}

