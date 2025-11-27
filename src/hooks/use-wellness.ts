"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { MoodEntryInput } from "@/lib/validations/mood"
import { CreateJournalInput, UpdateJournalInput } from "@/lib/validations/journal"

export function useCreateMoodEntry() {
  return useMutation({
    mutationFn: async (data: MoodEntryInput) => {
      const response = await fetch("/api/wellness/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao registrar humor")
      }

      return response.json()
    },
  })
}

export function useMoodEntries(startDate?: string, endDate?: string, page = 1, limit = 30) {
  return useQuery({
    queryKey: ["mood-entries", startDate, endDate, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (startDate) params.set("startDate", startDate)
      if (endDate) params.set("endDate", endDate)

      const response = await fetch(`/api/wellness/mood?${params}`)
      if (!response.ok) {
        throw new Error("Erro ao carregar registros de humor")
      }

      return response.json()
    },
  })
}

export function useMoodStats() {
  return useQuery({
    queryKey: ["mood-stats"],
    queryFn: async () => {
      const response = await fetch("/api/wellness/mood/stats")
      if (!response.ok) {
        throw new Error("Erro ao carregar estatísticas de humor")
      }

      return response.json()
    },
  })
}

export function useJournalEntries(params?: {
  page?: number
  limit?: number
  search?: string
  tag?: string
  favorite?: boolean
  sortBy?: "createdAt" | "updatedAt" | "title"
  sortOrder?: "asc" | "desc"
}) {
  return useQuery({
    queryKey: ["journal-entries", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()

      if (params?.page) searchParams.set("page", params.page.toString())
      if (params?.limit) searchParams.set("limit", params.limit.toString())
      if (params?.search) searchParams.set("search", params.search)
      if (params?.tag) searchParams.set("tag", params.tag)
      if (params?.favorite) searchParams.set("favorite", "true")
      if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
      if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder)

      const response = await fetch(`/api/wellness/journal?${searchParams}`)
      if (!response.ok) {
        throw new Error("Erro ao carregar entradas do diário")
      }

      return response.json()
    },
  })
}

export function useJournalEntry(id: string) {
  return useQuery({
    queryKey: ["journal-entry", id],
    queryFn: async () => {
      const response = await fetch(`/api/wellness/journal/${id}`)
      if (!response.ok) {
        throw new Error("Erro ao carregar entrada do diário")
      }

      return response.json()
    },
    enabled: !!id,
  })
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateJournalInput) => {
      const response = await fetch("/api/wellness/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao criar entrada do diário")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] })
    },
  })
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & UpdateJournalInput) => {
      const response = await fetch(`/api/wellness/journal/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao atualizar entrada do diário")
      }

      return response.json()
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] })
      queryClient.invalidateQueries({ queryKey: ["journal-entry", id] })
    },
  })
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/wellness/journal/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao excluir entrada do diário")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] })
    },
  })
}

export function useExercises(params?: {
  page?: number
  limit?: number
  search?: string
  category?: string
  difficulty?: string
  featured?: boolean
}) {
  return useQuery({
    queryKey: ["exercises", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()

      if (params?.page) searchParams.set("page", params.page.toString())
      if (params?.limit) searchParams.set("limit", params.limit.toString())
      if (params?.search) searchParams.set("search", params.search)
      if (params?.category) searchParams.set("category", params.category)
      if (params?.difficulty) searchParams.set("difficulty", params.difficulty)
      if (params?.featured) searchParams.set("featured", "true")

      const response = await fetch(`/api/wellness/exercises?${searchParams}`)
      if (!response.ok) {
        throw new Error("Erro ao carregar exercícios")
      }

      return response.json()
    },
  })
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: ["exercise", id],
    queryFn: async () => {
      const response = await fetch(`/api/wellness/exercises/${id}`)
      if (!response.ok) {
        throw new Error("Erro ao carregar exercício")
      }

      return response.json()
    },
    enabled: !!id,
  })
}

export function useGamificationStats() {
  return useQuery({
    queryKey: ["gamification-stats"],
    queryFn: async () => {
      const response = await fetch("/api/wellness/gamification")
      if (!response.ok) {
        throw new Error("Erro ao carregar estatísticas de gamificação")
      }

      return response.json()
    },
  })
}

export function useDailyCheckIn() {
  return useQuery({
    queryKey: ["daily-checkin"],
    queryFn: async () => {
      const response = await fetch("/api/gamification/checkin")
      if (!response.ok) {
        throw new Error("Erro ao carregar dados de check-in")
      }

      return response.json()
    },
  })
}

export function useCheckInCalendar(days: number = 30) {
  return useQuery({
    queryKey: ["checkin-calendar", days],
    queryFn: async () => {
      const response = await fetch(`/api/gamification/checkin?type=calendar&days=${days}`)
      if (!response.ok) {
        throw new Error("Erro ao carregar calendário de check-in")
      }

      return response.json()
    },
  })
}

export function useWellnessStats() {
  return useQuery({
    queryKey: ["wellness-stats"],
    queryFn: async () => {
      const response = await fetch("/api/wellness/stats")
      if (!response.ok) {
        throw new Error("Erro ao carregar estatísticas")
      }

      return response.json()
    },
  })
}
