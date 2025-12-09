"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save } from "lucide-react"
import { PREDEFINED_EMOTIONS, PREDEFINED_ACTIVITIES } from "@/lib/constants/wellness"

interface MoodSummaryProps {
    mood: number
    energy: number
    anxiety: number
    sleep: number
    emotions: string[]
    activities: string[]
    notes: string
    onNotesChange: (notes: string) => void
    onSave: () => void
    isSaving: boolean
    isValid: boolean
}

export function MoodSummary({
    mood,
    energy,
    anxiety,
    sleep,
    emotions,
    activities,
    notes,
    onNotesChange,
    onSave,
    isSaving,
    isValid
}: MoodSummaryProps) {
    return (
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
                                const emotion = PREDEFINED_EMOTIONS.find(e => e.id === emotionId)
                                return (
                                    <span key={emotionId} className="text-lg" title={emotion?.label}>
                                        {emotion?.emoji || "😊"} {emotion?.label || emotionId}
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
                                const activity = PREDEFINED_ACTIVITIES.find(a => a.id === activityId)
                                return (
                                    <span key={activityId} className="text-lg" title={activity?.label}>
                                        {activity?.emoji || "📝"} {activity?.label || activityId}
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
                        onChange={(e) => onNotesChange(e.target.value)}
                        rows={4}
                    />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4 border-t">
                    <Button
                        onClick={onSave}
                        disabled={!isValid || isSaving}
                        size="lg"
                        className="min-w-[150px]"
                    >
                        {isSaving ? (
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
    )
}
