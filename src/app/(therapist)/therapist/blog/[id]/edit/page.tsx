import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PostForm } from "@/components/admin/blog/post-form"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Role } from "@prisma/client"

interface EditTherapistPostPageProps {
  params: {
    id: string
  }
}

export default async function EditTherapistPostPage({ params }: EditTherapistPostPageProps) {
  const session = await auth()

  if (!session?.user || session.user.role !== Role.THERAPIST) {
    redirect("/unauthorized")
  }

  const post = await db.blogPost.findUnique({
    where: {
      id: params.id,
      authorId: session.user.id, // Ensure therapist owns the post
    },
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
      title="Editar Post"
      description="Faça alterações no seu artigo"
    >
      <PostForm
        post={post}
        categories={categories}
        tags={tags}
        mode="edit"
      />
    </DashboardShell>
  )
}


