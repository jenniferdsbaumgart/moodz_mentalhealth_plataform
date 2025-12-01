"use client"
import { Role } from "@prisma/client"
import { useAuth } from "@/hooks/use-auth"
import { hasMinimumRole } from "@/lib/auth/roles"

interface RoleGateProps {
  children: React.ReactNode
  allowedRole: Role
  fallback?: React.ReactNode
}

export function RoleGate({ children, allowedRole, fallback }: RoleGateProps) {
  const { role, isLoading } = useAuth()

  if (isLoading) return null
  if (!role || !hasMinimumRole(role, allowedRole)) {
    return fallback ?? null
  }
  return <>{children}</>
}


