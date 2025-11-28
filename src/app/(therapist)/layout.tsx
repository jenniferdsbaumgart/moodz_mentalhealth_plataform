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

  if (session.user.role !== Role.THERAPIST) {
    redirect("/unauthorized")
  }

  return (
    <DashboardShell role={Role.THERAPIST}>
      {children}
    </DashboardShell>
  )
}

