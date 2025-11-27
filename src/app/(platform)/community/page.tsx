"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { PostCategory } from "@prisma/client"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryTabs } from "@/components/community/category-tabs"
import { FeedFilters } from "@/components/community/feed-filters"
import { PostFeed } from "@/components/community/post-feed"
import { Plus, MessageSquare, Users, TrendingUp } from "lucide-react"
import { CommunityFiltersInput } from "@/types/community"

export default function CommunityPage() {
  const [filters, setFilters] = useState<CommunityFiltersInput>({
    category: "all",
    sortBy: "newest",
    page: 1,
    limit: 20,
  })

  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Update filters when category changes
  const handleCategoryChange = (category: PostCategory | "all") => {
    setFilters(prev => ({
      ...prev,
      category: category === "all" ? undefined : category,
      page: 1, // Reset to first page
    }))
  }

  const handleFiltersChange = (newFilters: CommunityFiltersInput) => {
    setFilters({
      ...newFilters,
      page: 1, // Reset to first page when filters change
    })
  }

  // Get category counts (mock data for now - in real app this would come from API)
  const categoryCounts = useMemo(() => ({
    all: 156,
    [PostCategory.GENERAL]: 45,
    [PostCategory.EXPERIENCES]: 32,
    [PostCategory.QUESTIONS]: 28,
    [PostCategory.SUPPORT]: 23,
    [PostCategory.VICTORIES]: 15,
    [PostCategory.RESOURCES]: 8,
    [PostCategory.DISCUSSION]: 5,
  }), [])

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Comunidade</h1>
            <p className="text-muted-foreground">
              Conecte-se com outros membros, compartilhe experiências e encontre suporte
            </p>
          </div>
          <Button asChild>
            <Link href="/community/new">
              <Plus className="h-4 w-4 mr-2" />
              Novo Post
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-6">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-muted-foreground">Posts ativos</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-6">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">89</p>
                <p className="text-sm text-muted-foreground">Membros ativos</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-6">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">+23%</p>
                <p className="text-sm text-muted-foreground">Crescimento mensal</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Tabs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Explorar por Categoria</CardTitle>
            <CardDescription>
              Navegue pelos diferentes tipos de conteúdo da comunidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryTabs
              value={filters.category || "all"}
              onValueChange={handleCategoryChange}
              counts={categoryCounts}
            />
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filtros e Ordenação</CardTitle>
          </CardHeader>
          <CardContent>
            <FeedFilters
              search={filters.search || ""}
              onSearchChange={(search) =>
                handleFiltersChange({ ...filters, search: search || undefined })
              }
              category={filters.category || "all"}
              onCategoryChange={handleCategoryChange}
              sortBy={filters.sortBy || "newest"}
              onSortByChange={(sortBy) =>
                handleFiltersChange({ ...filters, sortBy })
              }
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
            />
          </CardContent>
        </Card>

        {/* Post Feed */}
        <PostFeed
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>
    </MainLayout>
  )
}
