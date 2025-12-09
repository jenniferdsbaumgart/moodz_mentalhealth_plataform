import { Suspense } from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { PostsTable } from "@/components/admin/blog/posts-table"
import { PostsFilters } from "@/components/admin/blog/posts-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"

export default async function TherapistBlogPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== Role.THERAPIST) {
    redirect("/unauthorized")
  }

  const [total, draft, published, archived] = await Promise.all([
    db.blogPost.count({ where: { authorId: session.user.id } }),
    db.blogPost.count({ where: { authorId: session.user.id, status: "DRAFT" } }),
    db.blogPost.count({ where: { authorId: session.user.id, status: "PUBLISHED" } }),
    db.blogPost.count({ where: { authorId: session.user.id, status: "ARCHIVED" } }),
  ])

  const stats = {
    total,
    draft,
    published,
    archived,
  }

  return (
    <DashboardShell role={Role.THERAPIST}
      title="Meus Posts"
      description="Gerencie seus artigos do blog"
      action={
        <Button asChild>
          <Link href="/therapist/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Post
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <PostsFilters stats={stats} />
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <PostsTable />
        </Suspense>
      </div>
    </DashboardShell>
  )
}


