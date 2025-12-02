"use client"
import { useSession } from "next-auth/react"
import { Role } from "@prisma/client"

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user,
    role: session?.user?.role as Role | undefined,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  }
}



