"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PostCategory } from "@prisma/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RichEditor } from "./rich-editor"
import { TagInput } from "./tag-input"
import { useCreatePost } from "@/hooks/use-posts"
import { createPostSchema, type CreatePostInput } from "@/lib/validations/post"
import { POST_CATEGORIES } from "@/lib/constants/community"
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

interface PostFormProps {
  initialData?: Partial<CreatePostInput>
  isEditing?: boolean
}

export function PostForm({ initialData, isEditing = false }: PostFormProps) {
  const router = useRouter()
  const [showPreview, setShowPreview] = useState(false)
  const createPost = useCreatePost()

  const form = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      category: initialData?.category || PostCategory.GENERAL,
      tags: initialData?.tags || [],
      isAnonymous: initialData?.isAnonymous || false,
    },
  })

  const onSubmit = async (data: CreatePostInput) => {
    try {
      await createPost.mutateAsync(data)
      router.push("/community")
    } catch {
      // Error is handled by the mutation
    }
  }

  const watchContent = form.watch("content")
  const watchTitle = form.watch("title")

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/community">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Editar Post" : "Criar Novo Post"}
          </h1>
          <p className="text-muted-foreground">
            Compartilhe suas experiências e ajude outros membros da comunidade
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite um título atrativo para seu post..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Content */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo *</FormLabel>
                    <FormControl>
                      <RichEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Compartilhe sua experiência, faça uma pergunta ou ofereça apoio..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TagInput
                        value={field.value || []}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Category */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Categoria</CardTitle>
                  <CardDescription>
                    Escolha a categoria mais apropriada
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(POST_CATEGORIES).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                {config.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Privacidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="isAnonymous"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center gap-2">
                            {field.value ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            Post anônimo
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Seu nome não será exibido neste post
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Preview Toggle */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Visualizar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-full"
                  >
                    {showPreview ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Ocultar Preview
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Mostrar Preview
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle>Preview do Post</CardTitle>
                <CardDescription>
                  Esta é uma prévia de como seu post aparecerá
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {watchTitle || "Título do seu post"}
                  </h2>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: watchContent || "<p>Seu conteúdo aparecerá aqui...</p>"
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={createPost.isPending}
              className="min-w-[120px]"
            >
              {createPost.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  {isEditing ? "Atualizar" : "Publicar"} Post
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
