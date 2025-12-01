"use client"

import { PostForm } from "@/components/admin/blog/post-form"
import { DashboardShell } from "@/components/layout/dashboard-shell"

interface EditTherapistPostPageProps {
  params: {
    id: string
  }
}

export default function EditTherapistPostPage({ params }: EditTherapistPostPageProps) {
  return (
    <DashboardShell
      title="Editar Post"
      description="Faça alterações no seu artigo"
    >
      <PostForm postId={params.id} />
    </DashboardShell>
  )
}

