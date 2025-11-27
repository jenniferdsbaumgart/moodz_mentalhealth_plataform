"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Role } from "@prisma/client"
import { useAuth } from "./use-auth"
import { hasMinimumRole } from "@/lib/auth/roles"

interface UseRequireRoleOptions {
  requiredRole: Role
  redirectTo?: string
  fallback?: () => void
}

export function useRequireRole({
  requiredRole,
  redirectTo = "/login",
  fallback
}: UseRequireRoleOptions) {
  const { role, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      if (fallback) {
        fallback()
      } else {
        router.push(redirectTo)
      }
      return
    }

    if (role && !hasMinimumRole(role, requiredRole)) {
      if (fallback) {
        fallback()
      } else {
        router.push("/unauthorized")
      }
      return
    }
  }, [role, isAuthenticated, isLoading, requiredRole, redirectTo, router, fallback])

  return {
    hasAccess: isAuthenticated && role ? hasMinimumRole(role, requiredRole) : false,
    isLoading,
    role,
    isAuthenticated,
  }
}
