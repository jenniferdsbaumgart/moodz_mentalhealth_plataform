"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TiptapEditor } from "@/components/editor/tiptap-editor"
import { blogPostSchema, BlogPostInput } from "@/lib/validations/blog"
import { generateSlug, extractExcerpt, generateMetaDescription } from "@/lib/blog/utils"
import { toast } from "sonner"
import { Save, Eye, X, Upload, Search } from "lucide-react"
import { BlogPost, BlogCategory, BlogTag } from "@prisma/client"

interface PostFormProps {
  post?: BlogPost & {
    category: BlogCategory
    tags: { tag: BlogTag }[]
  }
  categories: (BlogCategory & { _count: { posts: number } })[]
  tags: BlogTag[]
  mode: "create" | "edit"
}

export function PostForm({ post, categories, tags, mode }: PostFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [coverImage, setCoverImage] = useState(post?.coverImage || "")
  const [selectedTags, setSelectedTags] = useState<string[]>(
    post?.tags.map(t => t.tag.id) || []
  )
  const [activeTab, setActiveTab] = useState("content")

  const form = useForm<BlogPostInput>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      excerpt: post?.excerpt || "",
      content: post?.content || "",
      coverImage: post?.coverImage || "",
      status: post?.status || "DRAFT",
      publishedAt: post?.publishedAt?.toISOString() || "",
      categoryId: post?.categoryId || "",
      tagIds: selectedTags,
    },
  })

  const watchedTitle = form.watch("title")
  const watchedContent = form.watch("content")

  // Auto-generate slug when title changes
  useEffect(() => {
    if (watchedTitle && !form.getValues("slug")) {
      const slug = generateSlug(watchedTitle)
      form.setValue("slug", slug)
    }
  }, [watchedTitle, form])

  // Auto-generate excerpt when content changes and excerpt is empty
  useEffect(() => {
    if (watchedContent && !form.getValues("excerpt")) {
      const excerpt = extractExcerpt(watchedContent)
      form.setValue("excerpt", excerpt)
    }
  }, [watchedContent, form])

  async function onSubmit(data: BlogPostInput) {
    setIsLoading(true)
    try {
      const payload = {
        ...data,
        tagIds: selectedTags,
        coverImage,
      }

      const url = mode === "create"
        ? "/api/admin/blog/posts"
        : `/api/admin/blog/posts/${post!.id}`

      const method = mode === "create" ? "POST" : "PATCH"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao salvar post")
      }

      const savedPost = await response.json()

      toast.success(
        mode === "create"
          ? "Post criado com sucesso!"
          : "Post atualizado com sucesso!"
      )

      // Redirect to edit mode for new posts
      if (mode === "create") {
        router.push(`/admin/blog/${savedPost.id}/edit`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar post")
    } finally {
      setIsLoading(false)
    }
  }

  function addTag(tagId: string) {
    if (selectedTags.length >= 10) {
      toast.error("Máximo de 10 tags por post")
      return
    }
    if (!selectedTags.includes(tagId)) {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  function removeTag(tagId: string) {
    setSelectedTags(selectedTags.filter(id => id !== tagId))
  }

  function handlePreview() {
    if (mode === "edit" && post?.slug) {
      window.open(`/blog/${post.slug}`, "_blank")
    }
  }

  const metaTitle = watchedTitle || "Título do post"
  const metaDescription = generateMetaDescription(watchedContent, 160)

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {mode === "create" ? "Novo Post" : "Editar Post"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "create"
              ? "Crie um novo post para o blog"
              : "Edite o conteúdo do post"
            }
          </p>
        </div>
        <div className="flex gap-2">
          {mode === "edit" && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              disabled={!post?.slug}
            >
              <Eye className="mr-2 h-4 w-4" />
              Visualizar
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="media">Mídia</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo do Post</CardTitle>
              <CardDescription>
                Escreva o título, resumo e conteúdo principal do post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  placeholder="Digite o título do post"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  placeholder="url-do-post"
                  {...form.register("slug")}
                />
                <p className="text-xs text-muted-foreground">
                  Gerado automaticamente do título. Usado na URL do post.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Resumo</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Breve descrição do post (opcional)"
                  rows={3}
                  {...form.register("excerpt")}
                />
                <p className="text-xs text-muted-foreground">
                  Aparece nas listagens e compartilhamentos. Gerado automaticamente do conteúdo.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Conteúdo *</Label>
                <TiptapEditor
                  content={form.watch("content")}
                  onChange={(content) => form.setValue("content", content)}
                  placeholder="Comece a escrever o conteúdo do post..."
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.content.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Imagem de Capa</CardTitle>
              <CardDescription>
                Adicione uma imagem atrativa para o post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cover-url">URL da Imagem</Label>
                <Input
                  id="cover-url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                />
              </div>

              {coverImage && (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={coverImage}
                      alt="Preview da imagem de capa"
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setCoverImage("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cover-alt">Texto Alternativo (Alt Text)</Label>
                    <Input
                      id="cover-alt"
                      placeholder="Descreva a imagem para acessibilidade"
                      {...form.register("coverImage")}
                    />
                    <p className="text-xs text-muted-foreground">
                      Importante para SEO e acessibilidade
                    </p>
                  </div>
                </div>
              )}

              {!coverImage && (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Cole a URL da imagem acima para visualizar
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Otimização SEO</CardTitle>
              <CardDescription>
                Configure os metadados para melhorar o SEO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Meta Title</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    {metaTitle.length}/60 caracteres
                  </p>
                  <div className="p-3 bg-muted rounded text-sm">
                    {metaTitle}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Meta Description</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    {metaDescription.length}/160 caracteres
                  </p>
                  <div className="p-3 bg-muted rounded text-sm">
                    {metaDescription}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium mb-2 block">
                  Preview no Google
                </Label>
                <div className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div className="text-sm text-green-700 truncate">
                      moodz.com/blog/{form.watch("slug") || "url-do-post"}
                    </div>
                  </div>
                  <h3 className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {metaTitle}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {metaDescription}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Publicação</CardTitle>
                <CardDescription>
                  Configure o status e data de publicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={form.watch("status")}
                    onValueChange={(value) => form.setValue("status", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Rascunho</SelectItem>
                      <SelectItem value="PUBLISHED">Publicado</SelectItem>
                      <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.watch("status") === "PUBLISHED" && (
                  <div className="space-y-2">
                    <Label htmlFor="publishedAt">Data de Publicação</Label>
                    <Input
                      id="publishedAt"
                      type="datetime-local"
                      {...form.register("publishedAt")}
                    />
                    <p className="text-xs text-muted-foreground">
                      Deixe vazio para publicar imediatamente
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categoria</CardTitle>
                <CardDescription>
                  Selecione a categoria do post
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={form.watch("categoryId")}
                  onValueChange={(value) => form.setValue("categoryId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name} ({category._count.posts} posts)
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoryId && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.categoryId.message}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>
                Adicione até 10 tags para categorizar o post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tagId) => {
                  const tag = tags.find(t => t.id === tagId)
                  return tag ? (
                    <Badge key={tag.id} variant="secondary" className="gap-1">
                      {tag.name}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeTag(tag.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ) : null
                })}
              </div>

              <div className="space-y-2">
                <Label>Adicionar Tags</Label>
                <div className="flex gap-2">
                  <Select onValueChange={addTag}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione uma tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {tags
                        .filter(tag => !selectedTags.includes(tag.id))
                        .map((tag) => (
                          <SelectItem key={tag.id} value={tag.id}>
                            {tag.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedTags.length}/10 tags selecionadas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}
