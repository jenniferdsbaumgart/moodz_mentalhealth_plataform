"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { PatientProfile } from "@/types/user"
import { ApiResponse } from "@/types/user"

export function usePatientProfile() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "PATIENT") {
      fetchPatientProfile()
    } else if (status === "unauthenticated" || session?.user?.role !== "PATIENT") {
      setIsLoading(false)
    }
  }, [session, status])

  const fetchPatientProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/patient/profile")
      const data: ApiResponse<PatientProfile> = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar perfil de paciente")
      }

      setProfile(data.data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<PatientProfile>) => {
    try {
      setError(null)

      const response = await fetch("/api/patient/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      const data: ApiResponse<PatientProfile> = await response.json()

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

  const createProfile = async (profileData: Omit<PatientProfile, "id" | "userId" | "createdAt" | "updatedAt">) => {
    try {
      setError(null)

      const response = await fetch("/api/patient/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      })

      const data: ApiResponse<PatientProfile> = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao criar perfil de paciente")
      }

      setProfile(data.data || null)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido"
      setError(message)
      return { success: false, error: message }
    }
  }

  const addPoints = async (points: number) => {
    try {
      setError(null)

      const response = await fetch("/api/patient/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ points }),
      })

      const data: ApiResponse<PatientProfile> = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao adicionar pontos")
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
    refetch: fetchPatientProfile,
    updateProfile,
    createProfile,
    addPoints,
    isPatient: session?.user?.role === "PATIENT",
  }
}



