"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { BlogPostStatus } from "@prisma/client"

interface PostsFiltersProps {
  stats: {
    total: number
    draft: number
    published: number
    archived: number
  }
}

const statusLabels = {
  ALL: "Todos",
  DRAFT: "Rascunhos",
  PUBLISHED: "Publicados",
  ARCHIVED: "Arquivados",
} as const

const statusColors = {
  DRAFT: "text-yellow-600",
  PUBLISHED: "text-green-600",
  ARCHIVED: "text-gray-600",
} as const

export function PostsFilters({ stats }: PostsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") || "")

  const currentStatus = (searchParams.get("status") as BlogPostStatus) || "ALL"

  function updateStatus(status: BlogPostStatus | "ALL") {
    const params = new URLSearchParams(searchParams.toString())

    if (status === "ALL") {
      params.delete("status")
    } else {
      params.set("status", status)
    }

    // Reset page when changing status
    params.delete("page")

    router.push(`/admin/blog?${params.toString()}`)
  }

  function handleSearch() {
    const params = new URLSearchParams(searchParams.toString())
    params.set("search", search)
    params.delete("page") // Reset page on search
    router.push(`/admin/blog?${params.toString()}`)
  }

  function clearSearch() {
    setSearch("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("search")
    params.delete("page")
    router.push(`/admin/blog?${params.toString()}`)
  }

  const getStatusCount = (status: keyof typeof stats) => {
    if (status === "total") return stats.total
    return stats[status as keyof typeof stats] || 0
  }

  return (
    <div className="space-y-4">
      {/* Header with search and create button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
            />
          </div>
          {search && (
            <Button variant="ghost" size="sm" onClick={clearSearch}>
              Limpar
            </Button>
          )}
        </div>

        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Post
          </Link>
        </Button>
      </div>

      {/* Status tabs */}
      <Tabs value={currentStatus} onValueChange={(value) => updateStatus(value as BlogPostStatus | "ALL")}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ALL" className="flex items-center gap-2">
            {statusLabels.ALL}
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
              {getStatusCount("total")}
            </span>
          </TabsTrigger>
          <TabsTrigger value="DRAFT" className="flex items-center gap-2">
            {statusLabels.DRAFT}
            <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors.DRAFT} bg-yellow-50`}>
              {getStatusCount("draft")}
            </span>
          </TabsTrigger>
          <TabsTrigger value="PUBLISHED" className="flex items-center gap-2">
            {statusLabels.PUBLISHED}
            <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors.PUBLISHED} bg-green-50`}>
              {getStatusCount("published")}
            </span>
          </TabsTrigger>
          <TabsTrigger value="ARCHIVED" className="flex items-center gap-2">
            {statusLabels.ARCHIVED}
            <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors.ARCHIVED} bg-gray-50`}>
              {getStatusCount("archived")}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}

