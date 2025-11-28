"use client"

import { useState } from "react"
import { PostCategory } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, X, Filter } from "lucide-react"
import { COMMUNITY_SORT_OPTIONS } from "@/lib/constants/community"

interface FeedFiltersProps {
  search: string
  onSearchChange: (search: string) => void
  category: PostCategory | "all"
  onCategoryChange: (category: PostCategory | "all") => void
  sortBy: string
  onSortByChange: (sortBy: string) => void
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  availableTags?: Array<{ id: string; name: string; slug: string }>
}

export function FeedFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sortBy,
  onSortByChange,
  selectedTags,
  onTagsChange,
  availableTags = [],
}: FeedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const addTag = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      onTagsChange([...selectedTags, tagId])
    }
  }

  const removeTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(id => id !== tagId))
  }

  const clearFilters = () => {
    onSearchChange("")
    onCategoryChange("all")
    onSortByChange("newest")
    onTagsChange([])
  }

  const hasActiveFilters =
    search ||
    category !== "all" ||
    sortBy !== "newest" ||
    selectedTags.length > 0

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar posts..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange("")}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Quick Filters Row */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            {COMMUNITY_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
              !
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-4">
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <Select value={category} onValueChange={(value) => onCategoryChange(value as PostCategory | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value={PostCategory.GENERAL}>Geral</SelectItem>
                <SelectItem value={PostCategory.EXPERIENCES}>Experiências</SelectItem>
                <SelectItem value={PostCategory.QUESTIONS}>Perguntas</SelectItem>
                <SelectItem value={PostCategory.SUPPORT}>Suporte</SelectItem>
                <SelectItem value={PostCategory.VICTORIES}>Vitórias</SelectItem>
                <SelectItem value={PostCategory.RESOURCES}>Recursos</SelectItem>
                <SelectItem value={PostCategory.DISCUSSION}>Discussão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.slice(0, 10).map((tag) => (
                <Button
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    selectedTags.includes(tag.id)
                      ? removeTag(tag.id)
                      : addTag(tag.id)
                  }
                  className="text-xs"
                >
                  #{tag.name}
                </Button>
              ))}
              {availableTags.length > 10 && (
                <span className="text-xs text-muted-foreground self-center">
                  +{availableTags.length - 10} tags disponíveis
                </span>
              )}
            </div>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedTags.map((tagId) => {
                  const tag = availableTags.find(t => t.id === tagId)
                  return tag ? (
                    <Badge key={tagId} variant="secondary" className="text-xs">
                      #{tag.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTag(tagId)}
                        className="ml-1 h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  ) : null
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

