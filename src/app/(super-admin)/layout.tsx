import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Role } from "@prisma/client"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Apenas SUPER_ADMIN pode acessar esta área
  const allowedRoles: string[] = [Role.SUPER_ADMIN]
  
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/unauthorized")
  }

  return (
    <DashboardShell role={Role.SUPER_ADMIN}>
      {children}
    </DashboardShell>
  )
}
