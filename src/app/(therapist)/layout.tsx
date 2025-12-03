import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Role } from "@prisma/client"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export default async function TherapistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // THERAPIST, ADMIN e SUPER_ADMIN podem acessar esta área
  const allowedRoles: string[] = [Role.THERAPIST, Role.ADMIN, Role.SUPER_ADMIN]
  
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/unauthorized")
  }

  return (
    <DashboardShell role={Role.THERAPIST}>
      {children}
    </DashboardShell>
  )
}
