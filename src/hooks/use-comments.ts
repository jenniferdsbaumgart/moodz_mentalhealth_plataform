"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useComments(postId: string, parentId?: string) {
  return useQuery({
    queryKey: ["comments", postId, parentId || "root"],
    queryFn: async () => {
      const params = parentId ? `?parentId=${parentId}` : ""
      const response = await fetch(`/api/posts/${postId}/comments${params}`)
      if (!response.ok) {
        throw new Error("Erro ao carregar comentários")
      }
      return response.json()
    },
    enabled: !!postId,
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      content: string
      postId: string
      parentId?: string
      isAnonymous?: boolean
    }) => {
      const response = await fetch(`/api/posts/${data.postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao criar comentário")
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // Invalidate comments queries
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] })
      // Also invalidate post query to update comment count
      queryClient.invalidateQueries({ queryKey: ["post", variables.postId] })

      toast.success("Comentário enviado com sucesso!")
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar comentário")
    },
  })
}

export function useUpdateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      commentId,
      data
    }: {
      commentId: string
      data: { content: string }
    }) => {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao atualizar comentário")
      }

      return response.json()
    },
    onSuccess: () => {
      // Find and invalidate the relevant comment queries
      queryClient.invalidateQueries({ queryKey: ["comments"] })

      toast.success("Comentário atualizado com sucesso!")
    },
    onError: () => {
      toast.error("Erro ao atualizar comentário")
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao deletar comentário")
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate all comment queries
      queryClient.invalidateQueries({ queryKey: ["comments"] })
      queryClient.invalidateQueries({ queryKey: ["post"] })

      toast.success("Comentário deletado com sucesso!")
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar comentário")
    },
  })
}

export function useVoteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ commentId, value }: { commentId: string; value: 1 | -1 }) => {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao votar no comentário")
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Update cache optimistically for comments
      queryClient.invalidateQueries({ queryKey: ["comments"] })

      // Show success message only if vote was added/changed (not removed)
      if (data.data.userVote !== null) {
        toast.success("Voto registrado!")
      }
    },
    onError: () => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ["comments"] })
      toast.error("Erro ao votar no comentário")
    },
  })
}
