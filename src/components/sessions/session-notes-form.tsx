"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Loader2, Eye, EyeOff } from "lucide-react"

interface SessionNote {
  id?: string
  content: string
  isPrivate: boolean
  createdAt?: string
  updatedAt?: string
}

interface SessionNotesFormProps {
  sessionId: string
  initialNote?: SessionNote
  onSave?: (note: SessionNote) => void
  isLoading?: boolean
}

export function SessionNotesForm({
  sessionId,
  initialNote,
  onSave,
  isLoading = false
}: SessionNotesFormProps) {
  const [content, setContent] = useState(initialNote?.content || "")
  const [isPrivate, setIsPrivate] = useState(initialNote?.isPrivate ?? true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    setContent(initialNote?.content || "")
    setIsPrivate(initialNote?.isPrivate ?? true)
  }, [initialNote])

  useEffect(() => {
    const hasChanges = content !== (initialNote?.content || "") ||
                      isPrivate !== (initialNote?.isPrivate ?? true)
    setHasUnsavedChanges(hasChanges)
  }, [content, isPrivate, initialNote])

  const handleSave = useCallback(async () => {
    if (!content.trim()) return

    setIsSaving(true)
    try {
      const noteData: SessionNote = {
        id: initialNote?.id,
        content: content.trim(),
        isPrivate,
      }

      // Call API to save note
      const response = await fetch(`/api/sessions/${sessionId}/notes`, {
        method: initialNote?.id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
      })

      if (response.ok) {
        const savedNote = await response.json()
        onSave?.(savedNote.data)
        setHasUnsavedChanges(false)
      } else {
        console.error("Error saving note")
      }
    } catch (error) {
      console.error("Error saving note:", error)
    } finally {
      setIsSaving(false)
    }
  }, [content, isPrivate, initialNote?.id, sessionId, onSave])

  const handleAutoSave = useCallback(() => {
    // Auto-save after 2 seconds of inactivity
    const timeoutId = setTimeout(() => {
      if (hasUnsavedChanges && content.trim()) {
        handleSave()
      }
    }, 2000)

    return () => clearTimeout(timeoutId)
  }, [hasUnsavedChanges, content, handleSave])

  useEffect(() => {
    const cleanup = handleAutoSave()
    return cleanup
  }, [handleAutoSave])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          Notas da Sessão
        </CardTitle>
        <CardDescription>
          Registre observações e insights sobre a sessão. Apenas você pode visualizar e editar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            placeholder="Registre suas observações sobre a sessão, progresso dos participantes, intervenções realizadas, etc."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            disabled={isLoading}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {content.length}/2000 caracteres
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="private"
            checked={isPrivate}
            onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
            disabled={isLoading}
          />
          <Label
            htmlFor="private"
            className="text-sm flex items-center gap-2 cursor-pointer"
          >
            {isPrivate ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            Manter privado (apenas você pode ver)
          </Label>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {hasUnsavedChanges ? (
              <span className="text-amber-600">● Alterações não salvas</span>
            ) : (
              <span className="text-green-600">● Salvo automaticamente</span>
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={!content.trim() || isSaving || !hasUnsavedChanges}
            size="sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>

        {!isPrivate && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Eye className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Nota pública
                </p>
                <p className="text-amber-700 dark:text-amber-300">
                  Esta nota será visível para outros terapeutas da plataforma.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
