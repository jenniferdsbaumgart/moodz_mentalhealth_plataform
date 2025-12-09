"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

import { PREDEFINED_EMOTIONS } from "@/lib/constants/wellness"

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

  const getGroupedEmotions = () => {
    if (showCategories) {
      return {
        type: 'categories' as const,
        data: {
          positive: PREDEFINED_EMOTIONS.filter(e => e.category === "positive"),
          negative: PREDEFINED_EMOTIONS.filter(e => e.category === "negative"),
          neutral: PREDEFINED_EMOTIONS.filter(e => e.category === "neutral"),
        }
      }
    }
    return {
      type: 'all' as const,
      data: {
        all: PREDEFINED_EMOTIONS
      }
    }
  }

  const groupedEmotions = getGroupedEmotions()

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
        {groupedEmotions.type === 'categories' ? (
          <>
            <div>
              <h4 className="text-sm font-medium mb-3 text-green-700">Emoções Positivas</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {groupedEmotions.data.positive.map((emotion) => (
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
                {groupedEmotions.data.negative.map((emotion) => (
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
                {groupedEmotions.data.neutral.map((emotion) => (
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
              {groupedEmotions.data.all.map((emotion) => (
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
