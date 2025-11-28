"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Activity {
  id: string
  label: string
  emoji: string
  category: "work" | "health" | "social" | "leisure" | "rest"
  color: string
}

const PREDEFINED_ACTIVITIES: Activity[] = [
  // Trabalho
  { id: "trabalho", label: "Trabalho", emoji: "💼", category: "work", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "estudo", label: "Estudo", emoji: "📚", category: "work", color: "bg-green-100 text-green-800 border-green-200" },
  { id: "reuniao", label: "Reunião", emoji: "👥", category: "work", color: "bg-purple-100 text-purple-800 border-purple-200" },

  // Saúde
  { id: "exercicio", label: "Exercício", emoji: "🏃‍♀️", category: "health", color: "bg-red-100 text-red-800 border-red-200" },
  { id: "meditacao", label: "Meditação", emoji: "🧘‍♀️", category: "health", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { id: "dieta", label: "Cuidar da dieta", emoji: "🥗", category: "health", color: "bg-green-200 text-green-900 border-green-300" },

  // Social
  { id: "social", label: "Interação social", emoji: "👥", category: "social", color: "bg-pink-100 text-pink-800 border-pink-200" },
  { id: "familia", label: "Tempo em família", emoji: "👨‍👩‍👧‍👦", category: "social", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { id: "amigos", label: "Tempo com amigos", emoji: "🎉", category: "social", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },

  // Lazer
  { id: "natureza", label: "Tempo na natureza", emoji: "🌳", category: "leisure", color: "bg-green-100 text-green-900 border-green-300" },
  { id: "leitura", label: "Leitura", emoji: "📖", category: "leisure", color: "bg-blue-200 text-blue-900 border-blue-300" },
  { id: "musica", label: "Ouvir música", emoji: "🎵", category: "leisure", color: "bg-purple-200 text-purple-900 border-purple-300" },
  { id: "hobby", label: "Hobby/Criativo", emoji: "🎨", category: "leisure", color: "bg-pink-200 text-pink-900 border-pink-300" },
  { id: "jogos", label: "Jogos", emoji: "🎮", category: "leisure", color: "bg-indigo-200 text-indigo-900 border-indigo-300" },

  // Descanso
  { id: "descanso", label: "Descanso", emoji: "😴", category: "rest", color: "bg-gray-100 text-gray-800 border-gray-200" },
  { id: "sono", label: "Bom sono", emoji: "🌙", category: "rest", color: "bg-blue-100 text-blue-900 border-blue-300" },
  { id: "relaxar", label: "Relaxar", emoji: "🛋️", category: "rest", color: "bg-green-50 text-green-700 border-green-200" },
]

interface ActivityPickerProps {
  selectedActivities: string[]
  onChange: (activities: string[]) => void
  maxActivities?: number
  showCategories?: boolean
  className?: string
}

export function ActivityPicker({
  selectedActivities,
  onChange,
  maxActivities = 10,
  showCategories = true,
  className
}: ActivityPickerProps) {
  const handleActivityToggle = (activityId: string) => {
    if (selectedActivities.includes(activityId)) {
      onChange(selectedActivities.filter(id => id !== activityId))
    } else if (selectedActivities.length < maxActivities) {
      onChange([...selectedActivities, activityId])
    }
  }

  const handleRemoveActivity = (activityId: string) => {
    onChange(selectedActivities.filter(id => id !== activityId))
  }

  const groupedActivities = showCategories ? {
    work: PREDEFINED_ACTIVITIES.filter(a => a.category === "work"),
    health: PREDEFINED_ACTIVITIES.filter(a => a.category === "health"),
    social: PREDEFINED_ACTIVITIES.filter(a => a.category === "social"),
    leisure: PREDEFINED_ACTIVITIES.filter(a => a.category === "leisure"),
    rest: PREDEFINED_ACTIVITIES.filter(a => a.category === "rest"),
  } : {
    all: PREDEFINED_ACTIVITIES
  }

  const categoryLabels = {
    work: "Trabalho & Produtividade",
    health: "Saúde & Bem-estar",
    social: "Social & Relacionamentos",
    leisure: "Lazer & Hobbies",
    rest: "Descanso & Relaxamento",
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Selected Activities */}
      {selectedActivities.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Atividades selecionadas:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedActivities.map((activityId) => {
              const activity = PREDEFINED_ACTIVITIES.find(a => a.id === activityId)
              return (
                <Badge
                  key={activityId}
                  variant="secondary"
                  className={cn(
                    "flex items-center gap-1",
                    activity?.color
                  )}
                >
                  <span>{activity?.emoji || "📝"}</span>
                  <span>{activity?.label || activityId}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveActivity(activityId)}
                    className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedActivities.length}/{maxActivities} atividades selecionadas
          </p>
        </div>
      )}

      {/* Predefined Activities */}
      <div className="space-y-4">
        {showCategories ? (
          Object.entries(groupedActivities).map(([category, activities]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base capitalize">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </CardTitle>
                <CardDescription className="text-xs">
                  Selecione as atividades que você fez hoje
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {activities.map((activity) => (
                    <Button
                      key={activity.id}
                      variant={selectedActivities.includes(activity.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleActivityToggle(activity.id)}
                      disabled={!selectedActivities.includes(activity.id) && selectedActivities.length >= maxActivities}
                      className={cn(
                        "flex flex-col items-center gap-1 h-auto py-3 text-center",
                        selectedActivities.includes(activity.id) && activity.color
                      )}
                    >
                      <span className="text-lg">{activity.emoji}</span>
                      <span className="text-xs leading-tight">{activity.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Atividades do dia</CardTitle>
              <CardDescription className="text-xs">
                Selecione as atividades que você fez hoje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                {groupedActivities.all.map((activity) => (
                  <Button
                    key={activity.id}
                    variant={selectedActivities.includes(activity.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleActivityToggle(activity.id)}
                    disabled={!selectedActivities.includes(activity.id) && selectedActivities.length >= maxActivities}
                    className={cn(
                      "flex flex-col items-center gap-1 h-auto py-2 text-center",
                      selectedActivities.includes(activity.id) && activity.color
                    )}
                  >
                    <span className="text-base">{activity.emoji}</span>
                    <span className="text-xs leading-tight">{activity.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

