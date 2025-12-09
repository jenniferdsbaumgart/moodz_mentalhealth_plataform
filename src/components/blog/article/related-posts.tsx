import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatRelativeBlogDate } from "@/lib/blog/utils"
import { BlogPost, BlogCategory, User } from "@prisma/client"
import { ArrowRight } from "lucide-react"

interface RelatedPostsProps {
  posts: (BlogPost & {
    author: Pick<User, "id" | "name">
    category: Pick<BlogCategory, "id" | "name" | "slug" | "color">
  })[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Posts Relacionados</h2>
        <Link
          href="/blog"
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          Ver todos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="group hover:shadow-md transition-all duration-200">
            <Link href={`/blog/${post.slug}`}>
              {/* Cover Image */}
              {post.coverImage && (
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge
                      variant="secondary"
                      className="text-xs"
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

              <CardHeader className="pb-2">
                <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0">
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{post.author.name}</span>
                  <span>{formatRelativeBlogDate(post.publishedAt || post.createdAt)}</span>
                </div>

                {post.readingTime && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {post.readingTime} min de leitura
                  </div>
                )}
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  )
}


