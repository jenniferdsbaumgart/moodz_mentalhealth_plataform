"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useJournalEntry, useUpdateJournalEntry, useDeleteJournalEntry } from "@/hooks/use-wellness"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Lock,
  Calendar,
  Hash,
  Clock,
  Star,
  MoreVertical
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function JournalEntryPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { data: entry, isLoading } = useJournalEntry(id)
  const updateEntry = useUpdateJournalEntry()
  const deleteEntry = useDeleteJournalEntry()

  const getMoodEmoji = (mood?: number) => {
    if (!mood) return null

    if (mood >= 9) return "🥳"
    if (mood >= 7) return "😊"
    if (mood >= 5) return "🙂"
    if (mood >= 3) return "😐"
    if (mood >= 1) return "😞"
    return "😢"
  }

  const getWordCount = (content: string): number => {
    return content.replace(/<[^>]*>/g, "").trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const handleToggleFavorite = async () => {
    if (!entry) return

    try {
      await updateEntry.mutateAsync({
        id,
        isFavorite: !entry.isFavorite
      })
      toast.success(entry.isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos")
    } catch {
      toast.error("Erro ao atualizar entrada")
    }
  }

  const handleTogglePrivate = async () => {
    if (!entry) return

    try {
      await updateEntry.mutateAsync({
        id,
        isPrivate: !entry.isPrivate
      })
      toast.success(entry.isPrivate ? "Tornada pública" : "Tornada privada")
    } catch {
      toast.error("Erro ao atualizar entrada")
    }
  }

  const handleDelete = async () => {
    try {
      await deleteEntry.mutateAsync(id)
      toast.success("Entrada excluída com sucesso")
      router.push("/wellness/journal")
    } catch {
      toast.error("Erro ao excluir entrada")
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!entry) {
    return (
      <MainLayout>
        <div className="py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Entrada não encontrada</h1>
            <p className="text-muted-foreground mb-4">
              A entrada do diário que você está procurando não existe ou foi removida.
            </p>
            <Button asChild>
              <Link href="/wellness/journal">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Diário
              </Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="py-8 max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/wellness/journal">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Diário
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{entry.title}</h1>

              <div className="flex items-center gap-4 text-muted-foreground text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(entry.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>

                {entry.updatedAt !== entry.createdAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Atualizado {format(new Date(entry.updatedAt), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                )}

                <span>{getWordCount(entry.content)} palavras</span>
                <span>~{Math.ceil(getWordCount(entry.content) / 200)} min</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleFavorite}
                disabled={updateEntry.isPending}
                className={entry.isFavorite ? "text-yellow-600 border-yellow-300" : ""}
              >
                <Star className={`h-4 w-4 ${entry.isFavorite ? "fill-current" : ""}`} />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/wellness/journal/${id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleTogglePrivate}>
                    <Lock className="h-4 w-4 mr-2" />
                    {entry.isPrivate ? "Tornar público" : "Tornar privado"}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {entry.mood && (
              <Badge variant="outline" className="flex items-center gap-1">
                <span className="text-base">{getMoodEmoji(entry.mood)}</span>
                Humor: {entry.mood}/10
              </Badge>
            )}

            {entry.isFavorite && (
              <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Favorito
              </Badge>
            )}

            {entry.isPrivate && (
              <Badge variant="outline">
                <Lock className="h-3 w-3 mr-1" />
                Privado
              </Badge>
            )}
          </div>

          {/* Tags */}
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Prompt */}
          {entry.prompt && (
            <Card className="mt-4 border-primary/20 bg-primary/5">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="text-primary mt-0.5">💭</div>
                  <div>
                    <p className="font-medium mb-1">Escrito baseado no prompt:</p>
                    <p className="text-sm text-muted-foreground italic">
                      &quot;{entry.prompt.text}&quot;
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Content */}
        <Card>
          <CardContent className="pt-6">
            <div
              className="prose prose-slate max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: entry.content }}
            />
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir entrada do diário</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir esta entrada? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleteEntry.isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteEntry.isPending}
              >
                {deleteEntry.isPending ? "Excluindo..." : "Excluir"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
