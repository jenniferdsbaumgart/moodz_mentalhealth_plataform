import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Role } from "@prisma/client"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // PATIENT, ADMIN e SUPER_ADMIN podem acessar esta área
  // (Admins podem querer ver a experiência do paciente)
  const allowedRoles: string[] = [Role.PATIENT, Role.ADMIN, Role.SUPER_ADMIN]
  
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/unauthorized")
  }

  return (
    <DashboardShell role={Role.PATIENT}>
      {children}
    </DashboardShell>
  )
}
