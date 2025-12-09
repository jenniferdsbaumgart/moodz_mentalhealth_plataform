"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Send, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"

const postSchema = z.object({
    title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
    slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
    excerpt: z.string().optional(),
    content: z.string().min(50, "Conteúdo deve ter pelo menos 50 caracteres"),
    coverImage: z.string().url("URL inválida").optional().or(z.literal("")),
    categoryId: z.string().min(1, "Selecione uma categoria"),
    status: z.enum(["DRAFT", "PUBLISHED"]),
})

type PostFormData = z.infer<typeof postSchema>

export default function BlogEditorPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const postId = searchParams.get("id")
    const isEditing = !!postId

    const { data: categories = [] } = useQuery<{ id: string; name: string }[]>({
        queryKey: ["blog-categories"],
        queryFn: async () => {
            const res = await fetch("/api/blog/categories")
            if (!res.ok) throw new Error("Failed to fetch categories")
            return res.json()
        }
    })

    const { data: existingPost, isLoading: isLoadingPost } = useQuery({
        queryKey: ["blog-post", postId],
        queryFn: async () => {
            const res = await fetch(`/api/admin/blog/posts/${postId}`)
            if (!res.ok) throw new Error("Failed to fetch post")
            return res.json()
        },
        enabled: isEditing
    })

    const form = useForm<PostFormData>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            title: "",
            slug: "",
            excerpt: "",
            content: "",
            coverImage: "",
            categoryId: "",
            status: "DRAFT",
        }
    })

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Comece a escrever seu artigo aqui..."
            })
        ],
        content: "",
        onUpdate: ({ editor }) => {
            form.setValue("content", editor.getHTML())
        }
    })

    // Update form when existing post loads
    useEffect(() => {
        if (existingPost && editor) {
            form.reset({
                title: existingPost.title,
                slug: existingPost.slug,
                excerpt: existingPost.excerpt || "",
                content: existingPost.content,
                coverImage: existingPost.coverImage || "",
                categoryId: existingPost.categoryId,
                status: existingPost.status,
            })
            editor.commands.setContent(existingPost.content)
        }
    }, [existingPost, editor, form])

    // Auto-generate slug from title
    const handleTitleChange = (title: string) => {
        if (!isEditing && !form.getValues("slug")) {
            const slug = title
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .slice(0, 60)
            form.setValue("slug", slug)
        }
    }

    const saveMutation = useMutation({
        mutationFn: async (data: PostFormData) => {
            const url = isEditing
                ? `/api/admin/blog/posts/${postId}`
                : "/api/admin/blog/posts"
            const method = isEditing ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || "Failed to save post")
            }
            return res.json()
        },
        onSuccess: () => {
            router.push("/admin/blog")
        }
    })

    const onSubmit = (data: PostFormData) => {
        saveMutation.mutate(data)
    }

    if (isEditing && isLoadingPost) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/blog">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">
                        {isEditing ? "Editar Artigo" : "Novo Artigo"}
                    </h1>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Conteúdo</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Título</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Título do artigo"
                                                        onChange={(e) => {
                                                            field.onChange(e)
                                                            handleTitleChange(e.target.value)
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="slug"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Slug (URL)</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="url-do-artigo" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="excerpt"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Resumo</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        placeholder="Breve descrição do artigo"
                                                        rows={2}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="content"
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>Conteúdo</FormLabel>
                                                <FormControl>
                                                    <div className="border rounded-md min-h-[300px] p-4 prose prose-sm max-w-none">
                                                        <EditorContent editor={editor} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Publicação</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="DRAFT">Rascunho</SelectItem>
                                                        <SelectItem value="PUBLISHED">Publicado</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="categoryId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Categoria</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {categories.map((cat) => (
                                                            <SelectItem key={cat.id} value={cat.id}>
                                                                {cat.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="coverImage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Imagem de Capa (URL)</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="https://..." />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="pt-4 space-y-2">
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={saveMutation.isPending}
                                        >
                                            {saveMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : form.watch("status") === "PUBLISHED" ? (
                                                <Send className="h-4 w-4 mr-2" />
                                            ) : (
                                                <Save className="h-4 w-4 mr-2" />
                                            )}
                                            {form.watch("status") === "PUBLISHED" ? "Publicar" : "Salvar Rascunho"}
                                        </Button>
                                    </div>

                                    {saveMutation.isError && (
                                        <p className="text-sm text-destructive">
                                            {saveMutation.error.message}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}
