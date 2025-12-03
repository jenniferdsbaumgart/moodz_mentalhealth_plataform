import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Role } from "@prisma/client"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // ADMIN e SUPER_ADMIN podem acessar esta área
  const allowedRoles: string[] = [Role.ADMIN, Role.SUPER_ADMIN]
  
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/unauthorized")
  }

  // Usar o role real do usuário para o shell
  const shellRole = session.user.role === Role.SUPER_ADMIN ? Role.SUPER_ADMIN : Role.ADMIN

  return (
    <DashboardShell role={shellRole}>
      {children}
    </DashboardShell>
  )
}
