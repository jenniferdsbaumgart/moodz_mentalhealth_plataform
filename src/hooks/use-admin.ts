"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ReportStatus } from "@prisma/client"
import { toast } from "sonner"

export function useReports(status: ReportStatus = "PENDING", page = 1, limit = 20) {
  return useQuery({
    queryKey: ["admin-reports", status, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        status,
        page: page.toString(),
        limit: limit.toString(),
      })

      const response = await fetch(`/api/admin/reports?${params}`)
      if (!response.ok) {
        throw new Error("Erro ao carregar relatórios")
      }

      return response.json()
    },
  })
}

export function useResolveReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      reportId,
      action,
      resolution
    }: {
      reportId: string
      action: "DISMISS" | "RESOLVE" | "REMOVE_CONTENT" | "BAN_USER"
      resolution?: string
    }) => {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, resolution }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao processar relatório")
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate reports queries
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] })
      // Also invalidate community content
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["post"] })

      toast.success("Relatório processado com sucesso!")
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao processar relatório")
    },
  })
}

export function useAdminPostActions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      postId,
      action
    }: {
      postId: string
      action: "PIN" | "UNPIN" | "LOCK" | "UNLOCK" | "DELETE"
    }) => {
      if (action === "DELETE") {
        const response = await fetch(`/api/admin/posts/${postId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Erro ao deletar post")
        }

        return response.json()
      } else {
        const response = await fetch(`/api/admin/posts/${postId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Erro ao atualizar post")
        }

        return response.json()
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate posts queries
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["post", variables.postId] })

      const actionMessages = {
        PIN: "Post fixado com sucesso!",
        UNPIN: "Post desafixado com sucesso!",
        LOCK: "Comentários travados com sucesso!",
        UNLOCK: "Comentários destravados com sucesso!",
        DELETE: "Post deletado com sucesso!",
      }

      toast.success(actionMessages[variables.action])
    },
    onError: (error) => {
      toast.error(error.message || "Erro na operação administrativa")
    },
  })
}

export function useBanUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      reason,
      duration
    }: {
      userId: string
      reason: string
      duration?: number
    }) => {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason, duration }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao banir usuário")
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate user and content queries
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["comments"] })

      toast.success("Usuário banido com sucesso!")
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao banir usuário")
    },
  })
}

export function useUnbanUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error("Erro ao desbanir usuário")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Usuário desbanido com sucesso!")
    },
    onError: () => {
      toast.error("Erro ao desbanir usuário")
    },
  })
}
