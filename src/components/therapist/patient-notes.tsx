"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  Lock,
  Eye,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface PatientNotesProps {
  patientId: string
}

interface Note {
  id: string
  content: string
  isPrivate: boolean
  createdAt: Date
  updatedAt: Date
}

export function PatientNotes({ patientId }: PatientNotesProps) {
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteContent, setNoteContent] = useState("")
  const [isPrivate, setIsPrivate] = useState(true)

  const queryClient = useQueryClient()

  const { data: notesData, isLoading } = useQuery({
    queryKey: ["therapist", "patient", patientId, "notes"],
    queryFn: async () => {
      // Mock data - em produção, buscar da API
      return {
        data: [
          {
            id: "1",
            content: "Paciente mostrou boa evolução na sessão de hoje. Demonstrou compreensão dos exercícios propostos.",
            isPrivate: true,
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date("2024-01-15"),
          },
          {
            id: "2",
            content: "Relatou dificuldades para manter rotina de meditação. Sugeriu técnicas mais simples.",
            isPrivate: true,
            createdAt: new Date("2024-01-10"),
            updatedAt: new Date("2024-01-10"),
          },
        ],
      }
    },
  })

  const createNoteMutation = useMutation({
    mutationFn: async (data: { content: string; isPrivate: boolean }) => {
      const res = await fetch(`/api/therapist/patients/${patientId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create note")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["therapist", "patient", patientId, "notes"]
      })
      setIsAddingNote(false)
      setNoteContent("")
      setIsPrivate(true)
    },
  })

  const updateNoteMutation = useMutation({
    mutationFn: async ({ noteId, data }: { noteId: string; data: { content: string; isPrivate: boolean } }) => {
      const res = await fetch(`/api/therapist/patients/${patientId}/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update note")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["therapist", "patient", patientId, "notes"]
      })
      setEditingNoteId(null)
      setNoteContent("")
    },
  })

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const res = await fetch(`/api/therapist/patients/${patientId}/notes/${noteId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete note")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["therapist", "patient", patientId, "notes"]
      })
    },
  })

  const notes: Note[] = notesData?.data || []

  const handleSaveNote = () => {
    if (!noteContent.trim()) return

    if (editingNoteId) {
      updateNoteMutation.mutate({
        noteId: editingNoteId,
        data: { content: noteContent, isPrivate },
      })
    } else {
      createNoteMutation.mutate({ content: noteContent, isPrivate })
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note.id)
    setNoteContent(note.content)
    setIsPrivate(note.isPrivate)
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
    setNoteContent("")
    setIsPrivate(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Adicionar Nota */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {editingNoteId ? "Editar Nota" : "Adicionar Nota"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(isAddingNote || editingNoteId) && (
            <>
              <Textarea
                placeholder="Digite suas observações sobre o paciente..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="min-h-[100px]"
              />

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded"
                  />
                  <Lock className="h-4 w-4" />
                  Nota privada
                </label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveNote}
                  disabled={!noteContent.trim() || createNoteMutation.isPending || updateNoteMutation.isPending}
                >
                  {(createNoteMutation.isPending || updateNoteMutation.isPending) ? (
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

                <Button
                  variant="outline"
                  onClick={() => {
                    if (editingNoteId) {
                      handleCancelEdit()
                    } else {
                      setIsAddingNote(false)
                      setNoteContent("")
                      setIsPrivate(true)
                    }
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </>
          )}

          {!isAddingNote && !editingNoteId && (
            <Button onClick={() => setIsAddingNote(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Nota
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Lista de Notas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Notas do Paciente ({notes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma nota ainda</p>
              <p className="text-sm text-gray-400 mt-1">
                Adicione observações sobre o progresso do paciente
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note, index) => (
                <div key={note.id}>
                  <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={note.isPrivate ? "secondary" : "outline"}>
                          {note.isPrivate ? (
                            <>
                              <Lock className="h-3 w-3 mr-1" />
                              Privada
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Pública
                            </>
                          )}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {format(new Date(note.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR
                          })}
                        </span>
                        {note.updatedAt > note.createdAt && (
                          <span className="text-xs text-gray-400">
                            (editado)
                          </span>
                        )}
                      </div>

                      <p className="text-gray-700 whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNote(note)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir esta nota?")) {
                            deleteNoteMutation.mutate(note.id)
                          }
                        }}
                        disabled={deleteNoteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {index < notes.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações sobre privacidade */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Sobre Privacidade</h4>
              <p className="text-sm text-blue-700 mt-1">
                Notas privadas são visíveis apenas para você. Use-as para registrar observações
                clínicas, progresso do tratamento e informações confidenciais do paciente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
