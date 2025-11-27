"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface Emotion {
  id: string
  label: string
  emoji?: string
  category: "positive" | "negative" | "neutral"
  color: string
}

const PREDEFINED_EMOTIONS: Emotion[] = [
  // Positivas
  { id: "feliz", label: "Feliz", emoji: "😊", category: "positive", color: "bg-green-100 text-green-800 border-green-200" },
  { id: "calmo", label: "Calmo", emoji: "😌", category: "positive", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "grato", label: "Grato", emoji: "🙏", category: "positive", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { id: "animado", label: "Animado", emoji: "🤩", category: "positive", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { id: "amado", label: "Amado", emoji: "❤️", category: "positive", color: "bg-pink-100 text-pink-800 border-pink-200" },
  { id: "confiante", label: "Confiante", emoji: "💪", category: "positive", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },

  // Negativas
  { id: "triste", label: "Triste", emoji: "😢", category: "negative", color: "bg-red-100 text-red-800 border-red-200" },
  { id: "ansioso", label: "Ansioso", emoji: "😰", category: "negative", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { id: "irritado", label: "Irritado", emoji: "😠", category: "negative", color: "bg-red-200 text-red-900 border-red-300" },
  { id: "estressado", label: "Estressado", emoji: "😫", category: "negative", color: "bg-orange-200 text-orange-900 border-orange-300" },
  { id: "solitario", label: "Solitário", emoji: "😔", category: "negative", color: "bg-gray-100 text-gray-800 border-gray-200" },
  { id: "cansado", label: "Cansado", emoji: "😴", category: "negative", color: "bg-blue-100 text-blue-900 border-blue-300" },

  // Neutras
  { id: "neutro", label: "Neutro", emoji: "😐", category: "neutral", color: "bg-gray-100 text-gray-700 border-gray-200" },
  { id: "pensativo", label: "Pensativo", emoji: "🤔", category: "neutral", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "curioso", label: "Curioso", emoji: "👀", category: "neutral", color: "bg-purple-50 text-purple-700 border-purple-200" },
]

interface EmotionPickerProps {
  selectedEmotions: string[]
  onChange: (emotions: string[]) => void
  maxEmotions?: number
  showCategories?: boolean
  className?: string
}

export function EmotionPicker({
  selectedEmotions,
  onChange,
  maxEmotions = 10,
  showCategories = true,
  className
}: EmotionPickerProps) {
  const [customEmotion, setCustomEmotion] = useState("")

  const handleEmotionToggle = (emotionId: string) => {
    if (selectedEmotions.includes(emotionId)) {
      onChange(selectedEmotions.filter(id => id !== emotionId))
    } else if (selectedEmotions.length < maxEmotions) {
      onChange([...selectedEmotions, emotionId])
    }
  }

  const handleAddCustomEmotion = () => {
    if (customEmotion.trim() && !selectedEmotions.includes(customEmotion.trim())) {
      if (selectedEmotions.length < maxEmotions) {
        onChange([...selectedEmotions, customEmotion.trim()])
        setCustomEmotion("")
      }
    }
  }

  const handleRemoveEmotion = (emotionId: string) => {
    onChange(selectedEmotions.filter(id => id !== emotionId))
  }

  const groupedEmotions = showCategories ? {
    positive: PREDEFINED_EMOTIONS.filter(e => e.category === "positive"),
    negative: PREDEFINED_EMOTIONS.filter(e => e.category === "negative"),
    neutral: PREDEFINED_EMOTIONS.filter(e => e.category === "neutral"),
  } : {
    all: PREDEFINED_EMOTIONS
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Selected Emotions */}
      {selectedEmotions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Emoções selecionadas:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedEmotions.map((emotionId) => {
              const emotion = PREDEFINED_EMOTIONS.find(e => e.id === emotionId)
              return (
                <Badge
                  key={emotionId}
                  variant="secondary"
                  className={cn(
                    "flex items-center gap-1",
                    emotion?.color
                  )}
                >
                  <span>{emotion?.emoji || "😊"}</span>
                  <span>{emotion?.label || emotionId}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEmotion(emotionId)}
                    className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedEmotions.length}/{maxEmotions} emoções selecionadas
          </p>
        </div>
      )}

      {/* Predefined Emotions */}
      <div className="space-y-4">
        {showCategories ? (
          <>
            <div>
              <h4 className="text-sm font-medium mb-3 text-green-700">Emoções Positivas</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {groupedEmotions.positive.map((emotion) => (
                  <Button
                    key={emotion.id}
                    variant={selectedEmotions.includes(emotion.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleEmotionToggle(emotion.id)}
                    disabled={!selectedEmotions.includes(emotion.id) && selectedEmotions.length >= maxEmotions}
                    className={cn(
                      "flex flex-col items-center gap-1 h-auto py-3",
                      selectedEmotions.includes(emotion.id) && "bg-green-100 border-green-300 text-green-800"
                    )}
                  >
                    <span className="text-lg">{emotion.emoji}</span>
                    <span className="text-xs">{emotion.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3 text-red-700">Emoções Negativas</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {groupedEmotions.negative.map((emotion) => (
                  <Button
                    key={emotion.id}
                    variant={selectedEmotions.includes(emotion.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleEmotionToggle(emotion.id)}
                    disabled={!selectedEmotions.includes(emotion.id) && selectedEmotions.length >= maxEmotions}
                    className={cn(
                      "flex flex-col items-center gap-1 h-auto py-3",
                      selectedEmotions.includes(emotion.id) && "bg-red-100 border-red-300 text-red-800"
                    )}
                  >
                    <span className="text-lg">{emotion.emoji}</span>
                    <span className="text-xs">{emotion.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">Emoções Neutras</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {groupedEmotions.neutral.map((emotion) => (
                  <Button
                    key={emotion.id}
                    variant={selectedEmotions.includes(emotion.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleEmotionToggle(emotion.id)}
                    disabled={!selectedEmotions.includes(emotion.id) && selectedEmotions.length >= maxEmotions}
                    className={cn(
                      "flex flex-col items-center gap-1 h-auto py-3",
                      selectedEmotions.includes(emotion.id) && "bg-gray-100 border-gray-300 text-gray-800"
                    )}
                  >
                    <span className="text-lg">{emotion.emoji}</span>
                    <span className="text-xs">{emotion.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div>
            <h4 className="text-sm font-medium mb-3">Escolha suas emoções</h4>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {groupedEmotions.all.map((emotion) => (
                <Button
                  key={emotion.id}
                  variant={selectedEmotions.includes(emotion.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleEmotionToggle(emotion.id)}
                  disabled={!selectedEmotions.includes(emotion.id) && selectedEmotions.length >= maxEmotions}
                  className="flex flex-col items-center gap-1 h-auto py-2"
                >
                  <span className="text-base">{emotion.emoji}</span>
                  <span className="text-xs">{emotion.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Custom Emotion Input */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Adicionar emoção personalizada</h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Digite uma emoção..."
            value={customEmotion}
            onChange={(e) => setCustomEmotion(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddCustomEmotion()}
            className="flex-1 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={selectedEmotions.length >= maxEmotions}
          />
          <Button
            size="sm"
            onClick={handleAddCustomEmotion}
            disabled={!customEmotion.trim() || selectedEmotions.length >= maxEmotions}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
