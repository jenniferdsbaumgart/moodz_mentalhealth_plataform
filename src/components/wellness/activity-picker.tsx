"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

import { PREDEFINED_ACTIVITIES } from "@/lib/constants/wellness"

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

  const getGroupedActivities = () => {
    if (showCategories) {
      return {
        type: 'categories' as const,
        data: {
          work: PREDEFINED_ACTIVITIES.filter(a => a.category === "work"),
          health: PREDEFINED_ACTIVITIES.filter(a => a.category === "health"),
          social: PREDEFINED_ACTIVITIES.filter(a => a.category === "social"),
          leisure: PREDEFINED_ACTIVITIES.filter(a => a.category === "leisure"),
          rest: PREDEFINED_ACTIVITIES.filter(a => a.category === "rest"),
        }
      }
    }
    return {
      type: 'all' as const,
      data: {
        all: PREDEFINED_ACTIVITIES
      }
    }
  }

  const groupedActivities = getGroupedActivities()

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

      <div className="space-y-4">
        {groupedActivities.type === 'categories' ? (
          Object.entries(groupedActivities.data).map(([category, activities]) => (
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
                  {activities.map((activity: any) => (
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
                {groupedActivities.data.all.map((activity) => (
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



