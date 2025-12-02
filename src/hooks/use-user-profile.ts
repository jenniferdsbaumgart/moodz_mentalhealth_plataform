"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { UserWithProfile } from "@/types/user"
import { ApiResponse } from "@/types/user"

export function useUserProfile() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserWithProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetchUserProfile()
    } else if (status === "unauthenticated") {
      setIsLoading(false)
    }
  }, [session, status])

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/user/profile")
      const data: ApiResponse<UserWithProfile> = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar perfil")
      }

      setProfile(data.data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserWithProfile>) => {
    try {
      setError(null)

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      const data: ApiResponse<UserWithProfile> = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao atualizar perfil")
      }

      setProfile(data.data || null)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido"
      setError(message)
      return { success: false, error: message }
    }
  }

  const createProfile = async (profileData: any) => {
    try {
      setError(null)

      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      })

      const data: ApiResponse<UserWithProfile> = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao criar perfil")
      }

      setProfile(data.data || null)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido"
      setError(message)
      return { success: false, error: message }
    }
  }

  return {
    profile,
    isLoading,
    error,
    refetch: fetchUserProfile,
    updateProfile,
    createProfile,
    isAuthenticated: status === "authenticated",
    user: session?.user,
  }
}



