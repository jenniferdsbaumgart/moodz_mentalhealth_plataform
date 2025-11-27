"use client"

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CommunityFiltersInput } from "@/types/community"
import { toast } from "sonner"

const POSTS_PER_PAGE = 20

export function usePosts(filters: CommunityFiltersInput = {}) {
  return useInfiniteQuery({
    queryKey: ["posts", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: pageParam.toString(),
        limit: POSTS_PER_PAGE.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== "")
        ),
      })

      const response = await fetch(`/api/posts?${params}`)
      if (!response.ok) {
        throw new Error("Erro ao carregar posts")
      }

      const data = await response.json()
      return data
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

export function usePost(postId: string) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${postId}`)
      if (!response.ok) {
        throw new Error("Post não encontrado")
      }
      return response.json()
    },
    enabled: !!postId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

export function useVotePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ postId, value }: { postId: string; value: 1 | -1 }) => {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao votar")
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // Update cache optimistically
      queryClient.setQueryData(["post", variables.postId], (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          userVote: data.data.userVote,
          _count: {
            ...oldData._count,
            votes: data.data.voteCount,
          },
        }
      })

      // Invalidate posts list to update vote counts
      queryClient.invalidateQueries({ queryKey: ["posts"] })

      // Show success message only if vote was added/changed (not removed)
      if (data.data.userVote !== null) {
        toast.success("Voto registrado!")
      }
    },
    onError: (error, variables) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ["post", variables.postId] })
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      toast.error(error.message || "Erro ao votar")
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
    onSuccess: () => {
      // Invalidate and refetch posts and comments
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["post"] })
      queryClient.invalidateQueries({ queryKey: ["comments"] })

      toast.success("Voto registrado!")
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao votar no comentário")
    },
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      title: string
      content: string
      category: string
      isAnonymous?: boolean
      tagIds?: string[]
    }) => {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao criar post")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      toast.success("Post criado com sucesso!")
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar post")
    },
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      postId,
      data
    }: {
      postId: string
      data: {
        title?: string
        content?: string
        category?: string
        isAnonymous?: boolean
        tagIds?: string[]
      }
    }) => {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao atualizar post")
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["post", variables.postId] })
      toast.success("Post atualizado com sucesso!")
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar post")
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao deletar post")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      toast.success("Post deletado com sucesso!")
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar post")
    },
  })
}
