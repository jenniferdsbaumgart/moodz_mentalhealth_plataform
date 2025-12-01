"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Plus,
  Heart,
  Lock,
  Calendar,
  Hash,
  Eye,
  Star,
  Filter
} from "lucide-react"

interface JournalEntry {
  id: string
  title: string
  content: string
  mood?: number
  tags: string[]
  isPrivate: boolean
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  prompt?: {
    id: string
    text: string
  }
}

interface JournalListProps {
  entries: JournalEntry[]
  isLoading?: boolean
  onSearch?: (query: string) => void
  onFilter?: (filters: { tag?: string; favorite?: boolean; sortBy?: string }) => void
  className?: string
}

export function JournalList({
  entries,
  isLoading = false,
  onSearch,
  onFilter,
  className
}: JournalListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string>("")
  const [showFavorites, setShowFavorites] = useState(false)
  const [sortBy, setSortBy] = useState("createdAt")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  const handleFilter = () => {
    onFilter?.({
      tag: selectedTag || undefined,
      favorite: showFavorites || undefined,
      sortBy,
    })
  }

  const getMoodEmoji = (mood?: number) => {
    if (!mood) return null

    if (mood >= 9) return "🥳"
    if (mood >= 7) return "😊"
    if (mood >= 5) return "🙂"
    if (mood >= 3) return "😐"
    if (mood >= 1) return "😞"
    return "😢"
  }

  const getPreviewText = (content: string): string => {
    // Remove HTML tags and get first 150 characters
    const text = content.replace(/<[^>]*>/g, "").trim()
    return text.length > 150 ? text.substring(0, 150) + "..." : text
  }

  const getWordCount = (content: string): number => {
    return content.replace(/<[^>]*>/g, "").trim().split(/\s+/).filter(word => word.length > 0).length
  }

  // Get unique tags from all entries
  const allTags = Array.from(new Set(entries.flatMap(entry => entry.tags)))

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Meu Diário</h2>
          <p className="text-muted-foreground">
            {entries.length} entradas registradas
          </p>
        </div>
        <Button asChild>
          <Link href="/wellness/journal/new">
            <Plus className="h-4 w-4 mr-2" />
            Nova Entrada
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar entradas..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filtrar por tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as tags</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Mais recentes</SelectItem>
                  <SelectItem value="updatedAt">Atualizadas</SelectItem>
                  <SelectItem value="title">Título (A-Z)</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showFavorites ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavorites(!showFavorites)}
                className="gap-2"
              >
                <Star className="h-4 w-4" />
                Favoritas
              </Button>

              <Button onClick={handleFilter} variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entries */}
      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="space-y-4">
              <div className="text-6xl">📝</div>
              <div>
                <h3 className="text-lg font-medium mb-2">Nenhuma entrada encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  Comece escrevendo seus primeiros pensamentos no diário
                </p>
                <Button asChild>
                  <Link href="/wellness/journal/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeira entrada
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg hover:text-primary cursor-pointer">
                        <Link href={`/wellness/journal/${entry.id}`}>
                          {entry.title}
                        </Link>
                      </CardTitle>
                      {entry.isFavorite && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                      {entry.isPrivate && (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                      {entry.mood && (
                        <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                      )}
                    </div>

                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(entry.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                      <span>{getWordCount(entry.content)} palavras</span>
                      <span>~{Math.ceil(getWordCount(entry.content) / 200)} min</span>
                    </CardDescription>
                  </div>
                </div>

                {/* Tags */}
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {entry.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Hash className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {entry.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{entry.tags.length - 3} mais
                      </Badge>
                    )}
                  </div>
                )}

                {/* Prompt */}
                {entry.prompt && (
                  <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                    <span className="font-medium">Prompt: </span>
                    {entry.prompt.text}
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <p className="text-muted-foreground line-clamp-3">
                  {getPreviewText(entry.content)}
                </p>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-2">
                    {entry.isFavorite && (
                      <Badge variant="outline" className="text-xs">
                        <Heart className="h-3 w-3 mr-1" />
                        Favorito
                      </Badge>
                    )}
                    {entry.isPrivate && (
                      <Badge variant="outline" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Privado
                      </Badge>
                    )}
                  </div>

                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/wellness/journal/${entry.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


