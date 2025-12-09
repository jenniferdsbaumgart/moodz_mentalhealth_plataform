import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { PostForm } from "@/components/admin/blog/post-form"

interface EditPostPageProps {
  params: {
    id: string
  }
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const session = await auth()
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/unauthorized")
  }

  // Buscar post com relacionamentos
  const post = await db.blogPost.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })

  if (!post) {
    notFound()
  }

  // Verificar se usuário pode editar (próprio post ou admin)
  if (post.authorId !== session.user.id && session.user.role !== "SUPER_ADMIN") {
    redirect("/unauthorized")
  }

  // Buscar categorias e tags
  const [categories, tags] = await Promise.all([
    db.blogCategory.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: "PUBLISHED",
                publishedAt: { not: null },
              },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    }),
    db.blogTag.findMany({
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <DashboardShell role="ADMIN">
      <PostForm
        post={post}
        categories={categories}
        tags={tags}
        mode="edit"
      />
    </DashboardShell>
  )
}


