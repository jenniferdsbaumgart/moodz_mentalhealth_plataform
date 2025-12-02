"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { TherapistProfile } from "@/types/user"
import { ApiResponse } from "@/types/user"

export function useTherapistProfile() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<TherapistProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "THERAPIST") {
      fetchTherapistProfile()
    } else if (status === "unauthenticated" || session?.user?.role !== "THERAPIST") {
      setIsLoading(false)
    }
  }, [session, status])

  const fetchTherapistProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/therapist/profile")
      const data: ApiResponse<TherapistProfile> = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar perfil de terapeuta")
      }

      setProfile(data.data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<TherapistProfile>) => {
    try {
      setError(null)

      const response = await fetch("/api/therapist/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      const data: ApiResponse<TherapistProfile> = await response.json()

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

  const createProfile = async (profileData: Omit<TherapistProfile, "id" | "userId" | "createdAt" | "updatedAt">) => {
    try {
      setError(null)

      const response = await fetch("/api/therapist/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      })

      const data: ApiResponse<TherapistProfile> = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao criar perfil de terapeuta")
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
    refetch: fetchTherapistProfile,
    updateProfile,
    createProfile,
    isTherapist: session?.user?.role === "THERAPIST",
  }
}



