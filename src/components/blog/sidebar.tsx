"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Search, TrendingUp, Hash } from "lucide-react"
import { BlogCategory, BlogTag } from "@prisma/client"

interface SidebarProps {
  categories: (BlogCategory & { _count: { posts: number } })[]
  tags: BlogTag[]
  totalPosts: number
}

export function Sidebar({ categories, tags, totalPosts }: SidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (search.trim()) {
      params.set("search", search.trim())
    } else {
      params.delete("search")
    }
    params.delete("page") // Reset to first page
    router.push(`/blog?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/blog")
    setSearch("")
  }

  const hasFilters = searchParams.toString().length > 0

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-3">
            <Input
              placeholder="Buscar posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
              {hasFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                >
                  Limpar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total de Posts</span>
              <Badge variant="secondary">{totalPosts}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Categorias</span>
              <Badge variant="secondary">{categories.length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tags</span>
              <Badge variant="secondary">{tags.length}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/blog?category=${category.slug}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">
                    {category.name}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {category._count.posts}
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Tags */}
      {tags.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Tags Populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 15).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog?tag=${tag.slug}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1 bg-muted/50 rounded-full hover:bg-muted"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Links Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Link
              href="/blog?sort=popular"
              className="block text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              📈 Posts Mais Lidos
            </Link>
            <Link
              href="/blog?sort=recent"
              className="block text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              🆕 Posts Recentes
            </Link>
            <Separator className="my-3" />
            <Link
              href="/sobre"
              className="block text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              📖 Sobre Nós
            </Link>
            <Link
              href="/contato"
              className="block text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              💬 Contato
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
