"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { useCreateComment } from "@/hooks/use-comments"
import { createCommentSchema } from "@/lib/validations/community"
import { Loader2, Send, User } from "lucide-react"

interface CommentFormProps {
  postId: string
  parentId?: string
  onSuccess?: () => void
  onCancel?: () => void
  placeholder?: string
  autoFocus?: boolean
}

export function CommentForm({
  postId,
  parentId,
  onSuccess,
  onCancel,
  placeholder = "Escreva seu comentário...",
  autoFocus = false,
}: CommentFormProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createComment = useCreateComment()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) return

    try {
      setIsSubmitting(true)
      const commentData = {
        content: content.trim(),
        postId,
        parentId,
        isAnonymous,
      }

      // Validate data
      createCommentSchema.parse(commentData)

      await createComment.mutateAsync(commentData)

      setContent("")
      setIsAnonymous(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error creating comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setContent("")
    setIsAnonymous(false)
    onCancel?.()
  }

  if (!session?.user) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Faça login para comentar</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={session.user.image || ""} />
          <AvatarFallback className="text-xs">
            {session.user.name?.charAt(0).toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <div>
            <Label htmlFor="comment-content" className="sr-only">
              Comentário
            </Label>
            <Textarea
              id="comment-content"
              placeholder={placeholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
              autoFocus={autoFocus}
              rows={parentId ? 2 : 3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {content.length}/2000 caracteres
            </p>
          </div>

          {/* Anonymous option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous-comment"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
              disabled={isSubmitting}
            />
            <Label
              htmlFor="anonymous-comment"
              className="text-sm cursor-pointer"
            >
              Comentar anonimamente
            </Label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {isAnonymous ? "Comentário anônimo" : `Comentando como ${session.user.name}`}
            </div>

            <div className="flex gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={!content.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {parentId ? "Responder" : "Comentar"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}


