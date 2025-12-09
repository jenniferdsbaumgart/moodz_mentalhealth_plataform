import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatBlogDate } from "@/lib/blog/utils"
import { BlogPost, BlogCategory, User } from "@prisma/client"
import { ArrowRight, Clock, Calendar } from "lucide-react"

interface HeroProps {
  featuredPost: BlogPost & {
    author: Pick<User, "id" | "name" | "image">
    category: Pick<BlogCategory, "id" | "name" | "slug" | "color">
    tags: { tag: { id: string; name: string; slug: string } }[]
  }
}

export function Hero({ featuredPost }: HeroProps) {
  const authorInitials = (featuredPost.author.name || "A")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="text-sm font-medium px-3 py-1"
                style={{
                  backgroundColor: featuredPost.category.color + '20',
                  borderColor: featuredPost.category.color,
                  color: featuredPost.category.color
                }}
              >
                {featuredPost.category.name}
              </Badge>

              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                {featuredPost.title}
              </h1>

              {featuredPost.excerpt && (
                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                  {featuredPost.excerpt}
                </p>
              )}
            </div>

            {/* Author and Meta */}
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={featuredPost.author.image || ""}
                  alt={featuredPost.author.name || "Author"}
                />
                <AvatarFallback>
                  {authorInitials}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  {featuredPost.author.name}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatBlogDate(featuredPost.publishedAt || featuredPost.createdAt)}</span>
                  </div>
                  {featuredPost.readingTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{featuredPost.readingTime} min de leitura</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Button asChild size="lg" className="gap-2">
                <Link href={`/blog/${featuredPost.slug}`}>
                  Ler Artigo Completo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Tags */}
            {featuredPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4">
                {featuredPost.tags.map(({ tag }) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1 bg-muted/50 rounded-full hover:bg-muted"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Featured Image */}
          {featuredPost.coverImage && (
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>

              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 bg-background border rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold text-primary">
                  {featuredPost.viewCount.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Visualizações
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
    </section>
  )
}


