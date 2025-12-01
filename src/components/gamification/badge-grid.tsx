"use client"

import { useState } from "react"
import { BadgeCard } from "./badge-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Trophy, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Badge {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  category: string
  rarity: string
  pointsReward: number
  criteriaType?: string
  criteriaValue?: number
  unlockedAt?: Date
  progress?: {
    current: number
    target: number
    percentage: number
  }
}

interface BadgeGridProps {
  badges: Badge[]
  unlockedBadgeIds?: string[]
  className?: string
}

const categories = [
  { value: "all", label: "Todos", icon: "🏆" },
  { value: "MILESTONE", label: "Marcos", icon: "🏆" },
  { value: "COMMUNITY", label: "Comunidade", icon: "💬" },
  { value: "SESSIONS", label: "Sessões", icon: "🤝" },
  { value: "WELLNESS", label: "Bem-estar", icon: "🧘‍♀️" },
  { value: "SOCIAL", label: "Social", icon: "🤗" },
  { value: "SPECIAL", label: "Especial", icon: "⭐" },
]

const rarities = [
  { value: "all", label: "Todas" },
  { value: "COMMON", label: "Comum" },
  { value: "UNCOMMON", label: "Incomum" },
  { value: "RARE", label: "Raro" },
  { value: "EPIC", label: "Épico" },
  { value: "LEGENDARY", label: "Lendário" },
]

export function BadgeGrid({ badges, unlockedBadgeIds = [], className }: BadgeGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRarity, setSelectedRarity] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort badges
  const filteredBadges = badges
    .filter(badge => {
      const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          badge.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || badge.category === selectedCategory
      const matchesRarity = selectedRarity === "all" || badge.rarity === selectedRarity

      return matchesSearch && matchesCategory && matchesRarity
    })
    .sort((a, b) => {
      // Sort by unlocked status first, then by rarity, then by name
      const aUnlocked = unlockedBadgeIds.includes(a.id)
      const bUnlocked = unlockedBadgeIds.includes(b.id)

      if (aUnlocked !== bUnlocked) {
        return aUnlocked ? -1 : 1
      }

      const rarityOrder = { LEGENDARY: 5, EPIC: 4, RARE: 3, UNCOMMON: 2, COMMON: 1 }
      const aRarity = rarityOrder[a.rarity as keyof typeof rarityOrder] || 0
      const bRarity = rarityOrder[b.rarity as keyof typeof rarityOrder] || 0

      if (aRarity !== bRarity) {
        return bRarity - aRarity
      }

      return a.name.localeCompare(b.name)
    })

  const unlockedBadges = filteredBadges.filter(badge => unlockedBadgeIds.includes(badge.id))
  const lockedBadges = filteredBadges.filter(badge => !unlockedBadgeIds.includes(badge.id))

  const getStats = () => {
    const total = badges.length
    const unlocked = unlockedBadgeIds.length
    const locked = total - unlocked
    const completionRate = total > 0 ? Math.round((unlocked / total) * 100) : 0

    return { total, unlocked, locked, completionRate }
  }

  const stats = getStats()

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Conquistas</h2>
          <p className="text-muted-foreground">
            {stats.unlocked} de {stats.total} badges conquistados ({stats.completionRate}%)
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1">
            <Trophy className="h-4 w-4" />
            {stats.unlocked}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Lock className="h-4 w-4" />
            {stats.locked}
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar badges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Filter Controls */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Raridade</label>
            <Select value={selectedRarity} onValueChange={setSelectedRarity}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rarities.map(rarity => (
                  <SelectItem key={rarity.value} value={rarity.value}>
                    {rarity.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Badge Tabs */}
      <Tabs defaultValue="unlocked" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="unlocked" className="gap-2">
            <Trophy className="h-4 w-4" />
            Conquistados ({unlockedBadges.length})
          </TabsTrigger>
          <TabsTrigger value="locked" className="gap-2">
            <Lock className="h-4 w-4" />
            Próximos Desafios ({lockedBadges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unlocked" className="mt-6">
          {unlockedBadges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {unlockedBadges.map(badge => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  isUnlocked={true}
                  unlockedAt={badge.unlockedAt}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum badge conquistado ainda</h3>
              <p className="text-muted-foreground">
                Continue usando a plataforma para desbloquear suas primeiras conquistas!
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="locked" className="mt-6">
          {lockedBadges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {lockedBadges.map(badge => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  isUnlocked={false}
                  progress={badge.progress}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Todos os badges foram conquistados!</h3>
              <p className="text-muted-foreground">
                Parabéns! Você é uma lenda na plataforma Moodz! 🎉
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}


