import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatBlogDate, formatRelativeBlogDate } from "@/lib/blog/utils"
import { BlogPost, BlogCategory, User } from "@prisma/client"
import { InteractiveCard } from "@/components/ui/interactive-card"
import { Clock, User as UserIcon } from "lucide-react"

interface PostCardProps {
  post: BlogPost & {
    author: Pick<User, "id" | "name" | "image">
    category: Pick<BlogCategory, "id" | "name" | "slug" | "color">
    tags: { tag: { id: string; name: string; slug: string } }[]
  }
  featured?: boolean
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const authorInitials = post.author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <InteractiveCard hoverStyle="interactive">
      <Link href={`/blog/${post.slug}`}>
        {/* Cover Image */}
        {post.coverImage && (
          <div className={`relative overflow-hidden rounded-t-lg ${featured ? 'h-64' : 'h-48'}`}>
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute top-3 left-3">
              <Badge
                variant="secondary"
                className="text-xs font-medium"
                style={{
                  backgroundColor: post.category.color + '20',
                  borderColor: post.category.color,
                  color: post.category.color
                }}
              >
                {post.category.name}
              </Badge>
            </div>
          </div>
        )}

        <CardContent className={`p-6 ${featured ? 'space-y-4' : 'space-y-3'}`}>
          {/* Title */}
          <h3 className={`font-bold leading-tight hover:text-primary transition-colors ${
            featured ? 'text-2xl' : 'text-lg'
          }`}>
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className={`text-muted-foreground leading-relaxed ${
              featured ? 'text-base' : 'text-sm'
            }`}>
              {post.excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={post.author.image || ""}
                  alt={post.author.name}
                />
                <AvatarFallback className="text-xs">
                  {authorInitials}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  {post.author.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatRelativeBlogDate(post.publishedAt)}
                </p>
              </div>
            </div>

            {post.readingTime && (
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <Clock className="h-3 w-3" />
                <span>{post.readingTime}min</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {post.tags.slice(0, 3).map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/blog?tag=${tag.slug}`}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{post.tags.length - 3} mais
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Link>
    </InteractiveCard>
  )
}

