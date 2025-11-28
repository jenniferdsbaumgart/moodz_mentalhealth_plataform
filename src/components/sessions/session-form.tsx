"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SessionCategory } from "@prisma/client"
import { createSessionSchema, type CreateSessionInput } from "@/lib/validations/session"
import { CategorySelector } from "./category-selector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SessionFormProps {
  initialData?: Partial<CreateSessionInput>
  onSubmit: (data: CreateSessionInput) => Promise<void>
  isLoading?: boolean
}

export function SessionForm({ initialData, onSubmit, isLoading }: SessionFormProps) {
  const [currentTag, setCurrentTag] = useState("")

  const form = useForm<CreateSessionInput>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      category: initialData?.category,
      scheduledAt: initialData?.scheduledAt || "",
      duration: initialData?.duration || 60,
      maxParticipants: initialData?.maxParticipants || 10,
      coverImage: initialData?.coverImage || "",
      tags: initialData?.tags || [],
    },
  })

  const tags = form.watch("tags") || []

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < 5) {
      form.setValue("tags", [...tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    form.setValue("tags", tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>
            Detalhes principais da sessão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Sessão *</Label>
            <Input
              id="title"
              placeholder="Ex: Grupo de Apoio para Ansiedade"
              {...form.register("title")}
              disabled={isLoading}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descreva os objetivos da sessão, o que será abordado, etc."
              className="min-h-[120px]"
              {...form.register("description")}
              disabled={isLoading}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Categoria *</Label>
            <CategorySelector
              value={form.watch("category")}
              onChange={(category) => form.setValue("category", category)}
            />
            {form.formState.errors.category && (
              <p className="text-sm text-red-500">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agendamento e Participantes</CardTitle>
          <CardDescription>
            Configure quando e quantas pessoas podem participar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Data e Hora *</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                {...form.register("scheduledAt")}
                disabled={isLoading}
              />
              {form.formState.errors.scheduledAt && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.scheduledAt.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos) *</Label>
              <Input
                id="duration"
                type="number"
                min="30"
                max="180"
                {...form.register("duration", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {form.formState.errors.duration && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.duration.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxParticipants">Máximo de Participantes *</Label>
            <Input
              id="maxParticipants"
              type="number"
              min="2"
              max="50"
              {...form.register("maxParticipants", { valueAsNumber: true })}
              disabled={isLoading}
            />
            {form.formState.errors.maxParticipants && (
              <p className="text-sm text-red-500">
                {form.formState.errors.maxParticipants.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personalização</CardTitle>
          <CardDescription>
            Adicione imagem e tags para tornar a sessão mais atrativa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coverImage">Imagem de Capa (URL)</Label>
            <Input
              id="coverImage"
              placeholder="https://exemplo.com/imagem.jpg"
              {...form.register("coverImage")}
              disabled={isLoading}
            />
            {form.formState.errors.coverImage && (
              <p className="text-sm text-red-500">
                {form.formState.errors.coverImage.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (máximo 5)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Digite uma tag"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || tags.length >= 5}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addTag}
                disabled={!currentTag.trim() || tags.length >= 5 || isLoading}
                aria-label="Adicionar tag"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      disabled={isLoading}
                      className="hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {form.formState.errors.tags && (
              <p className="text-sm text-red-500">
                {form.formState.errors.tags.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Criar Sessão"
          )}
        </Button>
      </div>
    </form>
  )
}

