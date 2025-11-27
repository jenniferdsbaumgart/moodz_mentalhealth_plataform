"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { JournalList } from "@/components/wellness/journal-list"
import { Button } from "@/components/ui/button"
import { useJournalEntries } from "@/hooks/use-wellness"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

export default function JournalPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<{
    tag?: string
    favorite?: boolean
    sortBy?: string
  }>({})

  const { data, isLoading, error } = useJournalEntries({
    search: searchQuery || undefined,
    tag: filters.tag,
    favorite: filters.favorite,
    sortBy: filters.sortBy as "createdAt" | "updatedAt" | "title" | undefined,
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilter = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  return (
    <MainLayout>
      <div className="py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/wellness">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Bem-estar
            </Link>
          </Button>
        </div>

        {/* Content */}
        {error ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Erro ao carregar diário</h2>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar suas entradas. Tente novamente.
            </p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <JournalList
            entries={data?.data || []}
            isLoading={isLoading}
            onSearch={handleSearch}
            onFilter={handleFilter}
          />
        )}

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6">
          <Button size="lg" asChild className="rounded-full shadow-lg">
            <Link href="/wellness/journal/new">
              <Plus className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}
