"use client"

import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { Role } from "@prisma/client"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar role={Role.PATIENT} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}



