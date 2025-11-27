"use client"

import { Role } from "@prisma/client"
import { navigationByRole } from "@/config/navigation"
import { SidebarNav } from "./sidebar-nav"

interface SidebarProps {
  role: Role
}

export function Sidebar({ role }: SidebarProps) {
  const navigationItems = navigationByRole[role]

  return (
    <div className="hidden md:flex w-64 flex-col border-r bg-card">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-primary">Moodz</h2>
        <p className="text-sm text-muted-foreground">Plataforma de Saúde Mental</p>
      </div>
      <SidebarNav items={navigationItems} />
    </div>
  )
}
