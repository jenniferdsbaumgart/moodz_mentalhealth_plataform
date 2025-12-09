import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PostForm } from "@/components/admin/blog/post-form"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Role } from "@prisma/client"

export default async function NewTherapistPostPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== Role.THERAPIST) {
    redirect("/unauthorized")
  }

  const categories = await db.blogCategory.findMany({
    include: {
      _count: {
        select: { posts: true },
      },
    },
    orderBy: { name: "asc" },
  })

  const tags = await db.blogTag.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <DashboardShell role={Role.THERAPIST}
      title="Novo Post"
      description="Crie um novo artigo para o blog"
    >
      <PostForm
        categories={categories}
        tags={tags}
        mode="create"
      />
    </DashboardShell>
  )
}


