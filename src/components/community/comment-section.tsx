"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CommentList } from "./comment-list"
import { MessageCircle, ChevronDown, ChevronUp, Lock } from "lucide-react"

interface CommentSectionProps {
  postId: string
  postAuthorId: string
  totalComments: number
  isLocked?: boolean
  className?: string
}

export function CommentSection({
  postId,
  postAuthorId,
  totalComments,
  isLocked = false,
  className
}: CommentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (isLocked) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Comentários Travados
          </CardTitle>
          <CardDescription>
            Os comentários estão temporariamente desabilitados para este post.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Este post não aceita novos comentários no momento.</p>
            <p className="text-sm mt-2">
              Entre em contato com um moderador se tiver dúvidas.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comentários ({totalComments})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Recolher
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Expandir
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          Participe da conversa e compartilhe suas perspectivas
        </CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <CommentList
            postId={postId}
            postAuthorId={postAuthorId}
            totalComments={totalComments}
          />
        </CardContent>
      )}
    </Card>
  )
}


