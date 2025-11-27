"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PostWithDetails } from "@/types/community"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useDeletePost } from "@/hooks/use-posts"
import { useSession } from "next-auth/react"
import { ReportButton } from "./report-button"
import { MoreHorizontal, Edit, Trash2, Pin, Lock, Unlock } from "lucide-react"
import { toast } from "sonner"

interface PostActionsProps {
  post: PostWithDetails
  onEdit?: () => void
  onReport?: () => void
}

export function PostActions({ post, onEdit, onReport }: PostActionsProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const deletePost = useDeletePost()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const isAuthor = session?.user?.id === post.authorId
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"

  const handleDelete = async () => {
    try {
      await deletePost.mutateAsync(post.id)
      router.push("/community")
    } catch {
      // Error handled by mutation
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      router.push(`/community/${post.id}/edit`)
    }
  }

  const handleReport = () => {
    if (onReport) {
      onReport()
    } else {
      toast.info("Funcionalidade de denúncia em desenvolvimento")
    }
  }

  // Don't render anything if user is not logged in and post is not the author's
  if (!session?.user && !isAuthor) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {/* Quick actions for author */}
      {isAuthor && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deletar Post</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja deletar este post? Esta ação não pode ser desfeita.
                  Todos os comentários também serão removidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deletePost.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deletePost.isPending ? "Deletando..." : "Deletar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Dropdown menu for additional actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Author actions */}
          {isAuthor && (
            <>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar post
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Admin actions */}
          {isAdmin && (
            <>
              <DropdownMenuItem>
                <Pin className="h-4 w-4 mr-2" />
                {post.isPinned ? "Desafixar" : "Fixar"} post
              </DropdownMenuItem>
              <DropdownMenuItem>
                {post.isLocked ? (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Destravar comentários
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Travar comentários
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Report action (for non-authors) */}
          {!isAuthor && (
            <div className="px-2 py-1.5">
              <ReportButton
                postId={post.id}
                contentTitle={post.title}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              />
            </div>
          )}

          {/* Delete action (shown in dropdown for consistency) */}
          {isAuthor && (
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar post
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
