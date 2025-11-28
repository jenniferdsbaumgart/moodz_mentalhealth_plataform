import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { PostsFilters } from "@/components/admin/blog/posts-filters"
import { PostsTable } from "@/components/admin/blog/posts-table"

export default async function BlogAdminPage() {
  const session = await auth()
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/unauthorized")
  }

  // Buscar estatísticas dos posts
  const [
    totalPosts,
    draftPosts,
    publishedPosts,
    archivedPosts,
  ] = await Promise.all([
    db.blogPost.count(),
    db.blogPost.count({ where: { status: "DRAFT" } }),
    db.blogPost.count({ where: { status: "PUBLISHED" } }),
    db.blogPost.count({ where: { status: "ARCHIVED" } }),
  ])

  const stats = {
    total: totalPosts,
    draft: draftPosts,
    published: publishedPosts,
    archived: archivedPosts,
  }

  return (
    <DashboardShell
      title="Gerenciar Blog"
      description="Gerencie os posts e conteúdo do blog"
    >
      <div className="space-y-6">
        <PostsFilters stats={stats} />
        <PostsTable />
      </div>
    </DashboardShell>
  )
}
