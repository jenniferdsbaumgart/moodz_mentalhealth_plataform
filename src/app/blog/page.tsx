"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Clock, Eye, ArrowRight, BookOpen } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  readingTime: number | null
  viewCount: number
  publishedAt: string
  author: {
    name: string | null
    image: string | null
  }
  category: {
    name: string
    slug: string
    color: string
  }
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  color: string
}

export default function BlogPage() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const { data: categories = [] } = useQuery<BlogCategory[]>({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const res = await fetch("/api/blog/categories")
      if (!res.ok) throw new Error("Failed to fetch categories")
      return res.json()
    }
  })

  const { data: postsData, isLoading } = useQuery<{ posts: BlogPost[]; total: number }>({
    queryKey: ["blog-posts", search, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (selectedCategory) params.set("category", selectedCategory)
      params.set("status", "PUBLISHED")

      const res = await fetch(`/api/blog/posts?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch posts")
      return res.json()
    }
  })

  const posts = postsData?.posts || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm font-medium">Blog Moodz</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Dicas e Insights para sua
            <span className="text-primary"> Saúde Mental</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Artigos escritos por especialistas para ajudar você a cuidar da sua mente e bem-estar emocional.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar artigos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 pb-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Todos
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.slug)}
                style={{
                  backgroundColor: selectedCategory === category.slug ? category.color : undefined,
                  borderColor: category.color,
                }}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="px-4 pb-16">
        <div className="container mx-auto max-w-6xl">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum artigo encontrado</h3>
              <p className="text-muted-foreground">
                Tente buscar por outro termo ou categoria.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow group">
                    {post.coverImage ? (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-primary/50" />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <Badge
                        variant="secondary"
                        className="w-fit text-xs"
                        style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
                      >
                        {post.category.name}
                      </Badge>
                      <h2 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                    </CardHeader>
                    <CardContent className="pb-2">
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readingTime || 5} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.viewCount}
                      </div>
                      <span className="ml-auto">
                        {formatDistanceToNow(new Date(post.publishedAt), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
