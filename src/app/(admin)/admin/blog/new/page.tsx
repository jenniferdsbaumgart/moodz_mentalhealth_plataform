import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { PostForm } from "@/components/admin/blog/post-form"

export default async function NewPostPage() {
  const session = await auth()
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
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
    <DashboardShell>
      <PostForm
        categories={categories}
        tags={tags}
        mode="create"
      />
    </DashboardShell>
  )
}
