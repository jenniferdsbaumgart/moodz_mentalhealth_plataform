"use client"

import { useState, useOptimistic } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useVotePost } from "@/hooks/use-posts"
import { useVoteComment as useVoteCommentHook } from "@/hooks/use-comments"

interface VoteButtonsProps {
  postId?: string
  commentId?: string
  currentVote?: number | null
  voteCount: number
  onVote?: (id: string, value: 1 | -1) => void
  compact?: boolean
  disabled?: boolean
}

export function VoteButtons({
  postId,
  commentId,
  currentVote,
  voteCount,
  onVote,
  compact = false,
  disabled = false
}: VoteButtonsProps) {
  const [isVoting, setIsVoting] = useState(false)

  // Optimistic updates
  const [optimisticVote, setOptimisticVote] = useOptimistic(currentVote)
  const [optimisticCount, setOptimisticCount] = useOptimistic(voteCount)

  const votePost = useVotePost()
  const voteComment = useVoteCommentHook()

  const isPostVote = !!postId
  const targetId = postId || commentId || ""

  const handleVote = async (value: 1 | -1) => {
    if (disabled || isVoting) return

    // Optimistic update
    const newVote = optimisticVote === value ? null : value
    const countDiff = calculateCountDiff(optimisticVote, newVote)

    setOptimisticVote(newVote)
    setOptimisticCount(prev => prev + countDiff)
    setIsVoting(true)

    try {
      if (isPostVote && postId) {
        await votePost.mutateAsync({ postId, value })
      } else if (commentId) {
        await voteComment.mutateAsync({ commentId, value })
      }

      // Success - optimistic update was correct
    } catch {
      // Revert optimistic update on error
      setOptimisticVote(currentVote)
      setOptimisticCount(voteCount)
    } finally {
      setIsVoting(false)
    }

    // Call external onVote callback if provided
    if (onVote) {
      onVote(targetId, value)
    }
  }

  const calculateCountDiff = (current: number | null, next: number | null): number => {
    if (current === next) return 0
    if (current === null && next !== null) return next
    if (current !== null && next === null) return -current
    if (current !== null && next !== null) return next - current
    return 0
  }

  const displayVote = optimisticVote ?? currentVote
  const displayCount = optimisticCount ?? voteCount

  const buttonSize = compact ? "sm" : "default"
  const iconSize = compact ? "h-3 w-3" : "h-4 w-4"

  const upvoteVariant = displayVote === 1 ? "default" : "ghost"
  const downvoteVariant = displayVote === -1 ? "destructive" : "ghost"

  return (
    <div className={cn(
      "flex items-center gap-1",
      compact ? "flex-row" : "flex-col",
      compact ? "min-w-[60px]" : "min-w-[40px]"
    )}>
      <Button
        variant={upvoteVariant}
        size={buttonSize}
        onClick={() => handleVote(1)}
        disabled={disabled || isVoting}
        className={cn(
          "transition-colors",
          compact ? "h-6 w-6 p-0" : "h-8 w-8 p-0",
          displayVote === 1 && "bg-primary text-primary-foreground hover:bg-primary/90",
          !compact && displayVote !== 1 && "hover:bg-primary/10 hover:text-primary"
        )}
      >
        {isVoting ? (
          <Loader2 className={cn(iconSize, "animate-spin")} />
        ) : (
          <ChevronUp className={iconSize} />
        )}
      </Button>

      <span className={cn(
        "font-medium text-center px-1",
        compact ? "text-sm min-w-[20px]" : "text-base min-w-[24px]",
        displayCount > 0 ? "text-green-600 dark:text-green-400" :
        displayCount < 0 ? "text-red-600 dark:text-red-400" :
        "text-muted-foreground"
      )}>
        {displayCount}
      </span>

      <Button
        variant={downvoteVariant}
        size={buttonSize}
        onClick={() => handleVote(-1)}
        disabled={disabled || isVoting}
        className={cn(
          "transition-colors",
          compact ? "h-6 w-6 p-0" : "h-8 w-8 p-0",
          displayVote === -1 && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          !compact && displayVote !== -1 && "hover:bg-destructive/10 hover:text-destructive"
        )}
      >
        {isVoting ? (
          <Loader2 className={cn(iconSize, "animate-spin")} />
        ) : (
          <ChevronDown className={iconSize} />
        )}
      </Button>
    </div>
  )
}
