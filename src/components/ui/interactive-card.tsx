import * as React from "react"
import { Card, CardProps } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CARD_HOVER } from "@/lib/design-tokens"

interface InteractiveCardProps extends CardProps {
  /** Estilo de hover */
  hoverStyle?: keyof typeof CARD_HOVER
  /** Se o card é clicável */
  clickable?: boolean
  /** Callback de clique */
  onClick?: () => void
}

export function InteractiveCard({
  children,
  className,
  hoverStyle = "interactive",
  clickable = true,
  onClick,
  ...props
}: InteractiveCardProps) {
  const Component = onClick ? "button" : "div"

  return (
    <Card
      asChild={!!onClick}
      className={cn(
        clickable && CARD_HOVER[hoverStyle],
        className
      )}
      {...props}
    >
      {onClick ? (
        <Component onClick={onClick} className="w-full text-left">
          {children}
        </Component>
      ) : (
        children
      )}
    </Card>
  )
}

