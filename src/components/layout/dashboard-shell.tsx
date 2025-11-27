import { Role } from "@prisma/client"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface DashboardShellProps {
  children: React.ReactNode
  role: Role
}

export function DashboardShell({ children, role }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  )
}
