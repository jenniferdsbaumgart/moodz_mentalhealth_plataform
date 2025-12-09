"use client"

import { CommentItem } from "./comment-item"
import { CommentForm } from "./comment-form"
import { useComments } from "@/hooks/use-comments"
import { Loader2, MessageCircle } from "lucide-react"

interface CommentListProps {
  postId: string
  postAuthorId: string
  totalComments: number
}

export function CommentList({ postId, postAuthorId, totalComments }: CommentListProps) {
  const { data, isLoading, error } = useComments(postId)
  const comments = data?.data || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Carregando comentários...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>Erro ao carregar comentários</p>
        <p className="text-sm text-muted-foreground mt-1">
          {error.message}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <div>
        <CommentForm
          postId={postId}
          placeholder="Compartilhe seus pensamentos sobre este post..."
          autoFocus={false}
        />
      </div>

      {/* Comments Count */}
      {totalComments > 0 && (
        <div className="flex items-center gap-2 text-sm font-medium">
          <MessageCircle className="h-4 w-4" />
          {totalComments} comentário{totalComments !== 1 ? "s" : ""}
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment: any) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postAuthorId={postAuthorId}
            />
          ))}
        </div>
      ) : totalComments === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Seja o primeiro a comentar!</h3>
          <p className="text-sm">
            Compartilhe seus pensamentos e ajude a construir a conversa.
          </p>
        </div>
      ) : null}
    </div>
  )
}
