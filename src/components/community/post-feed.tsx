"use client"

import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { CommunityFiltersInput } from "@/types/community"
import { usePosts, useVotePost } from "@/hooks/use-posts"
import { PostCard } from "./post-card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"

interface PostFeedProps {
  filters: CommunityFiltersInput
  onFiltersChange?: (filters: CommunityFiltersInput) => void
}

export function PostFeed({ filters, onFiltersChange }: PostFeedProps) {
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = usePosts(filters)
  const votePost = useVotePost()

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  })

  // Infinite scroll trigger
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleVote = (postId: string, value: 1 | -1) => {
    votePost.mutate({ postId, value })
  }

  const handleRetry = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando posts...</span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-red-600 mb-4">
          <p className="font-medium">Erro ao carregar posts</p>
          <p className="text-sm text-muted-foreground">
            {error?.message || "Tente novamente mais tarde"}
          </p>
        </div>
        <Button onClick={handleRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    )
  }

  const posts = data?.pages.flatMap(page => page.data) || []

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground mb-4">
          <p className="text-lg font-medium">Nenhum post encontrado</p>
          <p className="text-sm">
            {filters.search || filters.category !== "all" || filters.tagId
              ? "Tente ajustar os filtros de busca"
              : "Seja o primeiro a criar um post na comunidade!"}
          </p>
        </div>
        {(filters.search || filters.category !== "all" || filters.tagId) && (
          <Button
            onClick={() => onFiltersChange?.({
              ...filters,
              search: "",
              category: undefined,
              tagId: undefined
            })}
            variant="outline"
          >
            Limpar filtros
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onVote={handleVote}
          />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      <div ref={ref} className="flex justify-center py-8">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Carregando mais posts...</span>
          </div>
        ) : hasNextPage ? (
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            Carregar mais posts
          </Button>
        ) : posts.length > 0 ? (
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Você chegou ao fim! 🎉</p>
            <p className="text-xs mt-1">
              {posts.length} post{posts.length !== 1 ? 's' : ''} carregado{posts.length !== 1 ? 's' : ''}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
