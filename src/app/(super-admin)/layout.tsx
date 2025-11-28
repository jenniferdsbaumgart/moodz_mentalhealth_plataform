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

  if (session.user.role !== Role.SUPER_ADMIN) {
    redirect("/unauthorized")
  }

  return (
    <DashboardShell role={Role.SUPER_ADMIN}>
      {children}
    </DashboardShell>
  )
}

