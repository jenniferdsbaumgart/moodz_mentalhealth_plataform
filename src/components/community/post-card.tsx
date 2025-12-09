"use client"

import Link from "next/link"
import { PostWithDetails } from "@/types/community"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { VoteButtons } from "@/components/community/vote-buttons"
import {
  MessageCircle,
  Clock,
  Pin,
  Eye,
  User
} from "lucide-react"
import { POST_CATEGORIES } from "@/lib/constants/community"
import { formatRelativeTime } from "@/lib/utils/date"

interface PostCardProps {
  post: PostWithDetails
  onVote?: (postId: string, value: 1 | -1) => void
  isCompact?: boolean
}

export function PostCard({ post, onVote, isCompact = false }: PostCardProps) {
  const categoryInfo = POST_CATEGORIES[post.category]
  const authorDisplay = post.isAnonymous ? "Anônimo" : (post.author.name || "Usuário")
  const timeAgo = formatRelativeTime(post.createdAt)

  const excerpt = post.excerpt || post.content.substring(0, 150) + (post.content.length > 150 ? "..." : "")

  if (isCompact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <VoteButtons
              postId={post.id}
              currentVote={post.userVote?.value}
              voteCount={post._count.votes}
              compact
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{
                    borderColor: categoryInfo.color,
                    color: categoryInfo.color
                  }}
                >
                  {categoryInfo.label}
                </Badge>
                {post.isPinned && (
                  <Badge variant="secondary" className="text-xs">
                    <Pin className="h-3 w-3 mr-1" />
                    Fixado
                  </Badge>
                )}
              </div>

              <Link href={`/community/${post.id}`}>
                <h3 className="font-semibold text-sm leading-tight mb-1 hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
              </Link>

              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {excerpt}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {authorDisplay}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeAgo}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {post._count.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {post.viewCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <VoteButtons
            postId={post.id}
            currentVote={post.userVote?.value}
            voteCount={post._count.votes}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="outline"
                style={{
                  borderColor: categoryInfo.color,
                  color: categoryInfo.color
                }}
              >
                {categoryInfo.label}
              </Badge>
              {post.isPinned && (
                <Badge variant="secondary">
                  <Pin className="h-3 w-3 mr-1" />
                  Fixado
                </Badge>
              )}
            </div>

            <Link href={`/community/${post.id}`}>
              <h2 className="text-xl font-semibold leading-tight mb-2 hover:text-primary transition-colors">
                {post.title}
              </h2>
            </Link>

            <p className="text-muted-foreground mb-4 line-clamp-3">
              {excerpt}
            </p>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {post.tags.slice(0, 3).map(({ tag }) => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    #{tag.name}
                  </Badge>
                ))}
                {post.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{post.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.author.image || ""} />
                  <AvatarFallback className="text-xs">
                    {authorDisplay.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {authorDisplay}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeAgo}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {post._count.comments} comentários
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.viewCount} visualizações
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
