import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== Role.ADMIN) {
    redirect("/unauthorized")
  }

  return (
    <DashboardShell role={Role.ADMIN}>
      {children}
    </DashboardShell>
  )
}
