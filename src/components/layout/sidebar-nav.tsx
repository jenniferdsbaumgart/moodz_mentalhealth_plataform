"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NavItem } from "@/config/navigation"
import { Button } from "@/components/ui/button"

interface SidebarNavProps {
  items: NavItem[]
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col space-y-2 p-4">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Button
            key={item.href}
            asChild
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              isActive && "bg-secondary text-secondary-foreground"
            )}
          >
            <Link href={item.href}>
              <Icon className="mr-2 h-4 w-4" />
              {item.title}
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}