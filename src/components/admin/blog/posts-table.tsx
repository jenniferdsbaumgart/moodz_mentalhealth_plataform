"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  MoreHorizontal,
  Eye,
  Edit,
  Archive,
  ArchiveRestore,
  Trash2,
  Globe,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import Link from "next/link"
import { BlogPostStatus } from "@prisma/client"

type BlogPost = {
  id: string
  title: string
  slug: string
  status: BlogPostStatus
  publishedAt: string | null
  createdAt: string
  author: {
    id: string
    name: string
  }
  category: {
    id: string
    name: string
    slug: string
    color: string
  }
  viewCount: number
  readingTime: number | null
  _count: {
    tags: number
  }
}

const statusLabels = {
  DRAFT: "Rascunho",
  PUBLISHED: "Publicado",
  ARCHIVED: "Arquivado",
} as const

const statusColors = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  ARCHIVED: "outline",
} as const

const statusIcons = {
  DRAFT: FileText,
  PUBLISHED: Globe,
  ARCHIVED: Archive,
} as const

export function PostsTable() {
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [deletePost, setDeletePost] = useState<BlogPost | null>(null)

  // Parse filters from URL
  const status = searchParams.get("status") as BlogPostStatus | null
  const search = searchParams.get("search")
  const page = parseInt(searchParams.get("page") || "1")

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "blog-posts", { status, search, page }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (status) params.set("status", status)
      if (search) params.set("search", search)
      params.set("page", page.toString())
      params.set("limit", "12") // 12 posts per page for admin

      const response = await fetch(`/api/admin/blog/posts?${params}`)
      if (!response.ok) throw new Error("Failed to fetch posts")
      return response.json()
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BlogPostStatus }) => {
      const response = await fetch(`/api/admin/blog/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Failed to update post")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "blog-posts"] })
      toast.success("Status do post atualizado")
    },
    onError: () => {
      toast.error("Erro ao atualizar status do post")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/blog/posts/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete post")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "blog-posts"] })
      toast.success("Post deletado com sucesso")
      setDeletePost(null)
    },
    onError: () => {
      toast.error("Erro ao deletar post")
    },
  })

  function handleStatusChange(post: BlogPost, newStatus: BlogPostStatus) {
    updateStatusMutation.mutate({ id: post.id, status: newStatus })
  }

  function handleDelete(post: BlogPost) {
    setDeletePost(post)
  }

  function confirmDelete() {
    if (deletePost) {
      deleteMutation.mutate(deletePost.id)
    }
  }

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    window.location.href = `/admin/blog?${params.toString()}`
  }

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center">
          <div className="animate-pulse">Carregando posts...</div>
        </div>
      </div>
    )
  }

  const posts = data?.posts || []
  const pagination = data?.pagination || {}

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Visualizações</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum post encontrado
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post: BlogPost) => {
                const StatusIcon = statusIcons[post.status]

                return (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium line-clamp-1">
                          {post.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          /{post.slug}
                        </div>
                        {post._count.tags > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {post._count.tags} tag{post._count.tags !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[post.status]} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {statusLabels[post.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{post.author.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        style={{ borderColor: post.category.color }}
                        className="text-xs"
                      >
                        {post.category.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {post.viewCount.toLocaleString()}
                      </div>
                      {post.readingTime && (
                        <div className="text-xs text-muted-foreground">
                          {post.readingTime}min
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {post.status === "PUBLISHED" && post.publishedAt
                          ? format(new Date(post.publishedAt), "dd/MM/yyyy", { locale: ptBR })
                          : format(new Date(post.createdAt), "dd/MM/yyyy", { locale: ptBR })
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/blog/${post.slug}`} target="_blank">
                              <Eye className="mr-2 h-4 w-4" />
                              Ver público
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/blog/${post.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>

                          {post.status === "DRAFT" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(post, "PUBLISHED")}
                              disabled={updateStatusMutation.isPending}
                            >
                              <Globe className="mr-2 h-4 w-4" />
                              Publicar
                            </DropdownMenuItem>
                          )}

                          {post.status === "PUBLISHED" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(post, "ARCHIVED")}
                              disabled={updateStatusMutation.isPending}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Arquivar
                            </DropdownMenuItem>
                          )}

                          {post.status === "ARCHIVED" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(post, "DRAFT")}
                              disabled={updateStatusMutation.isPending}
                            >
                              <ArchiveRestore className="mr-2 h-4 w-4" />
                              Restaurar
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(post)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {posts.length} de {pagination.total} posts
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm">
              Página {page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page >= pagination.totalPages}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deletePost} onOpenChange={() => setDeletePost(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Post</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o post "{deletePost?.title}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
