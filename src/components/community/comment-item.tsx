"use client"

import { useState } from "react"
import { CommentWithDetails } from "@/types/community"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { VoteButtons } from "./vote-buttons"
import { ReportButton } from "./report-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession } from "next-auth/react"
import { useVoteComment, useUpdateComment, useDeleteComment } from "@/hooks/use-comments"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  MessageCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Loader2,
} from "lucide-react"

interface CommentItemProps {
  comment: CommentWithDetails
  postAuthorId: string
  onReply?: (parentId: string) => void
  depth?: number
  maxDepth?: number
}

export function CommentItem({
  comment,
  postAuthorId,
  onReply,
  depth = 0,
  maxDepth = 2
}: CommentItemProps) {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [showReplies, setShowReplies] = useState(depth < 1) // Auto-expand first level
  const [showReplyForm, setShowReplyForm] = useState(false)

  const voteComment = useVoteComment()
  const updateComment = useUpdateComment()
  const deleteComment = useDeleteComment()

  const isAuthor = session?.user?.id === comment.authorId
  const isPostAuthor = comment.authorId === postAuthorId
  const canReply = depth < maxDepth
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: ptBR
  })

  const handleVote = (commentId: string, value: 1 | -1) => {
    voteComment.mutate({ commentId, value })
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditContent(comment.content)
  }

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return

    try {
      await updateComment.mutateAsync({
        commentId: comment.id,
        data: { content: editContent.trim() },
      })
      setIsEditing(false)
    } catch {
      // Error handled by mutation
    }
  }

  const handleCancelEdit = () => {
    setEditContent(comment.content)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja deletar este comentário?")) {
      try {
        await deleteComment.mutateAsync(comment.id)
      } catch {
        // Error handled by mutation
      }
    }
  }

  const handleReply = () => {
    if (onReply) {
      onReply(comment.id)
    } else {
      setShowReplyForm(!showReplyForm)
    }
  }

  const handleReport = () => {
    // TODO: Implement report functionality
    alert("Funcionalidade de denúncia em desenvolvimento")
  }

  return (
    <div className={`${depth > 0 ? "ml-6 border-l-2 border-muted pl-4" : ""}`}>
      <Card className="mb-3">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <VoteButtons
              commentId={comment.id}
              currentVote={comment.userVote?.value}
              voteCount={comment._count.votes}
              compact
            />

            <div className="flex-1 min-w-0">
              {/* Author Info */}
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={comment.author.image || ""} />
                  <AvatarFallback className="text-xs">
                    {comment.author.name?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {comment.isAnonymous ? "Anônimo" : comment.author.name || "Usuário"}
                  </span>

                  {isPostAuthor && (
                    <Badge variant="secondary" className="text-xs">
                      Autor
                    </Badge>
                  )}

                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground text-xs">
                    {timeAgo}
                    {comment.isEdited && " (editado)"}
                  </span>
                </div>
              </div>

              {/* Comment Content */}
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={updateComment.isPending || !editContent.trim()}
                    >
                      {updateComment.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={updateComment.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm leading-relaxed mb-3">
                  {comment.content}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {canReply && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReply}
                      className="h-7 px-2 text-xs"
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Responder
                    </Button>
                  )}

                  {comment._count.replies > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReplies(!showReplies)}
                      className="h-7 px-2 text-xs"
                    >
                      {showReplies ? (
                        <ChevronUp className="h-3 w-3 mr-1" />
                      ) : (
                        <ChevronDown className="h-3 w-3 mr-1" />
                      )}
                      {comment._count.replies} resposta{comment._count.replies !== 1 ? "s" : ""}
                    </Button>
                  )}
                </div>

                {/* More Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isAuthor && !isEditing && (
                      <>
                        <DropdownMenuItem onClick={handleEdit}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleDelete}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Deletar
                        </DropdownMenuItem>
                      </>
                    )}
                    {!isAuthor && (
                      <div className="px-2 py-1.5">
                        <ReportButton
                          commentId={comment.id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        />
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="mb-3">
          {/* CommentForm will be rendered here */}
        </div>
      )}

      {/* Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postAuthorId={postAuthorId}
              onReply={onReply}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  )
}
