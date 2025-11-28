import { Role } from "@prisma/client"
import { Home, Users, Calendar, MessageSquare, Heart, BookOpen, Settings, Shield, BarChart } from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export const navigationByRole: Record<Role, NavItem[]> = {
  PATIENT: [
    { title: "Dashboard", href: "/dashboard", icon: Home },
    { title: "Sessoes", href: "/sessions", icon: Calendar },
    { title: "Minhas Sessoes", href: "/my-sessions", icon: Calendar },
    { title: "Comunidade", href: "/community", icon: MessageSquare },
    { title: "Bem-estar", href: "/wellness", icon: Heart },
    { title: "Blog", href: "/blog", icon: BookOpen },
    { title: "Perfil", href: "/profile", icon: Settings },
  ],
  THERAPIST: [
    { title: "Dashboard", href: "/therapist/dashboard", icon: Home },
    { title: "Minhas Sessões", href: "/therapist/sessions", icon: Calendar },
    { title: "Pacientes", href: "/therapist/patients", icon: Users },
    { title: "Agenda", href: "/therapist/schedule", icon: Calendar },
    { title: "Analytics", href: "/therapist/analytics", icon: BarChart },
    { title: "Blog", href: "/therapist/blog", icon: BookOpen },
  ],
  ADMIN: [
    { title: "Dashboard", href: "/admin/dashboard", icon: Home },
    { title: "Usuarios", href: "/admin/users", icon: Users },
    { title: "Terapeutas", href: "/admin/therapists", icon: UserCheck },
    { title: "Moderacao", href: "/admin/moderation", icon: Shield },
    { title: "Blog", href: "/admin/blog", icon: BookOpen },
  ],
  SUPER_ADMIN: [
    { title: "Dashboard", href: "/super-admin/dashboard", icon: Home },
    { title: "Admins", href: "/super-admin/admins", icon: Shield },
    { title: "Audit Logs", href: "/super-admin/audit", icon: FileText },
    { title: "Sistema", href: "/super-admin/system", icon: Settings },
  ],
}

export function getNavigationItems(role?: Role): NavItem[] {
  if (!role) return []

  return navigationByRole[role] || []
}