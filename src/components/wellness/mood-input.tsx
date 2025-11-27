"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoodSlider } from "./mood-slider"
import { EmotionPicker } from "./emotion-picker"
import { ActivityPicker } from "./activity-picker"
import { useCreateMoodEntry } from "@/hooks/use-wellness"
import { MoodEntryInput } from "@/lib/validations/mood"
import { Loader2, Heart, Zap, Moon, MessageSquare, Save } from "lucide-react"

interface MoodInputProps {
  onSuccess?: () => void
  initialData?: Partial<MoodEntryInput>
}

export function MoodInput({ onSuccess, initialData }: MoodInputProps) {
  const [mood, setMood] = useState(initialData?.mood || 5)
  const [energy, setEnergy] = useState(initialData?.energy || 5)
  const [anxiety, setAnxiety] = useState(initialData?.anxiety || 5)
  const [sleep, setSleep] = useState(initialData?.sleep || 5)
  const [emotions, setEmotions] = useState<string[]>(initialData?.emotions || [])
  const [activities, setActivities] = useState<string[]>(initialData?.activities || [])
  const [notes, setNotes] = useState(initialData?.notes || "")

  const createMoodEntry = useCreateMoodEntry()

  const handleSubmit = async () => {
    const data: MoodEntryInput = {
      mood,
      energy,
      anxiety,
      sleep,
      emotions,
      activities,
      notes: notes.trim() || undefined,
      date: new Date().toISOString(),
    }

    try {
      await createMoodEntry.mutateAsync(data)
      onSuccess?.()
    } catch {
      // Error handled by mutation
    }
  }

  const isFormValid = mood > 0 && emotions.length > 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Como você está se sentindo hoje?</h1>
        <p className="text-muted-foreground">
          Registre seu humor e atividades para acompanhar seu bem-estar
        </p>
      </div>

      <Tabs defaultValue="mood" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mood" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Humor
          </TabsTrigger>
          <TabsTrigger value="emotions" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Emoções
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Atividades
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Resumo
          </TabsTrigger>
        </TabsList>

        {/* Mood Tab */}
        <TabsContent value="mood" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Seu Humor Geral
              </CardTitle>
              <CardDescription>
                Como você está se sentindo hoje de forma geral?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MoodSlider value={mood} onChange={setMood} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Energia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MoodSlider
                  value={energy}
                  onChange={setEnergy}
                  label="Como está seu nível de energia?"
                  showLabels={false}
                  size="sm"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-4 w-4 text-orange-500" />
                  Ansiedade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MoodSlider
                  value={anxiety}
                  onChange={setAnxiety}
                  label="Como está seu nível de ansiedade?"
                  showLabels={false}
                  size="sm"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Moon className="h-4 w-4 text-blue-500" />
                  Sono
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MoodSlider
                  value={sleep}
                  onChange={setSleep}
                  label="Como foi seu sono?"
                  showLabels={false}
                  size="sm"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Emotions Tab */}
        <TabsContent value="emotions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quais emoções você sentiu hoje?</CardTitle>
              <CardDescription>
                Selecione todas as emoções que você experimentou hoje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmotionPicker
                selectedEmotions={emotions}
                onChange={setEmotions}
                maxEmotions={10}
                showCategories={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>O que você fez hoje?</CardTitle>
              <CardDescription>
                Selecione as atividades que você realizou hoje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityPicker
                selectedActivities={activities}
                onChange={setActivities}
                maxActivities={10}
                showCategories={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do seu dia</CardTitle>
              <CardDescription>
                Adicione observações adicionais sobre seu dia (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl mb-1">
                    {mood <= 3 ? "😢" : mood <= 5 ? "😐" : mood <= 7 ? "🙂" : "😊"}
                  </div>
                  <div className="text-sm font-medium">Humor: {mood}/10</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-sm font-medium">Energia: {energy}/10</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">😰</div>
                  <div className="text-sm font-medium">Ansiedade: {anxiety}/10</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">😴</div>
                  <div className="text-sm font-medium">Sono: {sleep}/10</div>
                </div>
              </div>

              {/* Emotions Summary */}
              {emotions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Emoções sentidas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {emotions.map((emotionId) => {
                      const emotion = [
                        { id: "feliz", emoji: "😊" },
                        { id: "triste", emoji: "😢" },
                        { id: "ansioso", emoji: "😰" },
                        // Add more as needed
                      ].find(e => e.id === emotionId)
                      return (
                        <span key={emotionId} className="text-lg">
                          {emotion?.emoji || "😊"} {emotionId}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Activities Summary */}
              {activities.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Atividades realizadas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {activities.map((activityId) => {
                      const activity = [
                        { id: "trabalho", emoji: "💼" },
                        { id: "exercicio", emoji: "🏃‍♀️" },
                        { id: "social", emoji: "👥" },
                        // Add more as needed
                      ].find(a => a.id === activityId)
                      return (
                        <span key={activityId} className="text-lg">
                          {activity?.emoji || "📝"} {activityId}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-2">
                  Observações adicionais (opcional)
                </label>
                <Textarea
                  id="notes"
                  placeholder="Compartilhe mais sobre seu dia, pensamentos ou reflexões..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid || createMoodEntry.isPending}
                  size="lg"
                  className="min-w-[150px]"
                >
                  {createMoodEntry.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Registro
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
