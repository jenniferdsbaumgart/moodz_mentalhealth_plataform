"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Lightbulb,
  Shuffle,
  Heart,
  Brain,
  Target,
  Users,
  TrendingUp,
  Puzzle,
  Sparkles
} from "lucide-react"
import { journalPrompts, JournalPromptCategory } from "@/lib/validations/journal"

interface JournalPromptsProps {
  onSelectPrompt: (prompt: string, category: JournalPromptCategory) => void
  className?: string
}

const categoryIcons = {
  GRATITUDE: Heart,
  REFLECTION: Brain,
  GOALS: Target,
  EMOTIONS: Sparkles,
  RELATIONSHIPS: Users,
  GROWTH: TrendingUp,
  CHALLENGES: Puzzle,
  CREATIVITY: Lightbulb,
} as const

const categoryLabels = {
  GRATITUDE: "Gratidão",
  REFLECTION: "Reflexão",
  GOALS: "Metas",
  EMOTIONS: "Emoções",
  RELATIONSHIPS: "Relacionamentos",
  GROWTH: "Crescimento",
  CHALLENGES: "Desafios",
  CREATIVITY: "Criatividade",
} as const

const categoryDescriptions = {
  GRATITUDE: "Cultive uma atitude de gratidão",
  REFLECTION: "Explore seus pensamentos e sentimentos",
  GOALS: "Defina e trabalhe em direção às suas metas",
  EMOTIONS: "Entenda e processe suas emoções",
  RELATIONSHIPS: "Reflita sobre conexões interpessoais",
  GROWTH: "Aprenda sobre seu desenvolvimento pessoal",
  CHALLENGES: "Enfrente e supere obstáculos",
  CREATIVITY: "Liberte sua imaginação e criatividade",
} as const

export function JournalPrompts({ onSelectPrompt, className }: JournalPromptsProps) {
  const [randomPrompt, setRandomPrompt] = useState<string | null>(null)
  const [randomCategory, setRandomCategory] = useState<JournalPromptCategory | null>(null)

  const getRandomPrompt = () => {
    const categories = Object.keys(journalPrompts) as JournalPromptCategory[]
    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
    const prompts = journalPrompts[randomCategory]
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]

    setRandomPrompt(randomPrompt)
    setRandomCategory(randomCategory)

    return { prompt: randomPrompt, category: randomCategory }
  }

  const handleRandomPrompt = () => {
    const { prompt, category } = getRandomPrompt()
    onSelectPrompt(prompt, category)
  }

  return (
    <div className={className}>
      {/* Random Prompt Card */}
      <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shuffle className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Prompt Aleatório</CardTitle>
            </div>
            <Button
              onClick={getRandomPrompt}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Shuffle className="h-4 w-4" />
              Novo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {randomPrompt && randomCategory ? (
            <div className="space-y-3">
              <div className="p-4 bg-background rounded-lg border">
                <p className="text-base font-medium mb-2">{randomPrompt}</p>
                <Badge variant="outline" className="text-xs">
                  {categoryLabels[randomCategory]}
                </Badge>
              </div>
              <Button
                onClick={handleRandomPrompt}
                className="w-full gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                Usar este prompt
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <Shuffle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Clique em &quot;Novo&quot; para gerar um prompt aleatório
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categorized Prompts */}
      <Tabs defaultValue="GRATITUDE" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {Object.entries(categoryLabels).map(([category, label]) => {
            const Icon = categoryIcons[category as JournalPromptCategory]
            return (
              <TabsTrigger
                key={category}
                value={category}
                className="text-xs gap-1"
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {Object.entries(journalPrompts).map(([category, prompts]) => {
          const Icon = categoryIcons[category as JournalPromptCategory]
          return (
            <TabsContent key={category} value={category} className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle>{categoryLabels[category as JournalPromptCategory]}</CardTitle>
                      <CardDescription>
                        {categoryDescriptions[category as JournalPromptCategory]}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {prompts.map((prompt, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => onSelectPrompt(prompt, category as JournalPromptCategory)}
                      >
                        <p className="text-sm font-medium mb-2">{prompt}</p>
                        <Button size="sm" variant="outline" className="w-full">
                          Usar este prompt
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
