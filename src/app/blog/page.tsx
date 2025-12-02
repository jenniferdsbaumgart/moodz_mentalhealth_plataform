"use client"

import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { Hero } from "@/components/blog/hero"
import { PostCard } from "@/components/blog/post-card"
import { Sidebar } from "@/components/blog/sidebar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { BlogPost, BlogCategory, BlogTag, User } from "@prisma/client"

type BlogPostWithRelations = BlogPost & {
  author: Pick<User, "id" | "name" | "image">
  category: Pick<BlogCategory, "id" | "name" | "slug" | "color">
  tags: { tag: Pick<BlogTag, "id" | "name" | "slug"> }[]
}

type CategoryWithCount = BlogCategory & {
  _count: { posts: number }
}

export default function BlogPage() {
  const searchParams = useSearchParams()

  // Parse query parameters
  const categorySlug = searchParams.get("category")
  const tagSlug = searchParams.get("tag")
  const search = searchParams.get("search")
  const sort = searchParams.get("sort") || "publishedAt"
  const page = parseInt(searchParams.get("page") || "1")

  const { data, isLoading } = useQuery({
    queryKey: ["blog-posts", { categorySlug, tagSlug, search, sort, page }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (categorySlug) params.set("category", categorySlug)
      if (tagSlug) params.set("tag", tagSlug)
      if (search) params.set("search", search)
      if (sort) params.set("sort", sort)
      params.set("page", page.toString())
      params.set("limit", "12")

      const response = await fetch(`/api/blog/posts?${params}`)
      if (!response.ok) throw new Error("Failed to fetch posts")
      return response.json()
    },
  })

  const { data: categoriesData } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const response = await fetch("/api/blog/categories")
      if (!response.ok) throw new Error("Failed to fetch categories")
      return response.json()
    },
  })

  const { data: tagsData } = useQuery({
    queryKey: ["blog-tags"],
    queryFn: async () => {
      // TODO: Create tags API endpoint if needed
      return { tags: [] }
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="animate-pulse">
          <div className="h-96 bg-muted"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-4">
                      <div className="h-48 bg-muted rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const posts = data?.posts || []
  const pagination = data?.pagination || {}
  const categories = categoriesData?.categories || []
  const tags = tagsData?.tags || []

  // Featured post is the first post if no filters are applied
  const featuredPost = !categorySlug && !tagSlug && !search && posts.length > 0 ? posts[0] : null
  const gridPosts = featuredPost ? posts.slice(1) : posts

  // Calculate total posts for sidebar
  const totalPosts = categories.reduce((acc, cat) => acc + cat._count.posts, 0)

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    window.location.href = `/blog?${params.toString()}`
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Only show if there's a featured post and no filters */}
      {featuredPost && (
        <Hero featuredPost={featuredPost as BlogPostWithRelations} />
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Posts Grid */}
          <div className="lg:col-span-3">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">
                {categorySlug ? `Categoria: ${categories.find(c => c.slug === categorySlug)?.name}` :
                 tagSlug ? `Tag: #${tags.find(t => t.slug === tagSlug)?.name}` :
                 search ? `Resultados para "${search}"` :
                 "Blog"}
              </h1>
              <p className="text-muted-foreground">
                {posts.length === 1 ? "1 post encontrado" : `${posts.length} posts encontrados`}
              </p>
            </div>

            {/* Posts Grid */}
            {gridPosts.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {gridPosts.map((post: BlogPostWithRelations) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {gridPosts.length} de {pagination.total} posts
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(page - 1)}
                        disabled={page <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      <span className="text-sm">
                        Página {page} de {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(page + 1)}
                        disabled={page >= pagination.totalPages}
                      >
                        Próxima
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">Nenhum post encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {search ? "Tente ajustar sua busca ou filtros." : "Volte em breve para novos conteúdos!"}
                </p>
                {(categorySlug || tagSlug || search) && (
                  <Button asChild variant="outline">
                    <a href="/blog">Ver todos os posts</a>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar
              categories={categories as CategoryWithCount[]}
              tags={tags}
              totalPosts={totalPosts}
            />
          </div>
        </div>
      </main>
    </div>
  )
}


